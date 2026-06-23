import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { calculateGroupBalances } from '@/utils/calculateBalances';
import { getGroup } from '@/services/groups.service';
import { getUsers } from '@/services/users.service';
import type { Balance, Expense, Group } from '@/types';

export function useBalances(userGroups: Group[] | undefined) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

        const groupBalances = calculateGroupBalances(
          expenses,
          group.id,
          group.name,
          'USD',
          members,
        );

        allBalances.push(...groupBalances);
      }

      setBalances(allBalances);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load balances'));
    } finally {
      setLoading(false);
    }
  }, [userGroups]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balances, loading, error, refresh };
}
