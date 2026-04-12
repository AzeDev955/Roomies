import { View, Text, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { useState, useCallback } from 'react';
import api from '@/services/api';
import { styles } from '@/styles/casero/inquilino/perfil.styles';
import { Theme } from '@/constants/theme';
import { parsePositiveIntParam } from '@/utils/routeParams';

type PerfilInquilino = {
  id: number;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  habitacion: { id: number; nombre: string };
  vivienda: { id: number; alias_nombre: string };
};

export default function PerfilInquilinoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const inquilinoId = parsePositiveIntParam(id);
  const [perfil, setPerfil] = useState<PerfilInquilino | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!inquilinoId) {
      setPerfil(null);
      setError('El enlace del inquilino no es valido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get<PerfilInquilino>(`/inquilino/${inquilinoId}/perfil`);
      setPerfil(data);
      setError(null);
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo cargar el perfil.';
      setPerfil(null);
      setError(mensaje);
      Toast.show({ type: 'error', text1: 'No se pudo cargar el perfil.' });
    } finally {
      setLoading(false);
    }
  }, [inquilinoId]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const iniciales = perfil
    ? `${perfil.nombre[0]}${perfil.apellidos?.[0] ?? ''}`.toUpperCase()
    : '';

  const nombreCompleto = perfil
    ? `${perfil.nombre}${perfil.apellidos ? ` ${perfil.apellidos}` : ''}`
    : '';

  if (loading) return <LoadingScreen />;

  if (!perfil) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Perfil de inquilino',
            headerTintColor: Theme.colors.primary,
          }}
        />
        <View style={styles.container}>
          <View style={styles.errorState}>
            <View style={styles.errorIconBox}>
              <Ionicons name="person-circle-outline" size={44} color={Theme.colors.primary} />
            </View>
            <Text style={styles.errorTitle}>Perfil no disponible</Text>
            <Text style={styles.errorText}>
              {error ?? 'No hemos encontrado datos para este inquilino.'}
            </Text>
            <CustomButton
              label="Volver a viviendas"
              variant="outline"
              onPress={() => router.replace('/casero/viviendas')}
              style={styles.errorAction}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Perfil de inquilino',
          headerStyle: { backgroundColor: Theme.colors.surface },
          headerTitleStyle: { color: Theme.colors.text, fontWeight: '600' },
          headerTintColor: Theme.colors.primary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciales}</Text>
        </View>

        <Text style={styles.nombre}>{nombreCompleto}</Text>
        <Text style={styles.subtitulo}>
          {perfil.habitacion.nombre} · {perfil.vivienda.alias_nombre}
        </Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitulo}>Datos de contacto</Text>

          <View style={styles.fila}>
            <Ionicons name="mail-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.filaTexto}>{perfil.email}</Text>
          </View>

          {perfil.telefono && (
            <>
              <View style={styles.separador} />
              <View style={styles.fila}>
                <Ionicons name="call-outline" size={20} color={Theme.colors.primary} />
                <Text style={styles.filaTexto}>{perfil.telefono}</Text>
              </View>
            </>
          )}
        </Card>

        <CustomButton
          label="Enviar email"
          variant="outline"
          onPress={() => Linking.openURL(`mailto:${perfil.email}`)}
          style={styles.botonEmail}
        />

        {perfil.telefono && (
          <CustomButton
            label="Llamar"
            variant="outline"
            onPress={() => Linking.openURL(`tel:${perfil.telefono}`)}
            style={styles.botonEmail}
          />
        )}
      </ScrollView>
    </>
  );
}
