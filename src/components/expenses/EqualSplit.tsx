import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';

interface EqualSplitProps {
  amount: number;
  members: { id: string; displayName: string }[];
}

export function EqualSplit({ amount, members }: EqualSplitProps) {
  const { colors } = useTheme();

  if (members.length === 0) return null;

  const perPerson = amount / members.length;
  const remainder = Math.abs(amount - Math.round(perPerson * 100) / 100 * members.length);
  const hasRoundingDiff = remainder > 0.005 && members.length > 1;

  return (
    <Card>
      <Text style={[styles.summary, { color: colors.textSecondary }]}>
        {members.length} {members.length === 1 ? 'person' : 'people'} ×{' '}
        <Text style={{ color: colors.primary, fontWeight: fontWeight.semibold }}>${perPerson.toFixed(2)}</Text>
      </Text>

      <View style={styles.list}>
        {members.map((member, index) => {
          const adjustedPerPerson = Math.round(perPerson * 100) / 100;
          const adjustedTotal = adjustedPerPerson * (members.length - 1);
          const share =
            index === members.length - 1
              ? amount - adjustedTotal
              : adjustedPerPerson;

          const isLast = index === members.length - 1;
          const differsFromNominal = hasRoundingDiff && isLast && Math.abs(share - adjustedPerPerson) > 0.001;

          return (
            <View key={member.id} style={styles.row}>
              <Avatar name={member.displayName} size="sm" />
              <Text style={[styles.name, { color: colors.textPrimary }]}>{member.displayName}</Text>
              <Text style={[styles.share, { color: colors.textSecondary }]}>
                ${share.toFixed(2)}
                {differsFromNominal && (
                  <Text style={[styles.adjustment, { color: colors.textMuted }]}> (rounded)</Text>
                )}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  share: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  adjustment: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },
});
