import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card } from '@/components/shared/Card';
import { colors, fontSize, fontWeight, spacing } from '@/config/theme';
import type { Balance } from '@/types';

interface BalanceChartProps {
  balances: Balance[];
  currentUserId: string;
}

export function BalanceChart({ balances, currentUserId }: BalanceChartProps) {
  const nonZero = balances.filter(
    (b) => Math.abs(b.netBalance) > 0.01 && b.userId !== currentUserId,
  );

  if (nonZero.length === 0) return null;

  const sorted = nonZero.sort(
    (a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance),
  );

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Group Balances</Text>
      <BarChart
        data={{
          labels: sorted.map((b) => b.displayName.split(' ')[0]),
          datasets: [
            {
              data: sorted.map((b) => {
                // Show from current user's perspective: invert
                return Math.round(-b.netBalance * 100) / 100;
              }),
            },
          ],
        }}
        width={Dimensions.get('window').width - spacing.md * 4}
        height={200}
        yAxisLabel="$"
        yAxisSuffix=""
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => {
            const value = parseFloat(String(opacity));
            return value > 0 ? colors.primary : colors.danger;
          },
          labelColor: () => colors.textSecondary,
          propsForBackgroundLines: {
            stroke: colors.divider,
          },
          barPercentage: 0.6,
        }}
        style={styles.chart}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
});
