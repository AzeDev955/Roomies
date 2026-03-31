import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_ESTADO } from '@/styles/casero/vivienda/incidencias.styles';

type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';
type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: Estado;
  fecha_creacion: string;
  creador: { id: number; nombre: string; apellidos: string | null };
  habitacion: { id: number; nombre: string } | null;
};

const ESTADOS: Estado[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTA'];

export default function IncidenciasCaseroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarIncidencias = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Incidencia[]>(`/incidencias?viviendaId=${id}`);
      setIncidencias(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las incidencias.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarIncidencias();
    }, [id])
  );

  const actualizarEstado = async (incidenciaId: number, nuevoEstado: Estado) => {
    try {
      await api.patch(`/incidencias/${incidenciaId}/estado`, { estado: nuevoEstado });
      setIncidencias((prev) =>
        prev.map((i) => (i.id === incidenciaId ? { ...i, estado: nuevoEstado } : i))
      );
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo actualizar el estado.';
      Alert.alert('Error', mensaje);
    }
  };

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={incidencias}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={styles.emptyText}>No hay incidencias en esta vivienda.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={[styles.indicador, { backgroundColor: COLORES_PRIORIDAD[item.prioridad] }]} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            <Text style={styles.cardDescripcion}>{item.descripcion}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardCreador}>
                {item.creador.nombre} {item.creador.apellidos ?? ''}
              </Text>
              {item.habitacion && (
                <>
                  <Text style={styles.cardSeparador}>·</Text>
                  <Text style={styles.cardHabitacion}>{item.habitacion.nombre}</Text>
                </>
              )}
              <Text style={styles.cardSeparador}>·</Text>
              <Text style={styles.cardFecha}>{formatearFecha(item.fecha_creacion)}</Text>
            </View>
            <View style={styles.estadoSelector}>
              {ESTADOS.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.estadoPill, item.estado === e && styles.estadoPillActivo]}
                  onPress={() => actualizarEstado(item.id, e)}
                >
                  <Text style={[styles.estadoPillTexto, item.estado === e && styles.estadoPillTextoActivo]}>
                    {ETIQUETAS_ESTADO[e]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    />
  );
}
