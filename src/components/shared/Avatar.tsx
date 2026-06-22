import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '@/config/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  photoURL?: string | null;
  name: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, { container: number; font: number }> = {
  sm: { container: 32, font: 14 },
  md: { container: 44, font: 18 },
  lg: { container: 56, font: 22 },
  xl: { container: 72, font: 30 },
};

const colorPalette = [
  '#6C63FF',
  '#FF6584',
  '#4CAF50',
  '#FFC107',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#00BCD4',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

export function Avatar({ photoURL, name, size = 'md' }: AvatarProps) {
  const dimensions = sizeMap[size];
  const bgColor = getColor(name);

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          styles.image,
          { width: dimensions.container, height: dimensions.container, borderRadius: dimensions.container / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: dimensions.font }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.divider,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontWeight: fontWeight.semibold,
  },
});
