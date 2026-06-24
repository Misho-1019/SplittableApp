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
    paid: { bg: '#E8F5E9', text: colors.success },
    pending: { bg: '#FFF3E0', text: colors.warning },
    processing: { bg: '#E3F2FD', text: colors.info },
    completed: { bg: '#E8F5E9', text: colors.success },
    failed: { bg: '#FFEBEE', text: colors.danger },
    info: { bg: '#F3E5F5', text: '#9C27B0' },
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
