import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Header } from '@/components/shared/Header';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { fontSize, fontWeight, spacing, borderRadius } from '@/config/theme';
import { useState } from 'react';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode, colors } = useTheme();
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setShowLogout(false);
    try {
      await logout();
    } catch {
      // silently fail
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>
              {user.displayName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user.email}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Preferences
        </Text>

        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.divider, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Currency
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.textMuted }]}>
                USD ($)
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Account
        </Text>

        <TouchableOpacity
          style={[styles.logoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>
          Splittable v1.0.0
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  profileEmail: {
    fontSize: fontSize.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  settingCard: {
    gap: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  settingDivider: {
    height: StyleSheet.hairlineWidth,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValueText: {
    fontSize: fontSize.sm,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#E74C3C',
  },
  version: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
