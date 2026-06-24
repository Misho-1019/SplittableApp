import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/shared/Button';
import { Header } from '@/components/shared/Header';
import { colors, fontSize, fontWeight, spacing } from '@/config/theme';

export default function PaymentConfirmationScreen() {
  const params = useLocalSearchParams<{
    success: string;
    amount: string;
    toUserName: string;
  }>();
  const router = useRouter();

  const isSuccess = params.success === 'true';
  const amount = parseFloat(params.amount ?? '0') || 0;

  return (
    <View style={styles.container}>
      <Header
        title={isSuccess ? 'Payment Confirmed' : 'Payment Failed'}
        onBack={() => router.replace('/(tabs)/balances')}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            isSuccess ? styles.successCircle : styles.failedCircle,
          ]}
        >
          <Ionicons
            name={isSuccess ? 'checkmark' : 'close'}
            size={48}
            color={colors.textInverse}
          />
        </View>

        <Text style={styles.title}>
          {isSuccess ? 'All Done!' : 'Something went wrong'}
        </Text>

        <Text style={styles.message}>
          {isSuccess
            ? `You paid ${params.toUserName} $${amount.toFixed(2)}. You're all settled up!`
            : 'The payment could not be completed. Please try again.'}
        </Text>

        <Button
          title="Back to Balances"
          onPress={() => router.replace('/(tabs)/balances')}
          variant={isSuccess ? 'primary' : 'secondary'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successCircle: {
    backgroundColor: colors.success,
  },
  failedCircle: {
    backgroundColor: colors.danger,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
});
