import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors as defaultColors } from '../theme/colors';
import AppIcon from './AppIcon';

/**
 * Format a timestamp into a human-readable relative date
 */
function formatRelativeDate(timestamp, lang) {
  const isAr = lang === 'ar';

  if (!timestamp) {
    return isAr ? 'تاريخ غير معروف' : 'Date inconnue';
  }

  const now = new Date();
  const date = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (timestamp >= todayStart) {
    return isAr ? `اليوم، ${timeStr}` : `Aujourd'hui, ${timeStr}`;
  } else if (timestamp >= yesterdayStart) {
    return isAr ? `البارح، ${timeStr}` : `Hier, ${timeStr}`;
  } else {
    // Format as "DD MMM" 
    const dayNum = date.getDate();
    const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
    const month = isAr ? monthsAr[date.getMonth()] : monthsFr[date.getMonth()];
    return `${dayNum} ${month}`;
  }
}

export default function TransactionList({ transactions, onDeleteTransaction, lang, themeColors }) {
  const isAr = lang === 'ar';
  const c = themeColors || defaultColors;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {isAr ? 'آخر العمليات والمصاريف' : 'Dernières opérations'}
        </Text>
        <Text style={[styles.countText, { color: c.textMuted }]}>
          {transactions.length} {isAr ? 'عمليات' : 'enregistrées'}
        </Text>
      </View>

      <View style={styles.list}>
        {transactions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: c.primaryGlow, borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <AppIcon name="wallet" size={24} color={c.primaryLight} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>
              {isAr ? 'مازال ما كاين حتى مصروف' : 'Aucune dépense enregistrée'}
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {isAr ? 'اضغط على الزر الدائري (+) لتحت باش تزيد أول عملية' : 'Appuyez sur le bouton vert (+) pour ajouter votre première dépense.'}
            </Text>
          </View>
        ) : (
          transactions.map((tx) => {
            const isCash = tx.method === 'Cash' || tx.methodAr === 'كاش';
            const displayDate = formatRelativeDate(tx.timestamp, lang);

            return (
              <View
                key={tx.id}
                style={[
                  styles.txRow,
                  { backgroundColor: c.surfaceRaised, borderColor: c.surfaceBorder },
                ]}
              >
                {/* Clean Vector Icon Circle */}
                <View style={[styles.iconBox, { backgroundColor: c.primaryGlow, borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                  <AppIcon name={tx.iconName || (isCash ? 'cash' : 'card')} size={18} color={c.primaryLight} strokeWidth={2} />
                </View>

                {/* Title & Metadata */}
                <View style={styles.details}>
                  <Text style={[styles.txTitle, { color: c.textPrimary }]} numberOfLines={1}>
                    {tx.title}
                  </Text>
                  <View style={styles.subRow}>
                    <Text style={[styles.catBadge, { color: tx.color || c.primaryLight, backgroundColor: `${tx.color || c.primary}18` }]}>
                      {isAr ? (tx.categoryLabelAr || tx.categoryLabel || tx.category) : (tx.categoryLabel || tx.category)}
                    </Text>
                    <Text style={[styles.txDate, { color: c.textMuted }]}>
                      {displayDate}
                    </Text>
                    <View
                      style={[
                        styles.methodBadge,
                        isCash ? styles.cashBadge : styles.cardBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.methodText,
                          isCash ? styles.cashText : styles.cardText,
                        ]}
                      >
                        {isAr ? tx.methodAr || tx.method : tx.method}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Amount & Delete */}
                <View style={styles.rightBlock}>
                  <Text style={[styles.amountText, { color: c.textPrimary }]}>
                    -{tx.amount.toLocaleString('fr-FR')} MAD
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteTransaction(tx.id)}
                    accessibilityLabel="Supprimer"
                  >
                    <AppIcon name="trash" size={14} color={c.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '700',
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cashBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  cashText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  cardText: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '700',
  },
  rightBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
