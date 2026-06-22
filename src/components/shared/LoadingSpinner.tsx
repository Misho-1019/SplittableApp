import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/config/theme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export function LoadingSpinner({
  fullScreen = false,
  size = 'large',
  color = colors.primary,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
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
