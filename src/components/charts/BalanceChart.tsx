import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card } from '@/components/shared/Card';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';
import { getBalancesFromPerspective } from '@/utils/calculateBalances';

interface BalanceChartProps {
  balances: import('@/types').Balance[];
  currentUserId: string;
}

export function BalanceChart({ balances, currentUserId }: BalanceChartProps) {
  const { colors } = useTheme();
  const entries = getBalancesFromPerspective(balances, currentUserId);

  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => b.amount - a.amount);

  return (
    <Card style={styles.container} accessibilityLabel={`Balance chart, ${sorted.length} members`}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Group Balances</Text>
      <BarChart
        data={{
          labels: sorted.map((b) => b.displayName.split(' ')[0]),
          datasets: [
            {
              data: sorted.map((b) =>
                Math.round((b.direction === 'receive' ? b.amount : -b.amount) * 100) / 100,
              ),
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
          color: (opacity = 1, _index?: number, data?: { dataset: { data: number[] } }) => {
            const value = data?.dataset?.data[_index ?? 0] ?? 0;
            return value >= 0 ? colors.success : colors.danger;
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
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
  },
});
