import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import { voiceDarijaPresets } from '../data/mockData';
import AppIcon from './AppIcon';

export default function DarijaVoiceSim({ onAddParsedExpense, lang, themeColors }) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;
  const [activePhrase, setActivePhrase] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const handleSimulateVoice = (preset) => {
    setIsListening(true);
    setActivePhrase(preset.text);

    setTimeout(() => {
      setIsListening(false);
      onAddParsedExpense({
        title: preset.title,
        amount: preset.amount,
        category: preset.category,
        categoryLabel: preset.category === 'food' ? 'Bouffe' : preset.category === 'transport' ? 'Transport' : 'Factures',
        categoryLabelAr: preset.category === 'food' ? 'ماكلة' : preset.category === 'transport' ? 'طريق' : 'فواتير',
        method: 'Cash',
        methodAr: 'كاش',
        timestamp: Date.now(),
        iconName: preset.iconName || 'food',
        note: preset.note,
      });
    }, 650);
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <AppIcon name="mic" size={22} color="#06B6D4" strokeWidth={2.2} />
        </View>
        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {isAr ? 'الإملاء الصوتي بالدارجة' : 'Saisie Vocale en Darija'}
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {isListening
              ? (isAr ? 'كنسمعوك... تحليل بالذكاء الاصطناعي...' : 'Écoute en cours... analyse IA...')
              : (isAr ? 'كليكي على أي مثال باش تجربه فالحين :' : 'Cliquez sur une phrase pour tester :')}
          </Text>
        </View>
      </View>

      {/* Preset pills in Darija */}
      <View style={styles.pillsContainer}>
        {voiceDarijaPresets.map((preset, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.phrasePill,
              { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
              activePhrase === preset.text && isListening && styles.phrasePillActive,
            ]}
            onPress={() => handleSimulateVoice(preset)}
            activeOpacity={0.7}
          >
            <AppIcon name="sparkles" size={14} color="#06B6D4" strokeWidth={2} style={{ marginRight: 8 }} />
            <Text style={[styles.phraseText, { color: c.textPrimary }]}>
              "{preset.text}"
            </Text>
            <View style={styles.amountTag}>
              <Text style={styles.amountTagText}>{preset.amount} DH</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.speedIndicator, { color: c.textMuted }]}>
        {isAr ? 'إضافة فورية ف أقل من 3 ثواني وبدون كتابة' : 'Ajout intelligent en 1 tap sans rien taper'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  pillsContainer: {
    gap: 8,
  },
  phrasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  phrasePillActive: {
    borderColor: '#06B6D4',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  phraseText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  amountTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amountTagText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '800',
  },
  speedIndicator: {
    marginTop: 12,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
});
