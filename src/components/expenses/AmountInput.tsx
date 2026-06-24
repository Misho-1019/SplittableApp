import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  currency?: string;
  error?: string;
  placeholder?: string;
}

export function AmountInput({
  value,
  onChangeText,
  currency = '$',
  error,
  placeholder = '0.00',
}: AmountInputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }, error && { borderColor: colors.danger }]}>
        <View style={[styles.currencyBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.currencyText, { color: colors.textInverse }]}>{currency}</Text>
        </View>
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="done"
          accessibilityLabel="Amount"
        />
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  input: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  error: {
    fontSize: fontSize.xs,
  },
});
