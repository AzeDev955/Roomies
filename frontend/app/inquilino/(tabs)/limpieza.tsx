import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/inquilino/limpieza.styles';

// ── Helpers UI ────────────────────────────────────────────────────────────────

const ETIQUETA_ESFUERZO: Record<number, string> = { 3: 'Ligera', 6: 'Normal', 10: 'Intensa' };
const etiquetaEsfuerzo = (peso: number) =>
  ETIQUETA_ESFUERZO[peso] ?? `Peso ${peso}`;

const ZONA_ICONS: Record<string, string> = {
  cocina: 'restaurant-outline',
  'baño': 'water-outline', 'baño 1': 'water-outline', 'baño 2': 'water-outline',
  'salón': 'tv-outline', salon: 'tv-outline',
  pasillo: 'footsteps-outline',
};
const zonaIcon = (nombre: string) =>
  (ZONA_ICONS[nombre.toLowerCase()] ?? 'sparkles-outline') as any;

const AvatarInitials = ({
  nombre,
  apellidos,
  size = 44,
}: {
  nombre: string;
  apellidos: string | null;
  size?: number;
}) => {
  const initials = `${nombre[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: Theme.colors.primary + '22',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: Theme.colors.primary }}>
        {initials}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

type Turno = {
  id: number;
  usuario_id: number;
  zona_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'PENDIENTE' | 'HECHO' | 'NO_HECHO';
  zona: { id: number; nombre: string; peso: number };
  usuario: { id: number; nombre: string; apellidos: string | null };
};

// ─────────────────────────────────────────────────────────────────────────────

export default function LimpiezaInquilinoTab() {
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miUsuarioId, setMiUsuarioId] = useState<number | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState<number | null>(null);
  const [moduloDesactivado, setModuloDesactivado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarDatos = async () => {
        setLoading(true);
        setModuloDesactivado(false);
        try {
          const { data: viviendaData } = await api.get<{ miHabitacionId: number; vivienda: any }>(
            '/inquilino/vivienda'
          );
          const miHab = viviendaData.vivienda.habitaciones.find(
            (h: any) => h.id === viviendaData.miHabitacionId
          );
          const vId = viviendaData.vivienda.id;
          const uId = miHab?.inquilino?.id ?? 0;
          if (!activo) return;
          setViviendaId(vId);
          setMiUsuarioId(uId);

          const { data: turnosData } = await api.get<Turno[]>(`/viviendas/${vId}/limpieza/turnos`);
          if (activo) {
            setTurnos(turnosData);
            setModuloDesactivado(false);
          }
        } catch (err: any) {
          const mensaje = err.response?.data?.error as string | undefined;
          if (activo && err.response?.status === 403 && mensaje?.toLowerCase().includes('desactivado')) {
            setTurnos([]);
            setModuloDesactivado(true);
          } else if (activo) {
            setViviendaId(null);
            setMiUsuarioId(null);
            setTurnos([]);
            setModuloDesactivado(false);
          }
        } finally {
          if (activo) setLoading(false);
        }
      };

      cargarDatos();
      return () => { activo = false; };
    }, [])
  );

  const handleMarcarHecho = async (turnoId: number) => {
    if (!viviendaId) return;
    setMarcando(turnoId);
    try {
      const { data } = await api.patch<Turno>(
        `/viviendas/${viviendaId}/limpieza/turnos/${turnoId}/hecho`
      );
      setTurnos((prev) => prev.map((t) => (t.id === turnoId ? data : t)));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo actualizar el turno.',
      });
    } finally {
      setMarcando(null);
    }
  };

  const getSemanaLabel = () => {
    const hoy = new Date();
    const offset = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - offset);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${fmt(lunes)} — ${fmt(domingo)}`;
  };

  // ── Loading / sin vivienda ────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  if (moduloDesactivado) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="lock-closed-outline" size={40} color={Theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Limpieza desactivada</Text>
          <Text style={styles.emptyText}>
            El casero ha desactivado este modulo para la vivienda. Cuando vuelva a estar activo,
            veras aqui tus turnos.
          </Text>
        </View>
      </View>
    );
  }

  if (!viviendaId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Todavía no formas parte de ninguna vivienda.</Text>
        </View>
      </View>
    );
  }

  const misTurnos = turnos.filter((t) => t.usuario_id === miUsuarioId);
  const turnosResto = turnos.filter((t) => t.usuario_id !== miUsuarioId);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Cabecera ── */}
        <View style={styles.header}>
          <Text style={styles.headerSemana}>{getSemanaLabel()}</Text>
          <Text style={styles.headerTitulo}>Mis Tareas</Text>
          <Text style={styles.headerSubtitulo}>Mantén el orden para una mejor convivencia.</Text>
        </View>

        {/* ── Mis turnos ── */}
        {misTurnos.length === 0 ? (
          <View style={styles.miTareaVacia}>
            <Text style={styles.miTareaVaciaTexto}>No tienes tareas asignadas esta semana.</Text>
          </View>
        ) : (
          misTurnos.map((t) => {
            const esPendiente = t.estado === 'PENDIENTE';
            const esHecho = t.estado === 'HECHO';
            return (
              <View key={t.id} style={[styles.miTareaCard, esHecho && styles.miTareaCardHecha]}>
                {/* Zona + icono */}
                <View style={styles.miTareaTop}>
                  <View style={styles.miTareaTexto}>
                    <Text style={styles.miTareaZona}>{t.zona.nombre}</Text>
                    <Text style={styles.miTareaEsfuerzo}>
                      ESFUERZO: {etiquetaEsfuerzo(t.zona.peso).toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.miTareaIconBox, esHecho && styles.miTareaIconBoxHecha]}>
                    <Ionicons
                      name={zonaIcon(t.zona.nombre)}
                      size={22}
                      color={esHecho ? Theme.colors.successText : Theme.colors.primary}
                    />
                  </View>
                </View>

                {/* Botón o badge hecho */}
                {esPendiente ? (
                  <Pressable
                    style={({ pressed }) => [styles.botonHecho, pressed && styles.botonHechoPressed]}
                    onPress={() => handleMarcarHecho(t.id)}
                    disabled={marcando === t.id}
                  >
                    {marcando === t.id ? (
                      <ActivityIndicator color={Theme.colors.surface} size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color={Theme.colors.surface} />
                        <Text style={styles.botonHechoTexto}>Marcar como Hecho</Text>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View style={styles.badgeHecho}>
                    <Ionicons name="checkmark-circle" size={15} color={Theme.colors.successText} />
                    <Text style={styles.badgeHechoTexto}>Completado</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* ── Turnos de la casa ── */}
        {turnosResto.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Turnos de la casa</Text>
            {turnosResto.map((t) => {
              const esPendiente = t.estado === 'PENDIENTE';
              return (
                <View key={t.id} style={styles.companeroRow}>
                  <AvatarInitials nombre={t.usuario.nombre} apellidos={t.usuario.apellidos} />
                  <View style={styles.companeroInfo}>
                    <View style={styles.companeroTurnoTop}>
                      <Text style={styles.companeroZonaNombre}>{t.zona.nombre}</Text>
                      <Text style={esPendiente ? styles.companeroEstadoPendiente : styles.companeroEstadoHecho}>
                        {esPendiente ? 'PENDIENTE' : 'HECHO'}
                      </Text>
                    </View>
                    <Text style={styles.companeroAsignado}>
                      ASIGNADO A {t.usuario.nombre.toUpperCase()}
                    </Text>
                  </View>
                  <Ionicons name={zonaIcon(t.zona.nombre)} size={18} color={Theme.colors.textTertiary} />
                </View>
              );
            })}
          </>
        )}

        {/* Sin ningún turno */}
        {turnos.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={{ width: 80, height: 80, borderRadius: Theme.radius.xl, backgroundColor: Theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: Theme.spacing.sm }}>
              <Ionicons name="sparkles-outline" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={{ fontSize: Theme.typography.title, fontWeight: '800', color: Theme.colors.text, textAlign: 'center', letterSpacing: -0.3 }}>
              Sin tareas esta semana
            </Text>
            <Text style={styles.emptyText}>
              Tu casero todavía no ha generado los turnos de limpieza. Vuelve más tarde.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
