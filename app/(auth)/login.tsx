import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { forgotPassword } from '@/services/auth.service';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { fontSize, spacing, borderRadius } from '@/config/theme';
import { getFirebaseErrorMessage } from '@/utils/errors';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();
  const [serverError, setServerError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)/groups');
    } catch (error) {
      setServerError(getFirebaseErrorMessage(error));
    }
  };

  const handleForgotPassword = () => {
    setResetEmail('');
    setShowForgotPassword(true);
  };

  const handleSendReset = async () => {
    if (!resetEmail.trim()) return;
    setSendingReset(true);
    try {
      await forgotPassword(resetEmail.trim());
      setShowForgotPassword(false);
      Alert.alert('Check Your Email', 'If an account exists for that email, a password reset link has been sent.');
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.appName, { color: colors.primary }]}>Splittable</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Split expenses, not friendships
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <Text
            style={[styles.forgotPassword, { color: colors.primary }]}
            onPress={handleForgotPassword}
          >
            Forgot Password?
          </Text>

          {serverError ? (
            <Text style={[styles.error, { color: colors.danger, backgroundColor: colors.dangerBackground }]}>
              {serverError}
            </Text>
          ) : null}

          <Button
            title="Login"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            variant="primary"
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Text
              style={[styles.link, { color: colors.primary }]}
              onPress={() => router.push('/(auth)/register')}
            >
              Register
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showForgotPassword}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reset Password</Text>
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
              Enter your email to receive a password reset link.
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button title={sendingReset ? 'Sending...' : 'Send Reset Link'} onPress={handleSendReset} disabled={!resetEmail.trim() || sendingReset} />
            <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
              <Text style={[styles.modalCancel, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.md,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  forgotPassword: {
    fontSize: fontSize.sm,
    textAlign: 'right',
    marginTop: -spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalHint: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: fontSize.md,
  },
  modalCancel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
