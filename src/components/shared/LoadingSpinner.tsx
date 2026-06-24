import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  fullScreen = false,
  size = 'large',
  color,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const indicatorColor = color ?? colors.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.overlay }]}>
        <ActivityIndicator size={size} color={indicatorColor} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
