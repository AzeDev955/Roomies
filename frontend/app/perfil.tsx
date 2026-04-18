import { View, Text, ScrollView, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { eliminarToken } from '@/services/auth.service';
import { createStyles } from '@/styles/perfil.styles';
import { ThemeMode } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

type Perfil = {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: 'CASERO' | 'INQUILINO';
  telefono: string | null;
};

export default function PerfilScreen() {
  const router = useRouter();
  const { mode, setMode, theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get<Perfil>('/auth/me');
        setPerfil(data);
      } catch {
        Toast.show({ type: 'error', text1: 'No se pudo cargar el perfil.' });
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const cerrarSesion = async () => {
    await eliminarToken();
    router.replace('/');
  };

  if (loading) return <LoadingScreen />;

  if (!perfil) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  const inicial = perfil.nombre.charAt(0).toUpperCase();
  const esCasero = perfil.rol === 'CASERO';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{inicial}</Text>
        </View>

        <Text style={styles.nombreCompleto}>{perfil.nombre} {perfil.apellidos}</Text>

        <View style={[styles.badge, esCasero ? styles.badgeCasero : styles.badgeInquilino]}>
          <Text style={styles.badgeTexto}>{esCasero ? 'Propietario' : 'Inquilino'}</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaLabel}>Email</Text>
          <Text style={styles.tarjetaValor}>{perfil.email}</Text>
        </View>

        {perfil.telefono ? (
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaLabel}>Teléfono</Text>
            <Text style={styles.tarjetaValor}>{perfil.telefono}</Text>
          </View>
        ) : null}

        <View style={styles.themeSection}>
          <Text style={styles.themeTitle}>Apariencia</Text>
          <View style={styles.themeOptions}>
            {[
              ['system', 'Sistema'],
              ['light', 'Claro'],
              ['dark', 'Oscuro'],
            ].map(([value, label]) => {
              const selected = mode === value;
              return (
                <Pressable
                  key={value}
                  style={({ pressed }) => [
                    styles.themeOption,
                    selected && styles.themeOptionActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void setMode(value as ThemeMode)}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar modo ${label.toLowerCase()}`}
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.themeOptionText, selected && styles.themeOptionTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.botonLogout, pressed && styles.pressed]}
          onPress={cerrarSesion}
        >
          <Text style={styles.botonLogoutTexto}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
