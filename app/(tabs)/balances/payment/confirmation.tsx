import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/shared/Button';
import { Header } from '@/components/shared/Header';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

export default function PaymentConfirmationScreen() {
  const params = useLocalSearchParams<{
    success: string;
    amount: string;
    toUserName: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const isSuccess = params.success === 'true';
  const amount = parseFloat(params.amount ?? '0') || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Payment" onBack={() => router.replace('/(tabs)/balances')} />

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isSuccess ? colors.success : colors.danger },
          ]}
        >
          <Ionicons
            name={isSuccess ? 'checkmark' : 'close'}
            size={40}
            color={colors.textInverse}
          />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {isSuccess
            ? `You successfully paid ${params.toUserName} $${amount.toFixed(2)}. All settled!`
            : `The payment to ${params.toUserName} could not be completed. Please try again.`}
        </Text>

        {isSuccess && (
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid to</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{params.toUserName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>${amount.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Method</Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>Card (Stripe)</Text>
            </View>
          </View>
        )}

        <Button
          title={isSuccess ? 'Back to Balances' : 'Try Again'}
          onPress={() =>
            isSuccess
              ? router.replace('/(tabs)/balances')
              : router.back()
          }
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.sm,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
