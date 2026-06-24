import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';
import { formatRelativeDate } from '@/utils/dates';
import type { Expense, SplitType } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
}

const splitTypeLabels: Record<SplitType, string> = {
  equal: 'Equal split',
  percentage: 'Percentage split',
  custom: 'Custom split',
};

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${expense.description}, $${expense.amount.toFixed(2)}, paid by ${expense.paidByName}`}
      accessibilityHint="Tap to view expense details"
    >
      <Card>
        <View style={styles.header}>
          <Text style={[styles.description, { color: colors.textPrimary }]} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>${expense.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="person" size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {expense.paidByName} paid
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {formatRelativeDate(expense.createdAt)}
            </Text>
          </View>
          {expense.receiptPhotoURL && (
            <Ionicons name="camera" size={12} color={colors.secondary} />
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.divider }]}>
          <Badge variant="info" label={splitTypeLabels[expense.splitType]} />
          <Text style={[styles.splitPreview, { color: colors.textMuted }]} numberOfLines={1}>
            {expense.splitDetails.map((s) => s.displayName.split(' ')[0]).join(', ')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  description: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  splitPreview: {
    fontSize: fontSize.xs,
    flex: 1,
  },
});
