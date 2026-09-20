// Color System adhering to 60/30/10 rule and 8-point grid from mobile-skill.md

export const darkColors = {
  mode: 'dark',
  // 60% Neutral Base
  background: '#0A1118',
  surface: '#131F2D',
  surfaceRaised: '#1A293D',
  surfaceBorder: '#223851',
  surfaceGlass: 'rgba(19, 31, 45, 0.85)',
  
  // 30% Complementary Text & Structure
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0A1118',
  divider: 'rgba(255, 255, 255, 0.08)',

  // 10% Brand Accents
  primary: '#059669',
  primaryLight: '#10B981',
  primaryGlow: 'rgba(16, 185, 129, 0.15)',
  primaryTint: 'rgba(16, 185, 129, 0.06)',
  
  accentWarm: '#E07A5F',
  accentWarmLight: '#F4A261',
  accentWarmGlow: 'rgba(224, 122, 95, 0.15)',
  
  gold: '#F59E0B',
  goldLight: '#FCD34D',
  goldGlow: 'rgba(245, 158, 11, 0.18)',

  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.15)',

  // Semantic Categories
  categories: {
    food: '#F97316',
    transport: '#06B6D4',
    bills: '#8B5CF6',
    housing: '#3B82F6',
    health: '#EC4899',
    personal: '#10B981',
    family: '#F59E0B',
    other: '#64748B',
  }
};

export const lightColors = {
  mode: 'light',
  // 60% Neutral Base (Crisp porcelain & soft whites)
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceRaised: '#F1F5F9',
  surfaceBorder: '#E2E8F0',
  surfaceGlass: 'rgba(255, 255, 255, 0.92)',
  
  // 30% Complementary Text & Structure
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  divider: 'rgba(0, 0, 0, 0.06)',

  // 10% Brand Accents
  primary: '#059669',
  primaryLight: '#059669',
  primaryGlow: 'rgba(5, 150, 105, 0.12)',
  primaryTint: 'rgba(5, 150, 105, 0.08)',
  
  accentWarm: '#D9532F',
  accentWarmLight: '#E07A5F',
  accentWarmGlow: 'rgba(217, 83, 47, 0.12)',
  
  gold: '#D97706',
  goldLight: '#B45309',
  goldGlow: 'rgba(217, 119, 6, 0.12)',

  danger: '#DC2626',
  dangerGlow: 'rgba(220, 38, 38, 0.12)',

  // Semantic Categories
  categories: {
    food: '#EA580C',
    transport: '#0891B2',
    bills: '#7C3AED',
    housing: '#2563EB',
    health: '#DB2777',
    personal: '#059669',
    family: '#D97706',
    other: '#64748B',
  }
};

export const getThemeColors = (mode = 'dark') => {
  return mode === 'light' ? lightColors : darkColors;
};

// Default export for backwards compatibility
export const colors = darkColors;
