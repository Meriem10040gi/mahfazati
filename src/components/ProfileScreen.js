import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import AppIcon from './AppIcon';

export default function ProfileScreen({
  profile,
  budgetData,
  themeColors,
  lang,
  healthScore,
  onEditBudget,
  onUpdateProfile,
}) {
  const isAr = lang === 'ar';
  const c = themeColors;

  const income = profile.monthlyIncome || 0;
  const fixedExpenses = profile.fixedExpenses !== undefined ? profile.fixedExpenses : (budgetData.fixedExpenses || 0);
  const rentExpense = profile.rentExpense !== undefined ? profile.rentExpense : (budgetData.rentExpense || 0);
  const savingsTarget = profile.monthlySavingsTarget !== undefined ? profile.monthlySavingsTarget : (budgetData.savingsTarget || 0);
  
  // Mathematically exact available budget
  const calculatedBudget = Math.max(0, income - fixedExpenses - savingsTarget);
  const savingRate = income > 0 ? Math.round((savingsTarget / income) * 100) : 0;

  // ─── Editable fields state ──────────────────────────────────
  const [editingField, setEditingField] = useState(null); // 'name' | 'city' | 'income' | 'fixed' | 'savings' | null
  const [editName, setEditName] = useState(profile.name || '');
  const [editCity, setEditCity] = useState(profile.city || '');
  const [editIncome, setEditIncome] = useState(String(profile.monthlyIncome || 0));
  const [editFixed, setEditFixed] = useState(String(fixedExpenses));
  const [editSavings, setEditSavings] = useState(String(savingsTarget));

  const handleSaveField = (field) => {
    switch (field) {
      case 'name': {
        const trimmed = editName.trim();
        const initials = trimmed
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || '?';
        onUpdateProfile({
          name: trimmed,
          nameAr: trimmed,
          initials,
        });
        break;
      }
      case 'city': {
        const trimmed = editCity.trim();
        onUpdateProfile({
          city: trimmed,
          cityAr: trimmed,
        });
        break;
      }
      case 'income': {
        const val = parseInt(editIncome, 10);
        if (!isNaN(val) && val >= 0) {
          const newBudget = Math.max(0, val - fixedExpenses - savingsTarget);
          onUpdateProfile({ monthlyIncome: val, monthlyBudget: newBudget });
        }
        break;
      }
      case 'fixed': {
        const val = parseInt(editFixed, 10);
        if (!isNaN(val) && val >= 0) {
          const newBudget = Math.max(0, income - val - savingsTarget);
          onUpdateProfile({ fixedExpenses: val, rentExpense: val, monthlyBudget: newBudget });
        }
        break;
      }
      case 'savings': {
        const val = parseInt(editSavings, 10);
        if (!isNaN(val) && val >= 0) {
          const newBudget = Math.max(0, income - fixedExpenses - val);
          onUpdateProfile({ monthlySavingsTarget: val, monthlyBudget: newBudget });
        }
        break;
      }
    }
    setEditingField(null);
  };

  return (
    <View style={styles.container}>
      {/* User Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={styles.heroRow}>
          <View style={[styles.avatarContainer, { borderColor: c.primaryLight, backgroundColor: c.primaryGlow }]}>
            <Text style={[styles.monogramText, { color: c.primaryLight }]}>
              {profile.initials || 'M'}
            </Text>
          </View>
          <View style={styles.heroText}>
            {editingField === 'name' ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.editInput, { color: c.textPrimary, backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}
                  value={editName}
                  onChangeText={setEditName}
                  autoFocus
                  placeholder={isAr ? 'الاسم' : 'Nom'}
                  placeholderTextColor={c.textMuted}
                />
                <TouchableOpacity onPress={() => handleSaveField('name')} style={[styles.saveBtn, { backgroundColor: c.primary }]}>
                  <AppIcon name="check" size={14} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingField(null)} style={[styles.cancelBtn, { backgroundColor: c.surfaceRaised }]}>
                  <AppIcon name="close" size={14} color={c.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editableRow}
                onPress={() => {
                  setEditName(profile.name || '');
                  setEditingField('name');
                }}
              >
                <Text style={[styles.userName, { color: c.textPrimary }]}>
                  {profile.name || (isAr ? 'المستخدم' : 'Utilisateur')}
                </Text>
                <AppIcon name="settings" size={13} color={c.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}

            {editingField === 'city' ? (
              <View style={[styles.editRow, { marginTop: 4 }]}>
                <TextInput
                  style={[styles.editInputSmall, { color: c.textPrimary, backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}
                  value={editCity}
                  onChangeText={setEditCity}
                  autoFocus
                  placeholder={isAr ? 'المدينة' : 'Ville'}
                  placeholderTextColor={c.textMuted}
                />
                <TouchableOpacity onPress={() => handleSaveField('city')} style={[styles.saveBtn, { backgroundColor: c.primary }]}>
                  <AppIcon name="check" size={12} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingField(null)} style={[styles.cancelBtn, { backgroundColor: c.surfaceRaised }]}>
                  <AppIcon name="close" size={12} color={c.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.cityBadgeRow}
                onPress={() => {
                  setEditCity(profile.city || '');
                  setEditingField('city');
                }}
              >
                <View style={[styles.cityBadge, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
                  <AppIcon name="mapPin" size={11} color={c.textMuted} strokeWidth={2} style={{ marginRight: 4 }} />
                  <Text style={[styles.cityText, { color: c.textMuted }]}>
                    {profile.city || (isAr ? 'المغرب' : 'Maroc')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick KPI Strip */}
        <View style={[styles.kpiRow, { borderTopColor: c.surfaceBorder }]}>
          {/* Income */}
          <TouchableOpacity
            style={styles.kpiItem}
            onPress={() => {
              setEditIncome(String(income));
              setEditingField('income');
            }}
          >
            <Text style={[styles.kpiLabel, { color: c.textMuted }]}>
              {isAr ? 'الخلصة / الدخل' : 'Revenu Net'}
            </Text>
            {editingField === 'income' ? (
              <View style={styles.kpiEditRow}>
                <TextInput
                  style={[styles.kpiEditInput, { color: c.textPrimary, borderColor: c.primaryLight }]}
                  value={editIncome}
                  onChangeText={setEditIncome}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveField('income')} style={[styles.miniSave, { backgroundColor: c.primary }]}>
                  <AppIcon name="check" size={10} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.kpiValue, { color: c.textPrimary }]}>
                {income.toLocaleString('fr-FR')} MAD
              </Text>
            )}
          </TouchableOpacity>

          <View style={[styles.kpiDivider, { backgroundColor: c.surfaceBorder }]} />

          {/* Fixed Expenses / Rent */}
          <TouchableOpacity
            style={styles.kpiItem}
            onPress={() => {
              setEditFixed(String(fixedExpenses));
              setEditingField('fixed');
            }}
          >
            <Text style={[styles.kpiLabel, { color: '#EF4444' }]}>
              {isAr ? 'كراء ومصاريف' : 'Loyer & Fixes'}
            </Text>
            {editingField === 'fixed' ? (
              <View style={styles.kpiEditRow}>
                <TextInput
                  style={[styles.kpiEditInput, { color: '#EF4444', borderColor: '#EF4444' }]}
                  value={editFixed}
                  onChangeText={setEditFixed}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveField('fixed')} style={[styles.miniSave, { backgroundColor: '#EF4444' }]}>
                  <AppIcon name="check" size={10} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.kpiValue, { color: '#EF4444' }]}>
                {fixedExpenses > 0 ? `-${fixedExpenses.toLocaleString('fr-FR')} MAD` : '0 MAD'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={[styles.kpiDivider, { backgroundColor: c.surfaceBorder }]} />

          {/* Savings Target */}
          <TouchableOpacity
            style={styles.kpiItem}
            onPress={() => {
              setEditSavings(String(savingsTarget));
              setEditingField('savings');
            }}
          >
            <Text style={[styles.kpiLabel, { color: c.goldLight }]}>
              {isAr ? 'توفير' : 'Épargne'}
            </Text>
            {editingField === 'savings' ? (
              <View style={styles.kpiEditRow}>
                <TextInput
                  style={[styles.kpiEditInput, { color: c.goldLight, borderColor: c.goldLight }]}
                  value={editSavings}
                  onChangeText={setEditSavings}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveField('savings')} style={[styles.miniSave, { backgroundColor: c.gold }]}>
                  <AppIcon name="check" size={10} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.kpiValue, { color: c.goldLight }]}>
                {savingsTarget.toLocaleString('fr-FR')} MAD
              </Text>
            )}
          </TouchableOpacity>

          <View style={[styles.kpiDivider, { backgroundColor: c.surfaceBorder }]} />

          {/* Saving Rate */}
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiLabel, { color: c.textMuted }]}>
              {isAr ? 'النسبة' : 'Taux'}
            </Text>
            <Text style={[styles.kpiValue, { color: c.primaryLight }]}>
              {savingRate}%
            </Text>
          </View>
        </View>
      </View>

      {/* Financial Plan Breakdown Card */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
            {isAr ? 'توزيع الميزانية الشهرية' : 'Structure du Budget Mensuel'}
          </Text>
          {onEditBudget && (
            <TouchableOpacity onPress={onEditBudget} style={[styles.actionLink, { backgroundColor: c.surfaceRaised }]}>
              <Text style={[styles.actionLinkText, { color: c.primaryLight }]}>
                {isAr ? 'تعديل' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.breakdownRows}>
          <View style={styles.planRow}>
            <View style={styles.planLabelWrap}>
              <View style={[styles.dotIcon, { backgroundColor: c.textPrimary }]} />
              <Text style={[styles.planLabel, { color: c.textPrimary }]}>
                {isAr ? 'الراتب / الدخل الكلي' : 'Revenu net mensuel'}
              </Text>
            </View>
            <Text style={[styles.planAmount, { color: c.textPrimary }]}>
              {income.toLocaleString('fr-FR')} MAD
            </Text>
          </View>

          <View style={styles.planRow}>
            <View style={styles.planLabelWrap}>
              <View style={[styles.dotIcon, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.planLabel, { color: '#EF4444' }]}>
                {isAr ? 'الكراء والمصاريف الثابتة' : 'Charges fixes (Loyer & Factures)'}
              </Text>
            </View>
            <Text style={[styles.planAmount, { color: '#EF4444' }]}>
              {fixedExpenses > 0 ? `-${fixedExpenses.toLocaleString('fr-FR')} MAD` : '0 MAD'}
            </Text>
          </View>

          <View style={styles.planRow}>
            <View style={styles.planLabelWrap}>
              <View style={[styles.dotIcon, { backgroundColor: c.goldLight }]} />
              <Text style={[styles.planLabel, { color: c.goldLight }]}>
                {isAr ? 'الادخار والتوفير المستهدف' : 'Objectif d\'épargne visé'}
              </Text>
            </View>
            <Text style={[styles.planAmount, { color: c.goldLight }]}>
              {savingsTarget > 0 ? `-${savingsTarget.toLocaleString('fr-FR')} MAD` : '0 MAD'}
            </Text>
          </View>

          <View style={[styles.planDivider, { backgroundColor: c.surfaceBorder }]} />

          <View style={styles.planRowHighlight}>
            <View style={styles.planLabelWrap}>
              <View style={[styles.dotIcon, { backgroundColor: c.primaryLight }]} />
              <Text style={[styles.planTotalLabel, { color: c.primaryLight }]}>
                {isAr ? 'الميزانية المتاحة للمصاريف اليومية' : 'Budget disponible pour les dépenses'}
              </Text>
            </View>
            <Text style={[styles.planTotalAmount, { color: c.primaryLight }]}>
              {calculatedBudget.toLocaleString('fr-FR')} MAD
            </Text>
          </View>
        </View>
      </View>

      {/* Discipline & Status Card */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: c.textPrimary }]}>
            {isAr ? 'مؤشر الانضباط المالي' : 'Indice de Discipline'}
          </Text>
          <View style={[styles.scorePill, { backgroundColor: c.primaryGlow, borderColor: c.primaryLight }]}>
            <Text style={[styles.scorePillText, { color: c.primaryLight }]}>
              {healthScore > 0 ? `${healthScore}/100` : '--/100'}
            </Text>
          </View>
        </View>
        <Text style={[styles.disciplineNote, { color: c.textSecondary }]}>
          {healthScore > 0
            ? (isAr
                ? `الانضباط الحالي ديالك هو ${healthScore}/100 مبني على المصاريف اليومية ديالك مقارنة مع الميزانية.`
                : `Votre score actuel est de ${healthScore}/100, calculé en temps réel selon le rythme de vos dépenses quotidiennes.`)
            : (isAr
                ? 'سجل مصاريفك اليومية باش يبدا الحساب المباشر للانضباط المالي ديالك.'
                : 'Enregistrez vos dépenses pour calculer votre indice de discipline financière en temps réel.')}
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
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 20,
    fontWeight: '900',
  },
  heroText: {
    flex: 1,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  cityBadgeRow: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  cityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editInput: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  editInputSmall: {
    flex: 1,
    height: 28,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  saveBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  kpiDivider: {
    width: 1,
    height: 24,
  },
  kpiEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiEditInput: {
    width: 54,
    height: 26,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  miniSave: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionLink: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownRows: {
    gap: 8,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  planRowHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  planLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  planAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  planDivider: {
    height: 1,
    marginVertical: 4,
  },
  planTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  planTotalAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  disciplineNote: {
    fontSize: 12,
    lineHeight: 18,
  },
});
