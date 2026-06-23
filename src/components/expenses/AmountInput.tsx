import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

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
  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, error && styles.containerError]}>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyText}>{currency}</Text>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
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
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  containerError: {
    borderColor: colors.danger,
  },
  currencyBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textInverse,
  },
  input: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
