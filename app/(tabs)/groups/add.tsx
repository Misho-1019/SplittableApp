import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Header } from '@/components/shared/Header';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { createGroup } from '@/services/groups.service';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';

const formSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { colors } = useTheme();
  const [serverError, setServerError] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return;
      setServerError('');
      try {
        await createGroup(
          data.name,
          data.description ?? null,
          user.id,
          user.displayName,
        );
        toast.showToast('Group created successfully!', 'success');
        setTimeout(() => router.back(), 1200);
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : 'Failed to create group.',
        );
      }
    },
    [user, router],
  );

  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  }, [isDirty, router]);

  useEffect(() => {
    const onBackPress = () => {
      if (isDirty) {
        setShowDiscardModal(true);
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isDirty]);

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="New Group" onBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Group Name"
                value={value}
                onChangeText={onChange}
                placeholder="Thailand Trip, Apartment, etc."
                autoCapitalize="words"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="What's this group for?"
                multiline
              />
            )}
          />

          <View style={[styles.infoBox, { backgroundColor: colors.infoBackground }]}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              After creating the group, you can invite members from the group
              details screen.
            </Text>
          </View>

          {serverError ? (
            <Text style={[styles.error, { color: colors.danger, backgroundColor: colors.dangerBackground }]}>{serverError}</Text>
          ) : null}

          <Button
            title="Create Group"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            variant="primary"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showDiscardModal}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={() => {
          setShowDiscardModal(false);
          router.back();
        }}
        onCancel={() => setShowDiscardModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
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
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  error: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
});
