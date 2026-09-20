/**
 * coachEngine.js — Local rule-based financial coach
 * 
 * Analyzes real transaction data and generates personalized coaching alerts
 * in both French and Darija. No API required.
 */

import { categoriesList } from '../data/mockData';

/**
 * Get the start of the current month as a timestamp
 */
function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * Get the start of last month and end of last month
 */
function getLastMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
  return { start, end };
}

/**
 * Aggregate spending by category for a given time range
 */
function aggregateByCategory(transactions, startTs, endTs) {
  const totals = {};
  transactions.forEach((tx) => {
    const ts = tx.timestamp || 0;
    if (ts >= startTs && ts <= endTs) {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    }
  });
  return totals;
}

/**
 * Count transactions per category this month
 */
function countByCategory(transactions, startTs, endTs) {
  const counts = {};
  transactions.forEach((tx) => {
    const ts = tx.timestamp || 0;
    if (ts >= startTs && ts <= endTs) {
      counts[tx.category] = (counts[tx.category] || 0) + 1;
    }
  });
  return counts;
}

/**
 * Calculate the streak: consecutive active days where daily spending was under daily budget
 */
export function calculateStreak(transactions, monthlyBudget) {
  if (!transactions || transactions.length === 0 || !monthlyBudget || monthlyBudget <= 0) {
    return 0;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBudget = monthlyBudget / daysInMonth;

  // Group spending by day
  const dayTotals = {};
  const activeDays = new Set();
  transactions.forEach((tx) => {
    if (!tx.timestamp) return;
    const d = new Date(tx.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    dayTotals[key] = (dayTotals[key] || 0) + tx.amount;
    activeDays.add(key);
  });

  if (activeDays.size === 0) return 0;

  let streak = 0;
  // Check each day going backwards starting from today/yesterday
  for (let i = 0; i <= 30; i++) {
    const checkDate = new Date(today.getTime() - i * 86400000);
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

    if (dayTotals[key] !== undefined) {
      if (dayTotals[key] <= dailyBudget) {
        streak++;
      } else {
        break; // over budget breaks streak
      }
    } else if (i === 0) {
      // today has no tx yet, keep checking yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate health score (0-100) based on real spending discipline
 */
export function calculateHealthScore(transactions, monthlyBudget) {
  if (!transactions || transactions.length === 0 || !monthlyBudget || monthlyBudget <= 0) {
    return 0;
  }
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthStart = getMonthStart();

  // Total spent this month
  const thisMonthTx = transactions.filter((tx) => (tx.timestamp || 0) >= monthStart);
  if (thisMonthTx.length === 0) {
    return 0;
  }

  const monthlySpent = thisMonthTx.reduce((sum, tx) => sum + tx.amount, 0);
  const spentPct = (monthlySpent / monthlyBudget) * 100;
  const timePct = (currentDay / daysInMonth) * 100;

  let score;
  if (spentPct <= timePct) {
    // Under budget for current calendar day: score 70 to 100
    const diff = timePct - spentPct;
    score = Math.round(75 + Math.min(25, diff * 0.8));
  } else {
    // Over budget: score 10 to 70
    const over = spentPct - timePct;
    score = Math.max(10, Math.round(75 - over * 1.2));
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Generate a coach alert from real spending data
 * Returns the same shape as `initialCoachAlert` so the UI works without changes
 */
export function generateCoachAlert(transactions, monthlyBudget, lang) {
  const isAr = lang === 'ar';
  const now = new Date();
  const monthStart = getMonthStart();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // This month's spending
  const thisMonthTx = transactions.filter((tx) => (tx.timestamp || 0) >= monthStart);
  const totalSpent = thisMonthTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Category breakdown
  const catTotals = aggregateByCategory(transactions, monthStart, Date.now());
  const catCounts = countByCategory(transactions, monthStart, Date.now());

  // Find the biggest spending category
  let topCat = null;
  let topAmount = 0;
  Object.entries(catTotals).forEach(([catId, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCat = catId;
    }
  });

  // Expected spending at this point
  const expectedSpent = (monthlyBudget / daysInMonth) * currentDay;
  const overUnder = totalSpent - expectedSpent;
  const isOver = overUnder > 0;

  // Get category info
  const topCatInfo = categoriesList.find((c) => c.id === topCat) || categoriesList[0];
  const topCatCount = catCounts[topCat] || 0;

  // ─── Build Alert ─────────────────────────────────────────────
  let alert;

  if (thisMonthTx.length === 0) {
    // No transactions yet this month
    alert = {
      type: 'info',
      title: 'Commence à suivre tes dépenses !',
      titleAr: 'بدا تسجل مصاريفك !',
      diagnostic: 'Aucune dépense enregistrée ce mois-ci. Ajoute ta première dépense pour que le coach puisse t\'aider à gérer ton budget.',
      diagnosticAr: 'ما كاين حتى مصروف مسجل هاد الشهر. زيد أول مصروف باش المدرب يقدر يعاونك فالميزانية ديالك.',
      actions: [
        {
          id: 'act-1',
          label: 'Ajouter ta première dépense maintenant',
          labelAr: 'زيد أول مصروف دابا',
          impact: 'Début du suivi',
          applied: false,
        },
        {
          id: 'act-2',
          label: 'Fixer ton objectif d\'épargne mensuel',
          labelAr: 'حدد هدف التوفير ديالك',
          impact: 'Objectif clair',
          applied: false,
        },
      ],
      projection: 'Commence à enregistrer tes dépenses, et le coach te donnera des conseils personnalisés dès la 1ère semaine !',
      projectionAr: 'بدا سجل مصاريفك، والمدرب غايعطيك نصائح خاصة بيك من أول سيمانة !',
    };
  } else if (isOver) {
    // Over budget
    const overAmount = Math.round(overUnder);
    const savingsIf = Math.round(overAmount * 6);

    alert = {
      type: 'warning',
      title: `Alerte Dépassement — ${topCatInfo.name}`,
      titleAr: `تنبيه: راك زايد ف ${topCatInfo.nameAr}`,
      diagnostic: `Tu as dépensé ${totalSpent.toLocaleString('fr-FR')} MAD en ${currentDay} jours, soit ${overAmount} MAD de plus que le rythme idéal. Le poste le plus lourd : ${topCatInfo.name} (${topAmount.toLocaleString('fr-FR')} MAD en ${topCatCount} opérations).`,
      diagnosticAr: `صرفتي ${totalSpent.toLocaleString('fr-FR')} درهم ف ${currentDay} يوم، يعني زايد بـ ${overAmount} درهم على الريتم المثالي. أكبر مصروف : ${topCatInfo.nameAr} (${topAmount.toLocaleString('fr-FR')} درهم ف ${topCatCount} عمليات).`,
      actions: generateActions(topCatInfo, topAmount, topCatCount, monthlyBudget, daysInMonth),
      projection: `Si tu réduis tes dépenses ${topCatInfo.name} de 30%, tu économiseras ${savingsIf.toLocaleString('fr-FR')} MAD en 6 mois !`,
      projectionAr: `إيلا نقصتي مصاريف ${topCatInfo.nameAr} بـ 30%، غاتوفر ${savingsIf.toLocaleString('fr-FR')} درهم ف 6 شهور !`,
    };
  } else {
    // Under or on budget — congratulations mode
    const savedSoFar = Math.round(Math.abs(overUnder));
    const projected6m = Math.round(savedSoFar * 6);

    alert = {
      type: 'success',
      title: 'Bravo ! Budget sous contrôle 🎯',
      titleAr: 'مبروك ! الميزانية تحت السيطرة 🎯',
      diagnostic: `Tu as dépensé ${totalSpent.toLocaleString('fr-FR')} MAD en ${currentDay} jours. Tu es ${savedSoFar} MAD en dessous du rythme idéal. Continue comme ça !`,
      diagnosticAr: `صرفتي ${totalSpent.toLocaleString('fr-FR')} درهم ف ${currentDay} يوم. راك تحت السقف بـ ${savedSoFar} درهم. كمل هاكا !`,
      actions: [
        {
          id: 'act-1',
          label: `Maintenir le rythme : max ${Math.round(monthlyBudget / daysInMonth)} MAD/jour`,
          labelAr: `حافظ على الريتم : ${Math.round(monthlyBudget / daysInMonth)} درهم/نهار كحد أقصى`,
          impact: `+${savedSoFar} MAD sauvés`,
          applied: false,
        },
        {
          id: 'act-2',
          label: 'Essaie de réduire de 5% le mois prochain',
          labelAr: 'حاول تنقص 5% الشهر الجاي',
          impact: `Objectif ${Math.round(monthlyBudget * 0.95).toLocaleString('fr-FR')} MAD`,
          applied: false,
        },
      ],
      projection: `Si tu continues à ce rythme, tu auras économisé ${projected6m.toLocaleString('fr-FR')} MAD en 6 mois !`,
      projectionAr: `إيلا كملتي بهاد الريتم، غاتوفر ${projected6m.toLocaleString('fr-FR')} درهم ف 6 شهور !`,
    };
  }

  return alert;
}

/**
 * Generate 2 concrete action items based on the top spending category
 */
function generateActions(catInfo, catAmount, catCount, monthlyBudget, daysInMonth) {
  const weeklyLimit = Math.round(catAmount / 4 * 0.7); // 30% reduction
  const dailySaving = Math.round(catAmount * 0.3 / daysInMonth);
  const monthlySaving = Math.round(catAmount * 0.3);

  const actionTemplates = {
    food: [
      {
        label: `Plafonner ${catInfo.name} à ${weeklyLimit} MAD/semaine`,
        labelAr: `دير سقف ${weeklyLimit} درهم/سيمانة ف ${catInfo.nameAr}`,
        impact: `+${monthlySaving} MAD/mois`,
      },
      {
        label: `Cuisiner 2 repas de plus par semaine au lieu de commander`,
        labelAr: `طيب جوج وجبات زيادة ف السيمانة عوض تكوموندي`,
        impact: `~${dailySaving * 14} MAD sauvés`,
      },
    ],
    transport: [
      {
        label: `Limiter les taxis : max ${Math.round(catCount * 0.6)} trajets/mois`,
        labelAr: `قلل الطاكسيات : ${Math.round(catCount * 0.6)} مشوار/شهر كحد أقصى`,
        impact: `+${monthlySaving} MAD/mois`,
      },
      {
        label: `Utiliser le Tram ou covoiturage 2x/semaine`,
        labelAr: `استعمل الطرام ولا التيكيتاج مرتين ف السيمانة`,
        impact: `~${Math.round(monthlySaving * 0.5)} MAD sauvés`,
      },
    ],
    default: [
      {
        label: `Réduire ${catInfo.name} de 30% : max ${weeklyLimit} MAD/semaine`,
        labelAr: `نقص ${catInfo.nameAr} بـ 30% : ${weeklyLimit} درهم/سيمانة كحد أقصى`,
        impact: `+${monthlySaving} MAD/mois`,
      },
      {
        label: `Se fixer un quota de ${Math.max(1, Math.round(catCount * 0.7))} opérations/mois`,
        labelAr: `حدد ${Math.max(1, Math.round(catCount * 0.7))} عمليات/شهر كحد أقصى`,
        impact: `~${Math.round(monthlySaving * 0.6)} MAD sauvés`,
      },
    ],
  };

  const templates = actionTemplates[catInfo.id] || actionTemplates.default;

  return templates.map((t, i) => ({
    id: `act-${i + 1}`,
    ...t,
    applied: false,
  }));
}
