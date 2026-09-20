import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import AppIcon from './AppIcon';

export default function WhatIfSimulator({ lang, themeColors }) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;
  const [monthlySaving, setMonthlySaving] = useState(400);

  const options = [200, 400, 600, 1000];

  const in3Months = monthlySaving * 3;
  const in6Months = monthlySaving * 6;
  const in12Months = monthlySaving * 12;

  const getMilestoneTip = (val) => {
    if (val <= 200) {
      return isAr ? 'كافي باش تخلص الويفي ديال عام' : 'Équivalent de ton abonnement Fibre / 4G pour l’année';
    }
    if (val <= 400) {
      return isAr ? 'عطلة زوينة ف مراكش ولا تغازوت' : 'Un super week-end détente à Taghazout ou Marrakech';
    }
    if (val <= 600) {
      return isAr ? 'ميزانية العيد الكبير بلا سلف' : 'Mouton de l’Aïd al-Adha sans aucun crédit';
    }
    return isAr ? 'صندوق الأمان والطوارئ (3 شهور)' : 'Fonds de sécurité complet (3 mois de loyer/charges)';
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { borderColor: c.gold, backgroundColor: c.goldGlow }]}>
          <AppIcon name="lightbulb" size={22} color={c.gold} strokeWidth={2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {isAr ? 'حاسبة التوفير الذكية "إيلا وفرتي..."' : 'Simulateur d’épargne "Et si..."'}
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {isAr ? 'شحال ممكن تجمع إيلا زيرتي شوية ؟' : 'Visualise tes économies futures sans effort'}
          </Text>
        </View>
      </View>

      {/* Select savings target buttons */}
      <Text style={[styles.label, { color: c.textSecondary }]}>
        {isAr ? 'إيلا وفرتي كل شهر :' : 'Si tu économises chaque mois :'}
      </Text>
      <View style={styles.chipsRow}>
        {options.map((opt) => {
          const isSelected = monthlySaving === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                isSelected && { backgroundColor: c.primary, borderColor: c.primaryLight },
              ]}
              onPress={() => setMonthlySaving(opt)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: c.textSecondary },
                  isSelected && styles.chipTextSelected,
                ]}
              >
                +{opt} DH
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Projection Cards (3, 6, 12 months) */}
      <View style={styles.projectionsGrid}>
        <View style={[styles.projBox, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.projDuration, { color: c.textSecondary }]}>
            {isAr ? 'فـ 3 شهور' : 'Dans 3 mois'}
          </Text>
          <Text style={[styles.projAmount, { color: c.primaryLight }]}>
            +{in3Months.toLocaleString('fr-FR')}
          </Text>
          <Text style={[styles.projCurrency, { color: c.textMuted }]}>MAD</Text>
        </View>

        <View
          style={[
            styles.projBox,
            styles.projBoxFeatured,
            { backgroundColor: c.goldGlow, borderColor: c.gold },
          ]}
        >
          <View style={[styles.popularBadge, { backgroundColor: c.gold }]}>
            <Text style={styles.popularText}>{isAr ? 'هدف مثالي' : 'Recommandé'}</Text>
          </View>
          <Text style={[styles.projDuration, { color: c.goldLight }]}>
            {isAr ? 'فـ 6 شهور' : 'Dans 6 mois'}
          </Text>
          <Text style={[styles.projAmount, { color: c.goldLight }]}>
            +{in6Months.toLocaleString('fr-FR')}
          </Text>
          <Text style={[styles.projCurrency, { color: c.goldLight }]}>MAD</Text>
        </View>

        <View style={[styles.projBox, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.projDuration, { color: c.textSecondary }]}>
            {isAr ? 'فـ عام كامل' : 'Dans 1 an'}
          </Text>
          <Text style={[styles.projAmount, { color: c.primaryLight }]}>
            +{in12Months.toLocaleString('fr-FR')}
          </Text>
          <Text style={[styles.projCurrency, { color: c.textMuted }]}>MAD</Text>
        </View>
      </View>

      {/* Concrete real-life Moroccan milestone */}
      <View style={[styles.milestoneNotice, { backgroundColor: c.surfaceRaised }]}>
        <AppIcon name="target" size={14} color={c.goldLight} strokeWidth={2.2} style={{ marginRight: 6 }} />
        <Text style={[styles.milestoneText, { color: c.textSecondary }]}>
          {getMilestoneTip(monthlySaving)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '800',
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  projBox: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  projBoxFeatured: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  popularText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  projDuration: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 2,
  },
  projAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  projCurrency: {
    fontSize: 10,
    fontWeight: '700',
  },
  milestoneNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
  },
  milestoneText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
});
