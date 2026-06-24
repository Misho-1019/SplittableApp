import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity, Alert, Share, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { useTheme } from '@/context/ThemeContext';
import { Header } from '@/components/shared/Header';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { fontSize, fontWeight, spacing, borderRadius, currencies } from '@/config/theme';
import type { CurrencyCode } from '@/config/theme';
import { useState } from 'react';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { groups } = useGroups(user?.id);
  const { isDark, toggleDarkMode, colors } = useTheme();
  const [showLogout, setShowLogout] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<(typeof currencies)[number]>(currencies[0]);

  const handleExport = async () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        groups,
      };
      const json = JSON.stringify(data, null, 2);

      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(json);
        Alert.alert('Exported', 'Data copied to clipboard.');
      } else {
        await Share.share({
          message: json,
          title: 'Splittable Export',
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

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

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowCurrencyPicker(true)}
            activeOpacity={0.6}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Currency
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.textMuted }]}>
                {selectedCurrency.code} ({selectedCurrency.symbol})
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data
        </Text>

        <TouchableOpacity
          style={[styles.logoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleExport}
          activeOpacity={0.7}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
          <Text style={[styles.exportText, { color: colors.primary }]}>Export Data (JSON)</Text>
        </TouchableOpacity>

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

      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay]}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    selectedCurrency.code === item.code && { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => {
                    setSelectedCurrency(item);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={[styles.currencySymbol, { color: colors.primary }]}>{item.symbol}</Text>
                  <View>
                    <Text style={[styles.currencyName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.currencyCode, { color: colors.textMuted }]}>{item.code}</Text>
                  </View>
                  {selectedCurrency.code === item.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  exportText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  version: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    width: 32,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  currencyCode: {
    fontSize: fontSize.xs,
  },
});
