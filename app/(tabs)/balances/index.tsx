import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '@/config/theme';

export default function BalancesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Balances</Text>
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
});
