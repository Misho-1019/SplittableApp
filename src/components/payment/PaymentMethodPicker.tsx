import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

type PaymentMethod = 'card' | 'cash';

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, value === 'card' && styles.optionActive]}
        onPress={() => onChange('card')}
        activeOpacity={0.7}
      >
        <Ionicons name="card" size={24} color={value === 'card' ? colors.primary : colors.textMuted} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, value === 'card' && styles.optionLabelActive]}>
            Pay with Card
          </Text>
          <Text style={styles.optionHint}>
            Visa, Mastercard, Amex
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, value === 'cash' && styles.optionActive]}
        onPress={() => onChange('cash')}
        activeOpacity={0.7}
      >
        <Ionicons name="cash" size={24} color={value === 'cash' ? colors.primary : colors.textMuted} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, value === 'cash' && styles.optionLabelActive]}>
            Mark as Paid
          </Text>
          <Text style={styles.optionHint}>
            Cash or other method
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0F0',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
