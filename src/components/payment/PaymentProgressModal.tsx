import { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

interface PaymentProgressModalProps {
  visible: boolean;
  message?: string;
  onCancel?: () => void;
}

export function PaymentProgressModal({
  visible,
  message = 'Processing your payment...',
  onCancel,
}: PaymentProgressModalProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: colors.overlay }]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 200,
  },
  message: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
