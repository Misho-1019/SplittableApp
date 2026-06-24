import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentIntent } from '@/services/stripe.service';
import { Card } from '@/components/shared/Card';
import { CardInput } from '@/components/payment/CardInput';
import { Button } from '@/components/shared/Button';
import { Header } from '@/components/shared/Header';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

type PaymentState = 'form' | 'processing' | 'success' | 'failed';

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    amount: string;
    toUserName: string;
    groupId: string;
    toUserId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [state, setState] = useState<PaymentState>('form');
  const [error, setError] = useState('');

  const amount = parseFloat(params.amount ?? '0') || 0;
  const amountCents = Math.round(amount * 100);

  const handlePay = async () => {
    if (!user || !params.groupId || !params.toUserId) return;

    setState('processing');
    setError('');

    try {
      const { clientSecret, settlementId } = await createPaymentIntent({
        amount: amountCents,
        currency: 'usd',
        groupId: params.groupId,
        toUserId: params.toUserId,
      });

      setState('success');

      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)/balances/payment/confirmation',
          params: {
            success: 'true',
            amount: params.amount,
            toUserName: params.toUserName,
          },
        });
      }, 1500);
    } catch (err) {
      setState('failed');
      setError(
        err instanceof Error
          ? err.message
          : 'Payment failed. Please try again.',
      );
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Header title="Payment" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {state === 'form' && (
          <>
            <Card style={styles.amountCard}>
              <Text style={styles.payingLabel}>
                Paying {params.toUserName}
              </Text>
              <Text style={styles.amountValue}>
                ${amount.toFixed(2)}
              </Text>
            </Card>

            <Text style={styles.sectionTitle}>Card Details</Text>
            <CardInput
              cardNumber={cardNumber}
              onCardNumberChange={setCardNumber}
              expiry={expiry}
              onExpiryChange={setExpiry}
              cvc={cvc}
              onCvcChange={setCvc}
            />

            <View style={styles.trustBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              <Text style={styles.trustText}>
                Secured by Stripe · Test mode · No real charges
              </Text>
            </View>

            <Button
              title={`Pay $${amount.toFixed(2)}`}
              onPress={handlePay}
              variant="primary"
              disabled={!cardNumber || !expiry || !cvc}
            />
          </>
        )}

        {state === 'processing' && (
          <View style={styles.statusCenter}>
            <Text style={styles.processingIcon}>⟳</Text>
            <Text style={styles.statusTitle}>Processing Payment</Text>
            <Text style={styles.statusMessage}>
              Please wait while we process your payment...
            </Text>
          </View>
        )}

        {state === 'success' && (
          <View style={styles.statusCenter}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={36} color={colors.textInverse} />
            </View>
            <Text style={styles.statusTitle}>Payment Successful!</Text>
            <Text style={styles.statusMessage}>
              You paid {params.toUserName} ${amount.toFixed(2)}
            </Text>
          </View>
        )}

        {state === 'failed' && (
          <View style={styles.statusCenter}>
            <View style={styles.failedCircle}>
              <Ionicons name="close" size={36} color={colors.textInverse} />
            </View>
            <Text style={styles.statusTitle}>Payment Failed</Text>
            <Text style={styles.statusMessage}>{error}</Text>
            <Button
              title="Try Again"
              onPress={() => setState('form')}
              variant="primary"
              style={styles.tryAgain}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  payingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  trustText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  processingIcon: {
    fontSize: 56,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statusMessage: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  tryAgain: {
    marginTop: spacing.md,
  },
});
