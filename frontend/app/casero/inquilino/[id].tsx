import { View, Text, Linking, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/casero/inquilino/perfil.styles';
import { Theme } from '@/constants/theme';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfil, setPerfil] = useState<PerfilInquilino | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PerfilInquilino>(`/inquilino/${id}/perfil`);
      setPerfil(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo cargar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, [id]));

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
        <Stack.Screen options={{ headerShown: true, title: 'Perfil de inquilino', headerTintColor: Theme.colors.primary }} />
        <View style={styles.container} />
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
            <Text style={{ fontSize: 18 }}>✉️</Text>
            <Text style={styles.filaTexto}>{perfil.email}</Text>
          </View>

          {perfil.telefono && (
            <>
              <View style={styles.separador} />
              <View style={styles.fila}>
                <Text style={{ fontSize: 18 }}>📞</Text>
                <Text style={styles.filaTexto}>{perfil.telefono}</Text>
              </View>
            </>
          )}
        </Card>

        <CustomButton
          label="Enviar Email"
          variant="outline"
          onPress={() => Linking.openURL(`mailto:${perfil.email}`)}
          style={styles.botonEmail}
        />
      </ScrollView>
    </>
  );
}
