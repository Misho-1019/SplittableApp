import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

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
  const { colors } = useTheme();
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
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {member.displayName}
          </Text>
          <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.currency, { color: colors.textMuted }]}>$</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={member.share}
              onChangeText={(text) => onShareChange(member.id, text)}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              accessibilityLabel={`Share for ${member.displayName}`}
            />
          </View>
        </View>
      ))}

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text
          style={[
            styles.remaining,
            isBalanced
              ? { color: colors.success }
              : remaining < 0
                ? { color: colors.danger }
                : { color: colors.warning },
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    width: 100,
  },
  currency: {
    paddingLeft: spacing.sm,
    fontSize: fontSize.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    paddingVertical: spacing.xs + 2,
    paddingRight: spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  remaining: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
