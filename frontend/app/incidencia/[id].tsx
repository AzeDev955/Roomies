import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import {
  styles,
  COLORES_PRIORIDAD,
  PRIORIDAD_BG,
  PRIORIDAD_TEXT,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ESTADO_PILL_BG,
  ESTADO_PILL_TEXT,
} from '@/styles/incidencia/detalle.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

type IncidenciaDetalle = {
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

export default function DetalleIncidenciaScreen() {
  const { id, puedeGestionar } = useLocalSearchParams<{ id: string; puedeGestionar: string }>();
  const router = useRouter();
  const puedeEditar = puedeGestionar === 'true';

  const [incidencia, setIncidencia] = useState<IncidenciaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<IncidenciaDetalle>(`/incidencias/${id}`);
      setIncidencia(data);
      setTitulo(data.titulo);
      setDescripcion(data.descripcion);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo cargar la incidencia.' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, [id]));

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await api.put(`/incidencias/${id}`, { titulo, descripcion });
      setIncidencia((prev) => prev ? { ...prev, titulo, descripcion } : prev);
      setEditando(false);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo guardar.' });
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = async (nuevoEstado: Estado) => {
    try {
      await api.patch(`/incidencias/${id}/estado`, { estado: nuevoEstado });
      setIncidencia((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo actualizar el estado.' });
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar incidencia',
      '¿Seguro que quieres eliminar esta incidencia? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/incidencias/${id}`);
              router.back();
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo eliminar.' });
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  if (!incidencia) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorTexto}>Incidencia no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Cabecera (hero card del ticket) ── */}
      <View style={styles.cabeceraCard}>
        <View style={[styles.cabeceraStripe, { backgroundColor: COLORES_PRIORIDAD[incidencia.prioridad] }]} />
        <View style={styles.cabeceraBadgeRow}>
          <View style={[styles.prioridadBadge, { backgroundColor: PRIORIDAD_BG[incidencia.prioridad] }]}>
            <Text style={[styles.prioridadBadgeTexto, { color: PRIORIDAD_TEXT[incidencia.prioridad] }]}>
              Prioridad {ETIQUETAS_PRIORIDAD[incidencia.prioridad]}
            </Text>
          </View>
        </View>
        {editando ? (
          <TextInput
            style={styles.inputTexto}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Título"
          />
        ) : (
          <Text style={styles.titulo}>{incidencia.titulo}</Text>
        )}
        <Text style={styles.subtitulo}>Reportada el {formatearFecha(incidencia.fecha_creacion)}</Text>
      </View>

      {/* ── Estado ── */}
      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>Estado</Text>
        <View style={styles.estadoSelector}>
          {ESTADOS.map((e) => {
            const activo = incidencia.estado === e;
            return (
              <Pressable
                key={e}
                style={[
                  styles.estadoPill,
                  activo && {
                    backgroundColor: ESTADO_PILL_BG[e],
                    borderColor: ESTADO_PILL_TEXT[e] + '40',
                  },
                ]}
                onPress={() => actualizarEstado(e)}
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

      {/* ── Descripción ── */}
      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>Descripción</Text>
        {editando ? (
          <TextInput
            style={[styles.inputTexto, styles.inputDescripcion]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción"
            multiline
          />
        ) : (
          <Text style={styles.valor}>{incidencia.descripcion}</Text>
        )}
      </View>

      {/* ── Reportado por ── */}
      {incidencia.creador && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Reportado por</Text>
          <Text style={styles.valor}>
            {incidencia.creador.nombre} {incidencia.creador.apellidos ?? ''}
          </Text>
        </View>
      )}

      {/* ── Habitación ── */}
      {incidencia.habitacion && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Habitación</Text>
          <Text style={styles.valor}>{incidencia.habitacion.nombre}</Text>
        </View>
      )}

      {/* ── Acciones ── */}
      {puedeEditar && !editando && (
        <View style={styles.accionFila}>
          <Pressable
            style={({ pressed }) => [styles.botonEditar, pressed && { opacity: 0.82 }]}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.botonTextoClaro}>Editar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.botonEliminar, pressed && { opacity: 0.82 }]}
            onPress={handleEliminar}
          >
            <Text style={styles.botonTextoEliminar}>Eliminar</Text>
          </Pressable>
        </View>
      )}

      {editando && (
        <View style={styles.accionFila}>
          <Pressable
            style={({ pressed }) => [styles.botonCancelar, pressed && { opacity: 0.75 }]}
            onPress={() => {
              setTitulo(incidencia.titulo);
              setDescripcion(incidencia.descripcion);
              setEditando(false);
            }}
          >
            <Text style={styles.botonTextoOscuro}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.botonGuardar, pressed && { opacity: 0.82 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTextoClaro}>Guardar</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
