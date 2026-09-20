/**
 * aiCoach.js — Gemini AI-powered financial coach
 * 
 * When the user provides their free Gemini API key (from Google AI Studio),
 * this generates personalized financial advice in Darija/French.
 * Falls back to the local rule-based coachEngine when no key is set.
 */

import { generateCoachAlert as localCoachAlert } from './coachEngine';
import { categoriesList } from '../data/mockData';

/**
 * Build a spending summary string for the AI prompt
 */
function buildSpendingSummary(transactions, monthlyBudget, lang) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const monthTx = transactions.filter((tx) => (tx.timestamp || 0) >= monthStart);
  const totalSpent = monthTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Category breakdown
  const catTotals = {};
  monthTx.forEach((tx) => {
    const catInfo = categoriesList.find((c) => c.id === tx.category);
    const name = catInfo ? catInfo.name : tx.category;
    catTotals[name] = (catTotals[name] || 0) + tx.amount;
  });

  const breakdown = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => `- ${name}: ${amount} MAD`)
    .join('\n');

  // Recent transactions with purpose / reason
  const recentDetails = monthTx.slice(0, 10).map((tx) => {
    const p = tx.purpose || tx.title || '';
    const label = tx.categoryLabel || tx.category || 'Autre';
    return `- ${label}: ${tx.amount} MAD${p ? ` (Motif: ${p})` : ''}`;
  }).join('\n');

  return `
Budget mensuel: ${monthlyBudget} MAD
Jour actuel: ${currentDay}/${daysInMonth}
Total dépensé ce mois: ${totalSpent} MAD
Reste: ${monthlyBudget - totalSpent} MAD

Répartition par catégorie:
${breakdown}

Détails des dépenses récentes (avec motifs/raisons):
${recentDetails || 'Aucune dépense enregistrée'}

Nombre total de transactions ce mois: ${monthTx.length}
  `.trim();
}

/**
 * Call Gemini API to generate personalized coaching advice
 */
async function callGeminiAPI(apiKey, spendingSummary, lang) {
  const isAr = lang === 'ar';

  const prompt = isAr
    ? `أنت مدرب مالي مغربي اسمك "Coach Mahfazati". كتهضر بالدارجة المغربية.
شوف هاد البيانات ديال المستخدم:

${spendingSummary}

عطيني تحليل قصير وممتع بالدارجة وقترح 2 حلول عملية. الجواب خاصو يكون بهاد الشكل بالضبط (JSON):
{
  "title": "عنوان التنبيه بالدارجة",
  "diagnostic": "التشخيص بالدارجة (2-3 جمل)",
  "actions": [
    {"label": "الحل الأول", "impact": "التأثير المتوقع"},
    {"label": "الحل الثاني", "impact": "التأثير المتوقع"}
  ],
  "projection": "التوقع ديال 6 شهور بالدارجة"
}`
    : `Tu es un coach financier marocain appelé "Coach Mahfazati". Tu parles en français simple avec quelques expressions marocaines.
Voici les données de dépenses de l'utilisateur:

${spendingSummary}

Donne un diagnostic court et motivant, et propose 2 actions correctives concrètes. Réponds UNIQUEMENT en JSON avec ce format exact:
{
  "title": "Titre de l'alerte (court)",
  "diagnostic": "Diagnostic en 2-3 phrases",
  "actions": [
    {"label": "Action 1 concrète", "impact": "Économie estimée"},
    {"label": "Action 2 concrète", "impact": "Économie estimée"}
  ],
  "projection": "Projection à 6 mois"
}`;

  // Minimal, high-throughput, lowest-latency models according to official Google API docs
  const modelsToTry = [
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.8-flash',
    'gemini-1.5-flash',
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } else {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Gemini API error (${model}): ${errMsg}`);
        if (response.status === 404) {
          continue; // Try next model candidate
        }
        throw lastError;
      }
    } catch (e) {
      lastError = e;
      if (e.message && e.message.includes('404')) {
        continue;
      }
      throw e;
    }
  }

  throw lastError || new Error('All Gemini model endpoints returned 404');
}

// In-memory cache to conserve user's free Gemini API quota
let lastCacheKey = '';
let lastCacheResult = null;

/**
 * Main entry point: generate coach alert
 * Uses Gemini AI if API key is available, otherwise falls back to local engine.
 * Employs smart caching so calls are only made when transactions/budget actually change.
 */
export async function getCoachAdvice(transactions, monthlyBudget, lang, apiKey, forceRefresh = false) {
  // If no API key, use local rule-based engine (0 API calls)
  if (!apiKey || apiKey.trim() === '') {
    return localCoachAlert(transactions, monthlyBudget, lang);
  }

  // Generate unique signature for current financial state
  const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const cacheKey = `${apiKey.trim().slice(-6)}_${lang}_${monthlyBudget}_${transactions.length}_${totalSpent}`;

  // If data has not changed and not forced, return cached advice with 0 API calls
  if (!forceRefresh && lastCacheResult && lastCacheKey === cacheKey) {
    return lastCacheResult;
  }

  try {
    const summary = buildSpendingSummary(transactions, monthlyBudget, lang);
    const aiResult = await callGeminiAPI(apiKey, summary, lang);
    const isAr = lang === 'ar';

    // Map AI response to the coachAlert shape the UI expects
    const alertResult = {
      type: 'ai',
      title: aiResult.title || (isAr ? 'نصيحة المدرب الذكي' : 'Conseil Coach IA'),
      titleAr: isAr ? aiResult.title : aiResult.title,
      diagnostic: aiResult.diagnostic || '',
      diagnosticAr: isAr ? aiResult.diagnostic : '',
      actions: (aiResult.actions || []).map((act, i) => ({
        id: `act-ai-${i + 1}`,
        label: act.label,
        labelAr: isAr ? act.label : '',
        impact: act.impact,
        applied: false,
      })),
      projection: aiResult.projection || '',
      projectionAr: isAr ? aiResult.projection : '',
      isAI: true,
    };

    // Store in cache
    lastCacheKey = cacheKey;
    lastCacheResult = alertResult;

    return alertResult;
  } catch (error) {
    console.warn('Mahfazati AI Coach error, falling back to local:', error.message);
    // Fallback to local engine on any error (quota reached, offline, etc.)
    return localCoachAlert(transactions, monthlyBudget, lang);
  }
}
