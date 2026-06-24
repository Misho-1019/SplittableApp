import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

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
  const { colors } = useTheme();

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
          <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
            {member.displayName}
          </Text>

          <StepButton
            icon="remove"
            onPress={() => handleDecrement(member.id, member.percentage)}
            disabled={member.percentage <= 0}
            colors={colors}
          />

          <View style={[styles.percentBox, { backgroundColor: colors.divider }]}>
            <Text style={[styles.percentText, { color: colors.textPrimary }]}>{member.percentage}%</Text>
          </View>

          <StepButton
            icon="add"
            onPress={() => handleIncrement(member.id, member.percentage)}
            disabled={member.percentage >= 100}
            colors={colors}
          />
        </View>
      ))}

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text
          style={[
            styles.total,
            isValid
              ? { color: colors.success }
              : { color: colors.warning },
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
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.stepButton, { borderColor: colors.border }, disabled && styles.stepButtonDisabled]}
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
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  percentBox: {
    minWidth: 48,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  percentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  total: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
