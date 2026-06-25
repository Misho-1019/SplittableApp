import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { calculateGroupBalances, applySettlementsToBalances } from '@/utils/calculateBalances';
import type { Balance, Expense, Group, Settlement } from '@/types';

export function useBalances(userGroups: Group[] | undefined) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const groupIdsKey = useMemo(
    () => (userGroups ?? []).map((g) => g.id).join(','),
    [userGroups],
  );

  const refresh = useCallback(async () => {
    if (!userGroups || userGroups.length === 0) {
      setBalances([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allBalances: Balance[] = [];

      for (const group of userGroups) {
        const expensesRef = collection(db, 'groups', group.id, 'expenses');
        const q = query(expensesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const expenses: Expense[] = snapshot.docs.map((d) => ({
          id: d.id,
          groupId: group.id,
          ...d.data(),
        })) as Expense[];

        const members = group.members.map((id) => ({
          id,
          displayName: group.memberNames[id] ?? id,
        }));

        let groupBalances = calculateGroupBalances(
          expenses,
          group.id,
          group.name,
          'USD',
          members,
        );

        // Apply completed settlements to balances
        const settlementsSnap = await getDocs(
          query(
            collection(db, 'groups', group.id, 'settlements'),
            orderBy('createdAt', 'desc'),
          ),
        );
        const settlements: Settlement[] = settlementsSnap.docs.map((d) => ({
          id: d.id,
          groupId: group.id,
          ...d.data(),
        })) as Settlement[];

        groupBalances = applySettlementsToBalances(groupBalances, settlements);

        allBalances.push(...groupBalances);
      }

      setBalances(allBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load balances'));
    } finally {
      setLoading(false);
    }
  }, [groupIdsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balances, loading, error, refresh };
}
