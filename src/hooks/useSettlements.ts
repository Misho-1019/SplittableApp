import { useState, useEffect } from 'react';
import { subscribeToGroupSettlements } from '@/services/settlements.service';
import type { Settlement } from '@/types';

export function useSettlements(groupId: string | undefined) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!groupId) {
      setSettlements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGroupSettlements(
      groupId,
      (data) => {
        setSettlements(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [groupId]);

  return { settlements, loading, error };
}
