import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors } from './src/theme/colors';
import {
  initialBudgetData,
  initialProfileData,
  initialTransactions,
  translations,
} from './src/data/mockData';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';

// Prevent native splash screen from hiding before data is fully loaded
try {
  SplashScreen?.preventAutoHideAsync?.()?.catch?.(() => {});
} catch (e) {}

// Storage
import {
  saveTransactions,
  loadTransactions,
  saveBudgetData,
  loadBudgetData,
  saveProfile,
  loadProfile,
  savePreferences,
  loadPreferences,
  saveApiKey,
  loadApiKey,
  saveCategories,
  loadCategories,
  clearAllData,
  saveOnboarded,
  loadOnboarded,
} from './src/storage/asyncStore';
import { categoriesList } from './src/data/mockData';

// Coach Engine
import { calculateStreak, calculateHealthScore, generateCoachAlert } from './src/services/coachEngine';
import { getCoachAdvice } from './src/services/aiCoach';

// Custom Components
import Header from './src/components/Header';
import BudgetSpeedometer from './src/components/BudgetSpeedometer';
import CoachCard from './src/components/CoachCard';
import QuickAddModal from './src/components/QuickAddModal';
import CategoryBreakdown from './src/components/CategoryBreakdown';
import TransactionList from './src/components/TransactionList';
import ProfileScreen from './src/components/ProfileScreen';
import SettingsScreen from './src/components/SettingsScreen';
import OnboardingScreen from './src/components/OnboardingScreen';
import AppIcon from './src/components/AppIcon';

function MainApp() {
  const insets = useSafeAreaInsets();

  // ─── App State ──────────────────────────────────────────────────
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('fr');
  const [activeTab, setActiveTab] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const [budgetData, setBudgetData] = useState(initialBudgetData);
  const [profile, setProfile] = useState(initialProfileData);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [categories, setCategories] = useState(categoriesList);
  const [coachAlert, setCoachAlert] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const isAr = lang === 'ar';
  const c = getThemeColors(theme);
  const t = translations[lang] || translations.fr;

  // ─── Live Date Calculations ─────────────────────────────────────
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // ─── Mathematical Budget Synchronization (Income - Fixed - Savings) ──
  const incomeVal = profile.monthlyIncome || 0;
  const fixedVal = profile.fixedExpenses !== undefined ? profile.fixedExpenses : (budgetData.fixedExpenses || 0);
  const savingsVal = profile.monthlySavingsTarget !== undefined ? profile.monthlySavingsTarget : (budgetData.savingsTarget || 0);

  // The true available budget for daily variable spending:
  const effectiveMonthlyBudget = incomeVal > 0
    ? Math.max(0, incomeVal - fixedVal - savingsVal)
    : (budgetData.monthlyBudget || 0);

  // ─── Compute live spending (this month only) ────────────────────
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const totalSpent = transactions
    .filter((tx) => (tx.timestamp || 0) >= monthStart)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todaySpent = transactions
    .filter((tx) => (tx.timestamp || 0) >= todayStart)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // ─── Live streak & health score ─────────────────────────────────
  const streakDays = calculateStreak(transactions, effectiveMonthlyBudget);
  const healthScore = calculateHealthScore(transactions, effectiveMonthlyBudget);

  // ─── Safe area ──────────────────────────────────────────────────
  const topInset = Platform.OS === 'android'
    ? Math.max(insets.top, StatusBar.currentHeight || 28)
    : Math.max(insets.top, 0);
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 28)
    : Math.max(insets.bottom, 12);

  // ─── Android System Navigation Bar Sync ────────────────────────
  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBar?.setBackgroundColorAsync) {
      try {
        NavigationBar.setBackgroundColorAsync(c.surface).catch(() => {});
        NavigationBar?.setButtonStyleAsync?.(theme === 'dark' ? 'light' : 'dark')?.catch?.(() => {});
      } catch (e) {}
    }
  }, [theme, c.surface]);

  // ─── Load Data on Mount ─────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [savedTx, savedBudget, savedProfile, savedPrefs, savedKey, onboarded] = await Promise.all([
          loadTransactions(),
          loadBudgetData(),
          loadProfile(),
          loadPreferences(),
          loadApiKey(),
          loadOnboarded(),
        ]);

        if (savedTx) setTransactions(savedTx);
        if (savedProfile) {
          setProfile(savedProfile);
          if (savedProfile.monthlyIncome > 0) {
            const calculated = Math.max(0, (savedProfile.monthlyIncome || 0) - (savedProfile.fixedExpenses || 0) - (savedProfile.monthlySavingsTarget || 0));
            setBudgetData((prev) => ({
              ...prev,
              ...(savedBudget || {}),
              monthlyBudget: calculated,
              fixedExpenses: savedProfile.fixedExpenses || 0,
              rentExpense: savedProfile.rentExpense || 0,
              savingsTarget: savedProfile.monthlySavingsTarget || 0,
            }));
          } else if (savedBudget) {
            setBudgetData(savedBudget);
          }
        } else if (savedBudget) {
          setBudgetData(savedBudget);
        }

        if (savedPrefs) {
          if (savedPrefs.theme) setTheme(savedPrefs.theme);
          if (savedPrefs.lang) setLang(savedPrefs.lang);
        }
        if (savedKey) setApiKey(savedKey);
        
        const savedCats = await loadCategories();
        if (savedCats && Array.isArray(savedCats) && savedCats.length > 0) {
          setCategories(savedCats);
        }

        setIsOnboarded(onboarded);
      } catch (e) {
        console.warn('Failed to load data:', e);
      }
      
      // Keep the splash screen visible for ~2.2s so the user can enjoy the branding
      await new Promise((resolve) => setTimeout(resolve, 2200));

      setIsLoaded(true);
      try {
        SplashScreen?.hideAsync?.()?.catch?.(() => {});
      } catch (e) {}
    }
    loadAll();
  }, []);

  // ─── Onboarding Complete Handler ────────────────────────────────
  const handleOnboardingComplete = async (data) => {
    setProfile(data.profile);
    setBudgetData(data.budgetData);
    setIsOnboarded(true);
    await Promise.all([
      saveOnboarded(true),
      saveProfile(data.profile),
      saveBudgetData(data.budgetData),
    ]);
    triggerToast(isAr ? 'مرحبا بيك ف محفظتي ! 🎉' : 'Bienvenue sur Mahfazati ! 🎉');
  };

  // ─── Auto-save on changes (after initial load) ─────────────────
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveTransactions(transactions);
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveBudgetData(budgetData);
  }, [budgetData, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveProfile(profile);
  }, [profile, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    savePreferences({ theme, lang });
  }, [theme, lang, isLoaded]);

  // ─── Generate Coach Alert (refresh on data change) ──────────────
  useEffect(() => {
    if (!isLoaded) return;
    async function refreshCoach() {
      try {
        const alert = await getCoachAdvice(transactions, effectiveMonthlyBudget, lang, apiKey);
        setCoachAlert(alert);
      } catch (e) {
        // Fallback to local engine
        const localAlert = generateCoachAlert(transactions, effectiveMonthlyBudget, lang);
        setCoachAlert(localAlert);
      }
    }
    refreshCoach();
  }, [transactions, effectiveMonthlyBudget, lang, apiKey, isLoaded]);

  // ─── Toast ──────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // ─── Add new expense ───────────────────────────────────────────
  const handleAddExpense = (newTx) => {
    const createdTx = {
      ...newTx,
      id: `tx-${Date.now()}`,
      timestamp: newTx.timestamp || Date.now(),
    };
    setTransactions((prev) => [createdTx, ...prev]);

    triggerToast(
      isAr
        ? `✓ تزادت ${createdTx.amount} درهم (${createdTx.title})`
        : `✓ +${createdTx.amount} MAD ajouté (${createdTx.title})`
    );
  };

  // ─── Add new custom category ───────────────────────────────────
  const handleAddCategory = (newCat) => {
    setCategories((prev) => {
      const updated = [...prev, newCat];
      saveCategories(updated);
      return updated;
    });
    triggerToast(isAr ? 'تمت إضافة الفئة الجديدة بنجاح ✓' : 'Nouvelle catégorie enregistrée ✓');
  };

  // ─── Toggle coach action ───────────────────────────────────────
  const handleToggleAction = (actionId) => {
    setCoachAlert((prev) => {
      if (!prev) return prev;
      const updatedActions = prev.actions.map((act) => {
        if (act.id === actionId) {
          const nextApplied = !act.applied;
          triggerToast(
            nextApplied
              ? (isAr ? 'تم تفعيل الحل بنجاح ✓' : 'Action activée avec succès ✓')
              : (isAr ? 'تم إلغاء التفعيل' : 'Action désactivée')
          );
          return { ...act, applied: nextApplied };
        }
        return act;
      });
      return { ...prev, actions: updatedActions };
    });
  };

  // ─── Delete transaction ────────────────────────────────────────
  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    triggerToast(isAr ? 'تم مسح العملية' : 'Dépense supprimée');
  };

  // ─── Update budget limit ───────────────────────────────────────
  const handleUpdateBudget = (budgetUpdate) => {
    if (typeof budgetUpdate === 'number') {
      setBudgetData((prev) => ({ ...prev, monthlyBudget: budgetUpdate }));
      triggerToast(
        isAr
          ? `تم تعديل سقف الميزانية إلى ${budgetUpdate.toLocaleString('fr-FR')} درهم ✓`
          : `Nouveau budget fixé à ${budgetUpdate.toLocaleString('fr-FR')} MAD ✓`
      );
    } else if (typeof budgetUpdate === 'object') {
      setBudgetData((prev) => ({ ...prev, ...budgetUpdate }));
      if (budgetUpdate.fixedExpenses !== undefined || budgetUpdate.savingsTarget !== undefined) {
        setProfile((prev) => ({
          ...prev,
          fixedExpenses: budgetUpdate.fixedExpenses !== undefined ? budgetUpdate.fixedExpenses : prev.fixedExpenses,
          rentExpense: budgetUpdate.rentExpense !== undefined ? budgetUpdate.rentExpense : prev.rentExpense,
          monthlySavingsTarget: budgetUpdate.savingsTarget !== undefined ? budgetUpdate.savingsTarget : prev.monthlySavingsTarget,
        }));
      }
      triggerToast(isAr ? 'تم تحديث إعدادات الميزانية ✓' : 'Budget et charges mis à jour ✓');
    }
  };

  // ─── Update profile ────────────────────────────────────────────
  const handleUpdateProfile = (updatedProfile) => {
    setProfile((prev) => {
      const newProf = { ...prev, ...updatedProfile };
      const inc = newProf.monthlyIncome || 0;
      const fix = newProf.fixedExpenses !== undefined ? newProf.fixedExpenses : (budgetData.fixedExpenses || 0);
      const sav = newProf.monthlySavingsTarget !== undefined ? newProf.monthlySavingsTarget : (budgetData.savingsTarget || 0);
      const newCalcBudget = inc > 0 ? Math.max(0, inc - fix - sav) : (budgetData.monthlyBudget || 0);

      setBudgetData((bPrev) => ({
        ...bPrev,
        monthlyBudget: newCalcBudget,
        fixedExpenses: fix,
        rentExpense: newProf.rentExpense !== undefined ? newProf.rentExpense : fix,
        savingsTarget: sav,
      }));

      return newProf;
    });
    triggerToast(isAr ? 'تم تحديث البروفايل ✓' : 'Profil mis à jour ✓');
  };

  // ─── Reset data ────────────────────────────────────────────────
  const handleResetData = async () => {
    setTransactions(initialTransactions);
    setBudgetData(initialBudgetData);
    setProfile(initialProfileData);
    setIsOnboarded(false);
    await clearAllData();
    triggerToast(isAr ? 'تمت إعادة تعيين البيانات' : 'Données réinitialisées');
  };

  // ─── Loading state / In-App Splash ─────────────────────
  if (!isLoaded) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: '#060B10', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#060B10" translucent={false} />

        {/* Glow & Logo */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <View
            style={{
              position: 'absolute',
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
            }}
          />
          <Image
            source={require('./assets/app-logo.png')}
            style={{ width: 140, height: 140, borderRadius: 32, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }}
            resizeMode="contain"
          />
        </View>

        <Text style={{ color: '#F8FAFC', fontSize: 27, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' }}>
          Mahfazati • محفظتي
        </Text>

        <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>
          Coach Financier Intelligent
        </Text>

        <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
          Dépense moins. Atteins plus.
        </Text>
        <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 4 }}>
          صرّف بذكاء، وفّر أكثر
        </Text>

        {/* Bottom branding footer */}
        <View style={{ position: 'absolute', bottom: 44, alignItems: 'center' }}>
          <Text style={{ color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 0.6 }}>
            🇲🇦 FINTECH MAROCAINE • 100% PRIVÉ & HORS-LIGNE
          </Text>
        </View>
      </View>
    );
  }

  // ─── Onboarding (first launch) ─────────────────────────────────
  if (!isOnboarded) {
    return (
      <View style={[styles.rootContainer, { backgroundColor: c.background }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={c.background}
          translucent={Platform.OS === 'android'}
        />
        <View style={[styles.appWrapper, { backgroundColor: theme === 'dark' ? '#060B10' : '#E2E8F0' }]}>
          <View style={[styles.phoneFrame, { backgroundColor: c.background, borderColor: c.surfaceBorder }]}>
            <OnboardingScreen onComplete={handleOnboardingComplete} themeColors={c} />
          </View>
        </View>
      </View>
    );
  }

  // Default coach alert if still loading
  const displayCoachAlert = coachAlert || generateCoachAlert(transactions, effectiveMonthlyBudget, lang);

  return (
    <View style={[styles.rootContainer, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={c.background}
        translucent={Platform.OS === 'android'}
      />

      {/* Outer Shell for desktop/web simulator & native responsive screen */}
      <View style={[styles.appWrapper, { backgroundColor: theme === 'dark' ? '#060B10' : '#E2E8F0' }]}>
        <View style={[styles.phoneFrame, { backgroundColor: c.background, borderColor: c.surfaceBorder }]}>
          {/* Native / Device Safe Area Top Padding */}
          <View
            style={[
              styles.safeAreaTop,
              { height: Platform.OS === 'web' ? 0 : topInset, backgroundColor: c.surface },
            ]}
          />

          {/* Top simulated mobile speaker bar on web */}
          {Platform.OS === 'web' && (
            <View style={[styles.phoneNotchRow, { backgroundColor: c.surface }]}>
              <Text style={[styles.clockText, { color: c.textPrimary }]}>
                {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
              </Text>
              <View style={[styles.dynamicIsland, { backgroundColor: theme === 'dark' ? '#000' : '#1E293B' }]}>
                <View style={[styles.islandDot, { backgroundColor: theme === 'dark' ? '#1E293B' : '#475569' }]} />
              </View>
              <Text style={[styles.notchBattery, { color: c.textSecondary }]}>🇲🇦 5G 100%</Text>
            </View>
          )}

          {/* Toast Notification Banner */}
          {toastMessage && (
            <View
              style={[
                styles.toast,
                {
                  top: Platform.OS === 'web' ? 44 : topInset + 10,
                  backgroundColor: c.primary,
                  shadowColor: c.primary,
                },
              ]}
            >
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          {/* App Header with quick theme & language toggle */}
          <Header
            lang={lang}
            onToggleLang={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            streakDays={streakDays}
            healthScore={healthScore}
            theme={theme}
            onToggleTheme={(newTheme) => setTheme(newTheme)}
            themeColors={c}
          />

          {/* Main Scrollable Screen Content */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
          >
            {/* TAB 1: ACCUEIL / HOME */}
            {activeTab === 'home' && (
              <>
                <BudgetSpeedometer
                  monthlyBudget={effectiveMonthlyBudget}
                  fixedExpenses={budgetData.fixedExpenses || profile.fixedExpenses || 0}
                  totalSpent={totalSpent}
                  todaySpent={todaySpent}
                  currentDay={currentDay}
                  totalDays={totalDaysInMonth}
                  lang={lang}
                  themeColors={c}
                />

                <CoachCard
                  coachAlert={displayCoachAlert}
                  onToggleAction={handleToggleAction}
                  lang={lang}
                  themeColors={c}
                />

                <TransactionList
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  lang={lang}
                  themeColors={c}
                />
              </>
            )}

            {/* TAB 2: COACH IA */}
            {activeTab === 'coach' && (
              <>
                <CoachCard
                  coachAlert={displayCoachAlert}
                  onToggleAction={handleToggleAction}
                  lang={lang}
                  themeColors={c}
                />

                {/* AI Engine Status Card */}
                <View style={[styles.aiEngineCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                  <View style={styles.aiEngineHeader}>
                    <View style={[styles.aiEngineIconBox, { backgroundColor: apiKey ? c.primaryGlow : c.surfaceRaised, borderColor: apiKey ? c.primaryLight : c.surfaceBorder }]}>
                      <AppIcon name="bot" size={20} color={apiKey ? c.primaryLight : c.textMuted} strokeWidth={2} />
                    </View>
                    <View style={styles.aiEngineTitles}>
                      <Text style={[styles.aiEngineTitle, { color: c.textPrimary }]}>
                        {apiKey
                          ? (isAr ? 'الذكاء الاصطناعي Gemini مفعل' : 'Moteur IA Gemini Activé')
                          : (isAr ? 'المدرب المحلي التلقائي' : 'Coach Algorithmique Local')}
                      </Text>
                      <Text style={[styles.aiEngineSubtitle, { color: c.textSecondary }]}>
                        {apiKey
                          ? (isAr ? 'تحليل ذكي ومخصص حسب عاداتك اليومية' : 'Conseils et diagnostics sur mesure en Darija & Français')
                          : (isAr ? 'يعمل بدون إنترنت بناء على القواعد المالية' : 'Analyse locale sans connexion requise')}
                      </Text>
                    </View>
                  </View>

                  {!apiKey && (
                    <TouchableOpacity
                      style={[styles.aiActivateBtn, { backgroundColor: c.primaryGlow, borderColor: c.primaryLight }]}
                      onPress={() => setActiveTab('settings')}
                      activeOpacity={0.8}
                    >
                      <AppIcon name="sparkles" size={14} color={c.primaryLight} style={{ marginRight: 6 }} />
                      <Text style={[styles.aiActivateBtnText, { color: c.primaryLight }]}>
                        {isAr ? 'إضافة مفتاح Gemini المجاني من الإعدادات' : 'Connecter Gemini IA (Gratuit)'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* TAB 3: RAPPORTS / ANALYTICS */}
            {activeTab === 'analytics' && (
              <>
                <CategoryBreakdown
                  transactions={transactions}
                  categories={categories}
                  lang={lang}
                  themeColors={c}
                />

                <View style={[styles.paymentBreakdownCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
                  <Text style={[styles.paymentCardTitle, { color: c.textPrimary }]}>
                    {isAr ? 'طريقة الخلاص : كاش مقابل كارطة' : 'Répartition Cash vs Carte'}
                  </Text>

                  <View style={styles.paymentRow}>
                    <View style={[styles.paymentBox, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
                      <View style={{ marginBottom: 6 }}>
                        <AppIcon name="cash" size={22} color={c.goldLight} strokeWidth={2} />
                      </View>
                      <Text style={[styles.payLabel, { color: c.textSecondary }]}>{isAr ? 'كاش (Espèces)' : 'Cash (Espèces)'}</Text>
                      <Text style={[styles.payAmount, { color: c.goldLight }]}>
                        {transactions
                          .filter((item) => item.method === 'Cash' || item.methodAr === 'كاش')
                          .reduce((s, item) => s + item.amount, 0)}{' '}
                        MAD
                      </Text>
                    </View>

                    <View style={[styles.paymentBox, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
                      <View style={{ marginBottom: 6 }}>
                        <AppIcon name="card" size={22} color="#06B6D4" strokeWidth={2} />
                      </View>
                      <Text style={[styles.payLabel, { color: c.textSecondary }]}>{isAr ? 'كارطة وفيرمون' : 'Carte & Virement'}</Text>
                      <Text style={[styles.payAmount, { color: '#06B6D4' }]}>
                        {transactions
                          .filter((item) => item.method !== 'Cash' && item.methodAr !== 'كاش')
                          .reduce((s, item) => s + item.amount, 0)}{' '}
                        MAD
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* TAB 4: PROFIL */}
            {activeTab === 'profile' && (
              <ProfileScreen
                profile={profile}
                budgetData={{ ...budgetData, monthlyBudget: effectiveMonthlyBudget }}
                themeColors={c}
                lang={lang}
                healthScore={healthScore}
                onEditBudget={() => setActiveTab('settings')}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {/* TAB 5: PARAMÈTRES / SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsScreen
                theme={theme}
                onToggleTheme={(newTheme) => setTheme(newTheme)}
                lang={lang}
                onToggleLang={(newLang) => setLang(newLang)}
                budgetData={{ ...budgetData, monthlyBudget: effectiveMonthlyBudget }}
                profile={profile}
                onUpdateBudget={handleUpdateBudget}
                themeColors={c}
                onTriggerToast={triggerToast}
                onResetData={handleResetData}
                transactions={transactions}
                apiKey={apiKey}
                onUpdateApiKey={(newKey) => setApiKey(newKey)}
              />
            )}

            {/* Dynamic bottom spacer for tab bar + safe area */}
            <View style={{ height: 110 + bottomInset }} />
          </ScrollView>

          {/* Bottom Navigation Bar (5 Core Tabs) with vector AppIcon */}
          <View style={[styles.bottomNav, { backgroundColor: c.surface, borderTopColor: c.surfaceBorder, paddingBottom: bottomInset }]}>
            {/* 1. Accueil */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('home')}
              activeOpacity={0.8}
            >
              <AppIcon
                name="home"
                size={20}
                color={activeTab === 'home' ? c.primaryLight : c.textMuted}
                strokeWidth={activeTab === 'home' ? 2.4 : 1.8}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'home' ? c.primaryLight : c.textMuted, marginTop: 4 },
                  activeTab === 'home' && styles.navLabelActive,
                ]}
              >
                {t.homeTab || 'Accueil'}
              </Text>
            </TouchableOpacity>

            {/* 2. Coach IA */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('coach')}
              activeOpacity={0.8}
            >
              <AppIcon
                name="bot"
                size={20}
                color={activeTab === 'coach' ? c.primaryLight : c.textMuted}
                strokeWidth={activeTab === 'coach' ? 2.4 : 1.8}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'coach' ? c.primaryLight : c.textMuted, marginTop: 4 },
                  activeTab === 'coach' && styles.navLabelActive,
                ]}
              >
                {t.coachTab || 'Coach IA'}
              </Text>
            </TouchableOpacity>

            {/* 3. Rapports */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('analytics')}
              activeOpacity={0.8}
            >
              <AppIcon
                name="chart"
                size={20}
                color={activeTab === 'analytics' ? c.primaryLight : c.textMuted}
                strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'analytics' ? c.primaryLight : c.textMuted, marginTop: 4 },
                  activeTab === 'analytics' && styles.navLabelActive,
                ]}
              >
                {t.analyticsTab || 'Rapports'}
              </Text>
            </TouchableOpacity>

            {/* 4. Profil */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.8}
            >
              <AppIcon
                name="user"
                size={20}
                color={activeTab === 'profile' ? c.primaryLight : c.textMuted}
                strokeWidth={activeTab === 'profile' ? 2.4 : 1.8}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'profile' ? c.primaryLight : c.textMuted, marginTop: 4 },
                  activeTab === 'profile' && styles.navLabelActive,
                ]}
              >
                {t.profileTab || 'Profil'}
              </Text>
            </TouchableOpacity>

            {/* 5. Réglages */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => setActiveTab('settings')}
              activeOpacity={0.8}
            >
              <AppIcon
                name="settings"
                size={20}
                color={activeTab === 'settings' ? c.primaryLight : c.textMuted}
                strokeWidth={activeTab === 'settings' ? 2.4 : 1.8}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: activeTab === 'settings' ? c.primaryLight : c.textMuted, marginTop: 4 },
                  activeTab === 'settings' && styles.navLabelActive,
                ]}
              >
                {t.settingsTab || 'Réglages'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Floating Action Button (FAB) for Quick Expense Addition on Home */}
          {(activeTab === 'home' || activeTab === 'analytics') && (
            <TouchableOpacity
              style={[
                styles.floatingFab,
                {
                  backgroundColor: c.primary,
                  bottom: 85 + bottomInset,
                  shadowColor: c.primary,
                },
              ]}
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.85}
              accessibilityLabel="Ajouter une dépense"
            >
              <AppIcon name="plus" size={26} color="#FFF" strokeWidth={2.6} />
            </TouchableOpacity>
          )}

          {/* Quick Expense Add Modal */}
          <QuickAddModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onAddExpense={handleAddExpense}
            categories={categories}
            onAddCategory={handleAddCategory}
            lang={lang}
            themeColors={c}
          />
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  appWrapper: {
    flex: 1,
    ...(Platform.OS === 'web'
      ? {
          alignItems: 'center',
          justifyContent: 'center',
        }
      : {}),
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    position: 'relative',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: 440,
          maxHeight: 900,
          borderRadius: 36,
          borderWidth: 2,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }
      : {}),
  },
  safeAreaTop: {
    width: '100%',
  },
  phoneNotchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  clockText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dynamicIsland: {
    width: 90,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  islandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notchBattery: {
    fontSize: 11,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    zIndex: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  navLabelActive: {
    fontWeight: '800',
  },
  floatingFab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 50,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '500',
    marginTop: -2,
  },
  weeklyAdviceCard: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  adviceTag: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  adviceHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  adviceBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentBreakdownCard: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  paymentCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  payEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  payLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  payAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  aiEngineCard: {
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  aiEngineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiEngineIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiEngineTitles: {
    flex: 1,
  },
  aiEngineTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  aiEngineSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiActivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiActivateBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
