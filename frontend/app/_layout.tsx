import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { obtenerToken, eliminarToken } from '@/services/auth.service';
import api from '@/services/api';
import { Theme } from '@/constants/theme';

export default function RootLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = await obtenerToken();
        if (!token) return; // queda en /

        const { data } = await api.get<{ rol: string }>('/auth/me');
        const destino = data.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
        router.replace(destino);
      } catch {
        // Token expirado o inválido — borrarlo y quedarse en login
        await eliminarToken();
      } finally {
        setChecking(false);
      }
    };

    verificarSesion();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
