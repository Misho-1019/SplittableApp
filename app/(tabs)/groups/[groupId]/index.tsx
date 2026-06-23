import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { getGroup } from '@/services/groups.service';
import { getUsers } from '@/services/users.service';
import { MemberChip } from '@/components/groups/MemberChip';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { Card } from '@/components/shared/Card';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Divider } from '@/components/shared/Divider';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { Group, User } from '@/types';
import { calculateGroupBalances } from '@/utils/calculateBalances';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const fetched = await getGroup(groupId);
        if (cancelled) return;

        if (!fetched) {
          setError('Group not found.');
          setLoading(false);
          return;
        }

        setGroup(fetched);

        const userDocs = await getUsers(fetched.members);
        if (cancelled) return;
        setMembers(userDocs);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load group.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId]);

  const { expenses } = useExpenses(groupId ?? undefined);

  const balances = useMemo(() => {
    if (!group || members.length === 0) return [];
    return calculateGroupBalances(
      expenses,
      group.id,
      group.name,
      'USD',
      members.map((m) => ({ id: m.id, displayName: m.displayName })),
    );
  }, [expenses, group, members]);

  const currentUserBalance = useMemo(
    () => balances.find((b) => b.userId === user?.id),
    [balances, user?.id],
  );

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !group) {
    return (
      <View style={styles.container}>
        <Header title="Group" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="Error"
          message={error ?? 'Group not found.'}
        />
      </View>
    );
  }

  const isCreator = user?.id === group.createdBy;

  return (
    <View style={styles.container}>
      <Header title={group.name} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <Text style={styles.totalAmount}>
            ${group.totalExpenses.toFixed(2)}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="key" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{group.inviteCode}</Text>
            </View>
          </View>
        </Card>

        {currentUserBalance && Math.abs(currentUserBalance.netBalance) > 0.01 && (
          <View
            style={[
              styles.balanceBanner,
              currentUserBalance.netBalance > 0
                ? styles.balancePositive
                : styles.balanceNegative,
            ]}
          >
            <Ionicons
              name={
                currentUserBalance.netBalance > 0
                  ? 'trending-up'
                  : 'trending-down'
              }
              size={18}
              color={
                currentUserBalance.netBalance > 0
                  ? colors.success
                  : colors.danger
              }
            />
            <Text
              style={[
                styles.balanceText,
                currentUserBalance.netBalance > 0
                  ? styles.balanceTextPositive
                  : styles.balanceTextNegative,
              ]}
            >
              {currentUserBalance.netBalance > 0
                ? `You are owed $${currentUserBalance.netBalance.toFixed(2)}`
                : `You owe $${Math.abs(currentUserBalance.netBalance).toFixed(2)}`}
            </Text>
          </View>
        )}

        {balances.length > 0 && (
          <View style={styles.balancesList}>
            <Text style={styles.sectionTitle}>Balances</Text>
            {balances
              .filter((b) => Math.abs(b.netBalance) > 0.01 && b.userId !== user?.id)
              .map((b) => (
                <View key={b.userId} style={styles.balanceRow}>
                  <Text style={styles.balanceName}>{b.displayName}</Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      b.netBalance > 0
                        ? styles.balanceTextPositive
                        : styles.balanceTextNegative,
                    ]}
                  >
                    {b.netBalance > 0
                      ? `+$${b.netBalance.toFixed(2)}`
                      : `-$${Math.abs(b.netBalance).toFixed(2)}`}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Members</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.membersRow}
        >
          {members.map((member) => (
            <MemberChip
              key={member.id}
              name={member.displayName}
              photoURL={member.photoURL}
              isCurrentUser={member.id === user?.id}
            />
          ))}
          {isCreator && (
            <TouchableOpacity
              style={styles.addMemberChip}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/groups/[groupId]/members',
                  params: { groupId: group.id },
                })
              }
            >
              <View style={styles.addMemberIcon}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <Text style={styles.addMemberLabel}>Manage</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <Divider label="Expenses" />

        <ExpenseList
          groupId={group.id}
          onAddExpense={() =>
            router.push({
              pathname: '/(tabs)/groups/[groupId]/add-expense',
              params: { groupId: group.id },
            })
          }
          onExpensePress={(expenseId) =>
            router.push({
              pathname: '/(tabs)/groups/[groupId]/expenses/[expenseId]',
              params: { groupId: group.id, expenseId },
            })
          }
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/groups/[groupId]/add-expense',
            params: { groupId: group.id },
          })
        }
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

function ExpenseList({
  groupId,
  onAddExpense,
  onExpensePress,
}: {
  groupId: string;
  onAddExpense: () => void;
  onExpensePress: (expenseId: string) => void;
}) {
  const { expenses, loading } = useExpenses(groupId);

  if (loading && expenses.length === 0) {
    return <LoadingSpinner />;
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No Expenses Yet"
        message="Add your first expense to start splitting costs."
        actionLabel="Add Expense"
        onAction={onAddExpense}
      />
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onPress={() => onExpensePress(expense.id)}
        />
      ))}
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
  summaryCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  balancePositive: {
    backgroundColor: '#E8F5E9',
  },
  balanceNegative: {
    backgroundColor: '#FFEBEE',
  },
  balanceText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  balanceTextPositive: {
    color: colors.success,
  },
  balanceTextNegative: {
    color: colors.danger,
  },
  balancesList: {
    gap: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  balanceName: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  balanceAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  membersRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  addMemberChip: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 72,
  },
  addMemberIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
