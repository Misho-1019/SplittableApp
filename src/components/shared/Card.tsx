import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, shadow, spacing } from '@/config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  accessibilityLabel?: string;
}

export function Card({ children, style, padded = true, accessibilityLabel }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    ...shadow.sm,
  },
  padded: {
    padding: spacing.md,
  },
});
