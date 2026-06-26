import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, spacing } from '@/config/theme';

interface SkeletonRowProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
  style?: object;
}

export function SkeletonRow({
  width = '100%',
  height = 16,
  rounded = false,
  style,
}: SkeletonRowProps) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width: width as number,
          height,
          borderRadius: rounded ? height / 2 : borderRadius.sm,
          opacity: pulse,
          backgroundColor: colors.divider,
        },
        style,
      ]}
    />
  );
}

export function GroupCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SkeletonRow width={48} height={48} rounded />
      <View style={styles.cardContent}>
        <SkeletonRow width="60%" height={14} />
        <SkeletonRow width="40%" height={10} style={styles.mt4} />
      </View>
      <SkeletonRow width={20} height={20} rounded />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  mt4: {
    marginTop: 4,
  },
});

export function ExpenseCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.cardContent, { gap: spacing.sm }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonRow width="60%" height={14} />
          <SkeletonRow width={60} height={14} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <SkeletonRow width="30%" height={10} />
          <SkeletonRow width="30%" height={10} />
        </View>
      </View>
    </View>
  );
}

export function BalanceRowSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SkeletonRow width={44} height={44} rounded />
      <View style={[styles.cardContent, { gap: 2 }]}>
        <SkeletonRow width="50%" height={14} />
        <SkeletonRow width="35%" height={10} />
      </View>
      <SkeletonRow width={50} height={14} />
    </View>
  );
}

export function SettlementCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <SkeletonRow width={32} height={32} rounded />
      <View style={[styles.cardContent, { gap: 2 }]}>
        <SkeletonRow width="70%" height={14} />
        <SkeletonRow width="40%" height={10} />
      </View>
      <SkeletonRow width={40} height={14} />
    </View>
  );
}
