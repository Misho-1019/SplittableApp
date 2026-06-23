import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '@/components/shared/Avatar';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface MemberChipProps {
  name: string;
  photoURL?: string | null;
  isCurrentUser?: boolean;
}

export function MemberChip({ name, photoURL, isCurrentUser }: MemberChipProps) {
  return (
    <View style={styles.container}>
      <Avatar name={name} photoURL={photoURL} size="md" />
      <Text style={styles.name} numberOfLines={1}>
        {name}
        {isCurrentUser ? ' (You)' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 72,
  },
  name: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
