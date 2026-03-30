import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '@/services/api';
import { styles } from '@/styles/casero/vivienda/detalle.styles';

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  metros_cuadrados: number | null;
  codigo_invitacion: string | null;
};

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

export default function DetalleViviendaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vivienda, setVivienda] = useState<Vivienda | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigosRevelados, setCodigosRevelados] = useState<Record<number, boolean>>({});

  const cargarVivienda = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda>(`/viviendas/${id}`);
      setVivienda(data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar la vivienda.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarVivienda();
    }, [id])
  );

  const revelarCodigo = async (habitacionId: number) => {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate para ver el código de invitación',
    });
    if (resultado.success) {
      setCodigosRevelados((prev) => ({ ...prev, [habitacionId]: true }));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      </View>
    );
  }

  if (!vivienda) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#9e9e9e' }}>
          Vivienda no encontrada.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{vivienda.alias_nombre}</Text>
        <Text style={styles.address}>{vivienda.direccion}</Text>

        {vivienda.habitaciones.map((habitacion) => (
          <View key={habitacion.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{habitacion.nombre}</Text>
              <Text style={styles.cardTipo}>{habitacion.tipo}</Text>
            </View>
            {habitacion.es_habitable && habitacion.codigo_invitacion ? (
              <View style={styles.codigoContainer}>
                <Text style={styles.codigoLabel}>Código de invitación</Text>
                {codigosRevelados[habitacion.id] ? (
                  <Text style={styles.codigo}>{habitacion.codigo_invitacion}</Text>
                ) : (
                  <Pressable onPress={() => revelarCodigo(habitacion.id)}>
                    <Text style={styles.codigoOculto}>••••••••</Text>
                    <Text style={styles.revelarTexto}>Toca para revelar</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <Text style={styles.zonaComun}>Zona común · Sin código</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push(`/casero/vivienda/${id}/nueva-habitacion`)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
