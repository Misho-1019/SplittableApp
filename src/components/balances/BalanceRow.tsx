import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/shared/Avatar';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface BalanceRowProps {
  displayName: string;
  groupName: string;
  netBalance: number;
  onPress: () => void;
}

export function BalanceRow({
  displayName,
  groupName,
  netBalance,
  onPress,
}: BalanceRowProps) {
  const isOwedToYou = netBalance > 0;
  const absAmount = Math.abs(netBalance);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={displayName} size="md" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.group} numberOfLines={1}>
          {groupName}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          isOwedToYou ? styles.positive : styles.negative,
        ]}
      >
        {isOwedToYou ? '+' : '-'}${absAmount.toFixed(2)}
      </Text>
      <View
        style={[
          styles.actionButton,
          isOwedToYou ? styles.actionPositive : styles.actionNegative,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            isOwedToYou ? styles.actionTextPositive : styles.actionTextNegative,
          ]}
        >
          {isOwedToYou ? 'Settle' : 'Pay'}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={12}
          color={isOwedToYou ? colors.success : colors.danger}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  group: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionPositive: {
    backgroundColor: '#E8F5E9',
  },
  actionNegative: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  actionTextPositive: {
    color: colors.success,
  },
  actionTextNegative: {
    color: colors.danger,
  },
});
