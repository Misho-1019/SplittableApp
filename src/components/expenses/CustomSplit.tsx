import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface CustomSplitProps {
  members: { id: string; displayName: string; share: string }[];
  onShareChange: (memberId: string, share: string) => void;
  totalAmount: number;
}

export function CustomSplit({
  members,
  onShareChange,
  totalAmount,
}: CustomSplitProps) {
  const sharesTotal = members.reduce(
    (sum, m) => sum + (parseFloat(m.share) || 0),
    0,
  );
  const remaining = totalAmount - sharesTotal;
  const isBalanced = Math.abs(remaining) < 0.01;

  return (
    <Card>
      {members.map((member) => (
        <View key={member.id} style={styles.row}>
          <Avatar name={member.displayName} size="sm" />
          <Text style={styles.name} numberOfLines={1}>
            {member.displayName}
          </Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.input}
              value={member.share}
              onChangeText={(text) => onShareChange(member.id, text)}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text
          style={[
            styles.remaining,
            isBalanced
              ? styles.remainingBalanced
              : remaining < 0
                ? styles.remainingNegative
                : styles.remainingPositive,
          ]}
        >
          {isBalanced
            ? 'Balanced ✓'
            : remaining > 0
              ? `$${remaining.toFixed(2)} remaining`
              : `$${Math.abs(remaining).toFixed(2)} over`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  name: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    width: 100,
  },
  currency: {
    paddingLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    paddingVertical: spacing.xs + 2,
    paddingRight: spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  remaining: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  remainingBalanced: {
    color: colors.success,
  },
  remainingPositive: {
    color: colors.warning,
  },
  remainingNegative: {
    color: colors.danger,
  },
});
