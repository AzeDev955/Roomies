import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/rol.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';
import { syncPushToken } from '@/utils/notifications';

type Rol = 'CASERO' | 'INQUILINO';

export default function SeleccionRolScreen() {
  const router = useRouter();
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
      const destino = data.usuario.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
      router.replace(destino);
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
      >
        <Text style={styles.cardEmoji}>🏠</Text>
        <Text style={styles.cardTitulo}>Casero</Text>
        <Text style={styles.cardDescripcion}>
          Gestiona viviendas, habitaciones e inquilinos. Crea códigos de invitación y controla incidencias.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.card, rolSeleccionado === 'INQUILINO' && styles.cardActivo]}
        onPress={() => setRolSeleccionado('INQUILINO')}
      >
        <Text style={styles.cardEmoji}>🛏️</Text>
        <Text style={styles.cardTitulo}>Inquilino</Text>
        <Text style={styles.cardDescripcion}>
          Únete a una vivienda con tu código de invitación, ve a tus compañeros y reporta incidencias.
        </Text>
      </Pressable>

      <Pressable
        style={[styles.botonConfirmar, (!rolSeleccionado || loading) && styles.botonConfirmarDisabled]}
        onPress={confirmar}
        disabled={!rolSeleccionado || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonConfirmarTexto}>Confirmar</Text>
        )}
      </Pressable>
    </View>
  );
}
