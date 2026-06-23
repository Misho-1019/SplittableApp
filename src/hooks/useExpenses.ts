import { useState, useEffect } from 'react';
import { subscribeToGroupExpenses } from '@/services/expenses.service';
import type { Expense } from '@/types';

export function useExpenses(groupId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGroupExpenses(
      groupId,
      (data) => {
        setExpenses(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [groupId]);

  return { expenses, loading, error };
}
