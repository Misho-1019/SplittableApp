import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { colors, fontSize, spacing } from '@/config/theme';

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
    return (
      <View style={styles.splash}>
        <Text style={styles.appName}>Splittable</Text>
        <Text style={styles.tagline}>Split expenses, not friendships</Text>
        <LoadingSpinner />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});
