import React from 'react';
import { View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AppIcon({ name, size = 20, color = '#F8FAFC', style }) {
  const iconProps = { size, color, style };

  switch (name) {
    // 1. Navigation & Core
    case 'home':
    case 'dashboard':
      return <Feather name="home" {...iconProps} />;

    case 'bot':
    case 'coach':
      return <MaterialCommunityIcons name="robot-excited-outline" {...iconProps} />;

    case 'sparkles':
      return <Ionicons name="sparkles" {...iconProps} />;

    case 'analytics':
    case 'chart':
    case 'reports':
      return <Feather name="bar-chart-2" {...iconProps} />;

    case 'user':
    case 'profile':
      return <Feather name="user" {...iconProps} />;

    case 'settings':
      return <Feather name="settings" {...iconProps} />;

    case 'wallet':
      return <Ionicons name="wallet-outline" {...iconProps} />;

    case 'plus':
      return <Feather name="plus" {...iconProps} />;

    case 'mic':
      return <Feather name="mic" {...iconProps} />;

    case 'volume':
      return <Feather name="volume-2" {...iconProps} />;

    // 2. Fintech Categories (Revolut / mobile-skill.md style)
    case 'food':
    case 'restaurant':
      return <Ionicons name="restaurant-outline" {...iconProps} />;

    case 'coffee':
      return <Feather name="coffee" {...iconProps} />;

    case 'transport':
      return <Ionicons name="car-outline" {...iconProps} />;

    case 'bills':
      return <Feather name="zap" {...iconProps} />;

    case 'housing':
      return <Ionicons name="home-outline" {...iconProps} />;

    case 'health':
      return <Ionicons name="medkit-outline" {...iconProps} />;

    case 'personal':
    case 'shopping':
      return <Feather name="shopping-bag" {...iconProps} />;

    case 'family':
      return <Feather name="users" {...iconProps} />;

    case 'other':
      return <Feather name="package" {...iconProps} />;

    case 'cart':
      return <Feather name="shopping-cart" {...iconProps} />;

    case 'gift':
      return <Feather name="gift" {...iconProps} />;

    case 'book':
      return <Feather name="book-open" {...iconProps} />;

    case 'gym':
    case 'sport':
      return <Ionicons name="barbell-outline" {...iconProps} />;

    case 'paw':
    case 'pet':
      return <Ionicons name="paw-outline" {...iconProps} />;

    case 'heart':
      return <Feather name="heart" {...iconProps} />;

    case 'tool':
    case 'repair':
      return <Feather name="tool" {...iconProps} />;

    case 'briefcase':
    case 'work':
      return <Feather name="briefcase" {...iconProps} />;

    case 'camera':
      return <Feather name="camera" {...iconProps} />;

    case 'star':
      return <Feather name="star" {...iconProps} />;

    case 'tag':
      return <Feather name="tag" {...iconProps} />;

    // 3. Payment Methods
    case 'cash':
      return <Ionicons name="cash-outline" {...iconProps} />;

    case 'card':
      return <Feather name="credit-card" {...iconProps} />;

    case 'transfer':
      return <Ionicons name="swap-horizontal" {...iconProps} />;

    // 4. Badges, Gamification & Settings
    case 'flame':
    case 'streak':
      return <Ionicons name="flame" {...iconProps} />;

    case 'shield':
    case 'security':
      return <Feather name="shield" {...iconProps} />;

    case 'target':
      return <Feather name="target" {...iconProps} />;

    case 'sun':
      return <Feather name="sun" {...iconProps} />;

    case 'moon':
      return <Feather name="moon" {...iconProps} />;

    case 'download':
      return <Feather name="download" {...iconProps} />;

    case 'refresh':
      return <Feather name="refresh-cw" {...iconProps} />;

    case 'trash':
      return <Feather name="trash-2" {...iconProps} />;

    case 'lightbulb':
      return <Ionicons name="bulb-outline" {...iconProps} />;

    case 'mapPin':
      return <Feather name="map-pin" {...iconProps} />;

    case 'close':
      return <Feather name="x" {...iconProps} />;

    case 'eye':
      return <Feather name="eye" {...iconProps} />;

    case 'eye-off':
      return <Feather name="eye-off" {...iconProps} />;

    case 'key':
      return <Feather name="key" {...iconProps} />;

    case 'check':
      return <Feather name="check" {...iconProps} />;

    default:
      return <Feather name="circle" {...iconProps} />;
  }
}
