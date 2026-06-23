import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { SplitType } from '@/types';

interface SplitTypePickerProps {
  value: SplitType;
  onChange: (type: SplitType) => void;
}

const options: { type: SplitType; label: string }[] = [
  { type: 'equal', label: 'Equal' },
  { type: 'percentage', label: '%' },
  { type: 'custom', label: 'Custom' },
];

export function SplitTypePicker({ value, onChange }: SplitTypePickerProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.type}
          style={[styles.option, value === option.type && styles.optionActive]}
          onPress={() => onChange(option.type)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.label,
              value === option.type && styles.labelActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.divider,
    borderRadius: borderRadius.md,
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md - 2,
  },
  optionActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
  },
});
