import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getGroup } from '@/services/groups.service';
import { getUsers } from '@/services/users.service';
import { createExpense } from '@/services/expenses.service';
import { Header } from '@/components/shared/Header';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { Avatar } from '@/components/shared/Avatar';
import { AmountInput } from '@/components/expenses/AmountInput';
import { SplitTypePicker } from '@/components/expenses/SplitTypePicker';
import { EqualSplit } from '@/components/expenses/EqualSplit';
import { PercentageSplit } from '@/components/expenses/PercentageSplit';
import { CustomSplit } from '@/components/expenses/CustomSplit';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import type { Group, User, SplitType, SplitDetail } from '@/types';

export default function AddExpenseScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const paidByUser = members.find((m) => m.id === paidBy);
  const amountNum = parseFloat(amount) || 0;

  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;

    async function load() {
      const fetched = await getGroup(groupId);
      if (cancelled || !fetched) return;
      setGroup(fetched);
      setPaidBy(fetched.members[0]);

      const userDocs = await getUsers(fetched.members);
      if (cancelled) return;
      setMembers(userDocs);

      const initialPercent = Math.floor(100 / fetched.members.length);
      const pcts: Record<string, number> = {};
      const shares: Record<string, string> = {};
      fetched.members.forEach((id, i) => {
        pcts[id] = i === fetched.members.length - 1 ? 100 - initialPercent * (fetched.members.length - 1) : initialPercent;
        shares[id] = '';
      });
      setPercentages(pcts);
      setCustomShares(shares);
      setLoadingData(false);
    }

    load();
    return () => { cancelled = true; };
  }, [groupId]);

  const splitData = useMemo(() => {
    if (splitType === 'equal') {
      return members.map((m) => ({
        userId: m.id,
        displayName: m.displayName,
        share: members.length > 0 ? amountNum / members.length : 0,
      }));
    }
    if (splitType === 'percentage') {
      return members.map((m) => ({
        userId: m.id,
        displayName: m.displayName,
        share: (percentages[m.id] ?? 0) / 100 * amountNum,
        percentage: percentages[m.id] ?? 0,
      }));
    }
    return members.map((m) => ({
      userId: m.id,
      displayName: m.displayName,
      share: parseFloat(customShares[m.id] ?? '0') || 0,
    }));
  }, [splitType, members, amountNum, percentages, customShares]);

  const canSave = useMemo(() => {
    if (!description.trim() || !amountNum || amountNum <= 0 || !paidBy) return false;
    if (splitType === 'percentage') {
      const total = Object.values(percentages).reduce((s, p) => s + p, 0);
      if (Math.abs(total - 100) > 0.5) return false;
    }
    if (splitType === 'custom') {
      const total = Object.values(customShares).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      if (Math.abs(total - amountNum) > 0.01) return false;
    }
    return true;
  }, [description, amountNum, paidBy, splitType, percentages, customShares]);

  const handlePercentageChange = (memberId: string, percentage: number) => {
    setPercentages((prev) => ({ ...prev, [memberId]: percentage }));
  };

  const handleCustomShareChange = (memberId: string, share: string) => {
    setCustomShares((prev) => ({ ...prev, [memberId]: share }));
  };

  const handleSave = async () => {
    if (!user || !group || !canSave) return;

    const lastMember = members[members.length - 1];
    let finalSplit = [...splitData];

    if (splitType === 'equal') {
      const sum = finalSplit.reduce((s, d) => s + d.share, 0);
      if (lastMember && finalSplit.length > 0) {
        finalSplit[finalSplit.length - 1] = {
          ...finalSplit[finalSplit.length - 1],
          share: finalSplit[finalSplit.length - 1].share + (amountNum - sum),
        };
      }
    }

    setSaving(true);
    setError('');

    try {
      await createExpense(group.id, {
        description: description.trim(),
        amount: amountNum,
        currency: 'USD',
        paidBy,
        paidByName: paidByUser?.displayName ?? '',
        splitType,
        splitDetails: finalSplit,
        receiptPhotoURL: null,
        receiptPhotoThumbnailURL: null,
        createdBy: user.id,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="Add Expense"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Grocery shopping, dinner, etc."
          />

          <AmountInput
            value={amount}
            onChangeText={setAmount}
            error={amount.trim() && (parseFloat(amount) || 0) <= 0 ? 'Enter a valid amount' : undefined}
          />

          <Text style={styles.label}>Paid by</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.payerRow}
          >
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.payerChip,
                  paidBy === member.id && styles.payerChipActive,
                ]}
                onPress={() => setPaidBy(member.id)}
              >
                <Avatar name={member.displayName} size="md" />
                <Text
                  style={[
                    styles.payerName,
                    paidBy === member.id && styles.payerNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {member.displayName}
                  {member.id === user?.id ? ' (You)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Split Type</Text>
          <SplitTypePicker value={splitType} onChange={setSplitType} />

          {splitType === 'equal' && (
            <EqualSplit
              amount={amountNum}
              members={members.map((m) => ({
                id: m.id,
                displayName: m.displayName,
              }))}
            />
          )}

          {splitType === 'percentage' && (
            <PercentageSplit
              members={members.map((m) => ({
                id: m.id,
                displayName: m.displayName,
                percentage: percentages[m.id] ?? 0,
              }))}
              onPercentChange={handlePercentageChange}
            />
          )}

          {splitType === 'custom' && (
            <CustomSplit
              members={members.map((m) => ({
                id: m.id,
                displayName: m.displayName,
                share: customShares[m.id] ?? '',
              }))}
              onShareChange={handleCustomShareChange}
              totalAmount={amountNum}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Save Expense"
            onPress={handleSave}
            loading={saving}
            disabled={!canSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  payerRow: {
    gap: spacing.sm,
  },
  payerChip: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    width: 80,
  },
  payerChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0F0',
  },
  payerName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  payerNameActive: {
    color: colors.primary,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
    backgroundColor: '#FFEBEE',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
});
