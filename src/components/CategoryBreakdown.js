import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import { categoriesList } from '../data/mockData';
import AppIcon from './AppIcon';

export default function CategoryBreakdown({ transactions, categories, lang, themeColors }) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;

  // Aggregate totals per category
  const totals = {};
  let grandTotal = 0;

  const allCategoriesMap = {};
  (categories || categoriesList).forEach((cat) => {
    allCategoriesMap[cat.id] = cat;
  });

  transactions.forEach((tx) => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    grandTotal += tx.amount;

    if (!allCategoriesMap[tx.category]) {
      allCategoriesMap[tx.category] = {
        id: tx.category,
        name: tx.categoryLabel || tx.category,
        nameAr: tx.categoryLabelAr || tx.categoryLabel || tx.category,
        iconName: tx.iconName || 'other',
        color: tx.color || '#64748B',
      };
    }
  });

  // Calculate percentages and sort descending
  const items = Object.values(allCategoriesMap)
    .map((cat) => {
      const amount = totals[cat.id] || 0;
      const pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
      return {
        ...cat,
        amount,
        pct,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {isAr ? 'فين كيمشيو فلوسك هاد الشهر ؟' : 'Répartition par poste de dépense'}
        </Text>
        <Text style={[styles.totalBadge, { color: c.primaryLight }]}>
          {grandTotal.toLocaleString('fr-FR')} MAD
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            {isAr ? 'لا توجد مصاريف لتحليلها بعد' : 'Aucune dépense à analyser pour l\'instant'}
          </Text>
        </View>
      ) : (
        <>
          {/* Stacked distribution bar */}
          <View style={[styles.multiBar, { backgroundColor: c.surfaceRaised }]}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.barSegment,
                  {
                    width: `${item.pct}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            ))}
          </View>

          {/* Category items list */}
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.leftCol}>
                  <View style={[styles.iconCircle, { backgroundColor: `${item.color}18`, borderColor: `${item.color}35` }]}>
                    <AppIcon name={item.iconName || 'other'} size={14} color={item.color} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.itemName, { color: c.textPrimary }]}>
                    {isAr ? item.nameAr : item.name}
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text style={[styles.itemAmount, { color: c.textPrimary }]}>
                    {item.amount.toLocaleString('fr-FR')} MAD
                  </Text>
                  <Text style={[styles.itemPct, { color: c.textMuted }]}>
                    {item.pct}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalBadge: {
    fontSize: 13,
    fontWeight: '800',
  },
  multiBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSegment: {
    height: '100%',
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemPct: {
    fontSize: 11,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  emptyBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
