import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '@/config/theme';

interface CardInputProps {
  cardNumber: string;
  onCardNumberChange: (text: string) => void;
  expiry: string;
  onExpiryChange: (text: string) => void;
  cvc: string;
  onCvcChange: (text: string) => void;
}

export function CardInput({
  cardNumber,
  onCardNumberChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
}: CardInputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={onCardNumberChange}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Expiry</Text>
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={onExpiryChange}
            placeholder="MM/YY"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>CVC</Text>
          <TextInput
            style={styles.input}
            value={cvc}
            onChangeText={onCvcChange}
            placeholder="123"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <Text style={styles.note}>
        Stripe requires a development build to process payments.
        Use test card 4242 4242 4242 4242 with any future date and CVC.
        No real charges are made in test mode.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
    backgroundColor: colors.divider,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
});
