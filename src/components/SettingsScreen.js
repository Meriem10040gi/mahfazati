import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Platform } from 'react-native';
import AppIcon from './AppIcon';
import { saveApiKey, loadApiKey } from '../storage/asyncStore';

// Real CSV export
let FileSystem = null;
let Sharing = null;
try {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
} catch (e) {
  // Web fallback — handled below
}

export default function SettingsScreen({
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  budgetData,
  profile,
  onUpdateBudget,
  themeColors,
  onTriggerToast,
  onResetData,
  transactions = [],
  apiKey: initialApiKey = '',
  onUpdateApiKey,
}) {
  const isAr = lang === 'ar';
  const isDark = theme === 'dark';
  const c = themeColors;

  const [dailyReminder, setDailyReminder] = useState(true);
  const [coachAlerts, setCoachAlerts] = useState(true);
  const [apiKey, setApiKeyLocal] = useState(initialApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Custom budget and fixed charges editing
  const [customBudget, setCustomBudget] = useState(String(budgetData.monthlyBudget || ''));
  const [customFixed, setCustomFixed] = useState(String(budgetData.fixedExpenses !== undefined ? budgetData.fixedExpenses : (profile?.fixedExpenses || '')));

  const budgetOptions = [2500, 3500, 5000, 6500, 8000];

  // Keep local inputs in sync with props
  useEffect(() => {
    setCustomBudget(String(budgetData.monthlyBudget || ''));
  }, [budgetData.monthlyBudget]);

  useEffect(() => {
    const fixedVal = budgetData.fixedExpenses !== undefined ? budgetData.fixedExpenses : (profile?.fixedExpenses || '');
    setCustomFixed(String(fixedVal));
  }, [budgetData.fixedExpenses, profile?.fixedExpenses]);

  // Load API key on mount or from prop
  useEffect(() => {
    if (initialApiKey) {
      setApiKeyLocal(initialApiKey);
    } else {
      loadApiKey().then((key) => {
        if (key) setApiKeyLocal(key);
      });
    }
  }, [initialApiKey]);

  const handleSaveFixed = () => {
    const val = parseInt(customFixed, 10);
    if (!isNaN(val) && val >= 0) {
      const income = profile?.monthlyIncome || 0;
      const savings = profile?.monthlySavingsTarget || budgetData.savingsTarget || 0;
      const newAvailable = Math.max(0, income - val - savings);
      onUpdateBudget({ fixedExpenses: val, rentExpense: val, monthlyBudget: newAvailable });
      setCustomBudget(String(newAvailable));
    }
  };

  const handleSaveCustomBudget = () => {
    const val = parseInt(customBudget, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
    }
  };

  // Save API key when changed
  const handleSaveApiKey = async (key) => {
    const trimmed = (key || '').trim();
    setApiKeyLocal(trimmed);
    await saveApiKey(trimmed);
    if (onUpdateApiKey) {
      onUpdateApiKey(trimmed);
    }
    onTriggerToast(
      isAr ? 'تم حفظ وتفعيل مفتاح Gemini API ✓' : 'Clé API Gemini sauvegardée et activée ✓'
    );
  };

  // ─── Real CSV Export ─────────────────────────────────────────
  const handleExport = async () => {
    if (transactions.length === 0) {
      onTriggerToast(isAr ? 'ما كاين حتى مصروف باش يتصدر' : 'Aucune dépense à exporter');
      return;
    }

    setIsExporting(true);

    try {
      // Build CSV content
      const headers = ['Date', 'Titre', 'Catégorie', 'Montant (MAD)', 'Méthode'];
      const rows = transactions.map((tx) => {
        const date = tx.timestamp
          ? new Date(tx.timestamp).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A';
        // Escape CSV fields
        const title = `"${(tx.title || '').replace(/"/g, '""')}"`;
        const category = tx.categoryLabel || tx.category || '';
        const amount = tx.amount || 0;
        const method = tx.method || '';
        return [date, title, category, amount, method].join(',');
      });

      const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
      const fileName = `mahfazati_export_${new Date().toISOString().slice(0, 10)}.csv`;

      if (Platform.OS === 'web') {
        // Web: trigger download via blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onTriggerToast(
          isAr
            ? `✓ تم تحميل ${fileName} بنجاح`
            : `✓ Fichier ${fileName} téléchargé`
        );
      } else if (FileSystem && Sharing) {
        // Native: write file and share
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: isAr ? 'تصدير المصاريف' : 'Exporter les dépenses',
          });
        }

        onTriggerToast(
          isAr
            ? `✓ تم تصدير ${transactions.length} مصروف`
            : `✓ ${transactions.length} dépenses exportées en CSV`
        );
      } else {
        onTriggerToast(
          isAr ? 'التصدير غير متاح' : 'Export non disponible sur cette plateforme'
        );
      }
    } catch (error) {
      console.warn('CSV export error:', error);
      onTriggerToast(
        isAr ? 'خطأ فالتصدير' : 'Erreur lors de l\'export'
      );
    }

    setIsExporting(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. Appearance / Theme */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
          {isAr ? 'الشكل والمظهر' : 'Apparence du thème'}
        </Text>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr ? 'بدل بين الوضع المظلم ووضع النهار' : 'Bascule entre le mode sombre et clair'}
        </Text>

        <View style={[styles.segmentContainer, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              !isDark && [styles.segmentBtnActive, { backgroundColor: c.surface, borderColor: c.primaryLight }],
            ]}
            onPress={() => onToggleTheme('light')}
            activeOpacity={0.8}
          >
            <AppIcon name="sun" size={16} color={!isDark ? c.primaryLight : c.textSecondary} strokeWidth={2} />
            <Text style={[styles.segmentLabel, { color: !isDark ? c.primaryLight : c.textSecondary }]}>
              {isAr ? 'وضع النهار' : 'Mode Clair'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              isDark && [styles.segmentBtnActive, { backgroundColor: c.surface, borderColor: c.primaryLight }],
            ]}
            onPress={() => onToggleTheme('dark')}
            activeOpacity={0.8}
          >
            <AppIcon name="moon" size={16} color={isDark ? c.primaryLight : c.textSecondary} strokeWidth={2} />
            <Text style={[styles.segmentLabel, { color: isDark ? c.primaryLight : c.textSecondary }]}>
              {isAr ? 'وضع الليل' : 'Mode Sombre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Language Switcher */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
          {isAr ? 'لغة التطبيق' : 'Langue de l\'interface'}
        </Text>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr ? 'اختار اللغة اللي كترتاح فيها' : 'Choisis ta langue préférée'}
        </Text>

        <View style={[styles.segmentContainer, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              !isAr && [styles.segmentBtnActive, { backgroundColor: c.surface, borderColor: c.primaryLight }],
            ]}
            onPress={() => onToggleLang('fr')}
            activeOpacity={0.8}
          >
            <View style={[styles.langCodeBadge, { backgroundColor: !isAr ? c.primaryLight : c.surfaceBorder }]}>
              <Text style={styles.langCodeText}>FR</Text>
            </View>
            <Text style={[styles.segmentLabel, { color: !isAr ? c.primaryLight : c.textSecondary }]}>
              Français
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              isAr && [styles.segmentBtnActive, { backgroundColor: c.surface, borderColor: c.primaryLight }],
            ]}
            onPress={() => onToggleLang('ar')}
            activeOpacity={0.8}
          >
            <View style={[styles.langCodeBadge, { backgroundColor: isAr ? c.primaryLight : c.surfaceBorder }]}>
              <Text style={styles.langCodeText}>MA</Text>
            </View>
            <Text style={[styles.segmentLabel, { color: isAr ? c.primaryLight : c.textSecondary }]}>
              الدارجة المغربية
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Fixed Charges & Rent */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppIcon name="housing" size={18} color="#3B82F6" />
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
            {isAr ? 'الكراء والمصاريف الثابتة' : 'Charges Fixes & Loyer'}
          </Text>
        </View>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr
            ? 'المبلغ الذي يتم خصمه تلقائياً كل شهر للسكن والفواتير'
            : 'Montant prélevé chaque mois pour le loyer et les factures fixes'}
        </Text>

        <View style={[styles.customInputRow, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <TextInput
            style={[styles.customTextInput, { color: c.textPrimary }]}
            placeholder="0"
            placeholderTextColor={c.textMuted}
            keyboardType="numeric"
            value={customFixed}
            onChangeText={setCustomFixed}
          />
          <Text style={[styles.currencySuffix, { color: '#3B82F6' }]}>MAD</Text>
          <TouchableOpacity
            style={[styles.applyCustomBtn, { backgroundColor: c.primary }]}
            onPress={handleSaveFixed}
            activeOpacity={0.8}
          >
            <AppIcon name="check" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Budget Limit Adjustment */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppIcon name="target" size={18} color={c.primaryLight} />
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
            {isAr ? 'سقف المصاريف اليومية (Reste à vivre)' : 'Budget Dépenses Quotidiennes'}
          </Text>
        </View>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr ? 'الميزانية المخصصة للأكل، النقل والمصاريف اليومية' : 'Budget suivi au quotidien sur l\'écran d\'accueil'}
        </Text>

        {/* Custom manual input */}
        <View style={[styles.customInputRow, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, marginBottom: 12 }]}>
          <TextInput
            style={[styles.customTextInput, { color: c.textPrimary }]}
            placeholder="0"
            placeholderTextColor={c.textMuted}
            keyboardType="numeric"
            value={customBudget}
            onChangeText={setCustomBudget}
          />
          <Text style={[styles.currencySuffix, { color: c.primaryLight }]}>MAD</Text>
          <TouchableOpacity
            style={[styles.applyCustomBtn, { backgroundColor: c.primary }]}
            onPress={handleSaveCustomBudget}
            activeOpacity={0.8}
          >
            <AppIcon name="check" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.budgetChipsRow}>
          {budgetOptions.map((amount) => {
            const isSelected = budgetData.monthlyBudget === amount;
            return (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.budgetChip,
                  { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                  isSelected && { borderColor: c.primaryLight, backgroundColor: c.primaryGlow },
                ]}
                onPress={() => {
                  setCustomBudget(String(amount));
                  onUpdateBudget(amount);
                }}
              >
                <Text
                  style={[
                    styles.budgetChipText,
                    { color: isSelected ? c.primaryLight : c.textPrimary },
                  ]}
                >
                  {amount.toLocaleString('fr-FR')} DH
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Gemini AI API Key */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.iconBadge, { backgroundColor: c.primaryGlow, borderColor: c.primaryLight }]}>
            <AppIcon name="sparkles" size={18} color={c.primaryLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
              {isAr ? 'مفتاح Gemini AI (اختياري)' : 'Clé API Gemini AI (Optionnel)'}
            </Text>
            <Text style={[styles.sectionSubCompact, { color: c.textMuted }]}>
              {isAr
                ? 'باش تفعل تحليلات ونصائح المدرب الذكي (مجاني من Google)'
                : 'Active les diagnostics personnalisés du coach IA (Gratuit)'}
            </Text>
          </View>
        </View>

        <View style={[styles.apiKeyInputWrap, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <View style={{ marginRight: 8 }}>
            <AppIcon name="key" size={16} color={c.textMuted} />
          </View>
          <TextInput
            style={[styles.apiKeyInput, { color: c.textPrimary }]}
            placeholder={isAr ? 'الصق المفتاح هنا...' : 'Collez votre clé API ici...'}
            placeholderTextColor={c.textMuted}
            value={apiKey}
            onChangeText={setApiKeyLocal}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowApiKey(!showApiKey)}
            style={styles.eyeBtn}
            accessibilityLabel="Afficher ou masquer la clé"
          >
            <AppIcon name={showApiKey ? 'eye-off' : 'eye'} size={16} color={c.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.saveKeyBtn,
            {
              backgroundColor: apiKey.trim() ? c.primary : c.surfaceRaised,
              borderColor: apiKey.trim() ? c.primary : c.surfaceBorder,
            },
          ]}
          onPress={() => handleSaveApiKey(apiKey)}
          disabled={!apiKey.trim()}
          activeOpacity={0.8}
        >
          <AppIcon name="check" size={15} color={apiKey.trim() ? '#FFF' : c.textMuted} style={{ marginRight: 6 }} />
          <Text style={[styles.saveKeyText, { color: apiKey.trim() ? '#FFF' : c.textMuted }]}>
            {isAr ? 'حفظ وتفعيل المفتاح' : 'Enregistrer la clé API'}
          </Text>
        </TouchableOpacity>

        {apiKey.trim() ? (
          <View style={[styles.keyStatusBadge, { backgroundColor: c.primaryGlow, borderColor: c.primaryLight }]}>
            <AppIcon name="check" size={12} color={c.primaryLight} />
            <Text style={[styles.keyStatusText, { color: c.primaryLight }]}>
              {isAr ? 'المدرب الذكي Gemini مفعل بنجاح ✓' : 'Coach IA Gemini activé ✓'}
            </Text>
          </View>
        ) : (
          <View style={[styles.keyStatusBadge, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
            <AppIcon name="bot" size={12} color={c.textMuted} />
            <Text style={[styles.keyStatusText, { color: c.textSecondary }]}>
              {isAr ? 'وضع محلي تلقائي (يعمل بدون إنترنت)' : 'Mode local algorithmique actif (sans API)'}
            </Text>
          </View>
        )}
      </View>

      {/* 5. Notifications */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
          {isAr ? 'التنبيهات والإشعارات' : 'Notifications & Alertes'}
        </Text>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr ? 'تحكم في رسائل التذكير اليومية وتنبيهات المصاريف' : 'Gérez les rappels de budget et les alertes du coach'}
        </Text>

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: c.textPrimary }]}>
              {isAr ? 'تذكير صباحي يومي' : 'Bilan matinal quotidien'}
            </Text>
            <Text style={[styles.switchSub, { color: c.textMuted }]}>
              {isAr ? 'رسالة خفيفة كتعطيك شحال باقي ليك' : 'Rappel rapide du budget quotidien restant'}
            </Text>
          </View>
          <Switch
            value={dailyReminder}
            onValueChange={setDailyReminder}
            trackColor={{ false: c.surfaceBorder, true: c.primaryLight }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: c.surfaceBorder }]} />

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: c.textPrimary }]}>
              {isAr ? 'تنبيه المدرب عند الدوبلاج' : 'Alertes de dépassement IA'}
            </Text>
            <Text style={[styles.switchSub, { color: c.textMuted }]}>
              {isAr ? 'Coach Mahfazati كيعلمك فالحين' : 'Notification en cas de dépense imprévue'}
            </Text>
          </View>
          <Switch
            value={coachAlerts}
            onValueChange={setCoachAlerts}
            trackColor={{ false: c.surfaceBorder, true: c.primaryLight }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* 6. Offline Security & Privacy Reassurance */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={styles.privacyHeader}>
          <View style={[styles.privacyIconBadge, { backgroundColor: c.primaryGlow, borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
            <AppIcon name="shield" size={22} color={c.primaryLight} strokeWidth={2.2} />
          </View>
          <View style={styles.privacyText}>
            <Text style={[styles.privacyTitle, { color: c.textPrimary }]}>
              {isAr ? '100% أوفلاين وسري' : '100% Hors-Ligne & Privé'}
            </Text>
            <Text style={[styles.privacyDesc, { color: c.textSecondary }]}>
              {isAr
                ? 'فلوسك ومعلوماتك المالية كتبقى مخزنة ف تيليفونك فقط. بدون تسجيل دخول، وبدون أي ربط بنكي إجباري.'
                : 'Vos finances restent strictement sur votre appareil. Aucune inscription, aucun partage et aucune connexion bancaire obligatoire.'}
            </Text>
          </View>
        </View>
      </View>

      {/* 7. Data Actions */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
          {isAr ? 'إدارة البيانات' : 'Gestion des données'}
        </Text>
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>
          {isAr ? 'تصدير العمليات أو إعادة ضبط الحساب' : 'Exporter vos dépenses ou réinitialiser'}
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}
          onPress={handleExport}
          activeOpacity={0.8}
          disabled={isExporting}
        >
          <AppIcon name="download" size={16} color={c.textPrimary} strokeWidth={2} />
          <Text style={[styles.actionBtnText, { color: c.textPrimary }]}>
            {isExporting
              ? (isAr ? 'جاري التصدير...' : 'Export en cours...')
              : (isAr ? 'تيليشارجي المصاريف (CSV)' : 'Exporter mes dépenses en CSV')}
          </Text>
          <View style={[styles.txCountBadge, { backgroundColor: c.primaryGlow }]}>
            <Text style={[styles.txCountText, { color: c.primaryLight }]}>{transactions.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, marginTop: 10 }]}
          onPress={onResetData}
          activeOpacity={0.8}
        >
          <AppIcon name="refresh" size={16} color={c.accentWarm} strokeWidth={2} />
          <Text style={[styles.actionBtnText, { color: c.accentWarm }]}>
            {isAr ? 'إعادة ضبط البيانات للصفر' : 'Réinitialiser toutes les données'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 8. Footer / Version */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: c.textMuted }]}>
          {isAr ? 'محفظتي • النسخة 1.0.0' : 'Mahfazati Mobile • Version 1.0.0'}
        </Text>
        <Text style={[styles.creditsText, { color: c.textMuted }]}>
          {isAr ? 'مصمم بكل حب للشباب المغربي 🇲🇦' : 'Fait avec passion au Maroc 🇲🇦'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  langCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  langCodeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  budgetChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  budgetChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  // AI Key section
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSubCompact: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  apiKeyInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  apiKeyInput: {
    flex: 1,
    height: 46,
    fontSize: 13,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 8,
  },
  saveKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  saveKeyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  keyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  keyStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 14,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  privacyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  privacyDesc: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  actionBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  txCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  txCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingBottom: 28,
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  creditsText: {
    fontSize: 11,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    height: 48,
  },
  customTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  currencySuffix: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 10,
  },
  applyCustomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
