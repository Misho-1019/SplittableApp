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

  if (!user) return null;

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
          <TouchableOpacity
            style={styles.errorClose}
            onPress={() => router.replace('/(tabs)/groups')}
          >
            <Text style={[styles.retryText, { color: colors.textInverse }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && groups.length === 0 ? (
        <View style={styles.skeletonList}>
          <GroupCardSkeleton />
          <GroupCardSkeleton />
          <GroupCardSkeleton />
        </View>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No Groups Yet"
          message="Create a group and start splitting expenses with friends."
          actionLabel="Create Group"
          onAction={() => router.push('/(tabs)/groups/add')}
        />
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
                onDelete={() => setDeleteTarget(item.id)}
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
});
