import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import AppIcon from './AppIcon';

export default function Header({
  lang,
  onToggleLang,
  streakDays = 0,
  healthScore = 0,
  theme,
  onToggleTheme,
  themeColors,
}) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;
  const isDark = theme === 'dark';
  const [imageError, setImageError] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderBottomColor: c.surfaceBorder }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { borderColor: c.primaryLight, backgroundColor: c.primaryGlow }]}>
            {!imageError ? (
              <Image
                source={require('../../assets/app-logo.png')}
                style={styles.logoImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <AppIcon name="wallet" size={22} color={c.primaryLight} strokeWidth={2.2} />
            )}
          </View>
          <View>
            <Text style={[styles.appName, { color: c.textPrimary }]}>Mahfazati • محفظتي</Text>
            <Text style={[styles.tagline, { color: c.textSecondary }]}>
              {isAr ? 'دير ميزانيتك بذكاء' : 'Dépense moins. Atteins plus.'}
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          {/* Quick Theme Toggle */}
          {onToggleTheme && (
            <TouchableOpacity
              style={[styles.quickControlBtn, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}
              onPress={() => onToggleTheme(isDark ? 'light' : 'dark')}
              activeOpacity={0.8}
              accessibilityLabel="Changer de thème"
            >
              <AppIcon name={isDark ? 'sun' : 'moon'} size={16} color={c.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Quick Language Toggle */}
          <TouchableOpacity
            style={[styles.langButton, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}
            onPress={onToggleLang}
            activeOpacity={0.8}
            accessibilityLabel="Changer de langue"
          >
            <Text style={[styles.langText, { color: c.goldLight }]}>
              {isAr ? 'FR' : 'دارجة'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <View style={[styles.streakBadge, { backgroundColor: c.goldGlow, borderColor: 'rgba(245, 158, 11, 0.35)' }]}>
          <AppIcon name="flame" size={13} color={c.goldLight} strokeWidth={2.2} />
          <Text style={[styles.streakText, { color: c.goldLight }]}>
            {streakDays || 0} {isAr ? 'أيام بدون زيادة' : 'j de suite'}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: c.primaryGlow, borderColor: 'rgba(16, 185, 129, 0.35)' }]}>
          <Text style={[styles.scoreLabel, { color: c.textSecondary }]}>
            {isAr ? 'الانضباط :' : 'Score :'}
          </Text>
          <Text style={[styles.scoreValue, { color: c.primaryLight }]}>
            {healthScore > 0 ? `${healthScore}/100` : (isAr ? '--/100' : '--/100')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  appName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '800',
  },
});
