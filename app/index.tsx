import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/(tabs)/groups');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return null;
}
