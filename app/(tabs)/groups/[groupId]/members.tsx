import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getGroup, addMemberToGroup, removeMemberFromGroup } from '@/services/groups.service';
import { getUsers, searchUserByEmail } from '@/services/users.service';
import { Avatar } from '@/components/shared/Avatar';
import { Card } from '@/components/shared/Card';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { Group, User } from '@/types';

export default function ManageMembersScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const fetched = await getGroup(groupId);
        if (cancelled || !fetched) return;
        setGroup(fetched);
        const userDocs = await getUsers(fetched.members);
        if (!cancelled) setMembers(userDocs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId]);

  const handleSearch = async () => {
    const trimmed = searchEmail.trim().toLowerCase();
    if (!trimmed) return;

    setSearchError('');
    setSearchResult(null);
    setSearching(true);

    try {
      const found = await searchUserByEmail(trimmed);
      if (!found) {
        setSearchError('No user found with that email.');
      } else if (group?.members.includes(found.id)) {
        setSearchError('This user is already a member.');
      } else {
        setSearchResult(found);
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult || !group) return;

    try {
      await addMemberToGroup(group.id, searchResult.id, searchResult.displayName);
      setSearchEmail('');
      setSearchResult(null);

      const updated = await getGroup(group.id);
      if (updated) {
        setGroup(updated);
        const userDocs = await getUsers(updated.members);
        setMembers(userDocs);
      }
    } catch {
      Alert.alert('Error', 'Failed to add member.');
    }
  };

  const handleRemove = (memberId: string, memberName: string) => {
    if (!group || memberId === user?.id) return;

    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMemberFromGroup(group.id, memberId);

              setMembers((prev) => prev.filter((m) => m.id !== memberId));
              setGroup((prev) =>
                prev
                  ? {
                      ...prev,
                      members: prev.members.filter((id) => id !== memberId),
                    }
                  : prev,
              );
            } catch {
              Alert.alert('Error', 'Failed to remove member.');
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!group) {
    return (
      <View style={styles.container}>
        <Header title="Members" onBack={() => router.back()} />
        <Text style={styles.notFound}>Group not found.</Text>
      </View>
    );
  }

  const isCreator = user?.id === group.createdBy;

  return (
    <View style={styles.container}>
      <Header title="Manage Members" onBack={() => router.back()} />

      <View style={styles.list}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <Avatar name={member.displayName} photoURL={member.photoURL} size="md" />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.displayName}
                {member.id === user?.id ? ' (You)' : ''}
              </Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            {isCreator && member.id !== user?.id && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(member.id, member.displayName)}
              >
                <Ionicons name="close-circle" size={22} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {isCreator && (
        <Card style={styles.addCard} padded>
          <Text style={styles.addTitle}>Add Member</Text>
          <Text style={styles.addHint}>
            Search by email to invite someone to this group.
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={searchEmail}
              onChangeText={setSearchEmail}
              placeholder="user@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, searching && { opacity: 0.6 }]}
              onPress={handleSearch}
              disabled={searching}
            >
              <Ionicons name="search" size={20} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          {searchError ? (
            <Text style={styles.searchError}>{searchError}</Text>
          ) : null}

          {searchResult && (
            <View style={styles.searchResultRow}>
              <Avatar
                name={searchResult.displayName}
                photoURL={searchResult.photoURL}
                size="sm"
              />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{searchResult.displayName}</Text>
                <Text style={styles.memberEmail}>{searchResult.email}</Text>
              </View>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    textAlign: 'center',
    padding: spacing.xl,
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  memberEmail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addCard: {
    margin: spacing.md,
    gap: spacing.sm,
  },
  addTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  addHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  searchButton: {
    backgroundColor: colors.primary,
    width: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchError: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
});
