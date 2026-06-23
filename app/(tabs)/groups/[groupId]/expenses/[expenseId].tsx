import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getExpense, deleteExpense } from '@/services/expenses.service';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Avatar } from '@/components/shared/Avatar';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/shared/Button';
import { Divider } from '@/components/shared/Divider';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import { formatRelativeDate } from '@/utils/dates';
import type { Expense, SplitType } from '@/types';

const splitTypeLabels: Record<SplitType, string> = {
  equal: 'Equal',
  percentage: 'Percentage',
  custom: 'Custom',
};

export default function ExpenseDetailScreen() {
  const { groupId, expenseId } = useLocalSearchParams<{
    groupId: string;
    expenseId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !expenseId) return;
    let cancelled = false;

    async function load() {
      const fetched = await getExpense(groupId, expenseId);
      if (!cancelled) {
        setExpense(fetched);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId, expenseId]);

  const handleDelete = () => {
    if (!expense || !groupId) return;
    Alert.alert(
      'Delete Expense',
      `Delete "${expense.description}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(groupId, expense.id);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete expense.');
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!expense) {
    return (
      <View style={styles.container}>
        <Header title="Expense" onBack={() => router.back()} />
        <Text style={styles.notFound}>Expense not found.</Text>
      </View>
    );
  }

  const isCreator = user?.id === expense.createdBy;

  return (
    <View style={styles.container}>
      <Header
        title="Expense"
        onBack={() => router.back()}
        rightAction={
          isCreator
            ? { icon: 'trash-outline', onPress: handleDelete }
            : undefined
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>
            ${expense.amount.toFixed(2)}
            <Text style={styles.currency}> {expense.currency}</Text>
          </Text>
        </Card>

        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{expense.description}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid by</Text>
            <Text style={styles.detailValue}>{expense.paidByName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Split type</Text>
            <Badge variant="info" label={splitTypeLabels[expense.splitType]} />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatRelativeDate(expense.createdAt)}
            </Text>
          </View>
        </Card>

        <Divider label="Split Breakdown" />

        {expense.splitDetails.map((split) => (
          <Card key={split.userId} style={styles.splitRow}>
            <Avatar name={split.displayName} size="sm" />
            <Text style={styles.splitName}>{split.displayName}</Text>
            <Text style={styles.splitShare}>
              ${split.share.toFixed(2)}
              {split.percentage !== undefined &&
                ` (${split.percentage}%)`}
            </Text>
          </Card>
        ))}

        {expense.receiptPhotoURL && (
          <>
            <Divider label="Receipt" />
            <Card padded={false} style={styles.receiptPlaceholder}>
              <Ionicons name="image-outline" size={48} color={colors.textMuted} />
              <Text style={styles.receiptText}>Receipt attached</Text>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  notFound: {
    textAlign: 'center',
    padding: spacing.xl,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  currency: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  splitName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  splitShare: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  receiptPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  receiptText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
