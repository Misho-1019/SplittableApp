import { View, FlatList, Text, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from '@/components/groups/GroupCard';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

export default function GroupListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, loading, error } = useGroups(user?.id);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Header
        title="My Groups"
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/(tabs)/groups/add'),
        }}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={18} color={colors.textInverse} />
          <Text style={styles.errorText}>{error.message}</Text>
          <TouchableOpacity
            style={styles.errorClose}
            onPress={() => router.replace('/(tabs)/groups')}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && groups.length === 0 ? (
        <LoadingSpinner fullScreen />
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
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/groups/[groupId]',
                  params: { groupId: item.id },
                })
              }
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} tintColor={colors.primary} />
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textInverse,
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
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
