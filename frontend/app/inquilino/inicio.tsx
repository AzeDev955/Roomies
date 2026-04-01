import { View, Text, TextInput, FlatList, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_ESTADO, ETIQUETAS_TIPO } from '@/styles/inquilino/inicio.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: Estado;
  fecha_creacion: string;
  creador_id: number;
  habitacion_id: number | null;
};

type InquilinoResumen = {
  id: number;
  nombre: string;
  apellidos: string | null;
};

type HabitacionResumen = {
  id: number;
  nombre: string;
  tipo: string;
  inquilino: InquilinoResumen | null;
};

type DatosCasa = {
  nombreVivienda: string;
  nombreHabitacion: string;
  viviendaId: number;
  miHabitacionId: number;
  miUsuarioId: number;
  habitaciones: HabitacionResumen[];
};

export default function InquilinoInicioScreen() {
  const router = useRouter();
  const [tieneCasa, setTieneCasa] = useState(false);
  const [sufijo, setSufijo] = useState('');
  const [loading, setLoading] = useState(false);
  const [datosCasa, setDatosCasa] = useState<DatosCasa | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const cargarVivienda = async () => {
    try {
      const { data } = await api.get<{ miHabitacionId: number; vivienda: any }>('/inquilino/vivienda');
      const miHab = data.vivienda.habitaciones.find((h: HabitacionResumen) => h.id === data.miHabitacionId);
      setDatosCasa({
        nombreVivienda: data.vivienda.alias_nombre,
        nombreHabitacion: miHab?.nombre ?? 'Mi habitación',
        viviendaId: data.vivienda.id,
        miHabitacionId: data.miHabitacionId,
        miUsuarioId: miHab?.inquilino?.id ?? 0,
        habitaciones: data.vivienda.habitaciones,
      });
      setTieneCasa(true);
    } catch {
      // Sin habitación asignada — se queda en onboarding
    }
  };

  const cargarIncidencias = async () => {
    setLoadingIncidencias(true);
    try {
      const { data } = await api.get<Incidencia[]>('/incidencias');
      setIncidencias(data);
    } catch {
      // Si no hay habitación asignada el backend ya devuelve []
    } finally {
      setLoadingIncidencias(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (tieneCasa) {
        cargarIncidencias();
      } else {
        cargarVivienda();
      }
    }, [tieneCasa])
  );

  const handleCanjearCodigo = async () => {
    setLoading(true);
    try {
      await api.post('/inquilino/unirse', {
        codigo_invitacion: `ROOM-${sufijo}`,
      });
      await cargarVivienda();
      cargarIncidencias();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo canjear el código. Inténtalo de nuevo.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  const abandonarVivienda = () => {
    Alert.alert(
      'Abandonar Vivienda',
      '¿Estás seguro de que quieres abandonar esta vivienda? Perderás el acceso a la misma.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/inquilino/habitacion');
              setTieneCasa(false);
              setDatosCasa(null);
              setIncidencias([]);
            } catch (err: any) {
              const mensaje = err.response?.data?.error ?? 'No se pudo abandonar la vivienda.';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  };

  const ESTADOS: Estado[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTA'];

  const tienePermisoEditar = (item: Incidencia): boolean => {
    if (!datosCasa) return false;
    if (item.creador_id === datosCasa.miUsuarioId) return true;
    if (item.habitacion_id !== null && item.habitacion_id === datosCasa.miHabitacionId) return true;
    const hab = datosCasa.habitaciones.find((h) => h.id === item.habitacion_id);
    return hab !== undefined && hab.tipo !== 'DORMITORIO';
  };

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

  const renderIncidencia = (item: Incidencia) => {
    const puedeGestionar = item.creador_id === datosCasa?.miUsuarioId;
    return (
      <Pressable
        key={item.id}
        style={styles.card}
        onPress={() => router.push(`/incidencia/${item.id}?puedeGestionar=${puedeGestionar}`)}
      >
        <View style={[styles.indicador, { backgroundColor: COLORES_PRIORIDAD[item.prioridad] }]} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitulo}>{item.titulo}</Text>
          <Text style={styles.cardDescripcion} numberOfLines={2}>{item.descripcion}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFecha}>{formatearFecha(item.fecha_creacion)}</Text>
          </View>
          {tienePermisoEditar(item) ? (
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
          ) : (
            <Text style={styles.estadoSoloLectura}>{ETIQUETAS_ESTADO[item.estado]}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  if (!tieneCasa) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.onboardingTitle}>Únete a tu nuevo hogar</Text>
        <Text style={styles.onboardingSubtitle}>
          Introduce el código de invitación que te ha proporcionado tu casero para acceder a tu habitación.
        </Text>
        <View style={styles.inputFila}>
          <Text style={styles.inputPrefijo}>ROOM-</Text>
          <TextInput
            style={styles.inputSufijo}
            value={sufijo}
            onChangeText={(text) => setSufijo(text.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor="#c7c7cc"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
        </View>
        <Pressable
          style={[styles.botonCanjear, (!sufijo.trim() || loading) && styles.botonCanjearDisabled]}
          onPress={handleCanjearCodigo}
          disabled={!sufijo.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonCanjearTexto}>Canjear Código</Text>
          )}
        </Pressable>
      </View>
    );
  }

  const companeros = (datosCasa?.habitaciones ?? []).filter(
    (h) => h.tipo === 'DORMITORIO' && h.inquilino !== null && h.id !== datosCasa?.miHabitacionId
  );
  const zonasComunes = (datosCasa?.habitaciones ?? []).filter((h) => h.tipo !== 'DORMITORIO');
  const activas = incidencias.filter((i) => i.estado !== 'RESUELTA');
  const historial = incidencias.filter((i) => i.estado === 'RESUELTA');

  return (
    <View style={styles.dashboardContainer}>
      <Pressable style={styles.iconoPerfil} onPress={() => router.push('/perfil')}>
        <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
      </Pressable>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.bienvenida}>{datosCasa?.nombreVivienda ?? 'Mi vivienda'}</Text>
        <Text style={styles.subtituloDashboard}>{datosCasa?.nombreHabitacion ?? 'Mi habitación'}</Text>

        {companeros.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Compañeros de piso</Text>
            {companeros.map((h) => (
              <View key={h.id} style={styles.companeroCard}>
                <Text style={styles.companeroNombre}>
                  {h.inquilino!.nombre} {h.inquilino!.apellidos ?? ''}
                </Text>
                <Text style={styles.companeroHabitacion}>{h.nombre}</Text>
              </View>
            ))}
          </>
        )}

        {zonasComunes.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Zonas comunes</Text>
            <View style={styles.zonasFilas}>
              {zonasComunes.map((h) => (
                <View key={h.id} style={styles.zonaCard}>
                  <Text style={styles.zonaNombre}>{h.nombre}</Text>
                  <Text style={styles.zonaTipo}>{ETIQUETAS_TIPO[h.tipo] ?? h.tipo}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.seccionTitulo}>Incidencias</Text>

        {loadingIncidencias ? (
          <ActivityIndicator color="#007AFF" style={styles.loaderIncidencias} />
        ) : (
          <>
            {activas.length === 0 && (
              <Text style={styles.emptyText}>No hay incidencias activas.</Text>
            )}
            {activas.map((item) => renderIncidencia(item))}

            {historial.length > 0 && (
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
            )}
            {mostrarHistorial && historial.map((item) => renderIncidencia(item))}
          </>
        )}

        <Pressable style={styles.botonAbandonar} onPress={abandonarVivienda}>
          <Text style={styles.botonAbandonarTexto}>Abandonar Vivienda</Text>
        </Pressable>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/inquilino/nueva-incidencia',
            params: {
              viviendaId: datosCasa?.viviendaId,
              miHabitacionId: datosCasa?.miHabitacionId,
              habitacionesJson: JSON.stringify(datosCasa?.habitaciones ?? []),
            },
          })
        }
      >
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>
    </View>
  );
}
