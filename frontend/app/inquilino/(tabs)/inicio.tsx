import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { CustomButton } from '@/components/common/CustomButton';
import { Card } from '@/components/common/Card';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_ESTADO, ETIQUETAS_TIPO } from '@/styles/inquilino/inicio.styles';

// ── Helpers UI ────────────────────────────────────────────────────────────────

const ZONA_ICONS: Record<string, any> = {
  BANO:    'water-outline',
  COCINA:  'restaurant-outline',
  SALON:   'tv-outline',
  OTRO:    'grid-outline',
};

const ESTADO_BADGE_BG: Record<string, string> = {
  PENDIENTE:  '#FF950018',
  EN_PROCESO: Theme.colors.primary + '18',
  RESUELTA:   Theme.colors.success + '18',
};

const ESTADO_BADGE_COLOR: Record<string, string> = {
  PENDIENTE:  '#FF9500',
  EN_PROCESO: Theme.colors.primary,
  RESUELTA:   Theme.colors.success,
};

const AvatarInitials = ({
  nombre,
  apellidos,
  size = 56,
}: {
  nombre: string;
  apellidos: string | null;
  size?: number;
}) => {
  const initials = `${nombre[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: Theme.colors.surface,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    }}>
      <Text style={{ fontSize: size * 0.3, fontWeight: '600', color: Theme.colors.text }}>
        {initials}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

export default function InquilinoInicioScreen() {
  const router = useRouter();
  const [tieneCasa, setTieneCasa] = useState(false);
  const [sufijo, setSufijo] = useState('');
  const [loading, setLoading] = useState(false);
  const [datosCasa, setDatosCasa] = useState<DatosCasa | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [companeroModal, setCompaneroModal] = useState<InquilinoResumen | null>(null);

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
      Toast.show({ type: 'error', text1: mensaje });
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
              Toast.show({ type: 'error', text1: mensaje });
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
      Toast.show({ type: 'error', text1: mensaje });
    }
  };

  const formatearFechaCorta = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  // ── Onboarding (sin casa) ─────────────────────────────────────────────────

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

  // ── Datos derivados ───────────────────────────────────────────────────────

  const companeros = (datosCasa?.habitaciones ?? []).filter(
    (h) => h.tipo === 'DORMITORIO' && h.inquilino !== null && h.id !== datosCasa?.miHabitacionId
  );
  const zonasComunes = (datosCasa?.habitaciones ?? []).filter((h) => h.tipo !== 'DORMITORIO');
  const activas = incidencias.filter((i) => i.estado !== 'RESUELTA');
  const historial = incidencias.filter((i) => i.estado === 'RESUELTA');

  const miNombre = (datosCasa?.habitaciones ?? [])
    .find((h) => h.id === datosCasa?.miHabitacionId)?.inquilino?.nombre ?? '';

  const irAReportarIncidencia = () =>
    router.push({
      pathname: '/inquilino/nueva-incidencia',
      params: {
        viviendaId: datosCasa?.viviendaId,
        miHabitacionId: datosCasa?.miHabitacionId,
        habitacionesJson: JSON.stringify(datosCasa?.habitaciones ?? []),
      },
    });

  const renderIncidencia = (item: Incidencia) => {
    const puedeGestionar = item.creador_id === datosCasa?.miUsuarioId;
    const esPropia = item.creador_id === datosCasa?.miUsuarioId;

    return (
      <Pressable
        key={item.id}
        style={({ pressed }) => [styles.incidenciaCard, pressed && { opacity: 0.9 }]}
        onPress={() => router.push(`/incidencia/${item.id}?puedeGestionar=${puedeGestionar}`)}
      >
        <View style={styles.incidenciaHeader}>
          <View style={{ flex: 1, marginRight: Theme.spacing.sm }}>
            <Text style={styles.incidenciaTitulo}>{item.titulo}</Text>
            <Text style={styles.incidenciaReporter}>
              {esPropia ? 'Tú' : 'Compañero'} · {formatearFechaCorta(item.fecha_creacion)}
            </Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: ESTADO_BADGE_BG[item.estado] }]}>
            <Text style={[styles.estadoBadgeTexto, { color: ESTADO_BADGE_COLOR[item.estado] }]}>
              {item.estado === 'EN_PROCESO' ? 'EN CURSO' : item.estado}
            </Text>
          </View>
        </View>

        <Text style={styles.incidenciaDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>

        {tienePermisoEditar(item) && (
          <View style={styles.estadoSelector}>
            {ESTADOS.map((e) => (
              <Pressable
                key={e}
                style={[styles.estadoPill, item.estado === e && styles.estadoPillActivo]}
                onPress={(ev) => { ev.stopPropagation?.(); actualizarEstado(item.id, e); }}
              >
                <Text style={[styles.estadoPillTexto, item.estado === e && styles.estadoPillTextoActivo]}>
                  {ETIQUETAS_ESTADO[e]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>

        {/* ── Saludo ── */}
        <View style={styles.greeting}>
          {miNombre ? (
            <Text style={styles.greetingHola}>¡Hola, {miNombre}!</Text>
          ) : null}
          <Text style={styles.greetingSubtitulo}>
            {datosCasa?.nombreVivienda ?? ''} · {datosCasa?.nombreHabitacion ?? ''}
          </Text>
        </View>

        {/* ── Compañeros ── */}
        {companeros.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionLabel}>Mis Compañeros</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.companerosRow}
            >
              {companeros.map((h) => (
                <Pressable
                  key={h.id}
                  style={({ pressed }) => [styles.companeroItem, pressed && { opacity: 0.75 }]}
                  onPress={() => setCompaneroModal(h.inquilino!)}
                >
                  <AvatarInitials nombre={h.inquilino!.nombre} apellidos={h.inquilino!.apellidos} />
                  <Text style={styles.companeroNombreCorto} numberOfLines={1}>
                    {h.inquilino!.nombre}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Zonas comunes ── */}
        {zonasComunes.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionLabel}>Zonas Comunes</Text>
            {zonasComunes.map((h) => (
              <View key={h.id} style={styles.zonaRow}>
                <View style={styles.zonaIconBox}>
                  <Ionicons
                    name={ZONA_ICONS[h.tipo] ?? 'grid-outline'}
                    size={18}
                    color={Theme.colors.primary}
                  />
                </View>
                <Text style={styles.zonaRowNombre}>{h.nombre}</Text>
                <Ionicons name="chevron-forward" size={18} color={Theme.colors.textTertiary} />
              </View>
            ))}
          </View>
        )}

        {/* ── Incidencias ── */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>Incidencias Recientes</Text>

          {loadingIncidencias ? (
            <ActivityIndicator color={Theme.colors.primary} style={styles.loaderIncidencias} />
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
                    {mostrarHistorial ? 'Ocultar historial' : `Ver historial (${historial.length})`}
                  </Text>
                </Pressable>
              )}
              {mostrarHistorial && historial.map((item) => renderIncidencia(item))}
            </>
          )}

          {/* Reportar problema */}
          <Pressable
            style={({ pressed }) => [styles.botonReportar, pressed && { opacity: 0.7 }]}
            onPress={irAReportarIncidencia}
          >
            <Ionicons name="warning-outline" size={16} color={Theme.colors.textMedium} />
            <Text style={styles.botonReportarTexto}>Reportar problema</Text>
          </Pressable>
        </View>

        {/* ── Abandonar vivienda ── */}
        <CustomButton
          label="Abandonar Vivienda"
          variant="danger"
          onPress={abandonarVivienda}
          style={styles.botonAbandonar}
        />

      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={irAReportarIncidencia}
      >
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>

      {/* ── Modal compañero ── */}
      <Modal
        visible={!!companeroModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCompaneroModal(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCompaneroModal(null)}>
          <Pressable style={styles.modalCardWrapper} onPress={() => {}}>
            <Card>
              {companeroModal && (
                <View style={styles.modalContenido}>
                  <AvatarInitials
                    nombre={companeroModal.nombre}
                    apellidos={companeroModal.apellidos}
                    size={72}
                  />
                  <Text style={styles.modalNombre}>
                    {companeroModal.nombre}{companeroModal.apellidos ? ` ${companeroModal.apellidos}` : ''}
                  </Text>
                  <CustomButton
                    label="Cerrar"
                    variant="outline"
                    onPress={() => setCompaneroModal(null)}
                    style={{ marginTop: 8 }}
                  />
                </View>
              )}
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
