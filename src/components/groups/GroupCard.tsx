import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius, shadow } from '@/config/theme';
import type { Group } from '@/types';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onDelete?: () => void;
}

export function GroupCard({ group, onPress, onDelete }: GroupCardProps) {
  const { colors } = useTheme();
  const memberCount = group.members.length;

  const renderRightActions = () => {
    if (!onDelete) return null;
    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.danger }]}
        onPress={onDelete}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${group.name}`}
      >
        <Ionicons name="trash-outline" size={22} color={colors.textInverse} />
        <Text style={[styles.deleteText, { color: colors.textInverse }]}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${group.name}, ${memberCount} members, total ${group.totalExpenses.toFixed(2)} dollars`}
        accessibilityHint="Tap to view group details"
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryBackground }]}>
          <Ionicons name="people" size={24} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash" size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                ${group.totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    ...shadow.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  deleteText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
