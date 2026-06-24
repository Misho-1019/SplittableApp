import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export function useImagePicker(options: UseImagePickerOptions = {}) {
  const { allowsEditing = true, aspect = [4, 3], quality = 0.8 } = options;
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to capture receipts.',
        );
        return false;
      }
    }
    return true;
  };

  const pickFromCamera = async () => {
    const permitted = await requestPermission();
    if (!permitted) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => setImage(null);

  return { image, loading, pickFromCamera, pickFromGallery, removeImage };
}
