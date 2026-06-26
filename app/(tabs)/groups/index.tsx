import { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { deleteGroup } from '@/services/groups.service';
import { GroupCard } from '@/components/groups/GroupCard';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { GroupCardSkeleton } from '@/components/shared/SkeletonRow';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

export default function GroupListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, loading, error } = useGroups(user?.id);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { colors } = useTheme();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGroup(deleteTarget);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="My Groups"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/(tabs)/groups/add'),
        }}
      />

      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.danger }]}>
          <Ionicons name="warning" size={18} color={colors.textInverse} />
          <Text style={[styles.errorText, { color: colors.textInverse }]}>{error.message}</Text>
        </View>
      )}

      {loading && groups.length === 0 ? (
        <View style={styles.skeletonList}>
          <GroupCardSkeleton />
          <GroupCardSkeleton />
          <GroupCardSkeleton />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="people-outline"
            title="Welcome to Splittable"
            message="Create a group, invite friends, add expenses, and settle up. Here's how it works:"
            actionLabel="Create Group"
            onAction={() => router.push('/(tabs)/groups/add')}
          />
          <View style={styles.onboardingSteps}>
            <View style={styles.onboardingStep}>
              <Ionicons name="people-circle-outline" size={24} color={colors.primary} />
              <Text style={[styles.onboardingText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textPrimary }}>1. Create a group</Text> — Trip, apartment, dinner...
              </Text>
            </View>
            <View style={styles.onboardingStep}>
              <Ionicons name="person-add-outline" size={24} color={colors.primary} />
              <Text style={[styles.onboardingText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textPrimary }}>2. Invite friends</Text> — Share your invite code
              </Text>
            </View>
            <View style={styles.onboardingStep}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={[styles.onboardingText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textPrimary }}>3. Add expenses</Text> — Split equally or customize
              </Text>
            </View>
            <View style={styles.onboardingStep}>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
              <Text style={[styles.onboardingText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textPrimary }}>4. Settle up</Text> — Mark as paid when done
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
              <GroupCard
                group={item}
                onPress={() => router.push({ pathname: '/(tabs)/groups/[groupId]', params: { groupId: item.id } })}
                onDelete={item.createdBy === user?.id ? () => setDeleteTarget(item.id) : undefined}
              />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} tintColor={colors.primary} />
          }
        />
      )}
    </View>

    <ConfirmModal
      visible={deleteTarget !== null}
      title="Delete Group"
      message="Are you sure you want to delete this group? All expenses and data will be permanently removed."
      confirmLabel="Delete"
      confirmVariant="danger"
      onConfirm={handleDelete}
      onCancel={() => setDeleteTarget(null)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  errorClose: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  onboardingSteps: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  onboardingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  onboardingText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});
