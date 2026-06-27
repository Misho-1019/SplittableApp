import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { usePreferences } from '@/context/PreferencesContext';
import { getGroup, removeMemberFromGroup } from '@/services/groups.service';
import { getUsers } from '@/services/users.service';
import { getSettlementsBetweenUsers } from '@/services/settlements.service';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { MemberChip } from '@/components/groups/MemberChip';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { ExpenseChart } from '@/components/charts/ExpenseChart';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Divider } from '@/components/shared/Divider';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { Group, User, Settlement } from '@/types';
import { getUserInvolvedBalances } from '@/utils/calculateBalances';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlementStatuses, setSettlementStatuses] = useState<Record<string, 'none' | 'pending' | 'completed'>>({});
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const { colors } = useTheme();
  const { currency } = usePreferences();

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

        if (user?.id && fetched.members.length > 1) {
          const statuses: Record<string, 'none' | 'pending' | 'completed'> = {};
          for (const memberId of fetched.members) {
            if (memberId === user.id) continue;
            const existing = await getSettlementsBetweenUsers(
              groupId,
              user.id,
              memberId,
            );
            if (existing.length > 0) {
              const latest = existing[0];
              statuses[memberId] =
                latest.status === 'completed' ? 'completed' : 'pending';
            } else {
              statuses[memberId] = 'none';
            }
          }
          if (!cancelled) setSettlementStatuses(statuses);
        }

        // Fetch all settlements for balance adjustment
        const settlementsSnap = await getDocs(
          query(
            collection(db, 'groups', groupId, 'settlements'),
            orderBy('createdAt', 'desc'),
          ),
        );
        const fetchedSettlements: Settlement[] = settlementsSnap.docs.map((d) => ({
          id: d.id,
          groupId,
          ...d.data(),
        })) as Settlement[];
        if (!cancelled) setSettlements(fetchedSettlements);
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

  const userBalances = useMemo(() => {
    if (!group || members.length === 0) return [];
    return getUserInvolvedBalances(
      expenses,
      group.id,
      group.name,
      currency.code,
      members.map((m) => ({ id: m.id, displayName: m.displayName })),
      user?.id ?? '',
      settlements,
    );
  }, [expenses, group, members, user?.id, settlements]);

  const userNetBalance = useMemo(() => {
    const owed = userBalances
      .filter((b) => b.direction === 'receive')
      .reduce((s, b) => s + b.amount, 0);
    const owes = userBalances
      .filter((b) => b.direction === 'pay')
      .reduce((s, b) => s + b.amount, 0);
    return owed - owes;
  }, [userBalances]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error || !group) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={group.name} onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summaryCard}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
          <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>
            ${group.totalExpenses.toFixed(2)}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="key" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>{group.inviteCode}</Text>
            </View>
          </View>
        </Card>

        {Math.abs(userNetBalance) > 0.01 && (
          <View
            style={[
              styles.balanceBanner,
              { backgroundColor: userNetBalance > 0 ? colors.successBackground : colors.dangerBackground },
            ]}
          >
            <Ionicons
              name={userNetBalance > 0 ? 'trending-up' : 'trending-down'}
              size={18}
              color={userNetBalance > 0 ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.balanceText,
                userNetBalance > 0
                  ? { color: colors.success }
                  : { color: colors.danger },
              ]}
            >
              {userNetBalance > 0
                ? `You are owed $${userNetBalance.toFixed(2)}`
                : `You owe $${Math.abs(userNetBalance).toFixed(2)}`}
            </Text>
          </View>
        )}

        {userBalances.length > 0 && (
          <View style={styles.balancesList}>
            <Divider label="Balances" />
            {userBalances.map((b) => {
                const isOwed = b.direction === 'receive';
                const status = settlementStatuses[b.userId] ?? 'none';

                return (
                  <View key={b.userId} style={styles.balanceRow}>
                    <View style={styles.balanceLeft}>
                      <Text style={[styles.balanceName, { color: colors.textPrimary }]}>{b.displayName}</Text>
                      {status !== 'none' && (
                        <Badge
                          variant={status === 'completed' ? 'completed' : 'pending'}
                          label={status === 'completed' ? 'Settled' : 'Awaiting'}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.balanceAmount,
                        isOwed
                          ? { color: colors.success }
                          : { color: colors.danger },
                      ]}
                    >
                      {isOwed
                        ? `+$${b.amount.toFixed(2)}`
                        : `-$${b.amount.toFixed(2)}`}
                    </Text>
                  </View>
                );
              })}
          </View>
        )}

        {expenses.length > 0 && (
          <ExpenseChart expenses={expenses.filter((e) =>
            e.paidBy === user?.id || e.splitDetails.some((s) => s.userId === user?.id)
          )} />
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Members</Text>
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
              <View style={[styles.addMemberIcon, { borderColor: colors.primary }]}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.addMemberLabel, { color: colors.primary }]}>Members</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {!isCreator && (
          <TouchableOpacity
            style={[styles.leaveButton, { borderColor: colors.danger }]}
            onPress={() => {
              Alert.alert(
                'Leave Group',
                `Leave "${group.name}"? You can be re-added by the group creator.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await removeMemberFromGroup(group.id, user!.id);
                        router.replace('/(tabs)/groups');
                      } catch (err) {
                        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to leave group.');
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Ionicons name="exit-outline" size={20} color={colors.danger} />
            <Text style={[styles.leaveText, { color: colors.danger }]}>Leave Group</Text>
          </TouchableOpacity>
        )}

        <Divider label="Expenses" />

        <TouchableOpacity
          style={[styles.addExpenseButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/groups/[groupId]/add-expense',
              params: { groupId: group.id },
            })
          }
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={[styles.addExpenseLabel, { color: colors.primary }]}>New Expense</Text>
        </TouchableOpacity>

        <ExpenseList
            groupId={group.id}
            userId={user?.id ?? ''}
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
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
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
  userId,
  onAddExpense,
  onExpensePress,
}: {
  groupId: string;
  userId: string;
  onAddExpense: () => void;
  onExpensePress: (expenseId: string) => void;
}) {
  const { expenses, loading } = useExpenses(groupId);

  const userExpenses = userId
    ? expenses.filter(
        (e) =>
          e.paidBy === userId ||
          e.splitDetails.some((s) => s.userId === userId),
      )
    : expenses;

  if (loading && userExpenses.length === 0) {
    return <LoadingSpinner />;
  }

  if (userExpenses.length === 0) {
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
      {userExpenses.map((expense) => (
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
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
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
  },
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },

  balanceText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  balanceName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  balanceAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
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
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  leaveText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
  },
  addExpenseLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
