import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card } from '@/components/shared/Card';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing } from '@/config/theme';
import type { Expense } from '@/types';

interface ExpenseChartProps {
  expenses: Expense[];
}

const chartColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFD93D',
  '#6C5CE7',
  '#A8E6CF',
  '#FF8C42',
  '#45B7D1',
  '#F06292',
];

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  if (expenses.length === 0) return null;

  const paidByName = new Map<string, number>();

  for (const expense of expenses) {
    const current = paidByName.get(expense.paidByName) || 0;
    paidByName.set(expense.paidByName, current + expense.amount);
  }

  const data = Array.from(paidByName.entries())
    .map(([name, amount], index) => ({
      name: name.split(' ')[0],
      amount,
      color: chartColors[index % chartColors.length],
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <Card style={styles.container} accessibilityLabel={`Spending chart, ${data.length} members`}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Spending by Member</Text>
      <PieChart
        data={data}
        width={screenWidth - spacing.md * 4}
        height={180}
        chartConfig={{
          color: () => colors.textPrimary,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
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
});
