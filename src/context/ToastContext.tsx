import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const current = toasts[0];

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {current && <ToastItem toast={current} />}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    return () => clearTimeout(hideTimer);
  }, [toast.id]);

  const bgColor =
    toast.type === 'success'
      ? colors.success
      : toast.type === 'error'
        ? colors.danger
        : colors.info;

  const iconName =
    toast.type === 'success'
      ? 'checkmark-circle'
      : toast.type === 'error'
        ? 'alert-circle'
        : 'information-circle';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name={iconName} size={20} color="#FFFFFF" />
      <Text style={styles.toastText} numberOfLines={2}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: '#FFFFFF',
  },
});
