import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { CustomButton } from '@/components/common/CustomButton';
import { Card } from '@/components/common/Card';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { styles } from '@/styles/casero/viviendas.styles';
import { Theme } from '@/constants/theme';
import api from '@/services/api';

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
  inquilino_id: number | null;
};
type IncidenciaActiva = { prioridad: 'VERDE' | 'AMARILLO' | 'ROJO' };
type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
  incidencias: IncidenciaActiva[];
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

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={viviendas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>Mis Propiedades</Text>
            <Text style={styles.headerSubtitulo}>Gestiona tus pisos y habitaciones</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={Theme.colors.textTertiary} />
            <Text style={styles.emptyTitulo}>Aún no tienes propiedades</Text>
            <Text style={styles.emptySubtitulo}>Comienza a gestionar tu patrimonio añadiendo tu primera vivienda.</Text>
            <CustomButton
              label="Comenzar"
              variant="primary"
              onPress={() => router.push('/casero/nueva-vivienda')}
              style={styles.emptyBoton}
            />
          </View>
        }
        renderItem={({ item }) => {
          const habitacionesHabitables = item.habitaciones.filter(
            (h) => h.tipo === 'DORMITORIO'
          );
          const inquilinosActuales = habitacionesHabitables.filter(
            (h) => h.inquilino_id !== null
          ).length;

          return (
            <Pressable
              style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardWrapperPressed]}
              onPress={() => router.push(`/casero/vivienda/${item.id}`)}
            >
              <Card style={styles.card}>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="business-outline" size={48} color={Theme.colors.primary} />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardBodyRow}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitulo}>{item.alias_nombre}</Text>
                      <View style={styles.cardDireccionFila}>
                        <Ionicons name="location-outline" size={14} color={Theme.colors.textSecondary} />
                        <Text style={styles.cardDireccion}>{item.direccion}</Text>
                      </View>
                      <View style={styles.chips}>
                        <View style={styles.chipHabitaciones}>
                          <Ionicons name="bed-outline" size={12} color="#1D4ED8" />
                          <Text style={styles.chipHabitacionesTexto}>
                            {habitacionesHabitables.length} Habitaciones
                          </Text>
                        </View>
                        <View style={styles.chipInquilinos}>
                          <Ionicons name="people-outline" size={12} color="#065F46" />
                          <Text style={styles.chipInquilinosTexto}>
                            {inquilinosActuales} Inquilinos
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={Theme.colors.textTertiary} />
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />

      {viviendas.length > 0 && (
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push('/casero/nueva-vivienda')}
        >
          <Ionicons name="add" size={24} color={Theme.colors.surface} />
          <Text style={styles.fabTexto}>Nueva Vivienda</Text>
        </Pressable>
      )}
    </View>
  );
}
