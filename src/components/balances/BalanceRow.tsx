import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/shared/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { BalanceDirection } from '@/utils/calculateBalances';

interface BalanceRowProps {
  displayName: string;
  groupName: string;
  amount: number;
  direction: BalanceDirection;
  onPress: () => void;
}

export function BalanceRow({
  displayName,
  groupName,
  amount,
  direction,
  onPress,
}: BalanceRowProps) {
  const { colors } = useTheme();
  const isReceive = direction === 'receive';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={displayName} size="md" />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.group, { color: colors.textMuted }]} numberOfLines={1}>
          {groupName}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isReceive ? colors.success : colors.danger },
        ]}
      >
        {isReceive ? '+' : '-'}${amount.toFixed(2)}
      </Text>
      <View
        style={[
          styles.actionButton,
          { backgroundColor: isReceive ? '#E8F5E9' : '#FFEBEE' },
        ]}
      >
        <Text
          style={[
            styles.actionText,
            { color: isReceive ? colors.success : colors.danger },
          ]}
        >
          {isReceive ? 'Settle' : 'Pay'}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={isReceive ? colors.success : colors.danger}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  group: {
    fontSize: fontSize.xs,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
