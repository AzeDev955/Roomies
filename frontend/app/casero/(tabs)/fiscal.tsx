import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { CustomButton } from '@/components/common/CustomButton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import { createStyles, getFiscalStatusColors } from '@/styles/casero/fiscal.styles';

type FiscalStyles = ReturnType<typeof createStyles>;
type FiscalStatusColors = ReturnType<typeof getFiscalStatusColors>;

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  mod_gastos: boolean;
};

type CategoriaFiscal =
  | 'FINANCIACION_INTERESES'
  | 'CONSERVACION_REPARACION'
  | 'COMUNIDAD'
  | 'IBI_TASAS'
  | 'SEGUROS'
  | 'SUMINISTROS'
  | 'SERVICIOS_PROFESIONALES'
  | 'LIMPIEZA'
  | 'MOBILIARIO_ENSERES'
  | 'AMORTIZACION'
  | 'OTROS'
  | 'SIN_CLASIFICAR';

type Deducibilidad = 'NO_APLICA' | 'PENDIENTE_CLASIFICACION' | 'DEDUCIBLE' | 'NO_DEDUCIBLE';

type FiscalAdvertencia = {
  codigo: string;
  mensaje: string;
  gasto_id?: number;
  deuda_id?: number;
};

type FiscalLinea = {
  id: string;
  naturaleza: 'INGRESO' | 'GASTO_POTENCIALMENTE_DEDUCIBLE';
  fuente: {
    modelo: 'Deuda' | 'Gasto';
    gasto_id: number;
    deuda_id?: number;
  };
  concepto: string;
  categoria: string;
  deducibilidad: Deducibilidad;
  importe: number;
  moneda: 'EUR';
  fecha: string;
  periodo_facturacion: string | null;
  estado_pago: 'COBRADO' | 'PENDIENTE' | 'ANULADO';
  factura_url: string | null;
  justificante_url?: string | null;
  metadata_fiscal?: {
    categoria_fiscal: CategoriaFiscal;
    deducible_previsto: boolean | null;
    notas_fiscales: string | null;
    prorrateo_fiscal: number | null;
  };
  habitacion?: { id: number; nombre: string } | null;
  inquilino?: { id: number; nombre: string; apellidos: string | null } | null;
  advertencias: FiscalAdvertencia[];
};

type FiscalResumen = {
  ejercicio: number;
  generado_en: string;
  vivienda: {
    id: number;
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
  };
  totales: {
    ingresos: {
      emitido: number;
      cobrado: number;
      pendiente: number;
      anulado: number;
      por_tipo: Record<string, number>;
    };
    gastos: {
      potencialmente_deducible: number;
      deducible_previsto: number;
      no_deducible_previsto: number;
      pendiente_clasificacion: number;
      con_factura: number;
      sin_factura: number;
      por_categoria: Record<string, number>;
    };
  };
  lineas: FiscalLinea[];
  advertencias: FiscalAdvertencia[];
};

type FiscalOcupacion = {
  ejercicio: number;
  resumen: {
    dias_alquilados: number;
    meses_equivalentes: number;
    porcentaje_ocupacion: number;
    estado: 'SIN_ACTIVIDAD' | 'PARCIAL' | 'TODO_EL_ANO';
    habitaciones_con_actividad: number;
    habitaciones_requieren_revision: number;
    requiere_revision: boolean;
  };
  habitaciones: {
    id: number;
    nombre: string;
    tipo: string;
    es_habitable: boolean;
    precio: number | null;
    dias_alquilados: number;
    meses_equivalentes: number;
    porcentaje_ocupacion: number;
    estado: 'SIN_ACTIVIDAD' | 'PARCIAL' | 'TODO_EL_ANO';
    requiere_revision: boolean;
    revisiones: { codigo: string; mensaje: string }[];
  }[];
  gastos_prorrateados: {
    id: number;
    concepto: string;
    importe: number;
    tipo: string;
    fecha: string;
    prorrateo: {
      modo: 'MANUAL' | 'OCUPACION';
      porcentaje: number;
      importe_prorrateado: number;
    };
  }[];
};

type DossierFiscalResponse = {
  nombreArchivo: string;
  mimeType: string;
  contenidoBase64: string;
};

type EditorFiscal = {
  linea: FiscalLinea;
  categoria: CategoriaFiscal;
  deducible: 'pendiente' | 'si' | 'no';
  notas: string;
  prorrateo: string;
};

const CATEGORIAS: { value: CategoriaFiscal; label: string }[] = [
  { value: 'SIN_CLASIFICAR', label: 'Pendiente de clasificar' },
  { value: 'FINANCIACION_INTERESES', label: 'Financiacion e intereses' },
  { value: 'CONSERVACION_REPARACION', label: 'Conservacion y reparacion' },
  { value: 'COMUNIDAD', label: 'Comunidad' },
  { value: 'IBI_TASAS', label: 'IBI y tasas' },
  { value: 'SEGUROS', label: 'Seguros' },
  { value: 'SUMINISTROS', label: 'Suministros' },
  { value: 'SERVICIOS_PROFESIONALES', label: 'Servicios profesionales' },
  { value: 'LIMPIEZA', label: 'Limpieza' },
  { value: 'MOBILIARIO_ENSERES', label: 'Mobiliario y enseres' },
  { value: 'AMORTIZACION', label: 'Amortizacion' },
  { value: 'OTROS', label: 'Otros' },
];

const EJERCICIO_ACTUAL = new Date().getFullYear();

const formatearImporte = (importe: number) =>
  importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const formatearFecha = (fechaIso: string) =>
  new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatearPorcentaje = (porcentaje: number) =>
  `${porcentaje.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%`;

const etiquetaCategoria = (categoria: string) =>
  CATEGORIAS.find((item) => item.value === categoria)?.label ??
  (categoria === 'PENDIENTE_CLASIFICACION' ? 'Pendiente de clasificar' : categoria);

const etiquetaDeducibilidad = (deducibilidad: Deducibilidad) => {
  if (deducibilidad === 'DEDUCIBLE') return 'Preparado como deducible';
  if (deducibilidad === 'NO_DEDUCIBLE') return 'Marcado no deducible';
  if (deducibilidad === 'PENDIENTE_CLASIFICACION') return 'Pendiente de revisar';
  return 'No aplica';
};

const nombreCompleto = (nombre: string, apellidos: string | null) =>
  apellidos ? `${nombre} ${apellidos}` : nombre;

const normalizarProrrateo = (valor: string) => {
  const limpio = valor.trim();
  if (!limpio) return { valido: true, valor: null };

  const numero = Number(limpio.replace(',', '.'));
  return {
    valido: Number.isFinite(numero) && numero >= 0 && numero <= 100,
    valor: numero,
  };
};

export default function CaseroFiscalScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors = useMemo(() => getFiscalStatusColors(theme), [theme]);
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [hayViviendas, setHayViviendas] = useState(false);
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<number | null>(null);
  const [ejercicio, setEjercicio] = useState(EJERCICIO_ACTUAL);
  const [resumen, setResumen] = useState<FiscalResumen | null>(null);
  const [ocupacion, setOcupacion] = useState<FiscalOcupacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFiscal, setLoadingFiscal] = useState(false);
  const [errorFiscal, setErrorFiscal] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [editor, setEditor] = useState<EditorFiscal | null>(null);
  const [guardando, setGuardando] = useState(false);

  const viviendaSeleccionada = useMemo(
    () => viviendas.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ?? null,
    [viviendaSeleccionadaId, viviendas],
  );

  const lineasGasto = useMemo(
    () => resumen?.lineas.filter((linea) => linea.naturaleza === 'GASTO_POTENCIALMENTE_DEDUCIBLE') ?? [],
    [resumen],
  );

  const lineasIngreso = useMemo(
    () => resumen?.lineas.filter((linea) => linea.naturaleza === 'INGRESO') ?? [],
    [resumen],
  );

  const pendientesRevision = resumen?.advertencias.length ?? 0;
  const documentosAusentes = resumen?.lineas.filter((linea) => !linea.factura_url).length ?? 0;
  const puedeExportar = !!resumen && !exportando && !loadingFiscal;

  const cargarFiscal = useCallback(async (viviendaId: number, ejercicioObjetivo: number) => {
    setLoadingFiscal(true);
    try {
      const [resumenResponse, ocupacionResponse] = await Promise.all([
        api.get<FiscalResumen>(`/viviendas/${viviendaId}/fiscal/${ejercicioObjetivo}`),
        api.get<FiscalOcupacion>(`/viviendas/${viviendaId}/fiscal/ocupacion`, {
          params: { ejercicio: ejercicioObjetivo },
        }),
      ]);

      setResumen(resumenResponse.data);
      setOcupacion(ocupacionResponse.data);
      setErrorFiscal(null);
    } catch (error: any) {
      const mensaje = error.response?.data?.error ?? 'No se pudo cargar el modo fiscal.';
      setResumen(null);
      setOcupacion(null);
      setErrorFiscal(mensaje);
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoadingFiscal(false);
    }
  }, []);

  const cargarContexto = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda[]>('/viviendas');
      const viviendasConGastos = data.filter((vivienda) => vivienda.mod_gastos);
      setHayViviendas(data.length > 0);
      setViviendas(viviendasConGastos);

      if (viviendasConGastos.length === 0) {
        setViviendaSeleccionadaId(null);
        setResumen(null);
        setOcupacion(null);
        setErrorFiscal(null);
        return;
      }

      const viviendaInicial =
        viviendasConGastos.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ??
        viviendasConGastos[0];

      setViviendaSeleccionadaId(viviendaInicial.id);
      await cargarFiscal(viviendaInicial.id, ejercicio);
    } catch {
      setViviendas([]);
      setHayViviendas(false);
      setViviendaSeleccionadaId(null);
      setResumen(null);
      setOcupacion(null);
      setErrorFiscal('No se pudieron cargar tus viviendas.');
      Toast.show({ type: 'error', text1: 'No se pudieron cargar tus viviendas.' });
    } finally {
      setLoading(false);
    }
  }, [cargarFiscal, ejercicio, viviendaSeleccionadaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  const cambiarVivienda = async (viviendaId: number) => {
    setViviendaSeleccionadaId(viviendaId);
    await cargarFiscal(viviendaId, ejercicio);
  };

  const cambiarEjercicio = async (delta: number) => {
    const siguiente = Math.min(2100, Math.max(2000, ejercicio + delta));
    setEjercicio(siguiente);
    if (viviendaSeleccionadaId) {
      await cargarFiscal(viviendaSeleccionadaId, siguiente);
    }
  };

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

    await Share.share({ title: nombreArchivo, url: uri });
  };

  const exportarDossier = async () => {
    if (!viviendaSeleccionadaId) return;

    setExportando(true);
    try {
      const { data } = await api.get<DossierFiscalResponse>(
        `/viviendas/${viviendaSeleccionadaId}/fiscal/${ejercicio}/dossier`,
        { params: { formato: 'base64' } },
      );

      await guardarArchivoCsv(data.contenidoBase64, data.nombreArchivo, data.mimeType);
      Toast.show({
        type: 'success',
        text1: 'Dossier fiscal preparado',
        text2: Platform.OS === 'android' ? 'Archivo CSV guardado.' : 'CSV listo para compartir o abrir.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? error.message ?? 'No se pudo exportar el dossier fiscal.',
      });
    } finally {
      setExportando(false);
    }
  };

  const abrirEditor = (linea: FiscalLinea) => {
    const metadata = linea.metadata_fiscal;
    const categoria =
      metadata?.categoria_fiscal ??
      (CATEGORIAS.some((item) => item.value === linea.categoria)
        ? (linea.categoria as CategoriaFiscal)
        : 'SIN_CLASIFICAR');
    const deducible =
      metadata?.deducible_previsto === true
        ? 'si'
        : metadata?.deducible_previsto === false
          ? 'no'
          : linea.deducibilidad === 'DEDUCIBLE'
            ? 'si'
            : linea.deducibilidad === 'NO_DEDUCIBLE'
              ? 'no'
              : 'pendiente';

    setEditor({
      linea,
      categoria,
      deducible,
      notas: metadata?.notas_fiscales ?? '',
      prorrateo:
        metadata?.prorrateo_fiscal !== null && metadata?.prorrateo_fiscal !== undefined
          ? String(metadata.prorrateo_fiscal).replace('.', ',')
          : '',
    });
  };

  const guardarMetadataFiscal = async () => {
    if (!editor || !viviendaSeleccionadaId) return;

    const prorrateo = normalizarProrrateo(editor.prorrateo);
    if (!prorrateo.valido) {
      Toast.show({ type: 'error', text1: 'El prorrateo debe estar entre 0 y 100.' });
      return;
    }

    setGuardando(true);
    try {
      await api.patch(`/viviendas/${viviendaSeleccionadaId}/gastos/${editor.linea.fuente.gasto_id}`, {
        categoria_fiscal: editor.categoria,
        deducible_previsto:
          editor.deducible === 'pendiente' ? null : editor.deducible === 'si',
        notas_fiscales: editor.notas.trim() ? editor.notas.trim() : null,
        prorrateo_fiscal: prorrateo.valor,
      });

      setEditor(null);
      await cargarFiscal(viviendaSeleccionadaId, ejercicio);
      Toast.show({ type: 'success', text1: 'Linea fiscal actualizada.' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo actualizar la linea fiscal.',
      });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hayViviendas || viviendas.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="briefcase-outline" size={34} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Modo fiscal sin viviendas activas</Text>
          <Text style={styles.emptySubtitle}>
            Crea una vivienda o activa el modulo de gastos para preparar el resumen fiscal del casero.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Modo fiscal</Text>
          <Text style={styles.headerTitle}>Preparacion fiscal</Text>
          <Text style={styles.headerSubtitle}>
            Revisa ingresos, gastos, prorrateos y documentos antes de llevar el CSV a tu gestor.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selector}
          contentContainerStyle={styles.selectorContent}
        >
          {viviendas.map((vivienda) => {
            const activa = vivienda.id === viviendaSeleccionadaId;
            return (
              <Pressable
                key={vivienda.id}
                style={[styles.chip, activa && styles.chipActive]}
                onPress={() => cambiarVivienda(vivienda.id)}
              >
                <Text style={[styles.chipText, activa && styles.chipTextActive]}>
                  {vivienda.alias_nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.yearRow}>
          <Pressable style={styles.yearButton} onPress={() => cambiarEjercicio(-1)}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
          </Pressable>
          <View style={styles.yearPill}>
            <Text style={styles.yearText}>Ejercicio {ejercicio}</Text>
          </View>
          <Pressable style={styles.yearButton} onPress={() => cambiarEjercicio(1)}>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>

        {errorFiscal && (
          <StatusNotice
            text={errorFiscal}
            icon="alert-circle-outline"
            tone="danger"
            styles={styles}
            theme={theme}
            statusColors={statusColors}
          />
        )}

        {loadingFiscal && (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginVertical: theme.spacing.xl }}
          />
        )}

        {resumen && viviendaSeleccionada && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <Text style={styles.heroLabel}>Resumen anual</Text>
                <Text style={styles.heroTitle}>{viviendaSeleccionada.alias_nombre}</Text>
                <Text style={styles.heroAddress}>{viviendaSeleccionada.direccion}</Text>
              </View>

              <View style={styles.metricGrid}>
                <MetricCard
                  label="Ingresos cobrados"
                  value={formatearImporte(resumen.totales.ingresos.cobrado)}
                  help={`${formatearImporte(resumen.totales.ingresos.pendiente)} pendiente`}
                  styles={styles}
                />
                <MetricCard
                  label="Gastos revisables"
                  value={formatearImporte(resumen.totales.gastos.potencialmente_deducible)}
                  help={`${formatearImporte(resumen.totales.gastos.deducible_previsto)} preparados`}
                  styles={styles}
                />
                <MetricCard
                  label="Sin clasificar"
                  value={formatearImporte(resumen.totales.gastos.pendiente_clasificacion)}
                  help="Gastos que necesitan categoria o criterio"
                  styles={styles}
                />
                <MetricCard
                  label="Sin documento"
                  value={String(documentosAusentes)}
                  help="Lineas sin factura adjunta"
                  styles={styles}
                />
              </View>

              <View style={styles.actionRow}>
                <CustomButton
                  label={exportando ? 'Exportando...' : 'Exportar CSV'}
                  onPress={exportarDossier}
                  disabled={!puedeExportar}
                  style={styles.actionButton}
                />
              </View>
            </View>

            <StatusNotice
              text={
                pendientesRevision > 0
                  ? `${pendientesRevision} avisos necesitan revision antes de cerrar el dossier.`
                  : 'El resumen esta listo para una revision final. Roomies no sustituye el criterio fiscal profesional.'
              }
              icon={pendientesRevision > 0 ? 'warning-outline' : 'checkmark-circle-outline'}
              tone={pendientesRevision > 0 ? 'review' : 'ready'}
              styles={styles}
              theme={theme}
              statusColors={statusColors}
            />

            {ocupacion && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Ocupacion y prorrateos</Text>
                  <Text style={styles.sectionSubtitle}>
                    Base de calculo para repartir gastos por uso anual de la vivienda.
                  </Text>
                </View>
                <View style={styles.list}>
                  <View style={styles.card}>
                    <View style={styles.lineHeader}>
                      <View style={[styles.lineIcon, { backgroundColor: theme.colors.primaryLight }]}>
                        <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
                      </View>
                      <View style={styles.lineBody}>
                        <Text style={styles.lineTitle}>
                          {ocupacion.resumen.meses_equivalentes.toLocaleString('es-ES', {
                            maximumFractionDigits: 1,
                          })}{' '}
                          meses equivalentes alquilados
                        </Text>
                        <Text style={styles.lineMeta}>
                          {ocupacion.resumen.dias_alquilados} dias con actividad ·{' '}
                          {ocupacion.resumen.habitaciones_con_actividad} habitaciones con cargos
                        </Text>
                      </View>
                    </View>
                    <View style={styles.occupancyRow}>
                      <View style={styles.occupancyMeter}>
                        <View
                          style={[
                            styles.occupancyFill,
                            { width: `${Math.min(100, ocupacion.resumen.porcentaje_ocupacion)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.occupancyPercent}>
                        {formatearPorcentaje(ocupacion.resumen.porcentaje_ocupacion)}
                      </Text>
                    </View>
                  </View>

                  {ocupacion.habitaciones
                    .filter((habitacion) => habitacion.es_habitable)
                    .map((habitacion) => (
                      <View key={habitacion.id} style={styles.card}>
                        <View style={styles.lineHeader}>
                          <View style={[styles.lineIcon, { backgroundColor: theme.colors.infoLight }]}>
                            <Ionicons name="bed-outline" size={22} color={theme.colors.info} />
                          </View>
                          <View style={styles.lineBody}>
                            <Text style={styles.lineTitle}>{habitacion.nombre}</Text>
                            <Text style={styles.lineMeta}>
                              {habitacion.dias_alquilados} dias ·{' '}
                              {formatearPorcentaje(habitacion.porcentaje_ocupacion)}
                            </Text>
                          </View>
                          {habitacion.requiere_revision && (
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor: statusColors.review.bg,
                                  borderColor: statusColors.review.border,
                                },
                              ]}
                            >
                              <Text style={[styles.badgeText, { color: statusColors.review.text }]}>
                                Revisar
                              </Text>
                            </View>
                          )}
                        </View>
                        {habitacion.revisiones.map((revision) => (
                          <Text key={revision.codigo + revision.mensaje} style={styles.warningText}>
                            {revision.mensaje}
                          </Text>
                        ))}
                      </View>
                    ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gastos a clasificar</Text>
                <Text style={styles.sectionSubtitle}>
                  Ajusta categoria, deducibilidad prevista, notas y prorrateo manual cuando proceda.
                </Text>
              </View>
              <View style={styles.list}>
                {lineasGasto.length === 0 ? (
                  <EmptyInline text="No hay gastos potencialmente deducibles en este ejercicio." styles={styles} />
                ) : (
                  lineasGasto.map((linea) => (
                    <FiscalLineCard
                      key={linea.id}
                      linea={linea}
                      styles={styles}
                      theme={theme}
                      statusColors={statusColors}
                      onEditar={abrirEditor}
                    />
                  ))
                )}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ingresos y justificantes</Text>
                <Text style={styles.sectionSubtitle}>
                  Seguimiento de cobros del ejercicio sin exponer datos fiscales a inquilinos.
                </Text>
              </View>
              <View style={styles.list}>
                {lineasIngreso.length === 0 ? (
                  <EmptyInline text="No hay ingresos registrados para este ejercicio." styles={styles} />
                ) : (
                  lineasIngreso.slice(0, 8).map((linea) => (
                    <FiscalLineCard
                      key={linea.id}
                      linea={linea}
                      styles={styles}
                      theme={theme}
                      statusColors={statusColors}
                    />
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={!!editor} transparent animationType="slide" onRequestClose={() => setEditor(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setEditor(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Revisar gasto</Text>
              <Text style={styles.modalSubtitle}>
                {editor?.linea.concepto}. La marca es de preparacion y puede revisarla tu gestor.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Categoria fiscal</Text>
                <View style={styles.optionGrid}>
                  {CATEGORIAS.map((categoria) => {
                    const activa = editor?.categoria === categoria.value;
                    return (
                      <Pressable
                        key={categoria.value}
                        style={[styles.optionButton, activa && styles.optionButtonActive]}
                        onPress={() => editor && setEditor({ ...editor, categoria: categoria.value })}
                      >
                        <Text style={[styles.optionText, activa && styles.optionTextActive]}>
                          {categoria.label}
                        </Text>
                        {activa && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Deducibilidad prevista</Text>
                <View style={styles.optionGrid}>
                  {[
                    { value: 'pendiente', label: 'Pendiente de revisar' },
                    { value: 'si', label: 'Preparar como deducible' },
                    { value: 'no', label: 'Marcar no deducible' },
                  ].map((opcion) => {
                    const activa = editor?.deducible === opcion.value;
                    return (
                      <Pressable
                        key={opcion.value}
                        style={[styles.optionButton, activa && styles.optionButtonActive]}
                        onPress={() =>
                          editor &&
                          setEditor({ ...editor, deducible: opcion.value as EditorFiscal['deducible'] })
                        }
                      >
                        <Text style={[styles.optionText, activa && styles.optionTextActive]}>
                          {opcion.label}
                        </Text>
                        {activa && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Prorrateo manual (%)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Vacío: usar ocupación anual"
                  placeholderTextColor={theme.colors.textMuted}
                  value={editor?.prorrateo ?? ''}
                  onChangeText={(valor) => editor && setEditor({ ...editor, prorrateo: valor })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Notas privadas</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Ej. Revisar con gestor si corresponde al periodo alquilado"
                  placeholderTextColor={theme.colors.textMuted}
                  value={editor?.notas ?? ''}
                  onChangeText={(valor) => editor && setEditor({ ...editor, notas: valor })}
                  multiline
                  maxLength={1000}
                />
              </View>

              <View style={styles.modalActions}>
                <CustomButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setEditor(null)}
                  disabled={guardando}
                  style={styles.modalAction}
                />
                <CustomButton
                  label={guardando ? 'Guardando...' : 'Guardar'}
                  onPress={guardarMetadataFiscal}
                  disabled={guardando}
                  style={styles.modalAction}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function MetricCard({
  label,
  value,
  help,
  styles,
}: {
  label: string;
  value: string;
  help: string;
  styles: FiscalStyles;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHelp}>{help}</Text>
    </View>
  );
}

function StatusNotice({
  text,
  icon,
  tone,
  styles,
  theme,
  statusColors,
}: {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: keyof FiscalStatusColors;
  styles: FiscalStyles;
  theme: AppTheme;
  statusColors: FiscalStatusColors;
}) {
  const colors = statusColors[tone];
  return (
    <View style={[styles.notice, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Ionicons name={icon} size={19} color={colors.text} />
      <Text style={[styles.noticeText, { color: theme.isDark ? theme.colors.textMedium : colors.text }]}>
        {text}
      </Text>
    </View>
  );
}

function EmptyInline({ text, styles }: { text: string; styles: FiscalStyles }) {
  return (
    <View style={styles.card}>
      <Text style={styles.lineMeta}>{text}</Text>
    </View>
  );
}

function FiscalLineCard({
  linea,
  styles,
  theme,
  statusColors,
  onEditar,
}: {
  linea: FiscalLinea;
  styles: FiscalStyles;
  theme: AppTheme;
  statusColors: FiscalStatusColors;
  onEditar?: (linea: FiscalLinea) => void;
}) {
  const esGasto = linea.naturaleza === 'GASTO_POTENCIALMENTE_DEDUCIBLE';
  const tone =
    linea.advertencias.length > 0
      ? 'review'
      : linea.deducibilidad === 'PENDIENTE_CLASIFICACION'
        ? 'pending'
        : 'ready';
  const colors = statusColors[tone];

  return (
    <View style={styles.card}>
      <View style={styles.lineHeader}>
        <View
          style={[
            styles.lineIcon,
            { backgroundColor: esGasto ? theme.colors.warningLight : theme.colors.successLight },
          ]}
        >
          <Ionicons
            name={esGasto ? 'receipt-outline' : 'cash-outline'}
            size={22}
            color={esGasto ? theme.colors.warning : theme.colors.success}
          />
        </View>
        <View style={styles.lineBody}>
          <Text style={styles.lineTitle} numberOfLines={2}>
            {linea.concepto}
          </Text>
          <Text style={styles.lineMeta}>
            {formatearFecha(linea.fecha)}
            {linea.periodo_facturacion ? ` · ${linea.periodo_facturacion}` : ''}
            {linea.inquilino ? ` · ${nombreCompleto(linea.inquilino.nombre, linea.inquilino.apellidos)}` : ''}
          </Text>
        </View>
        <Text style={styles.lineAmount}>{formatearImporte(linea.importe)}</Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {etiquetaDeducibilidad(linea.deducibilidad)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.colors.surface2, borderColor: theme.colors.border }]}>
          <Text style={[styles.badgeText, { color: theme.colors.textSecondary }]}>
            {etiquetaCategoria(linea.categoria)}
          </Text>
        </View>
        {!linea.factura_url && (
          <View
            style={[
              styles.badge,
              { backgroundColor: statusColors.danger.bg, borderColor: statusColors.danger.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: statusColors.danger.text }]}>Sin factura</Text>
          </View>
        )}
      </View>

      {linea.advertencias.map((advertencia) => (
        <Text key={`${linea.id}-${advertencia.codigo}-${advertencia.mensaje}`} style={styles.warningText}>
          {advertencia.mensaje}
        </Text>
      ))}

      <View style={styles.lineActions}>
        {esGasto && onEditar && (
          <Pressable
            style={[styles.smallButton, { backgroundColor: theme.colors.primaryLight }]}
            onPress={() => onEditar(linea)}
          >
            <Ionicons name="create-outline" size={15} color={theme.colors.primary} />
            <Text style={[styles.smallButtonText, { color: theme.colors.primary }]}>Clasificar</Text>
          </Pressable>
        )}
        {linea.factura_url && (
          <Pressable
            style={[styles.smallButton, { backgroundColor: theme.colors.infoLight }]}
            onPress={() => Linking.openURL(linea.factura_url!)}
          >
            <Ionicons name="document-text-outline" size={15} color={theme.colors.info} />
            <Text style={[styles.smallButtonText, { color: theme.colors.info }]}>Factura</Text>
          </Pressable>
        )}
        {linea.justificante_url && (
          <Pressable
            style={[styles.smallButton, { backgroundColor: theme.colors.successLight }]}
            onPress={() => Linking.openURL(linea.justificante_url!)}
          >
            <Ionicons name="image-outline" size={15} color={theme.colors.success} />
            <Text style={[styles.smallButtonText, { color: theme.colors.successText }]}>Justificante</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
