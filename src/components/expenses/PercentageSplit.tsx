import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface MemberPercent {
  id: string;
  displayName: string;
  percentage: number;
}

interface PercentageSplitProps {
  members: MemberPercent[];
  onPercentChange: (memberId: string, percentage: number) => void;
}

export function PercentageSplit({
  members,
  onPercentChange,
}: PercentageSplitProps) {
  if (members.length === 0) return null;

  const total = members.reduce((sum, m) => sum + m.percentage, 0);
  const isValid = Math.abs(total - 100) < 0.5;
  const remaining = 100 - total;

  const handleIncrement = (memberId: string, current: number) => {
    if (current >= 100) return;
    onPercentChange(memberId, Math.min(100, current + 5));
  };

  const handleDecrement = (memberId: string, current: number) => {
    if (current <= 0) return;
    onPercentChange(memberId, Math.max(0, current - 5));
  };

  return (
    <Card>
      {members.map((member) => (
        <View key={member.id} style={styles.row}>
          <Avatar name={member.displayName} size="sm" />
          <Text style={styles.name} numberOfLines={1}>
            {member.displayName}
          </Text>

          <StepButton
            icon="remove"
            onPress={() => handleDecrement(member.id, member.percentage)}
            disabled={member.percentage <= 0}
          />

          <View style={styles.percentBox}>
            <Text style={styles.percentText}>{member.percentage}%</Text>
          </View>

          <StepButton
            icon="add"
            onPress={() => handleIncrement(member.id, member.percentage)}
            disabled={member.percentage >= 100}
          />
        </View>
      ))}

      <View style={styles.footer}>
        <Text
          style={[
            styles.total,
            isValid ? styles.totalValid : styles.totalInvalid,
          ]}
        >
          {isValid
            ? '100% — Good!'
            : `${remaining > 0 ? '+' : ''}${remaining.toFixed(0)}% remaining`}
        </Text>
      </View>
    </Card>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.stepButton, disabled && styles.stepButtonDisabled]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={disabled ? colors.textMuted : colors.primary}
      />
    </Pressable>
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
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  percentBox: {
    minWidth: 48,
    alignItems: 'center',
    backgroundColor: colors.divider,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  percentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  total: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  totalValid: {
    color: colors.success,
  },
  totalInvalid: {
    color: colors.warning,
  },
});
