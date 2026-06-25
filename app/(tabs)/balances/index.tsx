import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { useBalances } from '@/hooks/useBalances';
import { getAllUserSettlements } from '@/services/settlements.service';
import { BalanceSummaryCard } from '@/components/balances/BalanceSummaryCard';
import { BalanceRow } from '@/components/balances/BalanceRow';
import { SettlementCard } from '@/components/balances/SettlementCard';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Divider } from '@/components/shared/Divider';
import {
  getOwedToUser,
  getUserOwes,
  getOverallNetBalance,
} from '@/utils/calculateBalances';
import type { BalanceFromPerspective } from '@/utils/calculateBalances';
import { useTheme } from '@/context/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '@/config/theme';
import type { Settlement } from '@/types';
import { useState, useEffect, useCallback } from 'react';

type ListItem =
  | { type: 'divider'; key: string; label: string }
  | (BalanceFromPerspective & { type: 'balance'; key: string })
  | { type: 'settlement'; key: string; settlement: Settlement };

export default function BalancesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups } = useGroups(user?.id);
  const { balances, loading, error, refresh } = useBalances(groups);
  const { colors } = useTheme();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loadingSettlements, setLoadingSettlements] = useState(true);

  const loadSettlements = useCallback(async () => {
    if (!user || groups.length === 0) {
      setSettlements([]);
      setLoadingSettlements(false);
      return;
    }

    setLoadingSettlements(true);
    try {
      const data = await getAllUserSettlements(
        user.id,
        groups.map((g) => g.id),
      );
      setSettlements(data);
    } finally {
      setLoadingSettlements(false);
    }
  }, [user?.id, groups.map((g) => g.id).join(',')]);

  useEffect(() => {
    loadSettlements();
  }, [loadSettlements]);

  if (!user) return null;

  const netBalance = getOverallNetBalance(balances, user.id);
  const owedToYou = getOwedToUser(balances, user.id);
  const youOwe = getUserOwes(balances, user.id);
  const hasAnyBalances = owedToYou.length > 0 || youOwe.length > 0;

  const handleSettleUp = (item: BalanceFromPerspective) => {
    router.push({
      pathname: '/(tabs)/balances/settle',
      params: {
        groupId: item.groupId,
        groupName: item.groupName,
        toUserId: item.userId,
        toUserName: item.displayName,
        amount: item.amount.toFixed(2),
        currency: item.currency,
        direction: item.direction,
      },
    });
  };

  const sectionHeader = (label: string) => <Divider label={label} />;

  const data: ListItem[] = [
    ...(owedToYou.length > 0
      ? [{ type: 'divider' as const, key: 'owed-divider', label: 'You are owed' }]
      : []),
    ...owedToYou.map((b) => ({
      type: 'balance' as const,
      key: b.userId + b.groupId,
      ...b,
    })),
    ...(youOwe.length > 0
      ? [{ type: 'divider' as const, key: 'owe-divider', label: 'You owe' }]
      : []),
    ...youOwe.map((b) => ({
      type: 'balance' as const,
      key: b.userId + b.groupId,
      ...b,
    })),
    ...(settlements.length > 0
      ? [
          {
            type: 'divider' as const,
            key: 'settlement-divider',
            label: 'Settlement History',
          },
        ]
      : []),
    ...settlements.map((s) => ({
      type: 'settlement' as const,
      key: s.id,
      settlement: s,
    })),
  ];

  if (loading && balances.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Balances" />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Balances" />

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.danger }]}>
          <Text style={[styles.errorText, { color: colors.textInverse }]}>{error.message}</Text>
        </View>
      )}

      {data.length === 0 && !hasAnyBalances ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="All Settled Up"
          message="No outstanding balances. Everything is paid off!"
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <BalanceSummaryCard netBalance={netBalance} currency="USD" />
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'divider') {
              return sectionHeader(item.label);
            }
            if (item.type === 'settlement') {
              return (
                <SettlementCard
                  settlement={item.settlement}
                  currentUserId={user.id}
                />
              );
            }
            return (
              <BalanceRow
                displayName={item.displayName}
                groupName={item.groupName}
                amount={item.amount}
                direction={item.direction}
                onPress={() => handleSettleUp(item)}
              />
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                refresh();
                loadSettlements();
              }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorBanner: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
