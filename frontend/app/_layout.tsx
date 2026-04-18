import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { obtenerToken, eliminarToken } from '@/services/auth.service';
import api from '@/services/api';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';
import { toastConfig } from '@/constants/toastConfig';
import { syncPushToken } from '@/utils/notifications';
import { getDashboardRoute } from '@/utils/authRoutes';
import { AppThemeProvider, useAppTheme } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootShell />
    </AppThemeProvider>
  );
}

function RootShell() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await obtenerToken();
        if (token) {
          const { data } = await api.get<{ rol: string }>('/auth/me');
          void syncPushToken();
          router.replace(getDashboardRoute(data.rol));
        }
      } catch {
        await eliminarToken();
        router.replace('/');
      } finally {
        setChecking(false);
      }
    };

    verificarSesion();
  }, [router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {checking && (
        <View style={createStyles(theme).overlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <StatusBar style={theme.isDark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <Toast config={toastConfig} />
    </>
  );
}

const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
