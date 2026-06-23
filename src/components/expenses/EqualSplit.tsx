import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/shared/Card';
import { Avatar } from '@/components/shared/Avatar';
import { colors, fontSize, fontWeight, spacing } from '@/config/theme';

interface EqualSplitProps {
  amount: number;
  members: { id: string; displayName: string }[];
}

export function EqualSplit({ amount, members }: EqualSplitProps) {
  if (members.length === 0) return null;

  const perPerson = amount / members.length;
  const remainder = amount - perPerson * members.length;

  return (
    <Card>
      <Text style={styles.summary}>
        {members.length} {members.length === 1 ? 'person' : 'people'} ×{' '}
        <Text style={styles.amount}>${perPerson.toFixed(2)}</Text>
      </Text>

      <View style={styles.list}>
        {members.map((member, index) => {
          const share =
            index === members.length - 1
              ? perPerson + remainder
              : perPerson;

          return (
            <View key={member.id} style={styles.row}>
              <Avatar name={member.displayName} size="sm" />
              <Text style={styles.name}>{member.displayName}</Text>
              <Text style={styles.share}>${share.toFixed(2)}</Text>
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  amount: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
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
    color: colors.textPrimary,
  },
  share: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
});
