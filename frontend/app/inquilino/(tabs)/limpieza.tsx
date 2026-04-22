import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import type { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { createStyles } from '@/styles/inquilino/limpieza.styles';

const ETIQUETA_ESFUERZO: Record<number, string> = { 3: 'Ligera', 6: 'Normal', 10: 'Intensa' };
const etiquetaEsfuerzo = (peso: number) => ETIQUETA_ESFUERZO[peso] ?? `Peso ${peso}`;

const ZONA_ICONS: Record<string, string> = {
  cocina: 'restaurant-outline',
  baño: 'water-outline',
  'baño 1': 'water-outline',
  'baño 2': 'water-outline',
  salón: 'tv-outline',
  salon: 'tv-outline',
  pasillo: 'footsteps-outline',
};

const zonaIcon = (nombre: string) => (ZONA_ICONS[nombre.toLowerCase()] ?? 'sparkles-outline') as any;

const AvatarInitials = ({
  nombre,
  apellidos,
  theme,
  size = 44,
}: {
  nombre: string;
  apellidos: string | null;
  theme: AppTheme;
  size?: number;
}) => {
  const initials = `${nombre[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: theme.colors.primary }}>{initials}</Text>
    </View>
  );
};

type Habitacion = {
  id: number;
  nombre: string;
  tipo: 'DORMITORIO' | 'BANO' | 'COCINA' | 'SALON' | 'OTRO';
  es_habitable: boolean;
  inquilino: { id: number; nombre: string; apellidos: string | null } | null;
};

type Turno = {
  id: number;
  usuario_id: number | null;
  habitacion_id: number;
  zona_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'PENDIENTE' | 'HECHO' | 'NO_HECHO';
  tipo_espacio: 'HABITACION' | 'ZONA_COMUN' | 'ESPACIO';
  zona: { id: number; nombre: string; peso: number; habitacion: Habitacion | null };
  habitacion: Habitacion;
  responsable_actual: { id: number; nombre: string; apellidos: string | null } | null;
};

const getTipoEspacioLabel = (tipo: Turno['tipo_espacio']) => {
  if (tipo === 'HABITACION') return 'Habitación';
  if (tipo === 'ZONA_COMUN') return 'Zona común';
  return 'Espacio';
};

export default function LimpiezaInquilinoTab() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miHabitacionId, setMiHabitacionId] = useState<number | null>(null);
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
          const { data: viviendaData } = await api.get<{ miHabitacionId: number; vivienda: { id: number } }>(
            '/inquilino/vivienda',
          );
          const vId = viviendaData.vivienda.id;
          if (!activo) return;
          setViviendaId(vId);
          setMiHabitacionId(viviendaData.miHabitacionId);

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
            setMiHabitacionId(null);
            setTurnos([]);
            setModuloDesactivado(false);
          }
        } finally {
          if (activo) setLoading(false);
        }
      };

      cargarDatos();
      return () => {
        activo = false;
      };
    }, []),
  );

  const handleMarcarHecho = async (turnoId: number) => {
    if (!viviendaId) return;
    setMarcando(turnoId);
    try {
      const { data } = await api.patch<Turno>(`/viviendas/${viviendaId}/limpieza/turnos/${turnoId}/hecho`);
      setTurnos((prev) => prev.map((turno) => (turno.id === turnoId ? data : turno)));
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

  if (loading) {
    return <ActivityIndicator style={styles.loading} size="large" color={theme.colors.primary} />;
  }

  if (moduloDesactivado) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="lock-closed-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Limpieza desactivada</Text>
          <Text style={styles.emptyText}>
            El casero ha desactivado este módulo para la vivienda. Cuando vuelva a estar activo, verás aquí tus tareas.
          </Text>
        </View>
      </View>
    );
  }

  if (!viviendaId || !miHabitacionId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Todavía no formas parte de ninguna vivienda.</Text>
        </View>
      </View>
    );
  }

  const misTurnos = turnos.filter((turno) => turno.habitacion_id === miHabitacionId);
  const turnosRelacionados = turnos.filter((turno) => turno.habitacion_id !== miHabitacionId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerSemana}>{getSemanaLabel()}</Text>
          <Text style={styles.headerTitulo}>Mis Tareas</Text>
          <Text style={styles.headerSubtitulo}>Las tareas se organizan por habitación y zonas comunes de la vivienda.</Text>
        </View>

        {misTurnos.length === 0 ? (
          <View style={styles.miTareaVacia}>
            <Text style={styles.miTareaVaciaTexto}>Tu habitación no tiene tareas asignadas esta semana.</Text>
          </View>
        ) : (
          misTurnos.map((turno) => {
            const esPendiente = turno.estado === 'PENDIENTE';
            const esHecho = turno.estado === 'HECHO';
            return (
              <View key={turno.id} style={[styles.miTareaCard, esHecho && styles.miTareaCardHecha]}>
                <View style={styles.miTareaTop}>
                  <View style={styles.miTareaTexto}>
                    <Text style={styles.miTareaZona}>{turno.zona.nombre}</Text>
                    <Text style={styles.miTareaEsfuerzo}>ESFUERZO: {etiquetaEsfuerzo(turno.zona.peso).toUpperCase()}</Text>
                    <Text style={[styles.companeroAsignado, { marginTop: theme.spacing.xs }]}>
                      {getTipoEspacioLabel(turno.tipo_espacio).toUpperCase()}
                    </Text>
                  </View>
                  <View style={[styles.miTareaIconBox, esHecho && styles.miTareaIconBoxHecha]}>
                    <Ionicons
                      name={zonaIcon(turno.zona.nombre)}
                      size={22}
                      color={esHecho ? theme.colors.successText : theme.colors.primary}
                    />
                  </View>
                </View>

                {esPendiente ? (
                  <Pressable
                    style={({ pressed }) => [styles.botonHecho, pressed && styles.botonHechoPressed]}
                    onPress={() => handleMarcarHecho(turno.id)}
                    disabled={marcando === turno.id}
                  >
                    {marcando === turno.id ? (
                      <ActivityIndicator color={theme.colors.surface} size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.surface} />
                        <Text style={styles.botonHechoTexto}>Marcar como Hecho</Text>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <View style={styles.badgeHecho}>
                    <Ionicons name="checkmark-circle" size={15} color={theme.colors.successText} />
                    <Text style={styles.badgeHechoTexto}>Completado</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {turnosRelacionados.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Tareas relacionadas</Text>
            {turnosRelacionados.map((turno) => {
              const esPendiente = turno.estado === 'PENDIENTE';
              const nombreResponsable =
                turno.responsable_actual?.nombre ?? turno.habitacion.nombre;
              const apellidosResponsable = turno.responsable_actual?.apellidos ?? null;
              return (
                <View key={turno.id} style={styles.companeroRow}>
                  <AvatarInitials nombre={nombreResponsable} apellidos={apellidosResponsable} theme={theme} />
                  <View style={styles.companeroInfo}>
                    <View style={styles.companeroTurnoTop}>
                      <Text style={styles.companeroZonaNombre}>{turno.zona.nombre}</Text>
                      <Text style={esPendiente ? styles.companeroEstadoPendiente : styles.companeroEstadoHecho}>
                        {esPendiente ? 'PENDIENTE' : 'HECHO'}
                      </Text>
                    </View>
                    <Text style={styles.companeroAsignado}>
                      RESPONSABLE: {nombreResponsable.toUpperCase()}
                    </Text>
                    <Text style={[styles.companeroAsignado, { marginTop: 2 }]}>
                      {getTipoEspacioLabel(turno.tipo_espacio).toUpperCase()}
                    </Text>
                  </View>
                  <Ionicons name={zonaIcon(turno.zona.nombre)} size={18} color={theme.colors.textTertiary} />
                </View>
              );
            })}
          </>
        )}

        {turnos.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBoxLarge}>
              <Ionicons name="sparkles-outline" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitleLarge}>Sin tareas esta semana</Text>
            <Text style={styles.emptyText}>
              Tu casero todavía no ha generado los turnos de limpieza. Vuelve más tarde.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
