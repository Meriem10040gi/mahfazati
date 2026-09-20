import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as defaultColors } from '../theme/colors';

export default function BudgetSpeedometer({
  monthlyBudget,
  fixedExpenses = 0,
  totalSpent,
  todaySpent,
  currentDay,
  totalDays,
  lang,
  themeColors,
}) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;

  const remaining = Math.max(0, (monthlyBudget || 0) - (totalSpent || 0));
  const spentPct = monthlyBudget > 0 ? Math.min(100, Math.round(((totalSpent || 0) / monthlyBudget) * 100)) : 0;
  const monthElapsedPct = Math.min(100, Math.round(((currentDay || 1) / (totalDays || 30)) * 100));
  const remainingDays = Math.max(1, (totalDays || 30) - (currentDay || 1));
  const dailyAllowance = Math.round(remaining / remainingDays);

  // Velocity status: are we spending faster than calendar days?
  const isOverPaced = spentPct > monthElapsedPct + 5;
  const isUnderPaced = spentPct < monthElapsedPct - 5 && totalSpent > 0;

  let paceColor = c.primaryLight;
  let paceLabel = totalSpent === 0
    ? (isAr ? 'ميزانية جاهزة ولم تصرف بعد' : 'Budget prêt et intact')
    : (isAr ? 'ريتم متوازن ممتاز' : 'Rythme bien équilibré');

  if (isOverPaced) {
    paceColor = c.accentWarm;
    paceLabel = isAr ? 'كتصرف كتر من القياس' : 'Dépense plus rapide que prévu';
  } else if (isUnderPaced) {
    paceColor = c.goldLight;
    paceLabel = isAr ? 'راك موفر مزيان' : 'Excellente maîtrise du budget';
  }

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
      {/* Pace Header pill */}
      <View style={styles.headerRow}>
        <View style={[styles.pacePill, { borderColor: paceColor, backgroundColor: `${paceColor}15` }]}>
          <Text style={[styles.pacePillText, { color: paceColor }]}>{paceLabel}</Text>
        </View>
        <Text style={[styles.calendarDayText, { color: c.textSecondary }]}>
          {isAr ? `نهار ${currentDay}/${totalDays}` : `Jour ${currentDay}/${totalDays}`}
        </Text>
      </View>

      {/* Main Big Number (Remaining to live) */}
      <View style={styles.heroBlock}>
        <Text style={[styles.heroLabel, { color: c.textSecondary }]}>
          {fixedExpenses > 0
            ? (isAr ? 'باقي ليك للمصاريف اليومية (بعد خصم الكراء)' : 'Reste à vivre (Loyer & charges déduits)')
            : (isAr ? 'باقي ليك باش تكمل الشهر' : 'Reste à vivre pour finir le mois')}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.heroAmount, { color: c.textPrimary }]}>
            {remaining.toLocaleString('fr-FR')}
          </Text>
          <Text style={[styles.currencyBadge, { color: c.primaryLight }]}>MAD</Text>
        </View>
        <Text style={[styles.heroSub, { color: c.textMuted }]}>
          {isAr
            ? `صرفتي ${totalSpent.toLocaleString('fr-FR')} درهم (${spentPct}%) من ميزانية ${monthlyBudget.toLocaleString('fr-FR')} درهم`
            : `${totalSpent.toLocaleString('fr-FR')} MAD utilisés (${spentPct}%) sur un budget de ${monthlyBudget.toLocaleString('fr-FR')} MAD`}
        </Text>
      </View>

      {/* Dynamic Progress Bar with calendar milestone pin */}
      <View style={styles.progressContainer}>
        <View style={[styles.track, { backgroundColor: c.surfaceRaised }]}>
          <View
            style={[
              styles.fillBar,
              {
                width: `${spentPct}%`,
                backgroundColor: isOverPaced ? c.accentWarm : c.primaryLight,
              },
            ]}
          />
          {/* Calendar day indicator line */}
          <View style={[styles.dayMarker, { left: `${monthElapsedPct}%`, backgroundColor: c.goldLight }]}>
            <View style={[styles.dayMarkerDot, { backgroundColor: c.gold }]} />
          </View>
        </View>

        <View style={styles.progressLegend}>
          <Text style={[styles.legendText, { color: c.textMuted }]}>
            0 MAD
          </Text>
          <Text style={[styles.legendText, { color: c.goldLight }]}>
            {isAr ? `علامة اليوم (${monthElapsedPct}%)` : `Rythme idéal (${monthElapsedPct}%)`}
          </Text>
          <Text style={[styles.legendText, { color: c.textMuted }]}>
            {monthlyBudget.toLocaleString('fr-FR')} MAD
          </Text>
        </View>
      </View>

      {/* 2 Quick Summary Tiles */}
      <View style={styles.tilesRow}>
        <View style={[styles.tile, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.tileLabel, { color: c.textSecondary }]}>
            {isAr ? 'صرفتي اليوم' : "Aujourd'hui"}
          </Text>
          <Text
            style={[
              styles.tileValue,
              { color: (todaySpent || 0) > 0 ? c.accentWarmLight : c.textPrimary },
            ]}
          >
            {(todaySpent || 0) > 0
              ? `-${(todaySpent || 0).toLocaleString('fr-FR')} MAD`
              : '0 MAD'}
          </Text>
          <Text style={[styles.tileHint, { color: c.textMuted }]}>
            {isAr ? 'كاش + كارطة' : 'Espèces + Carte'}
          </Text>
        </View>

        <View style={[styles.tile, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
          <Text style={[styles.tileLabel, { color: c.textSecondary }]}>
            {isAr ? 'المعدل المتبقي/نهار' : 'Rythme journalier'}
          </Text>
          <Text style={[styles.tileValue, { color: c.primaryLight }]}>
            ~{dailyAllowance.toLocaleString('fr-FR')} MAD
          </Text>
          <Text style={[styles.tileHint, { color: c.textMuted }]}>
            {isAr ? `على ${remainingDays} أيام باقيين` : `Sur les ${remainingDays} j restants`}
          </Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pacePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pacePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroBlock: {
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  currencyBadge: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 20,
  },
  track: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fillBar: {
    height: '100%',
    borderRadius: 6,
  },
  dayMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayMarkerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  tileHint: {
    fontSize: 10,
  },
});
