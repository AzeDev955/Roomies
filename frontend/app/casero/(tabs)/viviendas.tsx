import { View, Text, FlatList, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { styles } from '@/styles/casero/viviendas.styles';
import api from '@/services/api';
import { Card } from '@/components/common/Card';

type Habitacion = { id: number; nombre: string };
type IncidenciaActiva = { prioridad: 'VERDE' | 'AMARILLO' | 'ROJO' };
type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
  incidencias: IncidenciaActiva[];
};

const ORDEN_PRIORIDAD: Record<string, number> = { VERDE: 0, AMARILLO: 1, ROJO: 2 };

const getMaxPrioridad = (incidencias: IncidenciaActiva[]): 'VERDE' | 'AMARILLO' | 'ROJO' | null => {
  if (incidencias.length === 0) return null;
  return incidencias.reduce((max, i) =>
    ORDEN_PRIORIDAD[i.prioridad] > ORDEN_PRIORIDAD[max.prioridad] ? i : max
  ).prioridad;
};

export default function ViviendasScreen() {
  const router = useRouter();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarViviendas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda[]>('/viviendas');
      setViviendas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar las viviendas.' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarViviendas();
    }, [])
  );

  const BADGE_POR_PRIORIDAD = {
    VERDE: styles.badgeVerde,
    AMARILLO: styles.badgeAmarillo,
    ROJO: styles.badgeRojo,
  } as const;

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={viviendas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyText}>Aún no tienes viviendas registradas.</Text>
            <Text style={styles.emptySubtext}>Pulsa el botón + para añadir tu primera vivienda.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const maxPrioridad = getMaxPrioridad(item.incidencias);
          return (
            <Card onPress={() => router.push(`/casero/vivienda/${item.id}`)}>
              {maxPrioridad !== null && (
                <View style={[styles.badge, BADGE_POR_PRIORIDAD[maxPrioridad]]}>
                  <Text style={styles.badgeTexto}>{item.incidencias.length}</Text>
                </View>
              )}
              <Text style={styles.cardTitle}>{item.alias_nombre}</Text>
              <Text style={styles.cardAddress}>{item.direccion}</Text>
              <Text style={styles.cardRooms}>{item.habitaciones?.length ?? 0} habitaciones</Text>
            </Card>
          );
        }}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/casero/nueva-vivienda')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
