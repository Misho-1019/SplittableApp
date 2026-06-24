import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentIntent, confirmSettlement } from '@/services/stripe.service';
import { Card } from '@/components/shared/Card';
import { CardInput } from '@/components/payment/CardInput';
import { PaymentProgressModal } from '@/components/payment/PaymentProgressModal';
import { AnimatedCheckmark } from '@/components/shared/AnimatedCheckmark';
import { Button } from '@/components/shared/Button';
import { Header } from '@/components/shared/Header';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

type PaymentState = 'form' | 'processing' | 'success' | 'failed';

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    amount: string;
    toUserName: string;
    toUserId: string;
    groupId: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [state, setState] = useState<PaymentState>('form');
  const [error, setError] = useState('');
  const [settlementId, setSettlementId] = useState('');
  const { colors } = useTheme();

  const amount = parseFloat(params.amount ?? '0') || 0;
  const amountCents = Math.round(amount * 100);

  const canPay =
    cardNumber.replace(/\s/g, '').length >= 15 &&
    expiry.length === 5 &&
    cvc.length >= 3;

  const handlePay = async () => {
    if (!user || !params.groupId || !params.toUserId || !canPay) return;

    setState('processing');
    setError('');

    try {
      const result = await createPaymentIntent({
        amount: amountCents,
        currency: 'usd',
        groupId: params.groupId,
        toUserId: params.toUserId,
      });

      setSettlementId(result.settlementId);

      const paymentIntentId = result.clientSecret.split('_secret_')[0];

      await confirmSettlement({
        settlementId: result.settlementId,
        groupId: params.groupId,
        paymentIntentId,
      });

      setState('success');
    } catch (err) {
      setState('failed');
      setError(
        err instanceof Error ? err.message : 'Payment failed. Try again.',
      );
    }
  };

  if (!user) return null;

  const renderStatus = () => {
    if (state === 'processing') {
      return (
        <PaymentProgressModal
          visible
          message={`Securely processing your payment of $${amount.toFixed(2)}...`}
        />
      );
    }

    if (state === 'success') {
      return (
        <View style={styles.statusCenter}>
          <AnimatedCheckmark size={88} onDone={() => {}} />
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            Payment Successful
          </Text>
          <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
            You paid {params.toUserName} ${amount.toFixed(2)}
          </Text>
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          <Button
            title="Back to Balances"
            onPress={() => router.replace('/(tabs)/balances')}
            variant="primary"
          />
        </View>
      );
    }

    if (state === 'failed') {
      return (
        <View style={styles.statusCenter}>
          <View style={[styles.failedCircle, { backgroundColor: colors.danger }]}>
            <Ionicons name="close" size={36} color={colors.textInverse} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>Payment Failed</Text>
          <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>{error}</Text>
          <Button
            title="Try Again"
            onPress={() => setState('form')}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Payment" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {state === 'form' && (
          <>
            <Card style={styles.amountCard}>
              <Text style={[styles.payingLabel, { color: colors.textSecondary }]}>
                Paying {params.toUserName}
              </Text>
              <Text style={[styles.amountValue, { color: colors.textPrimary }]}>
                ${amount.toFixed(2)}
              </Text>
            </Card>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Card Details</Text>
            <CardInput
              cardNumber={cardNumber}
              onCardNumberChange={setCardNumber}
              expiry={expiry}
              onExpiryChange={setExpiry}
              cvc={cvc}
              onCvcChange={setCvc}
            />

            <View style={styles.trustRow}>
              <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              <Text style={[styles.trustText, { color: colors.textMuted }]}>
                Secured by Stripe · Test mode · No real charges
              </Text>
            </View>

            <Button
              title={`Pay $${amount.toFixed(2)}`}
              onPress={handlePay}
              variant="primary"
              disabled={!canPay}
            />
          </>
        )}

        {renderStatus()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  trustText: {
    fontSize: fontSize.xs,
  },
  statusCenter: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  failedCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statusMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  detailCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.xs,
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
