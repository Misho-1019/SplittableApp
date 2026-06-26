import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getExpense, deleteExpense } from '@/services/expenses.service';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Avatar } from '@/components/shared/Avatar';
import { Header } from '@/components/shared/Header';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/shared/Button';
import { Divider } from '@/components/shared/Divider';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
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
  const { colors } = useTheme();

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Expense" onBack={() => router.back()} />
        <EmptyState icon="alert-circle-outline" title="Not Found" message="Expense not found." actionLabel="Go Back" onAction={() => router.back()} />
      </View>
    );
  }

  const isCreator = user?.id === expense.createdBy;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
          <Text style={[styles.amountValue, { color: colors.textPrimary }]}>
            ${expense.amount.toFixed(2)}
            <Text style={[styles.currency, { color: colors.textMuted }]}> {expense.currency}</Text>
          </Text>
        </Card>

        <Card>
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{expense.description}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid by</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{expense.paidByName}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Split type</Text>
            <Badge variant="info" label={splitTypeLabels[expense.splitType]} />
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {formatRelativeDate(expense.createdAt)}
            </Text>
          </View>
        </Card>

        <Divider label="Split Breakdown" />

        {expense.splitDetails.map((split) => (
          <Card key={split.userId} style={styles.splitRow}>
            <Avatar name={split.displayName} size="sm" />
            <Text style={[styles.splitName, { color: colors.textPrimary }]}>{split.displayName}</Text>
            <Text style={[styles.splitShare, { color: colors.textSecondary }]}>
              ${split.share.toFixed(2)}
              {split.percentage !== undefined &&
                ` (${split.percentage}%)`}
            </Text>
          </Card>
        ))}

        {expense.receiptPhotoURL && (
          <>
            <Divider label="Receipt" />
            <Card padded={false} style={styles.receiptContainer}>
              <Image
                source={{ uri: expense.receiptPhotoURL }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
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
    fontSize: fontSize.md,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  currency: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    fontSize: fontSize.sm,
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
    fontWeight: fontWeight.medium,
  },
  splitShare: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  receiptContainer: {
    overflow: 'hidden',
  },
  receiptImage: {
    width: '100%',
    height: 240,
  },
  receiptText: {
    fontSize: fontSize.sm,
  },
});
