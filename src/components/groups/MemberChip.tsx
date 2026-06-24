import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '@/components/shared/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface MemberChipProps {
  name: string;
  photoURL?: string | null;
  isCurrentUser?: boolean;
}

export function MemberChip({ name, photoURL, isCurrentUser }: MemberChipProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Avatar name={name} photoURL={photoURL} size="md" />
      <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
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
    textAlign: 'center',
  },
});
