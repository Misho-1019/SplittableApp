import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
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
import { colors, spacing } from '@/config/theme';
import type { Settlement } from '@/types';
import { useState, useEffect, useCallback } from 'react';

export default function BalancesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups } = useGroups(user?.id);
  const { balances, loading, error, refresh } = useBalances(groups);
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

  const netBalance = balances
    .filter((b) => b.userId === user.id)
    .reduce((sum, b) => sum + b.netBalance, 0);

  const owedToYou = balances.filter(
    (b) => b.netBalance < -0.01 && b.userId !== user.id,
  );
  const youOwe = balances.filter(
    (b) => b.netBalance > 0.01 && b.userId !== user.id,
  );

  const handleSettleUp = (balance: typeof balances[0], direction: 'receive' | 'pay') => {
    router.push({
      pathname: '/(tabs)/balances/settle',
      params: {
        groupId: balance.groupId,
        groupName: balance.groupName,
        toUserId: balance.userId,
        toUserName: balance.displayName,
        amount: Math.abs(balance.netBalance).toFixed(2),
        currency: balance.currency,
        direction,
      },
    });
  };

  const headerComponent = (
    <View style={styles.headerSection}>
      <BalanceSummaryCard netBalance={netBalance} currency="USD" />
    </View>
  );

  const sectionHeader = (label: string) => (
    <Divider label={label} />
  );

  const data = [
    ...(owedToYou.length > 0 ? [{ type: 'divider' as const, key: 'owed-divider', label: 'You are owed' }] : []),
    ...owedToYou.map((b) => ({ type: 'balance' as const, key: b.userId + b.groupId, ...b, netBalance: Math.abs(b.netBalance), direction: 'receive' as const })),
    ...(youOwe.length > 0 ? [{ type: 'divider' as const, key: 'owe-divider', label: 'You owe' }] : []),
    ...youOwe.map((b) => ({ type: 'balance' as const, key: b.userId + b.groupId, ...b, netBalance: -Math.abs(b.netBalance), direction: 'pay' as const })),
    ...(settlements.length > 0 ? [{ type: 'divider' as const, key: 'settlement-divider', label: 'Settlement History' }] : []),
    ...settlements.map((s) => ({ type: 'settlement' as const, key: s.id, settlement: s })),
  ];

  if (loading && balances.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Balances" />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Balances" />

      {data.length === 0 ? (
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
                netBalance={item.netBalance}
                onPress={() => handleSettleUp(item, item.direction)}
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
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.md,
    paddingBottom: spacing.xs,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
