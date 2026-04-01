import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import {
  styles,
  COLORES_PRIORIDAD,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
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
      Alert.alert('Error', 'No se pudo cargar la incidencia.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, [id]));

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await api.put(`/incidencias/${id}`, { titulo, descripcion });
      // Actualizar solo los campos editados sin reemplazar el objeto completo
      setIncidencia((prev) => prev ? { ...prev, titulo, descripcion } : prev);
      setEditando(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = async (nuevoEstado: Estado) => {
    try {
      await api.patch(`/incidencias/${id}/estado`, { estado: nuevoEstado });
      setIncidencia((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'No se pudo actualizar el estado.');
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
              Alert.alert('Error', err.response?.data?.error ?? 'No se pudo eliminar.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!incidencia) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorTexto}>Incidencia no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.cabecera}>
        <View style={[styles.dot, { backgroundColor: COLORES_PRIORIDAD[incidencia.prioridad] }]} />
        <View style={styles.cabeceraTextos}>
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
          <Text style={styles.subtitulo}>
            {ETIQUETAS_PRIORIDAD[incidencia.prioridad]}
          </Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>Estado</Text>
        <View style={styles.estadoSelector}>
          {ESTADOS.map((e) => (
            <Pressable
              key={e}
              style={[styles.estadoPill, incidencia.estado === e && styles.estadoPillActivo]}
              onPress={() => actualizarEstado(e)}
            >
              <Text style={[styles.estadoPillTexto, incidencia.estado === e && styles.estadoPillTextoActivo]}>
                {ETIQUETAS_ESTADO[e]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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

      {incidencia.creador && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Reportado por</Text>
          <Text style={styles.valor}>
            {incidencia.creador.nombre} {incidencia.creador.apellidos ?? ''}
          </Text>
        </View>
      )}

      {incidencia.habitacion && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Habitación</Text>
          <Text style={styles.valor}>{incidencia.habitacion.nombre}</Text>
        </View>
      )}

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>Fecha</Text>
        <Text style={styles.valor}>{formatearFecha(incidencia.fecha_creacion)}</Text>
      </View>

      {puedeEditar && !editando && (
        <View style={styles.accionFila}>
          <Pressable style={styles.botonEditar} onPress={() => setEditando(true)}>
            <Text style={styles.botonTextoClaro}>Editar</Text>
          </Pressable>
          <Pressable style={styles.botonEliminar} onPress={handleEliminar}>
            <Text style={styles.botonTextoClaro}>Eliminar</Text>
          </Pressable>
        </View>
      )}

      {editando && (
        <View style={styles.accionFila}>
          <Pressable
            style={styles.botonCancelar}
            onPress={() => {
              setTitulo(incidencia.titulo);
              setDescripcion(incidencia.descripcion);
              setEditando(false);
            }}
          >
            <Text style={styles.botonTextoOscuro}>Cancelar</Text>
          </Pressable>
          <Pressable style={styles.botonGuardar} onPress={handleGuardar} disabled={guardando}>
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
