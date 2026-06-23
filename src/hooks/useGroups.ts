import { useState, useEffect } from 'react';
import { subscribeToUserGroups } from '@/services/groups.service';
import type { Group } from '@/types';

export function useGroups(userId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserGroups(
      userId,
      (data) => {
        setGroups(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { groups, loading, error };
}
