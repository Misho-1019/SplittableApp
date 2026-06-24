import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

type PaymentMethod = 'card' | 'cash';

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, { borderColor: colors.border, backgroundColor: colors.surface }, value === 'card' && { borderColor: colors.primary, backgroundColor: '#FFF0F0' }]}
        onPress={() => onChange('card')}
        activeOpacity={0.7}
      >
        <Ionicons name="card" size={24} color={value === 'card' ? colors.primary : colors.textMuted} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, { color: value === 'card' ? colors.primary : colors.textPrimary }]}>
            Pay with Card
          </Text>
          <Text style={[styles.optionHint, { color: colors.textMuted }]}>
            Visa, Mastercard, Amex
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { borderColor: colors.border, backgroundColor: colors.surface }, value === 'cash' && { borderColor: colors.primary, backgroundColor: '#FFF0F0' }]}
        onPress={() => onChange('cash')}
        activeOpacity={0.7}
      >
        <Ionicons name="cash" size={24} color={value === 'cash' ? colors.primary : colors.textMuted} />
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, { color: value === 'cash' ? colors.primary : colors.textPrimary }]}>
            Mark as Paid
          </Text>
          <Text style={[styles.optionHint, { color: colors.textMuted }]}>
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
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  optionHint: {
    fontSize: fontSize.xs,
  },
});
