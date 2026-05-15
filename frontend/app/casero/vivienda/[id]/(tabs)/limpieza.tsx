import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import Toast from 'react-native-toast-message';
import type { AppTheme } from '@/constants/theme';
import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { createStyles } from '@/styles/casero/vivienda/limpieza.styles';
import { useViviendaIdParam } from '@/hooks/useViviendaIdParam';
import { useAppTheme } from '@/contexts/ThemeContext';

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
  size = 48,
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
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: theme.colors.primary }}>{initials}</Text>
    </View>
  );
};

const TALLAS = [
  { label: 'Ligera', peso: 3 },
  { label: 'Normal', peso: 6 },
  { label: 'Intensa', peso: 10 },
] as const;

const ETIQUETA_ESFUERZO: Record<number, string> = { 3: 'Ligera', 6: 'Normal', 10: 'Intensa' };
const QUICK_CHIPS = ['Cocina', 'Baño', 'Salón', 'Pasillo'];
const ZONAS_BASE = [
  { nombre: 'Cocina', peso: 10 },
  { nombre: 'Salón', peso: 6 },
  { nombre: 'Baño', peso: 6 },
];

const etiquetaEsfuerzo = (peso: number) =>
  ETIQUETA_ESFUERZO[peso] ? `Esfuerzo: ${ETIQUETA_ESFUERZO[peso]}` : `Peso: ${peso}`;

const formatearFechaParam = (fecha: Date) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type ResponsableActual = {
  id: number;
  nombre: string;
  apellidos: string | null;
} | null;

type Habitacion = {
  id: number;
  nombre: string;
  tipo: 'DORMITORIO' | 'BANO' | 'COCINA' | 'SALON' | 'OTRO';
  es_habitable: boolean;
  inquilino: ResponsableActual;
};

type AsignacionFija = {
  id: number;
  habitacion_id: number;
  habitacion?: Habitacion | null;
  responsable_actual: ResponsableActual;
};

type ZonaLimpieza = {
  id: number;
  nombre: string;
  peso: number;
  activa: boolean;
  tipo_espacio: 'HABITACION' | 'ZONA_COMUN' | 'ESPACIO';
  habitacion: Habitacion | null;
  asignaciones_fijas: AsignacionFija[];
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
  habitacion?: Habitacion | null;
  responsable_actual: ResponsableActual;
};

type ExportLimpiezasResponse = {
  nombreArchivo: string;
  mimeType: string;
  contenidoBase64: string;
};

type EstadoFiltro = 'TODOS' | Turno['estado'];

const FILTROS_ESTADO: { label: string; value: EstadoFiltro }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Hechos', value: 'HECHO' },
];

const getTipoEspacioLabel = (tipo: ZonaLimpieza['tipo_espacio']) => {
  if (tipo === 'HABITACION') return 'Habitación';
  if (tipo === 'ZONA_COMUN') return 'Zona común';
  return 'Espacio';
};

const getResponsableLabel = (responsable: ResponsableActual) =>
  responsable ? `${responsable.nombre}${responsable.apellidos ? ` ${responsable.apellidos}` : ''}` : 'Sin ocupante';

const getNombreHabitacion = (habitacion: Habitacion | null | undefined, fallback = 'Habitacion') =>
  habitacion?.nombre ?? fallback;

export default function LimpiezaCaseroTab() {
  const id = useViviendaIdParam();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [vistaActual, setVistaActual] = useState<'CONFIG' | 'CALENDARIO'>('CONFIG');
  const [zonas, setZonas] = useState<ZonaLimpieza[]>([]);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [creandoBase, setCreandoBase] = useState(false);

  const [modalZonaVisible, setModalZonaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [pesoSeleccionado, setPesoSeleccionado] = useState<number | null>(null);
  const [habitacionObjetivoId, setHabitacionObjetivoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaLimpieza | null>(null);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [asignando, setAsignando] = useState(false);

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('TODOS');
  const [fechaObjetivo, setFechaObjetivo] = useState<Date>(() => {
    const hoy = new Date();
    const offset = (hoy.getDay() + 6) % 7;
    hoy.setDate(hoy.getDate() - offset);
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  });

  const habitacionesResponsables = habitaciones.filter(
    (habitacion) => habitacion.es_habitable && habitacion.tipo === 'DORMITORIO',
  );

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await Promise.all([cargarZonas(), cargarHabitaciones()]);
      setLoading(false);
    };
    inicializar();
  }, [cargarHabitaciones, cargarZonas]);

  useEffect(() => {
    if (vistaActual === 'CALENDARIO') {
      cargarTurnos(fechaObjetivo);
    }
  }, [cargarTurnos, fechaObjetivo, vistaActual]);

  const cargarZonas = useCallback(async () => {
    if (!id) return;

    try {
      const { data } = await api.get<ZonaLimpieza[]>(`/viviendas/${id}/limpieza/zonas`);
      setZonas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los espacios de limpieza.' });
    }
  }, [id]);

  const cargarHabitaciones = useCallback(async () => {
    if (!id) return;

    try {
      const { data } = await api.get<{ habitaciones: Habitacion[] }>(`/viviendas/${id}`);
      setHabitaciones(data.habitaciones);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar las habitaciones.' });
    }
  }, [id]);

  const cargarTurnos = useCallback(async (fecha?: Date) => {
    if (!id) return;

    setLoadingTurnos(true);
    try {
      const base = fecha ?? fechaObjetivo;
      const fechaParam = formatearFechaParam(base);
      const { data } = await api.get<Turno[]>(`/viviendas/${id}/limpieza/turnos?fecha=${fechaParam}`);
      setTurnos(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los turnos.' });
    } finally {
      setLoadingTurnos(false);
    }
  }, [fechaObjetivo, id]);

  const guardarArchivoCsv = async (contenidoBase64: string, nombreArchivo: string, mimeType: string) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const bytes = Uint8Array.from(atob(contenidoBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombreArchivo;
      enlace.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (Platform.OS === 'android') {
      const permisos = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permisos.granted) {
        throw new Error('Selecciona una carpeta para guardar el archivo.');
      }

      const nombreSinExtension = nombreArchivo.replace(/\.csv$/i, '');
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permisos.directoryUri,
        nombreSinExtension,
        mimeType,
      );
      await FileSystem.writeAsStringAsync(uri, contenidoBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return;
    }

    const uri = `${FileSystem.cacheDirectory ?? ''}${nombreArchivo}`;
    await FileSystem.writeAsStringAsync(uri, contenidoBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Share.share({
      title: nombreArchivo,
      url: uri,
    });
  };

  const obtenerMensajeErrorExport = (error: any) => {
    const data = error.response?.data;
    if (typeof data === 'string') {
      try {
        const parseado = JSON.parse(data);
        return parseado.error ?? 'No se pudieron exportar las limpiezas.';
      } catch {
        return 'No se pudieron exportar las limpiezas.';
      }
    }

    return data?.error ?? error.message ?? 'No se pudieron exportar las limpiezas.';
  };

  const exportarTurnos = async () => {
    if (!id) return;

    setExportando(true);
    try {
      const { data } = await api.get<ExportLimpiezasResponse>(`/viviendas/${id}/limpieza/turnos/export`, {
        params: {
          formato: 'base64',
          ...(filtroEstado !== 'TODOS' ? { estado: filtroEstado } : {}),
        },
      });

      await guardarArchivoCsv(data.contenidoBase64, data.nombreArchivo, data.mimeType);
      Toast.show({
        type: 'success',
        text1: 'Calendario exportado',
        text2: Platform.OS === 'android' ? 'Archivo CSV guardado.' : 'El archivo CSV se puede abrir con Excel.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: obtenerMensajeErrorExport(err),
      });
    } finally {
      setExportando(false);
    }
  };

  const navegar = (direccion: -1 | 1) => {
    setFechaObjetivo((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(prev.getDate() + direccion * 7);
      return nueva;
    });
  };

  const cerrarModalZona = () => {
    setModalZonaVisible(false);
    setNombre('');
    setPesoSeleccionado(null);
    setHabitacionObjetivoId(null);
  };

  const handleGuardar = async () => {
    if (!id || pesoSeleccionado === null) return;
    if (!nombre.trim() && !habitacionObjetivoId) return;

    setGuardando(true);
    try {
      const { data } = await api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, {
        nombre: nombre.trim() || undefined,
        peso: pesoSeleccionado,
        habitacion_id: habitacionObjetivoId,
      });
      setZonas((prev) => [...prev, data]);
      cerrarModalZona();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo crear el espacio.' });
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = (nombre.trim().length > 0 || habitacionObjetivoId !== null) && pesoSeleccionado !== null;

  const handleGenerarZonasBasicas = async () => {
    if (!id) return;

    setCreandoBase(true);
    try {
      const resultados = await Promise.all(
        ZONAS_BASE.map((zonaBase) => api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, zonaBase)),
      );
      setZonas((prev) => [...prev, ...resultados.map((resultado) => resultado.data)]);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudieron crear los espacios base.' });
    } finally {
      setCreandoBase(false);
    }
  };

  const abrirModalAsignacion = (zona: ZonaLimpieza) => {
    setZonaSeleccionada(zona);
    setSeleccionados((zona.asignaciones_fijas ?? []).map((asignacion) => asignacion.habitacion_id));
  };

  const cerrarModalAsignacion = () => {
    setZonaSeleccionada(null);
    setSeleccionados([]);
  };

  const toggleSeleccion = (habitacionId: number) => {
    setSeleccionados((prev) =>
      prev.includes(habitacionId) ? prev.filter((idHabitacion) => idHabitacion !== habitacionId) : [...prev, habitacionId],
    );
  };

  const handleGuardarAsignacion = async () => {
    if (!id || !zonaSeleccionada) return;

    setAsignando(true);
    try {
      const { data } = await api.post<AsignacionFija[]>(
        `/viviendas/${id}/limpieza/zonas/${zonaSeleccionada.id}/asignacion`,
        { habitacion_ids: seleccionados },
      );
      setZonas((prev) =>
        prev.map((zona) => (zona.id === zonaSeleccionada.id ? { ...zona, asignaciones_fijas: data } : zona)),
      );
      cerrarModalAsignacion();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo guardar la asignación.' });
    } finally {
      setAsignando(false);
    }
  };

  const handleEliminarZona = (zona: ZonaLimpieza) => {
    Alert.alert(
      'Eliminar espacio',
      `¿Eliminar "${zona.nombre}"? Se borrarán también sus asignaciones y turnos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/viviendas/${id}/limpieza/zonas/${zona.id}`);
              setZonas((prev) => prev.filter((item) => item.id !== zona.id));
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo eliminar el espacio.' });
            }
          },
        },
      ],
    );
  };

  const handleGenerarTurnos = async () => {
    if (!id) return;

    setGenerando(true);
    try {
      await api.post(`/viviendas/${id}/limpieza/generar`);
      Toast.show({
        type: 'success',
        text1: 'Turnos generados',
        text2: 'El reparto ya está vinculado a habitaciones responsables.',
      });
      if (vistaActual === 'CALENDARIO') {
        await cargarTurnos(fechaObjetivo);
      }
    } catch (err: any) {
      Alert.alert('No se pudieron generar los turnos', err.response?.data?.error ?? 'Ha ocurrido un error inesperado.');
    } finally {
      setGenerando(false);
    }
  };

  const getSemanaLabel = (base: Date) => {
    const domingo = new Date(base);
    domingo.setDate(base.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${fmt(base)} — ${fmt(domingo)}`;
  };

  const renderZona = ({ item }: { item: ZonaLimpieza }) => {
    const asignaciones = item.asignaciones_fijas ?? [];
    const etiquetaFijos =
      asignaciones.length > 0
        ? `Responsables fijas: ${asignaciones
            .map((asignacion) => getNombreHabitacion(asignacion.habitacion, `Habitacion ${asignacion.habitacion_id}`))
            .join(', ')}`
        : null;

    return (
      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={styles.cardRow}>
          <Text style={styles.zonaNombre}>{item.nombre}</Text>
          <View style={[styles.badge, item.activa ? styles.badgeActiva : styles.badgeInactiva]}>
            <Text style={[styles.badgeTexto, item.activa ? styles.badgeTextoActiva : styles.badgeTextoInactiva]}>
              {item.activa ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          <Pressable onPress={() => handleEliminarZona(item)} hitSlop={8} style={styles.eliminarIconButton}>
            <Text style={styles.eliminarBtn}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.zonaPeso}>{etiquetaEsfuerzo(item.peso)}</Text>
        <Text style={[styles.zonaPeso, { color: theme.colors.textSecondary, marginTop: theme.spacing.xs }]}>
          {getTipoEspacioLabel(item.tipo_espacio)}
          {item.habitacion ? ` · ${item.habitacion.nombre}` : ' · Espacio personalizado'}
        </Text>
        <View style={styles.asignacionRow}>
          <Pressable onPress={() => abrirModalAsignacion(item)} hitSlop={6}>
            {etiquetaFijos ? (
              <Text style={styles.asignacionFija}>{etiquetaFijos}</Text>
            ) : (
              <Text style={styles.asignarLink}>+ Asignar habitación responsable fija</Text>
            )}
          </Pressable>
        </View>
      </Card>
    );
  };

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="sparkles-outline" size={40} color={theme.colors.success} />
      </View>
      <Text style={styles.emptyTitulo}>Sin espacios todavía</Text>
      <Text style={styles.emptySubtitulo}>
        Crea habitaciones, zonas comunes o espacios personalizados para planificar la limpieza por espacio.
      </Text>
      <CustomButton
        label={creandoBase ? 'Creando...' : 'Generar espacios base'}
        variant="outline"
        onPress={handleGenerarZonasBasicas}
        disabled={creandoBase}
        style={{ marginTop: theme.spacing.md }}
      />
    </View>
  );

  const renderCalendario = () => {
    if (loadingTurnos) {
      return <ActivityIndicator style={{ flex: 1, marginTop: 40 }} size="large" color={theme.colors.primary} />;
    }

    const getHabitacionTurno = (turno: Turno) =>
      turno.habitacion ??
      habitaciones.find((habitacion) => habitacion.id === turno.habitacion_id) ?? {
        id: turno.habitacion_id,
        nombre: `Habitacion ${turno.habitacion_id}`,
        tipo: 'DORMITORIO',
        es_habitable: true,
        inquilino: null,
      };
    const turnosFiltrados = turnos.filter((turno) => (filtroEstado === 'TODOS' ? true : turno.estado === filtroEstado));
    const turnosAgrupados = turnosFiltrados.reduce<Record<number, { habitacion: Habitacion; items: Turno[] }>>((acc, turno) => {
      const habitacionTurno = getHabitacionTurno(turno);
      if (!acc[turno.habitacion_id]) {
        acc[turno.habitacion_id] = { habitacion: habitacionTurno, items: [] };
      }
      acc[turno.habitacion_id].items.push(turno);
      return acc;
    }, {});

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.calendarioHeader}>
          <View>
            <Text style={styles.calendarioGestion}>Gestión</Text>
            <Text style={styles.calendarioTitulo}>Limpieza</Text>
          </View>
          <View style={styles.calendarioActions}>
            <Pressable
              style={({ pressed }) => [styles.calendarioBtnExport, (pressed || exportando) && { opacity: 0.7 }]}
              onPress={exportarTurnos}
              disabled={exportando}
            >
              {exportando ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="download-outline" size={16} color={theme.colors.primary} />
              )}
              <Text style={styles.calendarioBtnExportTexto}>{exportando ? 'Exportando' : 'Exportar todo'}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.calendarioBtnConfig, pressed && { opacity: 0.7 }]}
              onPress={() => setVistaActual('CONFIG')}
            >
              <Text style={styles.calendarioBtnConfigTexto}>Configurar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.semanaNav}>
          <Pressable
            onPress={() => navegar(-1)}
            hitSlop={12}
            style={({ pressed }) => [styles.semanaNavBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.semanaNavTexto}>‹</Text>
          </Pressable>
          <Text style={styles.semanaLabel}>{getSemanaLabel(fechaObjetivo)}</Text>
          <Pressable
            onPress={() => navegar(1)}
            hitSlop={12}
            style={({ pressed }) => [styles.semanaNavBtn, pressed && { opacity: 0.5 }]}
          >
            <Text style={styles.semanaNavTexto}>›</Text>
          </Pressable>
        </View>

        {turnos.length > 0 && (
          <View style={styles.filtroEstadoRow}>
            {FILTROS_ESTADO.map((filtro) => {
              const activo = filtroEstado === filtro.value;
              return (
                <Pressable
                  key={filtro.value}
                  style={({ pressed }) => [
                    styles.filtroEstadoChip,
                    activo && styles.filtroEstadoChipActivo,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setFiltroEstado(filtro.value)}
                >
                  <Text style={[styles.filtroEstadoTexto, activo && styles.filtroEstadoTextoActivo]}>
                    {filtro.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {turnos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-outline" size={40} color={theme.colors.success} />
            </View>
            <Text style={styles.emptyTitulo}>Sin turnos esta semana</Text>
            <Text style={styles.emptySubtitulo}>
              Genera los turnos para repartir tareas por habitación responsable y mantener el histórico del espacio.
            </Text>
            <CustomButton
              label={generando ? 'Generando...' : 'Generar turnos'}
              variant="primary"
              onPress={handleGenerarTurnos}
              disabled={generando}
              style={{ marginTop: theme.spacing.md, minWidth: 180 }}
            />
          </View>
        ) : turnosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="filter-outline" size={40} color={theme.colors.success} />
            </View>
            <Text style={styles.emptyTitulo}>Sin resultados</Text>
            <Text style={styles.emptySubtitulo}>No hay turnos de limpieza con el filtro seleccionado.</Text>
          </View>
        ) : (
          Object.values(turnosAgrupados).map((grupo) => (
            <View key={grupo.habitacion.id} style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <AvatarInitials
                  nombre={grupo.habitacion.inquilino?.nombre ?? grupo.habitacion.nombre}
                  apellidos={grupo.habitacion.inquilino?.apellidos ?? null}
                  theme={theme}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userNombre}>{grupo.habitacion.nombre}</Text>
                  <Text style={styles.userSubtitle}>{getResponsableLabel(grupo.habitacion.inquilino)}</Text>
                </View>
              </View>

              {grupo.items.map((turno) => (
                <View key={turno.id} style={styles.turnoRow}>
                  <View style={styles.turnoIconWrapper}>
                    <Ionicons name={zonaIcon(turno.zona.nombre)} size={15} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.turnoZona}>{turno.zona.nombre}</Text>
                    <Text style={[styles.userSubtitle, { marginTop: 2 }]}>
                      {getTipoEspacioLabel(turno.tipo_espacio)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.turnoEstadoBadge,
                      turno.estado === 'HECHO' ? styles.turnoEstadoBadgeHecho : styles.turnoEstadoBadgePendiente,
                    ]}
                  >
                    <Text
                      style={[
                        styles.turnoEstadoTexto,
                        turno.estado === 'HECHO' ? styles.turnoEstadoTextoHecho : styles.turnoEstadoTextoPendiente,
                      ]}
                    >
                      {turno.estado === 'HECHO' ? 'Hecho' : 'Pendiente'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segTab, vistaActual === 'CALENDARIO' && styles.segTabActivo]}
          onPress={() => setVistaActual('CALENDARIO')}
        >
          <Text style={[styles.segTabTexto, vistaActual === 'CALENDARIO' && styles.segTabTextoActivo]}>Calendario</Text>
        </Pressable>
        <Pressable
          style={[styles.segTab, vistaActual === 'CONFIG' && styles.segTabActivo]}
          onPress={() => setVistaActual('CONFIG')}
        >
          <Text style={[styles.segTabTexto, vistaActual === 'CONFIG' && styles.segTabTextoActivo]}>Configuración</Text>
        </Pressable>
      </View>

      {vistaActual === 'CONFIG' ? (
        <>
          <CustomButton
            label={generando ? 'Generando...' : 'Generar siguiente semana de turnos'}
            variant="primary"
            onPress={handleGenerarTurnos}
            disabled={generando || loading}
            style={styles.botonGenerar}
          />
          {loading ? (
            <ActivityIndicator style={{ flex: 1 }} size="large" color={theme.colors.primary} />
          ) : (
            <FlatList
              contentContainerStyle={styles.content}
              data={zonas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderZona}
              ListEmptyComponent={emptyComponent}
            />
          )}
          <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={() => setModalZonaVisible(true)}>
            <Text style={styles.fabTexto}>+</Text>
          </Pressable>
        </>
      ) : (
        renderCalendario()
      )}

      <Modal visible={modalZonaVisible} animationType="slide" transparent onRequestClose={cerrarModalZona}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Nuevo espacio</Text>

            <View style={styles.chipRow}>
              {QUICK_CHIPS.map((chip) => (
                <Pressable
                  key={chip}
                  style={({ pressed }) => [styles.chip, pressed && styles.botonPressed]}
                  onPress={() => setNombre(chip)}
                >
                  <Text style={styles.chipTexto}>{chip}</Text>
                </Pressable>
              ))}
            </View>

            <CustomInput
              label="Nombre del espacio"
              placeholder="ej. Cocina, Baño 1 o Despensa"
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
            />

            <Text style={styles.tshirtLabel}>Vincular a una habitación existente (opcional)</Text>
            <ScrollView style={{ maxHeight: 160, marginBottom: theme.spacing.md }}>
              <Pressable
                style={({ pressed }) => [
                  styles.inquilinoRow,
                  habitacionObjetivoId === null && styles.inquilinoRowActual,
                  pressed && styles.botonPressed,
                ]}
                onPress={() => setHabitacionObjetivoId(null)}
              >
                <Text style={[styles.inquilinoNombre, habitacionObjetivoId === null && styles.inquilinoNombreActual]}>
                  Espacio personalizado
                </Text>
              </Pressable>
              {habitaciones.map((habitacion) => {
                const seleccionado = habitacionObjetivoId === habitacion.id;
                return (
                  <Pressable
                    key={habitacion.id}
                    style={({ pressed }) => [
                      styles.inquilinoRow,
                      seleccionado && styles.inquilinoRowActual,
                      pressed && styles.botonPressed,
                    ]}
                    onPress={() => {
                      setHabitacionObjetivoId(habitacion.id);
                      setNombre(habitacion.nombre);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inquilinoNombre, seleccionado && styles.inquilinoNombreActual]}>
                        {habitacion.nombre}
                      </Text>
                      <Text style={{ color: theme.colors.textTertiary, fontSize: theme.typography.caption }}>
                        {habitacion.es_habitable ? 'Habitación' : 'Zona común'}
                      </Text>
                    </View>
                    {seleccionado && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.tshirtLabel}>Esfuerzo</Text>
            <View style={styles.tshirtRow}>
              {TALLAS.map((talla) => (
                <Pressable
                  key={talla.peso}
                  style={[styles.tshirtBtn, pesoSeleccionado === talla.peso && styles.tshirtBtnActivo]}
                  onPress={() => setPesoSeleccionado(talla.peso)}
                >
                  <Text
                    style={[styles.tshirtBtnTexto, pesoSeleccionado === talla.peso && styles.tshirtBtnTextoActivo]}
                  >
                    {talla.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalAcciones}>
              <Pressable style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]} onPress={cerrarModalZona}>
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.botonGuardar,
                  !puedeGuardar && styles.botonGuardarDisabled,
                  pressed && !guardando && styles.botonPressed,
                ]}
                onPress={handleGuardar}
                disabled={!puedeGuardar || guardando}
              >
                {guardando ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.botonGuardarTexto}>Guardar</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={zonaSeleccionada !== null} animationType="slide" transparent onRequestClose={cerrarModalAsignacion}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Asignar responsables fijas</Text>
            {zonaSeleccionada && <Text style={styles.modalSubtitulo}>{zonaSeleccionada.nombre}</Text>}
            {habitacionesResponsables.length === 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.colors.textTertiary,
                  fontSize: theme.typography.body,
                  paddingVertical: theme.spacing.md,
                }}
              >
                No hay habitaciones habitables disponibles.
              </Text>
            ) : (
              habitacionesResponsables.map((habitacion) => {
                const seleccionado = seleccionados.includes(habitacion.id);
                return (
                  <Pressable
                    key={habitacion.id}
                    style={({ pressed }) => [
                      styles.inquilinoRow,
                      seleccionado && styles.inquilinoRowActual,
                      pressed && styles.botonPressed,
                    ]}
                    onPress={() => toggleSeleccion(habitacion.id)}
                    disabled={asignando}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inquilinoNombre, seleccionado && styles.inquilinoNombreActual]}>
                        {habitacion.nombre}
                      </Text>
                      <Text style={{ color: theme.colors.textTertiary, fontSize: theme.typography.caption }}>
                        {getResponsableLabel(habitacion.inquilino)}
                      </Text>
                    </View>
                    {seleccionado && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })
            )}
            <View style={[styles.modalAcciones, { marginTop: theme.spacing.md }]}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModalAsignacion}
                disabled={asignando}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonGuardar, pressed && !asignando && styles.botonPressed]}
                onPress={handleGuardarAsignacion}
                disabled={asignando}
              >
                {asignando ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.botonGuardarTexto}>Guardar</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
