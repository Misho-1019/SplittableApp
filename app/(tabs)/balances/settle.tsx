import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { createSettlement, getSettlementsBetweenUsers, updateSettlementStatus } from '@/services/settlements.service';
import { Header } from '@/components/shared/Header';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/shared/Badge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import { formatRelativeDate } from '@/utils/dates';
import type { Settlement } from '@/types';

type PaymentMethod = 'card' | 'cash';

export default function SettleUpScreen() {
  const params = useLocalSearchParams<{
    groupId: string;
    groupName: string;
    toUserId: string;
    toUserName: string;
    amount: string;
    currency: string;
    direction: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [existingSettlement, setExistingSettlement] = useState<Settlement | null>(null);
  const [checkingSettlement, setCheckingSettlement] = useState(true);
  const { colors } = useTheme();

  const amount = parseFloat(params.amount ?? '0') || 0;
  const isReceiving = params.direction === 'receive';

  useEffect(() => {
    if (!user?.id || !params.groupId || !params.toUserId) return;

    async function check() {
      try {
        const settlements = await getSettlementsBetweenUsers(
          params.groupId,
          user!.id,
          params.toUserId,
        );
        // Only consider settlements going in the same direction
        const relevant = settlements.find((s) => {
          if (isReceiving) {
            return s.fromUserId === params.toUserId && s.toUserId === user!.id;
          }
          return s.fromUserId === user!.id && s.toUserId === params.toUserId;
        });
        setExistingSettlement(relevant ?? null);
      } finally {
        setCheckingSettlement(false);
      }
    }

    check();
  }, [params.groupId, params.toUserId, user?.id]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '' });
  const [pendingStatus, setPendingStatus] = useState<Settlement['status']>('completed');

  const openConfirm = (
    title: string,
    message: string,
    status: Settlement['status'],
  ) => {
    setModalConfig({ title, message });
    setPendingStatus(status);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!user || !params.groupId || !params.toUserId || amount <= 0) {
      if (amount <= 0) {
        toast.showToast('Cannot settle a zero or negative amount.', 'error');
      }
      return;
    }

    if (user.id === params.toUserId) {
      toast.showToast('You cannot settle with yourself.', 'error');
      return;
    }

    setModalVisible(false);
    setSaving(true);
    setSavingAction(pendingStatus);

    try {
      await createSettlement(params.groupId, {
        fromUserId: isReceiving ? params.toUserId : user.id,
        fromUserName: isReceiving ? params.toUserName : user.displayName,
        toUserId: isReceiving ? user.id : params.toUserId,
        toUserName: isReceiving ? user.displayName : params.toUserName,
        amount,
        currency: params.currency ?? 'USD',
        paidVia: 'cash',
        status: pendingStatus,
        stripePaymentIntentId: null,
      });
      toast.showToast(
        pendingStatus === 'completed' ? 'Payment recorded!' : 'Awaiting payment recorded.',
        'success',
      );
      setTimeout(() => router.replace('/(tabs)/balances'), 300);
    } catch {
      toast.showToast('Failed to record settlement. Please try again.', 'error');
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  if (checkingSettlement) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Settle Up" onBack={() => router.back()} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (existingSettlement && existingSettlement.status === 'pending') {
    const otherName = params.toUserName;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Settle Up" onBack={() => router.back()} />

        <View style={styles.content}>
          <View style={styles.hero}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.warning },
              ]}
            >
              <Ionicons name="time" size={36} color={colors.textInverse} />
            </View>
            <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
              Payment Pending
            </Text>
            <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
              Awaiting ${amount.toFixed(2)} from {otherName}.
            </Text>
            {existingSettlement.createdAt && (
              <Text style={[styles.statusDate, { color: colors.textMuted }]}>
                {formatRelativeDate(existingSettlement.createdAt)}
              </Text>
            )}
            <Badge variant="pending" label="pending" />
          </View>

          <Button
            title="Mark as Completed"
            onPress={async () => {
              try {
                await updateSettlementStatus(
                  params.groupId,
                  existingSettlement.id,
                  'completed',
                );
                toast.showToast('Payment marked as completed!', 'success');
                setTimeout(() => router.replace('/(tabs)/balances'), 300);
              } catch {
                toast.showToast('Failed to update settlement.', 'error');
              }
            }}
            variant="primary"
          />

          <Button
            title="Back to Balances"
            onPress={() => router.replace('/(tabs)/balances')}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settle Up" onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isReceiving ? colors.success : colors.danger },
            ]}
          >
            <Ionicons
              name={isReceiving ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={36}
              color={colors.textInverse}
            />
          </View>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {isReceiving
              ? `${params.toUserName} owes you`
              : `You're paying ${params.toUserName}`}
          </Text>
          <Text style={[styles.groupName, { color: colors.textPrimary }]}>{params.groupName}</Text>
        </View>

        <Card style={styles.amountCard}>
          <Text style={[styles.amountValue, { color: colors.textPrimary }]}>
            ${amount.toFixed(2)}
          </Text>
          <Text style={[styles.amountCurrency, { color: colors.textMuted }]}>{params.currency ?? 'USD'}</Text>
        </Card>

        {isReceiving ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>What would you like to do?</Text>

            <View style={[styles.infoBox, { backgroundColor: colors.divider }]}>
              <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Mark as received only if you already got the money. Use "Waiting" to track pending payments.
              </Text>
            </View>

            <Button
              title="Waiting for Payment"
              onPress={() =>
                openConfirm(
                  'Awaiting Payment',
                  `Record that ${params.toUserName} owes you $${amount.toFixed(2)}? This will show as pending until completed.`,
                  'pending',
                )
              }
              loading={savingAction === 'pending'}
              variant="secondary"
            />

            <Button
              title="Mark as Received"
              onPress={() =>
                openConfirm(
                  'Confirm Payment Received',
                  `Confirm that ${params.toUserName} paid you $${amount.toFixed(2)} in cash? This will mark the debt as settled.`,
                  'completed',
                )
              }
              loading={savingAction === 'completed'}
              variant="primary"
            />
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>How would you like to pay?</Text>

            <View style={[styles.infoBox, { backgroundColor: colors.divider }]}>
              <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Card payments secured by Stripe (test mode). No real charges are made.
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/balances/payment',
                  params: {
                    amount: params.amount,
                    toUserName: params.toUserName,
                    groupId: params.groupId,
                    toUserId: params.toUserId,
                  },
                })
              }
            >
              <Card style={styles.cardOption}>
                <View style={styles.cardOptionLeft}>
                  <Ionicons name="card" size={24} color={colors.primary} />
                  <View>
                    <Text style={[styles.cardOptionLabel, { color: colors.textPrimary }]}>Pay with Card</Text>
                    <Text style={[styles.cardOptionHint, { color: colors.textMuted }]}>Visa, Mastercard, Amex</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Card>
            </Pressable>

            <Button
              title="Mark as Paid (Cash)"
              onPress={() =>
                openConfirm(
                  'Confirm Payment',
                  `Mark $${amount.toFixed(2)} as paid to ${params.toUserName}? This records a completed cash payment.`,
                  'completed',
                )
              }
              loading={savingAction === 'completed'}
              variant="primary"
            />
          </>
        )}

        <ConfirmModal
          visible={modalVisible}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={() => setModalVisible(false)}
          loading={saving}
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
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  groupName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  amountCurrency: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  statusTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  statusMessage: {
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  statusDate: {
    fontSize: fontSize.sm,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cardOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardOptionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  cardOptionHint: {
    fontSize: fontSize.xs,
  },
});
