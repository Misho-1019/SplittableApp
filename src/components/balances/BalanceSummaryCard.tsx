import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/shared/Card';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';

interface BalanceSummaryCardProps {
  netBalance: number;
  currency: string;
}

export function BalanceSummaryCard({
  netBalance,
  currency,
}: BalanceSummaryCardProps) {
  const { colors } = useTheme();
  const isOwed = netBalance > 0;
  const absAmount = Math.abs(netBalance);
  const isSettled = Math.abs(netBalance) < 0.01;

  return (
    <Card style={styles.container}>
      {isSettled ? (
        <>
          <View style={[styles.iconCircle, { backgroundColor: colors.textMuted }]}>
            <Ionicons name="checkmark" size={28} color={colors.textInverse} />
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>All Settled Up</Text>
          <Text style={[styles.amountSettled, { color: colors.textMuted }]}>You're all square!</Text>
        </>
      ) : (
        <>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isOwed ? colors.success : colors.danger },
            ]}
          >
            <Ionicons
              name={isOwed ? 'trending-up' : 'trending-down'}
              size={28}
              color={colors.textInverse}
            />
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {isOwed ? 'You are owed' : 'You owe'}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: isOwed ? colors.success : colors.danger },
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  amountSettled: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
