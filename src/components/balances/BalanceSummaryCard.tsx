import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/shared/Card';
import { colors, fontSize, fontWeight, spacing } from '@/config/theme';

interface BalanceSummaryCardProps {
  netBalance: number;
  currency: string;
}

export function BalanceSummaryCard({
  netBalance,
  currency,
}: BalanceSummaryCardProps) {
  const isOwed = netBalance > 0;
  const absAmount = Math.abs(netBalance);
  const isSettled = Math.abs(netBalance) < 0.01;

  return (
    <Card style={styles.container}>
      {isSettled ? (
        <>
          <View style={[styles.iconCircle, styles.settledCircle]}>
            <Ionicons name="checkmark" size={28} color={colors.textInverse} />
          </View>
          <Text style={styles.label}>All Settled Up</Text>
          <Text style={styles.amountSettled}>You're all square!</Text>
        </>
      ) : (
        <>
          <View
            style={[
              styles.iconCircle,
              isOwed ? styles.positiveCircle : styles.negativeCircle,
            ]}
          >
            <Ionicons
              name={isOwed ? 'trending-up' : 'trending-down'}
              size={28}
              color={colors.textInverse}
            />
          </View>
          <Text style={styles.label}>
            {isOwed ? 'You are owed' : 'You owe'}
          </Text>
          <Text
            style={[
              styles.amount,
              isOwed ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isOwed ? '+' : '-'}${absAmount.toFixed(2)}
          </Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  positiveCircle: {
    backgroundColor: colors.success,
  },
  negativeCircle: {
    backgroundColor: colors.danger,
  },
  settledCircle: {
    backgroundColor: colors.textMuted,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.danger,
  },
  amountSettled: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
});
