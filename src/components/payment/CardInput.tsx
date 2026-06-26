import { useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface CardInputProps {
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  expiry: string;
  onExpiryChange: (value: string) => void;
  cvc: string;
  onCvcChange: (value: string) => void;
}

export function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function CardInput({
  cardNumber,
  onCardNumberChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
}: CardInputProps) {
  const { colors } = useTheme();
  const prevCardRef = useRef(cardNumber);

  const formatCardNumber = (text: string) => {
    const raw = text.replace(/\D/g, '');
    const prevRaw = prevCardRef.current.replace(/\D/g, '');

    // Detect backspace through a formatting space
    if (raw.length === prevRaw.length && text.length < prevCardRef.current.length) {
      const trimmed = raw.slice(0, -1).slice(0, 16);
      prevCardRef.current = trimmed;
      return trimmed.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    const limited = raw.slice(0, 16);
    prevCardRef.current = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const formatCvc = (text: string) => {
    return text.replace(/\D/g, '').slice(0, 4);
  };

  const cardDigits = cardNumber.replace(/\D/g, '');
  const cardValid = cardDigits.length >= 13 ? luhnCheck(cardDigits) : null;

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Card Number</Text>
        <TextInput
          style={[styles.input, { borderColor: cardValid === false ? colors.danger : colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
          value={cardNumber}
          onChangeText={(t) => onCardNumberChange(formatCardNumber(t))}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={19}
          accessibilityLabel="Card number"
        />
        {cardValid === false && (
          <Text style={[styles.errorHint, { color: colors.danger }]}>Invalid card number</Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Expiry</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
            value={expiry}
            onChangeText={(t) => onExpiryChange(formatExpiry(t))}
            placeholder="MM/YY"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={5}
            accessibilityLabel="Expiry date"
          />
        </View>

        <View style={[styles.field, styles.halfField]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>CVC</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
            value={cvc}
            onChangeText={(t) => onCvcChange(formatCvc(t))}
            placeholder="123"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            accessibilityLabel="Security code"
          />
        </View>
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Test cards: 4242 4242 4242 4242 (success) · 4000 0000 0000 0002 (decline)
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
    fontWeight: fontWeight.medium,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
