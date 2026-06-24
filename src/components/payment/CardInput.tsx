import { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface CardInputProps {
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  expiry: string;
  onExpiryChange: (value: string) => void;
  cvc: string;
  onCvcChange: (value: string) => void;
}

export function CardInput({
  cardNumber,
  onCardNumberChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
}: CardInputProps) {
  const formatCardNumber = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }, []);

  const formatExpiry = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  }, []);

  const formatCvc = useCallback((text: string) => {
    return text.replace(/\D/g, '').slice(0, 4);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(t) => onCardNumberChange(formatCardNumber(t))}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>Expiry</Text>
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={(t) => onExpiryChange(formatExpiry(t))}
            placeholder="MM/YY"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>CVC</Text>
          <TextInput
            style={styles.input}
            value={cvc}
            onChangeText={(t) => onCvcChange(formatCvc(t))}
            placeholder="123"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
        </View>
      </View>

      <Text style={styles.hint}>
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
    color: colors.textSecondary,
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
  halfField: {
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
