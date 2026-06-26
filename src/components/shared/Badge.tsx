import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, borderRadius, spacing } from '@/config/theme';

type BadgeVariant = 'paid' | 'pending' | 'processing' | 'completed' | 'failed' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const { colors } = useTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    paid: { bg: colors.successBackground, text: colors.success },
    pending: { bg: colors.warningBackground, text: colors.warning },
    processing: { bg: colors.infoBackground, text: colors.info },
    completed: { bg: colors.successBackground, text: colors.success },
    failed: { bg: colors.dangerBackground, text: colors.danger },
    info: { bg: colors.primaryBackground, text: colors.primary },
  };

  const style = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]} accessibilityLabel={label} accessibilityRole="text">
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
