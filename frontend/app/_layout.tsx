import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { obtenerToken, eliminarToken } from '@/services/auth.service';
import api from '@/services/api';
import { Theme } from '@/constants/theme';
import { toastConfig } from '@/constants/toastConfig';
import { syncPushToken } from '@/utils/notifications';

export default function RootLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await obtenerToken();
        if (token) {
          const { data } = await api.get<{ rol: string }>('/auth/me');
          void syncPushToken();
          const destino = data.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
          router.replace(destino);
        }
      } catch {
        await eliminarToken();
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
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      )}
      <Toast config={toastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
