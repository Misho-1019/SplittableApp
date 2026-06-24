import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.divider }]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.type}
          style={[styles.option, value === option.type && { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }]}
          onPress={() => onChange(option.type)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.label,
              { color: value === option.type ? colors.primary : colors.textMuted },
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
