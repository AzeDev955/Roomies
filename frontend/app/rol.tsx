import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createStyles } from '@/styles/rol.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';
import { useAppTheme } from '@/contexts/ThemeContext';
import { syncPushToken } from '@/utils/notifications';
import { getDashboardRoute } from '@/utils/authRoutes';

type Rol = 'CASERO' | 'INQUILINO';

export default function SeleccionRolScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    if (!rolSeleccionado) return;
    setLoading(true);
    try {
      const { data } = await api.patch<{ token: string; usuario: { rol: string } }>('/auth/rol', {
        rol: rolSeleccionado,
      });
      await guardarToken(data.token);
      void syncPushToken();
      router.replace(getDashboardRoute(data.usuario.rol));
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo guardar el rol. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>¿Cómo usarás Roomies?</Text>
      <Text style={styles.subtitulo}>
        Elige tu rol para personalizar la experiencia. Podrás cambiarlo más adelante desde tu perfil.
      </Text>

      <Pressable
        style={[styles.card, rolSeleccionado === 'CASERO' && styles.cardActivo]}
        onPress={() => setRolSeleccionado('CASERO')}
        accessibilityRole="button"
        accessibilityLabel="Seleccionar rol casero"
        accessibilityState={{ selected: rolSeleccionado === 'CASERO' }}
      >
        <View style={styles.cardIconBox}>
          <Ionicons name="home-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.cardTitulo}>Casero</Text>
        <Text style={styles.cardDescripcion}>
          Gestiona viviendas, habitaciones e inquilinos. Crea códigos de invitación y controla incidencias.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.card, rolSeleccionado === 'INQUILINO' && styles.cardActivo]}
        onPress={() => setRolSeleccionado('INQUILINO')}
        accessibilityRole="button"
        accessibilityLabel="Seleccionar rol inquilino"
        accessibilityState={{ selected: rolSeleccionado === 'INQUILINO' }}
      >
        <View style={styles.cardIconBox}>
          <Ionicons name="people-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.cardTitulo}>Inquilino</Text>
        <Text style={styles.cardDescripcion}>
          Únete a una vivienda con tu código de invitación, ve a tus compañeros y reporta incidencias.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.botonConfirmar, (!rolSeleccionado || loading) && styles.botonConfirmarDisabled]}
        onPress={confirmar}
        disabled={!rolSeleccionado || loading}
        accessibilityRole="button"
        accessibilityLabel="Confirmar rol"
        accessibilityState={{ disabled: !rolSeleccionado || loading, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.background} />
        ) : (
          <Text style={styles.botonConfirmarTexto}>Confirmar</Text>
        )}
      </Pressable>
    </View>
  );
}
