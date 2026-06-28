import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { useNotifications } from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function NotificationSetup() {
  useNotifications();
  return null;
}

function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  if (!fontsLoaded && Platform.OS === 'web') {
    return <LoadingSpinner fullScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <PreferencesProvider>
              <FontLoader>
                <NotificationSetup />
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </FontLoader>
            </PreferencesProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
