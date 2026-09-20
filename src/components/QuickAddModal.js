import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as defaultColors } from '../theme/colors';
import {
  categoriesList as defaultCategoriesList,
  categorySuggestions,
  availableCategoryIcons,
  categoryColorsPalette,
} from '../data/mockData';
import AppIcon from './AppIcon';

export default function QuickAddModal({
  visible,
  onClose,
  onAddExpense,
  categories,
  onAddCategory,
  lang,
  themeColors,
}) {
  const insets = useSafeAreaInsets();
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;

  const currentCategories = categories && categories.length > 0 ? categories : defaultCategoriesList;

  // Form State
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentCategories[0]?.id || 'food');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [purpose, setPurpose] = useState('');

  // Custom Category Creator Mode
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('gift');
  const [newCatColor, setNewCatColor] = useState('#10B981');

  const quickAmounts = [20, 50, 100, 200];

  // Active suggestions for selected category
  const activeSuggestions = categorySuggestions[selectedCategory]
    ? (isAr ? categorySuggestions[selectedCategory].ar : categorySuggestions[selectedCategory].fr)
    : [];

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const categoryObj = currentCategories.find((item) => item.id === selectedCategory) || currentCategories[0];

    onAddExpense({
      title: purpose.trim() || (isAr ? categoryObj.nameAr : categoryObj.name),
      purpose: purpose.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      categoryLabel: categoryObj.name,
      categoryLabelAr: categoryObj.nameAr,
      method: paymentMethod,
      methodAr: paymentMethod === 'Cash' ? 'كاش' : paymentMethod === 'Carte' ? 'كارطة' : 'فيرمون',
      iconName: categoryObj.iconName || 'other',
      color: categoryObj.color,
      timestamp: Date.now(),
    });

    // Reset fields
    setAmount('');
    setPurpose('');
    setIsCreatingCategory(false);
    onClose();
  };

  const handleCreateCustomCategory = () => {
    if (!newCatName.trim()) return;

    const newId = `cat-custom-${Date.now()}`;
    const newCategory = {
      id: newId,
      name: newCatName.trim(),
      nameAr: newCatNameAr.trim() || newCatName.trim(),
      iconName: newCatIcon,
      color: newCatColor,
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCategory);
    }

    setSelectedCategory(newId);
    setNewCatName('');
    setNewCatNameAr('');
    setIsCreatingCategory(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: c.surface,
              borderColor: c.surfaceBorder,
              paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 12) + 14,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={[styles.handleBar, { backgroundColor: c.surfaceBorder }]} />

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.modalTitle, { color: c.textPrimary }]}>
                {isAr ? 'زيد مصاريف جديدة' : 'Ajouter une dépense'}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>
                {isAr ? 'حدد الثمن، النوع وسبب المصروف' : 'Montant, catégorie & motif'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: c.surfaceRaised }]}
            >
              <AppIcon name="close" size={14} color={c.textSecondary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Amount input & presets */}
            <View style={styles.amountSection}>
              <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
                {isAr ? 'شحال خسرتي ؟' : 'Montant en Dirhams (MAD)'}
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}>
                <TextInput
                  style={[styles.amountInput, { color: c.textPrimary }]}
                  placeholder="0"
                  placeholderTextColor={c.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus={true}
                />
                <Text style={[styles.inputCurrency, { color: c.primaryLight }]}>MAD</Text>
              </View>

              {/* Quick amount chips */}
              <View style={styles.chipsRow}>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.chip, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}
                    onPress={() => setAmount(String(amt))}
                  >
                    <Text style={[styles.chipText, { color: c.textPrimary }]}>+{amt} DH</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category selection */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.sectionLabel, { color: c.textSecondary, marginBottom: 0 }]}>
                  {isAr ? 'النوع ديال المصروف' : 'Catégorie'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsCreatingCategory(!isCreatingCategory)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <AppIcon name="plus" size={12} color={c.primaryLight} strokeWidth={2.5} />
                  <Text style={{ color: c.primaryLight, fontSize: 12, fontWeight: '700' }}>
                    {isCreatingCategory
                      ? (isAr ? 'إلغاء' : 'Annuler')
                      : (isAr ? '+ زد نوع مخصص' : '+ Nouvelle catégorie')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Inline Category Creator */}
              {isCreatingCategory && (
                <View style={[styles.creatorCard, { backgroundColor: c.surfaceRaised, borderColor: c.primaryLight }]}>
                  <Text style={{ color: c.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 8 }}>
                    {isAr ? 'إنشاء فئة جديدة' : 'Créer une catégorie personnalisée'}
                  </Text>

                  {/* Name inputs */}
                  <TextInput
                    style={[styles.miniInput, { backgroundColor: c.surface, borderColor: c.surfaceBorder, color: c.textPrimary }]}
                    placeholder={isAr ? 'اسم الفئة بالفرنسية (Ex: Daret, Sport...)' : 'Nom (ex: Daret, Salle de sport, Animaux...)'}
                    placeholderTextColor={c.textMuted}
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />
                  <TextInput
                    style={[styles.miniInput, { backgroundColor: c.surface, borderColor: c.surfaceBorder, color: c.textPrimary, marginTop: 6 }]}
                    placeholder={isAr ? 'اسم الفئة بالدارجة (اختياري)' : 'Nom en Arabe (optionnel)'}
                    placeholderTextColor={c.textMuted}
                    value={newCatNameAr}
                    onChangeText={setNewCatNameAr}
                  />

                  {/* Icon Picker */}
                  <Text style={[styles.miniLabel, { color: c.textSecondary, marginTop: 10 }]}>
                    {isAr ? 'اختر الأيقونة :' : 'Choisir l\'icône :'}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {availableCategoryIcons.map((ic) => {
                        const isIcSel = newCatIcon === ic;
                        return (
                          <TouchableOpacity
                            key={ic}
                            onPress={() => setNewCatIcon(ic)}
                            style={[
                              styles.iconPickTile,
                              { backgroundColor: c.surface, borderColor: isIcSel ? newCatColor : c.surfaceBorder },
                              isIcSel && { backgroundColor: `${newCatColor}25` },
                            ]}
                          >
                            <AppIcon name={ic} size={18} color={isIcSel ? newCatColor : c.textSecondary} strokeWidth={2} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>

                  {/* Color Picker */}
                  <Text style={[styles.miniLabel, { color: c.textSecondary, marginTop: 6 }]}>
                    {isAr ? 'اختر اللون :' : 'Choisir la couleur :'}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                    {categoryColorsPalette.map((col) => {
                      const isColSel = newCatColor === col;
                      return (
                        <TouchableOpacity
                          key={col}
                          onPress={() => setNewCatColor(col)}
                          style={[
                            styles.colorDot,
                            { backgroundColor: col },
                            isColSel && { borderWidth: 2.5, borderColor: '#FFF' },
                          ]}
                        />
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    onPress={handleCreateCustomCategory}
                    disabled={!newCatName.trim()}
                    style={[
                      styles.createBtn,
                      { backgroundColor: c.primary },
                      !newCatName.trim() && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>
                      {isAr ? 'حفظ الفئة واختيارها ✓' : 'Ajouter et sélectionner ✓'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Grid of Categories */}
              <View style={styles.categoriesGrid}>
                {currentCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catButton,
                        { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                        isSelected && { borderColor: cat.color, backgroundColor: `${cat.color}20` },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <View style={[styles.catIconWrap, { backgroundColor: `${cat.color}15` }]}>
                        <AppIcon name={cat.iconName || 'other'} size={20} color={cat.color} strokeWidth={2} />
                      </View>
                      <Text
                        style={[
                          styles.catName,
                          { color: isSelected ? c.textPrimary : c.textSecondary },
                          isSelected && { fontWeight: '700' },
                        ]}
                        numberOfLines={2}
                      >
                        {isAr ? cat.nameAr : cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Purpose & Contextual Suggestions (The "Why / علاش ؟") */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[styles.sectionLabel, { color: c.textSecondary, marginBottom: 0 }]}>
                  {isAr ? 'علاش صرفتي ؟ (السبب / المحل)' : 'Motif / Pour quelle raison ?'}
                </Text>
                <Text style={{ color: c.textMuted, fontSize: 11 }}>
                  {isAr ? 'كيساعد المدرب الذكي' : 'Aide l\'IA à analyser'}
                </Text>
              </View>

              {/* Fast Tap Chips based on selected Category */}
              {activeSuggestions.length > 0 && (
                <View style={styles.suggestionChipsWrap}>
                  {activeSuggestions.map((sug) => {
                    const isSelectedSug = purpose === sug;
                    return (
                      <TouchableOpacity
                        key={sug}
                        onPress={() => setPurpose(sug)}
                        style={[
                          styles.sugChip,
                          { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                          isSelectedSug && { backgroundColor: c.primaryGlow, borderColor: c.primaryLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sugChipText,
                            { color: isSelectedSug ? c.primaryLight : c.textSecondary },
                            isSelectedSug && { fontWeight: '700' },
                          ]}
                        >
                          {sug}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Custom Free Text Input */}
              <TextInput
                style={[
                  styles.noteInput,
                  { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder, color: c.textPrimary },
                ]}
                placeholder={isAr ? 'مثال: تقضية السيمانة فالمرشي، قهوة الحومة...' : 'Ex: Souk de la semaine, Pharmacie, Café...'}
                placeholderTextColor={c.textMuted}
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>

            {/* Payment method */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>
                {isAr ? 'باش خلصتي ؟' : 'Moyen de paiement'}
              </Text>
              <View style={styles.methodsRow}>
                {[
                  { id: 'Cash', label: 'Cash (كاش)', iconName: 'cash' },
                  { id: 'Carte', label: 'Carte (كارطة)', iconName: 'card' },
                  { id: 'Virement', label: 'Virement (فيرمون)', iconName: 'transfer' },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.methodBtn,
                        { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                        isSelected && { borderColor: c.primaryLight, backgroundColor: c.primaryGlow },
                      ]}
                      onPress={() => setPaymentMethod(m.id)}
                    >
                      <AppIcon
                        name={m.iconName}
                        size={18}
                        color={isSelected ? c.primaryLight : c.textSecondary}
                        strokeWidth={2}
                      />
                      <Text
                        style={[
                          styles.methodLabel,
                          { color: isSelected ? c.primaryLight : c.textSecondary, marginTop: 4 },
                          isSelected && { fontWeight: '700' },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: c.primary },
                (!amount || parseFloat(amount) <= 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Text style={styles.submitButtonText}>
                {isAr ? 'سجل المصروف دابا ✓' : 'Valider la dépense ✓'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '92%',
    borderWidth: 1,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amountSection: {
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: 30,
    fontWeight: '900',
  },
  inputCurrency: {
    fontSize: 18,
    fontWeight: '800',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  creatorCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  miniInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconPickTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  createBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catButton: {
    width: '23%',
    minHeight: 74,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 4,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  catName: {
    fontSize: 10,
    textAlign: 'center',
  },
  suggestionChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  sugChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sugChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  methodLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
