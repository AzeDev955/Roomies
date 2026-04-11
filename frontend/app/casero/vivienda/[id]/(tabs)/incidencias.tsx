import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useGlobalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import {
  styles,
  PRIORIDAD_BG,
  PRIORIDAD_TEXT,
  COLORES_PRIORIDAD,
  ETIQUETAS_PRIORIDAD,
  ETIQUETAS_ESTADO,
  ESTADO_PILL_BG,
  ESTADO_PILL_TEXT,
} from '@/styles/casero/vivienda/incidencias.styles';

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

export default function IncidenciasCaseroTab() {
  const params = useGlobalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const cargarIncidencias = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data } = await api.get<Incidencia[]>(`/incidencias?viviendaId=${id}`);
      setIncidencias(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar las incidencias.' });
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
      Toast.show({ type: 'error', text1: mensaje });
    }
  };

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const activas = incidencias.filter((i) => i.estado !== 'RESUELTA');
  const historial = incidencias.filter((i) => i.estado === 'RESUELTA');

  const renderCard = (item: Incidencia) => (
    <View key={item.id} style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: COLORES_PRIORIDAD[item.prioridad] }]} />
      <View style={styles.cardBody}>
        <Pressable onPress={() => router.push(`/incidencia/${item.id}?puedeGestionar=true`)}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            <View style={[styles.prioridadBadge, { backgroundColor: PRIORIDAD_BG[item.prioridad] }]}>
              <Text style={[styles.prioridadBadgeTexto, { color: PRIORIDAD_TEXT[item.prioridad] }]}>
                {ETIQUETAS_PRIORIDAD[item.prioridad]}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescripcion} numberOfLines={2}>{item.descripcion}</Text>
        </Pressable>
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
          {ESTADOS.map((e) => {
            const activo = item.estado === e;
            return (
              <Pressable
                key={e}
                style={[
                  styles.estadoPill,
                  activo && { backgroundColor: ESTADO_PILL_BG[e] },
                ]}
                onPress={() => actualizarEstado(item.id, e)}
              >
                <Text
                  style={[
                    styles.estadoPillTexto,
                    activo && { color: ESTADO_PILL_TEXT[e] },
                  ]}
                >
                  {ETIQUETAS_ESTADO[e]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={activas}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="checkmark-circle-outline" size={40} color={Theme.colors.success} />
            </View>
            <Text style={styles.emptyTitulo}>Todo en orden</Text>
            <Text style={styles.emptySubtitulo}>
              No hay incidencias activas en esta vivienda. ¡Qué bien!
            </Text>
          </View>
        }
        renderItem={({ item }) => renderCard(item)}
        ListFooterComponent={
          historial.length > 0 ? (
            <>
              <Pressable
                style={styles.historialToggle}
                onPress={() => setMostrarHistorial((v) => !v)}
              >
                <Text style={styles.historialToggleTexto}>
                  {mostrarHistorial
                    ? 'Ocultar historial'
                    : `Ver historial (${historial.length})`}
                </Text>
              </Pressable>
              {mostrarHistorial && (
                <>
                  <View style={styles.historialSeparador} />
                  {historial.map((item) => renderCard(item))}
                </>
              )}
            </>
          ) : null
        }
      />
    </View>
  );
}
