import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './AppIcon';

const STEPS = [
  { id: 'welcome', icon: 'wallet' },
  { id: 'name', icon: 'user' },
  { id: 'income', icon: 'cash' },
  { id: 'rent', icon: 'housing' },
  { id: 'savings', icon: 'lightbulb' },
  { id: 'budget', icon: 'target' },
];

export default function OnboardingScreen({ onComplete, themeColors }) {
  const insets = useSafeAreaInsets();
  const c = themeColors;
  const [step, setStep] = useState(0);

  const topPad = Platform.OS === 'web' ? 24 : Math.max(insets.top, 36);
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 32 : 16);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [income, setIncome] = useState('');
  
  // Rent and fixed charges
  const [paysRent, setPaysRent] = useState(true);
  const [rentAmount, setRentAmount] = useState('');
  const [otherFixed, setOtherFixed] = useState('');

  // Savings and variable budget
  const [savings, setSavings] = useState('');
  const [budget, setBudget] = useState('');

  const rentPresets = [1500, 2000, 2500, 3000, 4000];
  const savingsPresets = [500, 1000, 1500, 2000];

  const incomeNum = parseInt(income, 10) || 0;
  const rentNum = paysRent ? (parseInt(rentAmount, 10) || 0) : 0;
  const otherFixedNum = parseInt(otherFixed, 10) || 0;
  const totalFixed = rentNum + otherFixedNum;
  const afterFixed = Math.max(0, incomeNum - totalFixed);
  const savingsNum = parseInt(savings, 10) || 0;
  const suggestedBudget = Math.max(0, afterFixed - savingsNum);

  const canProceed = () => {
    switch (STEPS[step].id) {
      case 'welcome':
        return true;
      case 'name':
        return name.trim().length >= 2;
      case 'income':
        return incomeNum > 0;
      case 'rent':
        return !paysRent || rentNum > 0;
      case 'savings':
        return parseInt(savings, 10) >= 0;
      case 'budget':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      // When moving from savings to budget, automatically sync budget
      if (STEPS[step].id === 'savings') {
        setBudget(String(suggestedBudget));
      }
      setStep(step + 1);
    } else {
      // Finish onboarding
      const finalBudget = budget !== '' && !isNaN(parseInt(budget, 10))
        ? parseInt(budget, 10)
        : suggestedBudget;

      const initials = name.trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

      onComplete({
        profile: {
          name: name.trim(),
          nameAr: name.trim(),
          initials,
          city: city.trim() || 'Maroc',
          cityAr: city.trim() || 'المغرب',
          role: '',
          roleAr: '',
          monthlyIncome: incomeNum,
          rentExpense: rentNum,
          fixedExpenses: totalFixed,
          monthlySavingsTarget: savingsNum,
          accounts: [],
          achievements: [],
        },
        budgetData: {
          monthlyBudget: finalBudget,
          fixedExpenses: totalFixed,
          rentExpense: rentNum,
          currency: 'MAD',
          savingsTarget: savingsNum,
        },
      });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderStep = () => {
    switch (STEPS[step].id) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.heroIcon, { backgroundColor: c.primaryGlow, borderColor: c.primaryLight, overflow: 'hidden' }]}>
              <Image
                source={require('../../assets/app-logo.png')}
                style={{ width: '100%', height: '100%', borderRadius: 38 }}
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Mahfazati • محفظتي
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              Gérez votre argent simplement et intelligemment
            </Text>
            <Text style={[styles.description, { color: c.textMuted }]}>
              Configurons votre budget en 1 minute pour adapter vos dépenses à vos vrais revenus et charges fixes.
              {'\n\n'}
              مرحبا بيك ! غادي نضبطو ميزانيتك حسب دخلك ومصاريفك الثابتة (الكراء، الفواتير) ف دقيقة.
            </Text>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: c.primaryGlow }]}>
              <AppIcon name="user" size={28} color={c.primaryLight} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Comment vous appelez-vous ?
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              شنو سميتك ؟
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, color: c.textPrimary }]}
              placeholder="Ex: Youssef Bennani"
              placeholderTextColor={c.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, color: c.textPrimary, marginTop: 10 }]}
              placeholder="Ville (ex: Casablanca, Rabat...)"
              placeholderTextColor={c.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>
        );

      case 'income':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: c.goldGlow }]}>
              <AppIcon name="cash" size={28} color={c.goldLight} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Quel est votre revenu mensuel net ?
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              شحال الدخل أو الخلصة ديالك ف الشهر ؟
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}>
              <TextInput
                style={[styles.bigInput, { color: c.textPrimary }]}
                placeholder="0"
                placeholderTextColor={c.textMuted}
                keyboardType="numeric"
                value={income}
                onChangeText={setIncome}
                autoFocus
              />
              <Text style={[styles.currency, { color: c.primaryLight }]}>MAD</Text>
            </View>
            <Text style={[styles.hint, { color: c.textMuted }]}>
              Salaire net, freelance ou revenu moyen disponible
            </Text>
          </View>
        );

      case 'rent':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: '#3B82F620' }]}>
              <AppIcon name="housing" size={28} color="#3B82F6" />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Payez-vous un loyer (Location) ?
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              واش كتخلص الكراء أو السكن ؟
            </Text>

            {/* Rent Toggle buttons */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                  paysRent && { borderColor: '#3B82F6', backgroundColor: '#3B82F620' },
                ]}
                onPress={() => setPaysRent(true)}
              >
                <Text style={[styles.toggleBtnText, { color: paysRent ? '#3B82F6' : c.textSecondary }]}>
                  🏠 Oui, je suis locataire
                </Text>
                <Text style={[styles.toggleBtnSub, { color: c.textMuted }]}>نعم، كاري</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                  !paysRent && { borderColor: c.primaryLight, backgroundColor: c.primaryGlow },
                ]}
                onPress={() => {
                  setPaysRent(false);
                  setRentAmount('0');
                }}
              >
                <Text style={[styles.toggleBtnText, { color: !paysRent ? c.primaryLight : c.textSecondary }]}>
                  🏡 Non (Propriétaire / Famille)
                </Text>
                <Text style={[styles.toggleBtnSub, { color: c.textMuted }]}>لا، دار ملك أو عائلة</Text>
              </TouchableOpacity>
            </View>

            {paysRent && (
              <>
                <Text style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 14 }]}>
                  Montant du loyer mensuel (الكراء) :
                </Text>
                <View style={[styles.inputWrap, { backgroundColor: c.surfaceRaised, borderColor: '#3B82F6' }]}>
                  <TextInput
                    style={[styles.bigInput, { color: c.textPrimary }]}
                    placeholder="2500"
                    placeholderTextColor={c.textMuted}
                    keyboardType="numeric"
                    value={rentAmount}
                    onChangeText={setRentAmount}
                    autoFocus
                  />
                  <Text style={[styles.currency, { color: '#3B82F6' }]}>MAD</Text>
                </View>

                {/* Presets for rent */}
                <View style={styles.presetsRow}>
                  {rentPresets.map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.preset,
                        { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                        rentAmount === String(val) && { borderColor: '#3B82F6', backgroundColor: '#3B82F625' },
                      ]}
                      onPress={() => setRentAmount(String(val))}
                    >
                      <Text style={[styles.presetText, { color: rentAmount === String(val) ? '#3B82F6' : c.textSecondary }]}>
                        {val.toLocaleString('fr-FR')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Other fixed bills */}
            <Text style={[styles.fieldLabel, { color: c.textSecondary, marginTop: 14 }]}>
              Autres charges fixes (Factures eau/élec, Wifi, Syndic...) :
            </Text>
            <View style={[styles.inputWrapSmall, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
              <TextInput
                style={[styles.smallInput, { color: c.textPrimary }]}
                placeholder="Ex: 500 (Optionnel)"
                placeholderTextColor={c.textMuted}
                keyboardType="numeric"
                value={otherFixed}
                onChangeText={setOtherFixed}
              />
              <Text style={[styles.currencySmall, { color: c.textMuted }]}>MAD</Text>
            </View>

            {/* Live calculation banner */}
            {incomeNum > 0 && totalFixed > 0 && (
              <View style={[styles.deductionCard, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
                <View style={styles.deductionRow}>
                  <Text style={[styles.deductionLabel, { color: c.textMuted }]}>Revenu brut :</Text>
                  <Text style={[styles.deductionVal, { color: c.textPrimary }]}>{incomeNum.toLocaleString('fr-FR')} MAD</Text>
                </View>
                <View style={styles.deductionRow}>
                  <Text style={[styles.deductionLabel, { color: '#EF4444' }]}>- Charges fixes & Loyer :</Text>
                  <Text style={[styles.deductionVal, { color: '#EF4444' }]}>-{totalFixed.toLocaleString('fr-FR')} MAD</Text>
                </View>
                <View style={[styles.deductionDivider, { backgroundColor: c.surfaceBorder }]} />
                <View style={styles.deductionRow}>
                  <Text style={[styles.deductionTotalLabel, { color: c.primaryLight }]}>Revenu disponible restant :</Text>
                  <Text style={[styles.deductionTotalVal, { color: c.primaryLight }]}>{afterFixed.toLocaleString('fr-FR')} MAD</Text>
                </View>
              </View>
            )}
          </View>
        );

      case 'savings':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: c.goldGlow }]}>
              <AppIcon name="lightbulb" size={28} color={c.goldLight} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Combien voulez-vous épargner par mois ?
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              شحال باغي توفر كل شهر ؟
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: c.surfaceRaised, borderColor: c.gold }]}>
              <TextInput
                style={[styles.bigInput, { color: c.textPrimary }]}
                placeholder="1000"
                placeholderTextColor={c.textMuted}
                keyboardType="numeric"
                value={savings}
                onChangeText={setSavings}
                autoFocus
              />
              <Text style={[styles.currency, { color: c.goldLight }]}>MAD</Text>
            </View>
            <View style={styles.presetsRow}>
              {savingsPresets.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.preset,
                    { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                    savings === String(val) && { borderColor: c.goldLight, backgroundColor: c.goldGlow },
                  ]}
                  onPress={() => setSavings(String(val))}
                >
                  <Text style={[styles.presetText, { color: savings === String(val) ? c.goldLight : c.textSecondary }]}>
                    {val.toLocaleString('fr-FR')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.hint, { color: c.textMuted }]}>
              {afterFixed > 0
                ? `Sur vos ${afterFixed.toLocaleString('fr-FR')} MAD restants après charges fixes`
                : 'Montant à mettre de côté chaque mois'}
            </Text>
          </View>
        );

      case 'budget':
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: c.primaryGlow }]}>
              <AppIcon name="target" size={28} color={c.primaryLight} />
            </View>
            <Text style={[styles.title, { color: c.textPrimary }]}>
              Votre budget pour les dépenses quotidiennes
            </Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              الميزانية الشهرية المخصصة للمصاريف اليومية (ماكلة، طريق، خروج...)
            </Text>

            <View style={[styles.inputWrap, { backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}>
              <TextInput
                style={[styles.bigInput, { color: c.textPrimary }]}
                placeholder={String(suggestedBudget)}
                placeholderTextColor={c.textMuted}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
                autoFocus
              />
              <Text style={[styles.currency, { color: c.primaryLight }]}>MAD</Text>
            </View>

            {/* Calculated Breakdown Summary */}
            <View style={[styles.deductionCard, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, marginTop: 14 }]}>
              <View style={styles.deductionRow}>
                <Text style={[styles.deductionLabel, { color: c.textMuted }]}>Revenu Net :</Text>
                <Text style={[styles.deductionVal, { color: c.textPrimary }]}>{incomeNum.toLocaleString('fr-FR')} MAD</Text>
              </View>
              {totalFixed > 0 && (
                <View style={styles.deductionRow}>
                  <Text style={[styles.deductionLabel, { color: '#EF4444' }]}>- Loyer & Charges :</Text>
                  <Text style={[styles.deductionVal, { color: '#EF4444' }]}>-{totalFixed.toLocaleString('fr-FR')} MAD</Text>
                </View>
              )}
              {savingsNum > 0 && (
                <View style={styles.deductionRow}>
                  <Text style={[styles.deductionLabel, { color: c.goldLight }]}>- Épargne visée :</Text>
                  <Text style={[styles.deductionVal, { color: c.goldLight }]}>-{savingsNum.toLocaleString('fr-FR')} MAD</Text>
                </View>
              )}
              <View style={[styles.deductionDivider, { backgroundColor: c.surfaceBorder }]} />
              <View style={styles.deductionRow}>
                <Text style={[styles.deductionTotalLabel, { color: c.primaryLight }]}>= Reste à vivre (Budget suivi) :</Text>
                <Text style={[styles.deductionTotalVal, { color: c.primaryLight }]}>
                  {(parseInt(budget, 10) || suggestedBudget).toLocaleString('fr-FR')} MAD
                </Text>
              </View>
            </View>

            <Text style={[styles.hint, { color: c.textMuted, marginTop: 10 }]}>
              C'est ce montant qui sera suivi jour par jour sur l'écran d'accueil !
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPad,
            paddingBottom: 110 + bottomPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                { backgroundColor: i <= step ? c.primaryLight : c.surfaceBorder },
                i === step && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {renderStep()}
      </ScrollView>

      {/* Bottom buttons */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: c.surface,
            borderTopColor: c.surfaceBorder,
            paddingBottom: bottomPad + 12,
            paddingTop: 14,
          },
        ]}
      >
        {step > 0 ? (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={[styles.backBtnText, { color: c.textSecondary }]}>Retour</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: canProceed() ? c.primary : c.surfaceRaised },
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.nextBtnText,
              { color: canProceed() ? '#FFF' : c.textMuted },
            ]}
          >
            {step === STEPS.length - 1 ? 'Commencer ✓' : 'Continuer →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 24 : 36,
    paddingBottom: 100,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 32,
  },
  stepContent: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  inputWrapSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  bigInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
  },
  smallInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  currency: {
    fontSize: 16,
    fontWeight: '800',
  },
  currencySmall: {
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  fieldLabel: {
    width: '100%',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  toggleBtnSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  deductionCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 14,
    gap: 6,
  },
  deductionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deductionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  deductionVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  deductionDivider: {
    height: 1,
    marginVertical: 4,
  },
  deductionTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  deductionTotalVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  backBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
