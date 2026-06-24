import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { createSettlement, getSettlementsBetweenUsers } from '@/services/settlements.service';
import { Header } from '@/components/shared/Header';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/shared/Badge';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
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

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [saving, setSaving] = useState(false);
  const [existingSettlement, setExistingSettlement] = useState<Settlement | null>(null);
  const [checkingSettlement, setCheckingSettlement] = useState(true);

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
        setExistingSettlement(settlements.length > 0 ? settlements[0] : null);
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
    if (!user || !params.groupId || !params.toUserId || amount <= 0) return;

    setModalVisible(false);
    setSaving(true);

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
      router.replace('/(tabs)/balances');
    } catch {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (checkingSettlement) {
    return (
      <View style={styles.container}>
        <Header title="Settle Up" onBack={() => router.back()} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (existingSettlement) {
    const isComplete = existingSettlement.status === 'completed';
    const otherName = params.toUserName;

    return (
      <View style={styles.container}>
        <Header title="Settle Up" onBack={() => router.back()} />

        <View style={styles.content}>
          <View style={styles.hero}>
            <View
              style={[
                styles.iconCircle,
                isComplete ? styles.iconCircleDone : styles.iconCirclePending,
              ]}
            >
              <Ionicons
                name={isComplete ? 'checkmark' : 'time'}
                size={36}
                color={colors.textInverse}
              />
            </View>
            <Text style={styles.statusTitle}>
              {isComplete ? 'Already Settled' : 'Payment Pending'}
            </Text>
            <Text style={styles.statusMessage}>
              {isComplete
                ? `You ${isReceiving ? 'received' : 'paid'} $${amount.toFixed(2)} ${isReceiving ? 'from' : 'to'} ${otherName}.`
                : `Awaiting $${amount.toFixed(2)} from ${otherName}.`}
            </Text>
            {existingSettlement.createdAt && (
              <Text style={styles.statusDate}>
                {formatRelativeDate(existingSettlement.createdAt)}
              </Text>
            )}
            <Badge
              variant={isComplete ? 'completed' : 'pending'}
              label={existingSettlement.status}
            />
          </View>

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
    <View style={styles.container}>
      <Header title="Settle Up" onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.hero}>
          <View
            style={[
              styles.iconCircle,
              isReceiving ? styles.iconCircleReceive : styles.iconCirclePay,
            ]}
          >
            <Ionicons
              name={isReceiving ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={36}
              color={colors.textInverse}
            />
          </View>
          <Text style={styles.label}>
            {isReceiving
              ? `${params.toUserName} owes you`
              : `You're paying ${params.toUserName}`}
          </Text>
          <Text style={styles.groupName}>{params.groupName}</Text>
        </View>

        <Card style={styles.amountCard}>
          <Text style={styles.amountValue}>
            ${amount.toFixed(2)}
          </Text>
          <Text style={styles.amountCurrency}>{params.currency ?? 'USD'}</Text>
        </Card>

        {isReceiving ? (
          <>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>

            <Button
              title="Waiting for Payment"
              onPress={() =>
                openConfirm(
                  'Awaiting Payment',
                  `Record that ${params.toUserName} owes you $${amount.toFixed(2)}? This will show as pending until completed.`,
                  'pending',
                )
              }
              loading={saving}
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
              loading={saving}
              variant="primary"
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>How would you like to pay?</Text>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/balances/payment/index',
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
                    <Text style={styles.cardOptionLabel}>Pay with Card</Text>
                    <Text style={styles.cardOptionHint}>Visa, Mastercard, Amex</Text>
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
              loading={saving}
              variant="primary"
            />
          </>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
          <Text style={styles.infoText}>
            {isReceiving
              ? 'Mark as received only if you already got the money. Use "Waiting" to track pending payments.'
              : 'Card payments secured by Stripe (test mode). No real charges are made.'}
          </Text>
        </View>

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
    backgroundColor: colors.background,
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
  iconCirclePay: {
    backgroundColor: colors.danger,
  },
  iconCircleReceive: {
    backgroundColor: colors.success,
  },
  iconCircleDone: {
    backgroundColor: colors.success,
  },
  iconCirclePending: {
    backgroundColor: colors.warning,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  groupName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  amountValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  amountCurrency: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.divider,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
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
    paddingHorizontal: spacing.md,
  },
  statusDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    color: colors.textPrimary,
  },
  cardOptionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
