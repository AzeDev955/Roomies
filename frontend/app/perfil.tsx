import { View, Text, ScrollView, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { eliminarToken } from '@/services/auth.service';
import { styles } from '@/styles/perfil.styles';

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
        <Text>No se pudo cargar el perfil.</Text>
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
