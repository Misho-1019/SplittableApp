import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '@/config/theme';

export default function GroupDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Group Detail</Text>
      <Text style={styles.subtext}>Coming in Milestone 14</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  subtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 8,
  },
});
