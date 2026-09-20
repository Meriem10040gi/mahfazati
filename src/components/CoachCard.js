import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import AppIcon from './AppIcon';

export default function CoachCard({ coachAlert, onToggleAction, lang, themeColors }) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: 'rgba(224, 122, 95, 0.35)' }]}>
      {/* Coach Header */}
      <View style={styles.topRow}>
        <View style={[styles.avatarBadge, { borderColor: c.accentWarmLight, backgroundColor: c.accentWarmGlow }]}>
          <AppIcon name="bot" size={22} color={c.accentWarmLight} strokeWidth={2} />
        </View>
        <View style={styles.headerTitles}>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.coachName, { color: c.textPrimary }]}>Coach Mahfazati</Text>
            <View style={[styles.iaPill, { backgroundColor: c.primary }]}>
              <Text style={styles.iaPillText}>IA</Text>
            </View>
          </View>
          <Text style={[styles.alertTitle, { color: c.accentWarmLight }]}>
            {isAr ? coachAlert.titleAr : coachAlert.title}
          </Text>
        </View>
      </View>

      {/* Diagnostic message */}
      <View
        style={[
          styles.diagnosticBox,
          { backgroundColor: c.surfaceRaised, borderLeftColor: c.accentWarm },
        ]}
      >
        <Text style={[styles.diagnosticText, { color: c.textPrimary }]}>
          "{isAr ? coachAlert.diagnosticAr : coachAlert.diagnostic}"
        </Text>
      </View>

      {/* Actionable recommendations */}
      <View style={styles.actionsBlock}>
        <Text style={[styles.actionsHeader, { color: c.textSecondary }]}>
          {isAr ? '2 حلول عملية باش ترجع ف الريتم :' : '2 actions correctives immédiates :'}
        </Text>

        {coachAlert.actions.map((act) => {
          const isApplied = act.applied;
          return (
            <View
              key={act.id}
              style={[
                styles.actionRow,
                { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                isApplied && { borderColor: 'rgba(16, 185, 129, 0.4)', backgroundColor: c.primaryGlow },
              ]}
            >
              <View style={styles.actionInfo}>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: c.textPrimary },
                    isApplied && { color: c.primaryLight, textDecorationLine: 'line-through' },
                  ]}
                >
                  {isAr ? act.labelAr : act.label}
                </Text>
                <Text style={[styles.actionImpact, { color: c.goldLight }]}>{act.impact}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.applyBtn,
                  { backgroundColor: c.primary },
                  isApplied && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1, borderColor: c.primaryLight },
                ]}
                onPress={() => onToggleAction(act.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.applyBtnText,
                    isApplied && { color: c.primaryLight },
                  ]}
                >
                  {isApplied
                    ? (isAr ? 'مطبق ✓' : 'Appliqué ✓')
                    : (isAr ? 'طبق' : 'Appliquer')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* AI Simulation "Et si..." */}
      <View
        style={[
          styles.projectionCard,
          { backgroundColor: c.goldGlow, borderColor: 'rgba(245, 158, 11, 0.25)' },
        ]}
      >
        <AppIcon name="target" size={16} color={c.goldLight} strokeWidth={2.2} />
        <Text style={[styles.projectionText, { color: c.goldLight }]}>
          {isAr ? coachAlert.projectionAr : coachAlert.projection}
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
    shadowColor: '#E07A5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatarBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '800',
  },
  iaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  iaPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  diagnosticBox: {
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    marginBottom: 16,
  },
  diagnosticText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  actionsBlock: {
    marginBottom: 14,
  },
  actionsHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  actionInfo: {
    flex: 1,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
  },
  actionImpact: {
    fontSize: 11,
    fontWeight: '700',
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  projectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  projectionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
