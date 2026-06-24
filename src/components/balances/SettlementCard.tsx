import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';
import { formatRelativeDate } from '@/utils/dates';
import type { Settlement } from '@/types';

interface SettlementCardProps {
  settlement: Settlement;
  currentUserId: string;
}

export function SettlementCard({
  settlement,
  currentUserId,
}: SettlementCardProps) {
  const { colors } = useTheme();
  const isSender = settlement.fromUserId === currentUserId;
  const otherName = isSender ? settlement.toUserName : settlement.fromUserName;
  const action = isSender ? `You paid ${otherName}` : `${otherName} paid you`;
  const icon =
    settlement.status === 'completed' ? 'checkmark-circle' : 'time-outline';
  const iconColor =
    settlement.status === 'completed' ? colors.success : colors.warning;

  return (
    <Card style={styles.container} accessibilityLabel={`${action} $${settlement.amount.toFixed(2)}, ${settlement.status}`}>
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <View style={styles.info}>
          <Text style={[styles.action, { color: colors.textPrimary }]} numberOfLines={1}>
            {action}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {settlement.paidVia === 'card' ? '💳 Card' : '💵 Cash'}
            {' · '}
            {formatRelativeDate(settlement.createdAt)}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          ${settlement.amount.toFixed(2)}
        </Text>
        <Badge
          variant={
            settlement.status === 'completed'
              ? 'completed'
              : settlement.status === 'failed'
                ? 'failed'
                : 'pending'
          }
          label={settlement.status}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  info: {
    gap: 2,
    flex: 1,
  },
  action: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  meta: {
    fontSize: fontSize.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
