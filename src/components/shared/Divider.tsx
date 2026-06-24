import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing } from '@/config/theme';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  const { colors } = useTheme();

  if (label) {
    return (
      <View style={styles.row}>
        <View style={[styles.line, { backgroundColor: colors.divider }]} />
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: colors.divider }]} />
      </View>
    );
  }

  return <View style={[styles.line, { backgroundColor: colors.divider }]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: fontSize.sm,
  },
});
