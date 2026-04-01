import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Share } from 'react-native';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Clipboard from 'expo-clipboard';
import api from '@/services/api';
import { styles } from '@/styles/casero/vivienda/detalle.styles';
import { COLORES_PRIORIDAD } from '@/styles/casero/vivienda/incidencias.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

type Inquilino = {
  id: number;
  nombre: string;
  apellidos: string | null;
  email: string;
};

type IncidenciaResumen = {
  id: number;
  titulo: string;
  prioridad: Prioridad;
  estado: Estado;
};

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  metros_cuadrados: number | null;
  codigo_invitacion: string | null;
  inquilino: Inquilino | null;
  incidencias: IncidenciaResumen[];
};

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

const ETIQUETAS_TIPO: Record<string, string> = {
  DORMITORIO: 'Dormitorio',
  BANO: 'Baño',
  COCINA: 'Cocina',
  SALON: 'Salón',
  OTRO: 'Otro',
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

  const copiarCodigo = async (codigo: string) => {
    const codigoLimpio = codigo.replace(/^room[-\s]*/i, '').trim();
    await Clipboard.setStringAsync(codigoLimpio);
    Alert.alert('Código copiado', 'Pégalo en la app para unirte a la habitación.');
  };

  const compartirCodigo = async (codigo: string) => {
    await Share.share({
      message: `¡Únete a tu nueva habitación en Roomies! Tu código de invitación es: ${codigo}`,
    });
  };

  const handleEliminarHabitacion = (hab: Habitacion) => {
    Alert.alert(
      'Eliminar habitación',
      `¿Eliminar "${hab.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/viviendas/${id}/habitaciones/${hab.id}`);
              cargarVivienda();
            } catch (err: any) {
              const mensaje = err.response?.data?.error ?? 'No se pudo eliminar la habitación.';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  };

  const handleExpulsarInquilino = (hab: Habitacion) => {
    Alert.alert(
      '¿Expulsar inquilino?',
      'Esta acción desvinculará al usuario de la habitación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Expulsar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/viviendas/${id}/habitaciones/${hab.id}/inquilino`);
              setVivienda((prev) =>
                prev
                  ? {
                      ...prev,
                      habitaciones: prev.habitaciones.map((h) =>
                        h.id === hab.id ? { ...h, inquilino: null } : h
                      ),
                    }
                  : prev
              );
            } catch (err: any) {
              const mensaje = err.response?.data?.error ?? 'No se pudo expulsar al inquilino.';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  };

  const handleEditarHabitacion = (hab: Habitacion) => {
    router.push({
      pathname: `/casero/vivienda/${id}/editar-habitacion`,
      params: {
        habId: String(hab.id),
        nombre: hab.nombre,
        tipo: hab.tipo,
        esHabitable: String(hab.es_habitable),
        metrosCuadrados: String(hab.metros_cuadrados ?? ''),
      },
    });
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
        <Text style={styles.errorTexto}>Vivienda no encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{vivienda.alias_nombre}</Text>
        <Text style={styles.address}>{vivienda.direccion}</Text>

        <Pressable onPress={() => router.push(`/casero/vivienda/${id}/incidencias`)}>
          <Text style={styles.enlaceIncidencias}>Ver todas las incidencias →</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/tablon/${id}?esCasero=true`)}>
          <Text style={styles.enlaceIncidencias}>Tablón de anuncios →</Text>
        </Pressable>

        {[...vivienda.habitaciones]
          .sort((a, b) => Number(b.es_habitable) - Number(a.es_habitable) || a.id - b.id)
          .map((habitacion) => (
          <View key={habitacion.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{habitacion.nombre}</Text>
              <Text style={styles.cardTipo}>{ETIQUETAS_TIPO[habitacion.tipo] ?? habitacion.tipo}</Text>
            </View>

            {habitacion.tipo === 'DORMITORIO' && (
              <>
                {habitacion.inquilino ? (
                  <View style={styles.inquilinoInfo}>
                    <View style={styles.inquilinoTextos}>
                      <Text style={styles.inquilinoNombre}>
                        {habitacion.inquilino.nombre} {habitacion.inquilino.apellidos ?? ''}
                      </Text>
                      <Text style={styles.inquilinoEmail}>{habitacion.inquilino.email}</Text>
                    </View>
                    <Pressable
                      style={styles.botonExpulsar}
                      onPress={() => handleExpulsarInquilino(habitacion)}
                    >
                      <Text style={styles.botonExpulsarTexto}>Expulsar</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.sinInquilino}>Sin inquilino</Text>
                )}

                {habitacion.es_habitable && habitacion.codigo_invitacion ? (
                  <View style={styles.codigoContainer}>
                    <Text style={styles.codigoLabel}>Código de invitación</Text>
                    {codigosRevelados[habitacion.id] ? (
                      <View style={styles.codigoReveladoFila}>
                        <Pressable
                          style={styles.codigoReveladoTextoArea}
                          onLongPress={() => copiarCodigo(habitacion.codigo_invitacion!)}
                        >
                          <Text style={styles.codigo}>{habitacion.codigo_invitacion}</Text>
                          <Text style={styles.codigoHint}>Mantén pulsado para copiar</Text>
                        </Pressable>
                        <Pressable
                          style={styles.compartirBoton}
                          onPress={() => compartirCodigo(habitacion.codigo_invitacion!)}
                        >
                          <Text style={styles.compartirBotonTexto}>Compartir</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable onPress={() => revelarCodigo(habitacion.id)}>
                        <Text style={styles.codigoOculto}>••••••••</Text>
                        <Text style={styles.revelarTexto}>Toca para revelar</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </>
            )}

            {habitacion.incidencias.length > 0 && (
              <View style={styles.incidenciasHabitacion}>
                {habitacion.incidencias.map((inc) => (
                  <Pressable
                    key={inc.id}
                    style={styles.incidenciaFila}
                    onPress={() => router.push(`/incidencia/${inc.id}?puedeGestionar=true`)}
                  >
                    <View style={[styles.incidenciaDot, { backgroundColor: COLORES_PRIORIDAD[inc.prioridad] }]} />
                    <Text style={styles.incidenciaTitulo} numberOfLines={1}>{inc.titulo}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.accionFila}>
              <Pressable style={styles.botonEditar} onPress={() => handleEditarHabitacion(habitacion)}>
                <Text style={styles.botonAccionTexto}>Editar</Text>
              </Pressable>
              <Pressable style={styles.botonEliminar} onPress={() => handleEliminarHabitacion(habitacion)}>
                <Text style={styles.botonAccionTexto}>Eliminar</Text>
              </Pressable>
            </View>
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
