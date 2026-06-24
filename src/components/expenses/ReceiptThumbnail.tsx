import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing, borderRadius } from '@/config/theme';

interface ReceiptThumbnailProps {
  uri: string;
  onPress: () => void;
  onRemove?: () => void;
}

export function ReceiptThumbnail({ uri, onPress, onRemove }: ReceiptThumbnailProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>

      {onRemove && (
        <TouchableOpacity style={[styles.removeButton, { backgroundColor: colors.surface }]} onPress={onRemove}>
          <Ionicons name="close-circle" size={22} color={colors.danger} />
        </TouchableOpacity>
      )}

      <View style={styles.label}>
        <Ionicons name="camera" size={12} color={colors.textInverse} />
        <Text style={[styles.labelText, { color: colors.textInverse }]}>Receipt</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    borderRadius: 12,
  },
  label: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  labelText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});
