import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { GroupCard } from '@/components/groups/GroupCard';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { colors, spacing } from '@/config/theme';

export default function GroupListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, loading } = useGroups(user?.id);

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
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
});
