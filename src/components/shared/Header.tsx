import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function Header({ title, onBack, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + spacing.sm + 4,
        },
      ]}
    >
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.right}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={rightAction.icon}
          >
            <Ionicons name={rightAction.icon} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  backButton: {
    padding: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
