import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AccordionSection } from '@/components/common/AccordionSection';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import { onModulosViviendaActualizados } from '@/utils/viviendaModules';
import {
  createStyles,
  getEstadoBadgeColors,
} from '@/styles/casero/cobros.styles';

type CobrosStyles = ReturnType<typeof createStyles>;
type EstadoBadgeColors = ReturnType<typeof getEstadoBadgeColors>;

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  mod_gastos: boolean;
};

type InquilinoActivo = {
  id: number;
  nombre: string;
  apellidos: string | null;
  avatar: string | null;
};

type ViviendaDetalle = Vivienda & {
  habitaciones: {
    id: number;
    tipo: string;
    es_habitable: boolean;
    inquilino: {
      id: number;
      nombre: string;
      apellidos: string | null;
      email?: string;
    } | null;
  }[];
};

type DeudaCobro = {
  id: number;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADA';
  justificante_url: string | null;
  categoria?: 'CASERO';
  gasto: {
    id: number;
    concepto: string;
    importe: number;
    tipo?: 'FACTURA_PUNTUAL' | 'FACTURA_MENSUAL' | 'CARGO_RECURRENTE';
    factura_url: string | null;
    fecha_creacion: string;
    fecha_modificacion: string | null;
    modificado_por: {
      id: number;
      nombre: string;
      apellidos: string | null;
    } | null;
  };
  deudor: {
    id: number;
    nombre: string;
    apellidos: string | null;
    avatar: string | null;
  };
};

type CobrosResponse = {
  vivienda: Vivienda;
  periodo: {
    inicio: string;
    fin: string;
  };
  resumen: {
    total_pagado_mes: number;
    total_pendiente: number;
    total_deudas: number;
  };
  deudas: DeudaCobro[];
};

type FacturaEmitida = {
  id: number;
  concepto: string;
  importe: number;
  factura_url: string | null;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  modificado_por: {
    id: number;
    nombre: string;
    apellidos: string | null;
  } | null;
  deudas: DeudaCobro[];
};

type GastoActualizadoResponse = {
  id: number;
  concepto: string;
  importe: number;
  factura_url: string | null;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  modificado_por: {
    id: number;
    nombre: string;
    apellidos: string | null;
  } | null;
  deudas: {
    id: number;
    importe: number;
    estado: 'PENDIENTE' | 'PAGADA';
  }[];
};

type RepartoFacturaPuntualLinea = {
  usuario_id: number;
  importe: number;
  automatico: boolean;
};

type GrupoFacturas = {
  key: string;
  titulo: string;
  total: number;
  facturas: FacturaEmitida[];
};

const formatearImporte = (importe: number) =>
  importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const formatearFecha = (fechaIso: string) =>
  new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatearMesFacturas = (fechaIso: string) => {
  const fecha = new Date(fechaIso);

  return fecha.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
};

const obtenerClaveMes = (fechaIso: string) => {
  const fecha = new Date(fechaIso);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');

  return `${fecha.getFullYear()}-${mes}`;
};

const perteneceAlMesActual = (fechaIso: string) => {
  const fecha = new Date(fechaIso);
  const ahora = new Date();

  return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
};

const agruparFacturasPorMes = (facturas: FacturaEmitida[]) => {
  const grupos = new Map<string, GrupoFacturas>();

  facturas.forEach((factura) => {
    const key = obtenerClaveMes(factura.fecha_creacion);
    const grupo = grupos.get(key);

    if (grupo) {
      grupo.facturas.push(factura);
      grupo.total += factura.importe;
      return;
    }

    grupos.set(key, {
      key,
      titulo: formatearMesFacturas(factura.fecha_creacion),
      total: factura.importe,
      facturas: [factura],
    });
  });

  return Array.from(grupos.values()).sort((a, b) => b.key.localeCompare(a.key));
};

const obtenerIniciales = (nombre: string, apellidos: string | null) =>
  `${nombre[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase();

const normalizarInputImporte = (valor: string) => {
  const limpio = valor.trim();

  if (!limpio) {
    return { vacio: true, numero: null, valido: true };
  }

  const numero = Number(limpio.replace(',', '.'));
  return { vacio: false, numero, valido: Number.isFinite(numero) };
};

const aCentimos = (importe: number) => Math.round(importe * 100);

const desdeCentimos = (centimos: number) => centimos / 100;

const repartirCentimos = (totalCentimos: number, participantes: number[]) => {
  if (participantes.length === 0) {
    return [];
  }

  const base = Math.floor(totalCentimos / participantes.length);
  const resto = totalCentimos % participantes.length;

  return participantes.map((usuarioId, index) => ({
    usuario_id: usuarioId,
    importe: desdeCentimos(base + (index < resto ? 1 : 0)),
    automatico: true,
  }));
};

const recalcularResumenCobros = (deudas: DeudaCobro[]) => ({
  total_pagado_mes: deudas
    .filter((deuda) => deuda.estado === 'PAGADA')
    .reduce((acumulado, deuda) => acumulado + deuda.importe, 0),
  total_pendiente: deudas
    .filter((deuda) => deuda.estado === 'PENDIENTE')
    .reduce((acumulado, deuda) => acumulado + deuda.importe, 0),
  total_deudas: deudas.length,
});

export default function CaseroCobrosScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const estadoBadgeColors = useMemo(() => getEstadoBadgeColors(theme), [theme]);
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [hayViviendas, setHayViviendas] = useState(false);
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<CobrosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCobros, setLoadingCobros] = useState(false);
  const [errorCobros, setErrorCobros] = useState<string | null>(null);
  const [justificanteSeleccionado, setJustificanteSeleccionado] = useState<DeudaCobro | null>(null);
  const [facturaEditando, setFacturaEditando] = useState<FacturaEmitida | null>(null);
  const [facturaVisualizando, setFacturaVisualizando] = useState<FacturaEmitida | null>(null);
  const [conceptoEditado, setConceptoEditado] = useState('');
  const [importeEditado, setImporteEditado] = useState('');
  const [fechaEditada, setFechaEditada] = useState('');
  const [guardandoFactura, setGuardandoFactura] = useState(false);
  const [subiendoFactura, setSubiendoFactura] = useState(false);
  const [inquilinosActivos, setInquilinosActivos] = useState<InquilinoActivo[]>([]);
  const [modalFacturaPuntualVisible, setModalFacturaPuntualVisible] = useState(false);
  const [conceptoFacturaPuntual, setConceptoFacturaPuntual] = useState('');
  const [fechaFacturaPuntual, setFechaFacturaPuntual] = useState(new Date().toISOString().slice(0, 10));
  const [importeFacturaPuntual, setImporteFacturaPuntual] = useState('');
  const [repartoFacturaPuntual, setRepartoFacturaPuntual] = useState<Record<number, string>>({});
  const [participantesFacturaPuntual, setParticipantesFacturaPuntual] = useState<Record<number, boolean>>(
    {},
  );
  const [facturaAdjuntaPuntual, setFacturaAdjuntaPuntual] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [guardandoFacturaPuntual, setGuardandoFacturaPuntual] = useState(false);
  const [gruposFacturasExpandidos, setGruposFacturasExpandidos] = useState<Record<string, boolean>>({});

  const deudasPendientes = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PENDIENTE') ?? [],
    [resumen],
  );
  const deudasPagadas = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PAGADA') ?? [],
    [resumen],
  );
  const importeFacturaPuntualNumero = useMemo(
    () => normalizarInputImporte(importeFacturaPuntual).numero ?? 0,
    [importeFacturaPuntual],
  );
  const participantesSeleccionadosFacturaPuntual = useMemo(
    () =>
      inquilinosActivos.filter(
        (inquilino) => participantesFacturaPuntual[inquilino.id] ?? true,
      ),
    [inquilinosActivos, participantesFacturaPuntual],
  );
  const repartoCalculadoFacturaPuntual = useMemo(() => {
    const totalCentimos = aCentimos(importeFacturaPuntualNumero);
    const participantesIds = participantesSeleccionadosFacturaPuntual.map((inquilino) => inquilino.id);
    const entradas = participantesIds.map((usuarioId) => ({
      usuarioId,
      normalizado: normalizarInputImporte(repartoFacturaPuntual[usuarioId] ?? ''),
    }));
    const entradasInformadas = entradas.filter((entrada) => !entrada.normalizado.vacio);
    const hayImportesInvalidos = entradas.some(
      (entrada) =>
        !entrada.normalizado.valido ||
        (entrada.normalizado.numero != null && entrada.normalizado.numero < 0),
    );

    if (participantesIds.length === 0) {
      return {
        lineas: [] as RepartoFacturaPuntualLinea[],
        total: 0,
        valido: false,
        automatico: false,
        mensaje: 'Selecciona al menos un inquilino para repartir la factura.',
      };
    }

    if (importeFacturaPuntualNumero <= 0) {
      return {
        lineas: [] as RepartoFacturaPuntualLinea[],
        total: 0,
        valido: false,
        automatico: false,
        mensaje: 'Introduce un importe total mayor que 0.',
      };
    }

    if (hayImportesInvalidos) {
      return {
        lineas: [] as RepartoFacturaPuntualLinea[],
        total: 0,
        valido: false,
        automatico: false,
        mensaje: 'Usa importes válidos y nunca negativos. El 0 sí está permitido.',
      };
    }

    if (entradasInformadas.length === 0) {
      const lineas = repartirCentimos(totalCentimos, participantesIds);
      return {
        lineas,
        total: importeFacturaPuntualNumero,
        valido: true,
        automatico: true,
        mensaje: 'Sin importes manuales: se reparte a partes iguales.',
      };
    }

    if (entradasInformadas.length !== participantesIds.length) {
      return {
        lineas: [] as RepartoFacturaPuntualLinea[],
        total: entradasInformadas.reduce(
          (total, entrada) => total + (entrada.normalizado.numero ?? 0),
          0,
        ),
        valido: false,
        automatico: false,
        mensaje: 'Para un reparto manual, rellena todos los importes seleccionados. Puedes usar 0.',
      };
    }

    const lineas = entradas.map((entrada) => ({
      usuario_id: entrada.usuarioId,
      importe: entrada.normalizado.numero ?? 0,
      automatico: false,
    }));
    const sumaCentimos = lineas.reduce((total, linea) => total + aCentimos(linea.importe), 0);

    return {
      lineas,
      total: desdeCentimos(sumaCentimos),
      valido: sumaCentimos === totalCentimos,
      automatico: false,
      mensaje:
        sumaCentimos === totalCentimos
          ? 'Reparto manual cuadrado.'
          : 'El reparto manual debe sumar exactamente el importe total.',
    };
  }, [
    importeFacturaPuntualNumero,
    participantesSeleccionadosFacturaPuntual,
    repartoFacturaPuntual,
  ]);
  const totalAsignadoFacturaPuntual = repartoCalculadoFacturaPuntual.total;
  const repartoPuntualCuadra =
    repartoCalculadoFacturaPuntual.valido && importeFacturaPuntualNumero > 0;
  const repartoPuntualAutomatico = repartoCalculadoFacturaPuntual.automatico;
  const puedeGuardarFacturaPuntual =
    conceptoFacturaPuntual.trim().length > 0 &&
    fechaFacturaPuntual.trim().length > 0 &&
    repartoPuntualCuadra &&
    !guardandoFacturaPuntual;
  const obtenerLineaRepartoCalculado = useCallback(
    (usuarioId: number) =>
      repartoCalculadoFacturaPuntual.lineas.find((linea) => linea.usuario_id === usuarioId),
    [repartoCalculadoFacturaPuntual.lineas],
  );
  const facturasEmitidas = useMemo(() => {
    if (!resumen) {
      return [];
    }

    const facturas = new Map<number, FacturaEmitida>();

    resumen.deudas.forEach((deuda) => {
      const facturaExistente = facturas.get(deuda.gasto.id);

      if (facturaExistente) {
        facturaExistente.deudas.push(deuda);
        return;
      }

      facturas.set(deuda.gasto.id, {
        id: deuda.gasto.id,
        concepto: deuda.gasto.concepto,
        importe: deuda.gasto.importe,
        factura_url: deuda.gasto.factura_url,
        fecha_creacion: deuda.gasto.fecha_creacion,
        fecha_modificacion: deuda.gasto.fecha_modificacion,
        modificado_por: deuda.gasto.modificado_por,
        deudas: [deuda],
      });
    });

    return Array.from(facturas.values()).sort(
      (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime(),
    );
  }, [resumen]);
  const facturasPrioritarias = useMemo(
    () =>
      facturasEmitidas.filter(
        (factura) =>
          perteneceAlMesActual(factura.fecha_creacion) ||
          factura.deudas.some((deuda) => deuda.estado === 'PENDIENTE'),
      ),
    [facturasEmitidas],
  );
  const gruposFacturasPasadas = useMemo(
    () =>
      agruparFacturasPorMes(
        facturasEmitidas.filter(
          (factura) =>
            !perteneceAlMesActual(factura.fecha_creacion) &&
            factura.deudas.every((deuda) => deuda.estado === 'PAGADA'),
        ),
      ),
    [facturasEmitidas],
  );

  const facturaTienePagos = facturaEditando?.deudas.some((deuda) => deuda.estado === 'PAGADA') ?? false;

  const cargarInquilinosActivos = useCallback(async (viviendaId: number) => {
    try {
      const { data } = await api.get<ViviendaDetalle>(`/viviendas/${viviendaId}`);
      const activos = data.habitaciones
        .filter((habitacion) => habitacion.es_habitable && habitacion.inquilino)
        .map((habitacion) => ({
          id: habitacion.inquilino!.id,
          nombre: habitacion.inquilino!.nombre,
          apellidos: habitacion.inquilino!.apellidos,
          avatar: null,
        }));

      setInquilinosActivos(activos);
      setRepartoFacturaPuntual((actual) => {
        const siguiente: Record<number, string> = {};
        activos.forEach((inquilino) => {
          siguiente[inquilino.id] = actual[inquilino.id] ?? '';
        });
        return siguiente;
      });
      setParticipantesFacturaPuntual((actual) => {
        const siguiente: Record<number, boolean> = {};
        activos.forEach((inquilino) => {
          siguiente[inquilino.id] = actual[inquilino.id] ?? true;
        });
        return siguiente;
      });
    } catch {
      setInquilinosActivos([]);
      setRepartoFacturaPuntual({});
      setParticipantesFacturaPuntual({});
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los inquilinos activos.' });
    }
  }, []);

  const cargarCobros = useCallback(async (viviendaId: number) => {
    setLoadingCobros(true);
    try {
      const { data } = await api.get<CobrosResponse>(`/viviendas/${viviendaId}/cobros`);
      setResumen(data);
      setErrorCobros(null);
    } catch (error: any) {
      const mensaje = error.response?.data?.error ?? 'No se pudo cargar el dashboard de cobros.';
      setResumen(null);
      setErrorCobros(mensaje);
      Toast.show({
        type: 'error',
        text1: mensaje,
      });
    } finally {
      setLoadingCobros(false);
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
        setInquilinosActivos([]);
        setErrorCobros(null);
        return;
      }

      const viviendaInicial =
        viviendasConGastos.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ??
        viviendasConGastos[0];

      setViviendaSeleccionadaId(viviendaInicial.id);
      await Promise.all([cargarCobros(viviendaInicial.id), cargarInquilinosActivos(viviendaInicial.id)]);
    } catch {
      setViviendas([]);
      setHayViviendas(false);
      setViviendaSeleccionadaId(null);
      setResumen(null);
      setErrorCobros('No se pudieron cargar tus viviendas.');
      Toast.show({ type: 'error', text1: 'No se pudieron cargar tus viviendas.' });
    } finally {
      setLoading(false);
    }
  }, [cargarCobros, cargarInquilinosActivos, viviendaSeleccionadaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  useEffect(() => onModulosViviendaActualizados(() => cargarContexto()), [cargarContexto]);

  const cambiarVivienda = async (viviendaId: number) => {
    setViviendaSeleccionadaId(viviendaId);
    await Promise.all([cargarCobros(viviendaId), cargarInquilinosActivos(viviendaId)]);
  };

  const limpiarModalFacturaPuntual = () => {
    setConceptoFacturaPuntual('');
    setFechaFacturaPuntual(new Date().toISOString().slice(0, 10));
    setImporteFacturaPuntual('');
    setFacturaAdjuntaPuntual(null);
    setRepartoFacturaPuntual(
      inquilinosActivos.reduce<Record<number, string>>((total, inquilino) => {
        total[inquilino.id] = '';
        return total;
      }, {}),
    );
    setParticipantesFacturaPuntual(
      inquilinosActivos.reduce<Record<number, boolean>>((total, inquilino) => {
        total[inquilino.id] = true;
        return total;
      }, {}),
    );
  };

  const cerrarModalFacturaPuntual = () => {
    if (guardandoFacturaPuntual) {
      return;
    }

    setModalFacturaPuntualVisible(false);
    limpiarModalFacturaPuntual();
  };

  const seleccionarFacturaPuntual = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (resultado.canceled || !resultado.assets[0]) {
      return;
    }

    setFacturaAdjuntaPuntual(resultado.assets[0]);
  };

  const actualizarRepartoPuntual = (usuarioId: number, valor: string) => {
    setRepartoFacturaPuntual((actual) => ({ ...actual, [usuarioId]: valor }));
  };

  const alternarParticipanteFacturaPuntual = (usuarioId: number) => {
    setParticipantesFacturaPuntual((actual) => ({
      ...actual,
      [usuarioId]: !(actual[usuarioId] ?? true),
    }));
  };

  const guardarFacturaPuntual = async () => {
    if (!viviendaSeleccionadaId || !puedeGuardarFacturaPuntual) {
      return;
    }

    const formData = new FormData();
    formData.append('concepto', conceptoFacturaPuntual.trim());
    formData.append('fecha', fechaFacturaPuntual.trim());
    formData.append('importe', importeFacturaPuntualNumero.toFixed(2));
    formData.append(
      'repartoManual',
      JSON.stringify(
        repartoCalculadoFacturaPuntual.lineas.map((linea) => ({
          usuario_id: linea.usuario_id,
          importe: parseFloat(linea.importe.toFixed(2)),
        })),
      ),
    );

    if (facturaAdjuntaPuntual) {
      if (Platform.OS === 'web' && facturaAdjuntaPuntual.file) {
        formData.append('factura', facturaAdjuntaPuntual.file);
      } else {
        formData.append('factura', {
          uri: facturaAdjuntaPuntual.uri,
          name: facturaAdjuntaPuntual.name ?? `factura-${Date.now()}`,
          type: facturaAdjuntaPuntual.mimeType ?? 'application/octet-stream',
        } as never);
      }
    }

    setGuardandoFacturaPuntual(true);
    try {
      await api.post(`/viviendas/${viviendaSeleccionadaId}/gastos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await cargarCobros(viviendaSeleccionadaId);
      setModalFacturaPuntualVisible(false);
      limpiarModalFacturaPuntual();
      Toast.show({
        type: 'success',
        text1: 'Factura registrada',
        text2: `${conceptoFacturaPuntual.trim()} queda repartida entre los inquilinos.`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo registrar la factura puntual.',
      });
    } finally {
      setGuardandoFacturaPuntual(false);
    }
  };

  const abrirUrlFactura = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo abrir la factura.' });
    }
  };

  const abrirFacturaEmitida = (factura: FacturaEmitida) => {
    if (!factura.factura_url) {
      return;
    }

    if (factura.factura_url.toLowerCase().includes('.pdf')) {
      abrirUrlFactura(factura.factura_url);
      return;
    }

    setFacturaVisualizando(factura);
  };

  const abrirEditorFactura = (factura: FacturaEmitida) => {
    const pagosRegistrados = factura.deudas.some((deuda) => deuda.estado === 'PAGADA');

    if (pagosRegistrados) {
      Toast.show({
        type: 'info',
        text1: 'Factura bloqueada',
        text2: 'Ya hay pagos registrados y no se puede modificar.',
      });
      return;
    }

    setFacturaEditando(factura);
    setConceptoEditado(factura.concepto);
    setImporteEditado(String(factura.importe).replace('.', ','));
    setFechaEditada(factura.fecha_creacion.slice(0, 10));
  };

  const alternarGrupoFacturas = (grupoKey: string) => {
    setGruposFacturasExpandidos((actual) => ({
      ...actual,
      [grupoKey]: !actual[grupoKey],
    }));
  };

  const cerrarEditorFactura = () => {
    if (guardandoFactura) {
      return;
    }

    setFacturaEditando(null);
    setConceptoEditado('');
    setImporteEditado('');
    setFechaEditada('');
  };

  const guardarFactura = async () => {
    if (!facturaEditando || !viviendaSeleccionadaId) {
      return;
    }

    const conceptoNormalizado = conceptoEditado.trim();
    const importeNormalizado = Number(importeEditado.replace(',', '.'));
    const fechaNormalizada = fechaEditada.trim();

    if (!conceptoNormalizado) {
      Toast.show({ type: 'error', text1: 'El concepto no puede estar vacío.' });
      return;
    }

    if (!facturaTienePagos && (!Number.isFinite(importeNormalizado) || importeNormalizado <= 0)) {
      Toast.show({ type: 'error', text1: 'Introduce un importe válido mayor que 0.' });
      return;
    }

    if (!fechaNormalizada || Number.isNaN(new Date(fechaNormalizada).getTime())) {
      Toast.show({ type: 'error', text1: 'Introduce una fecha válida.' });
      return;
    }

    setGuardandoFactura(true);
    try {
      const payload: { concepto: string; fecha: string; importe?: number } = {
        concepto: conceptoNormalizado,
        fecha: fechaNormalizada,
      };

      if (!facturaTienePagos) {
        payload.importe = importeNormalizado;
      }

      const { data } = await api.patch<GastoActualizadoResponse>(
        `/viviendas/${viviendaSeleccionadaId}/gastos/${facturaEditando.id}`,
        payload,
      );

      aplicarGastoEnCobros(data);

      setFacturaEditando(null);
      setConceptoEditado('');
      setImporteEditado('');
      setFechaEditada('');
      Toast.show({ type: 'success', text1: 'Factura actualizada.' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo actualizar la factura.',
      });
    } finally {
      setGuardandoFactura(false);
    }
  };

  const aplicarGastoEnCobros = (gasto: GastoActualizadoResponse) => {
    setResumen((resumenActual) => {
      if (!resumenActual) {
        return resumenActual;
      }

      const deudasActualizadas = resumenActual.deudas.map((deuda) => {
        if (deuda.gasto.id !== gasto.id) {
          return deuda;
        }

        const deudaActualizada = gasto.deudas.find((item) => item.id === deuda.id);

        return {
          ...deuda,
          importe: deudaActualizada?.importe ?? deuda.importe,
          estado: deudaActualizada?.estado ?? deuda.estado,
          gasto: {
            ...deuda.gasto,
            concepto: gasto.concepto,
            importe: gasto.importe,
            factura_url: gasto.factura_url,
            fecha_creacion: gasto.fecha_creacion,
            fecha_modificacion: gasto.fecha_modificacion,
            modificado_por: gasto.modificado_por,
          },
        };
      });

      return {
        ...resumenActual,
        resumen: recalcularResumenCobros(deudasActualizadas),
        deudas: deudasActualizadas,
      };
    });
  };

  const subirFotoFactura = async () => {
    if (!facturaEditando || !viviendaSeleccionadaId) {
      return;
    }

    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Toast.show({
          type: 'info',
          text1: 'Permiso necesario',
          text2: 'Necesitamos acceso a tu galería para adjuntar la factura.',
        });
        return;
      }
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });

    if (resultado.canceled || !resultado.assets[0]) {
      return;
    }

    const asset = resultado.assets[0];
    const formData = new FormData();

    if (Platform.OS === 'web' && asset.file) {
      formData.append('factura', asset.file);
    } else {
      formData.append('factura', {
        uri: asset.uri,
        name: asset.fileName ?? `factura-${facturaEditando.id}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as never);
    }

    setSubiendoFactura(true);
    try {
      const { data } = await api.post<GastoActualizadoResponse>(
        `/viviendas/${viviendaSeleccionadaId}/gastos/${facturaEditando.id}/factura`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      aplicarGastoEnCobros(data);
      setFacturaEditando((facturaActual) =>
        facturaActual
          ? {
              ...facturaActual,
              factura_url: data.factura_url,
              fecha_modificacion: data.fecha_modificacion,
              modificado_por: data.modificado_por,
            }
          : facturaActual,
      );
      Toast.show({ type: 'success', text1: 'Foto de factura subida.' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo subir la foto de la factura.',
      });
    } finally {
      setSubiendoFactura(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!viviendas.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="home-outline" size={44} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Primero añade una vivienda</Text>
          <Text style={styles.emptySubtitle}>
            El dashboard de cobros aparecerá aquí en cuanto tengas una propiedad creada.
          </Text>
          <CustomButton
            label={hayViviendas ? 'Ver viviendas' : 'Crear vivienda'}
            onPress={() => router.push(hayViviendas ? '/casero/viviendas' : '/casero/nueva-vivienda')}
            style={styles.emptyAction}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Dashboard financiero</Text>
          <Text style={styles.headerTitle}>Cobros del mes</Text>
          <Text style={styles.headerSubtitle}>
            Controla qué recibos ya han entrado y qué importes siguen pendientes de cobro.
          </Text>
        </View>

        {viviendas.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viviendaSelectorContent}
            style={styles.viviendaSelector}
          >
            {viviendas.map((vivienda) => {
              const activa = vivienda.id === viviendaSeleccionadaId;
              return (
                <Pressable
                  key={vivienda.id}
                  style={[styles.viviendaChip, activa && styles.viviendaChipActive]}
                  onPress={() => cambiarVivienda(vivienda.id)}
                >
                  <Text
                    style={[
                      styles.viviendaChipText,
                      activa && styles.viviendaChipTextActive,
                    ]}
                  >
                    {vivienda.alias_nombre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {resumen && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>Vivienda activa</Text>
              <Text style={styles.heroTitle}>{resumen.vivienda.alias_nombre}</Text>
              <Text style={styles.heroAddress}>{resumen.vivienda.direccion}</Text>
            </View>

            <View style={styles.heroAmounts}>
              <View style={[styles.heroAmountCard, styles.heroAmountCardPaid]}>
                <Text style={[styles.heroAmountLabel, styles.heroAmountLabelPaid]}>
                  Ingresado
                </Text>
                <Text style={styles.heroAmountValue}>
                  {formatearImporte(resumen.resumen.total_pagado_mes)}
                </Text>
                <Text style={styles.heroAmountHelp}>Recibos marcados como pagados este mes</Text>
              </View>

              <View style={[styles.heroAmountCard, styles.heroAmountCardPending]}>
                <Text style={[styles.heroAmountLabel, styles.heroAmountLabelPending]}>
                  Pendiente
                </Text>
                <Text style={styles.heroAmountValue}>
                  {formatearImporte(resumen.resumen.total_pendiente)}
                </Text>
                <Text style={styles.heroAmountHelp}>Importe aún abierto por cobrar</Text>
              </View>
            </View>
          </View>
        )}

        <CustomButton
          label="Nueva Factura Puntual (Luz, Agua...)"
          variant="secondary"
          onPress={() => setModalFacturaPuntualVisible(true)}
          disabled={!!errorCobros || !viviendaSeleccionadaId}
          style={styles.invoiceButton}
        />

        {errorCobros && !loadingCobros && (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={22} color={theme.colors.danger} />
            </View>
            <View style={styles.errorTextBox}>
              <Text style={styles.errorTitle}>No se pudieron cargar los cobros</Text>
              <Text style={styles.errorText}>{errorCobros}</Text>
            </View>
          </View>
        )}

        {resumen && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Facturas emitidas</Text>
              <Text style={styles.sectionSubtitle}>
                Revisa primero las facturas actuales o pendientes y consulta el histórico por mes.
              </Text>
            </View>

            {facturasEmitidas.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="receipt-outline" size={40} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Sin facturas emitidas</Text>
                <Text style={styles.emptySubtitle}>
                  Las mensualidades generadas aparecerán aquí para poder revisarlas.
                </Text>
              </View>
            ) : (
              <View style={styles.invoiceList}>
                {facturasPrioritarias.length > 0 && (
                  <View style={styles.currentInvoiceList}>
                    {facturasPrioritarias.map((factura) => (
                      <FacturaCard
                        key={factura.id}
                        factura={factura}
                        styles={styles}
                        theme={theme}
                        onEditar={abrirEditorFactura}
                        onVerFactura={abrirFacturaEmitida}
                      />
                    ))}
                  </View>
                )}

                {gruposFacturasPasadas.map((grupo) => (
                  <AccordionSection
                    key={grupo.key}
                    title={grupo.titulo}
                    subtitle={`${grupo.facturas.length} facturas cerradas`}
                    meta={formatearImporte(grupo.total)}
                    expanded={!!gruposFacturasExpandidos[grupo.key]}
                    onToggle={() => alternarGrupoFacturas(grupo.key)}
                  >
                    {grupo.facturas.map((factura) => (
                      <FacturaCard
                        key={factura.id}
                        factura={factura}
                        styles={styles}
                        theme={theme}
                        onEditar={abrirEditorFactura}
                        onVerFactura={abrirFacturaEmitida}
                      />
                    ))}
                  </AccordionSection>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pendientes de cobro</Text>
            <Text style={styles.sectionSubtitle}>
              Recibos del mes actual que todavía no han sido marcados como pagados.
            </Text>
          </View>

          {loadingCobros ? (
            <LoadingScreen />
          ) : errorCobros ? null : deudasPendientes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="checkmark-done-outline" size={40} color={theme.colors.success} />
              </View>
              <Text style={styles.emptyTitle}>Nada pendiente por ahora</Text>
              <Text style={styles.emptySubtitle}>
                Cuando haya importes abiertos para esta vivienda aparecerán aquí agrupados.
              </Text>
            </View>
          ) : (
            <View style={styles.debtList}>
              {deudasPendientes.map((deuda) => (
                <DeudaCard
                  key={deuda.id}
                  deuda={deuda}
                  styles={styles}
                  theme={theme}
                  estadoBadgeColors={estadoBadgeColors}
                  onVerJustificante={setJustificanteSeleccionado}
                  onVerFactura={abrirUrlFactura}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cobrados</Text>
            <Text style={styles.sectionSubtitle}>
              Pagos ya registrados, con acceso rápido al justificante cuando existe.
            </Text>
          </View>

          {errorCobros ? null : deudasPagadas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="wallet-outline" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Todavía no hay cobros cerrados</Text>
              <Text style={styles.emptySubtitle}>
                En cuanto un inquilino marque una deuda como pagada la verás aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.debtList}>
              {deudasPagadas.map((deuda) => (
                <DeudaCard
                  key={deuda.id}
                  deuda={deuda}
                  styles={styles}
                  theme={theme}
                  estadoBadgeColors={estadoBadgeColors}
                  onVerJustificante={setJustificanteSeleccionado}
                  onVerFactura={abrirUrlFactura}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!justificanteSeleccionado}
        transparent
        animationType="slide"
        onRequestClose={() => setJustificanteSeleccionado(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setJustificanteSeleccionado(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Justificante</Text>
            <Text style={styles.modalSubtitle}>
              {justificanteSeleccionado
                ? `${nombreCompleto(justificanteSeleccionado.deudor.nombre, justificanteSeleccionado.deudor.apellidos)} · ${justificanteSeleccionado.gasto.concepto}`
                : ''}
            </Text>

            {justificanteSeleccionado?.justificante_url && (
              <View style={styles.modalImageWrap}>
                <Image
                  source={{ uri: justificanteSeleccionado.justificante_url }}
                  contentFit="contain"
                  style={styles.modalImage}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton
                label="Cerrar"
                variant="secondary"
                onPress={() => setJustificanteSeleccionado(null)}
                style={styles.modalAction}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalFacturaPuntualVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModalFacturaPuntual}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModalFacturaPuntual} />
          <View style={styles.invoiceSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.invoiceContent}>
              <Text style={styles.modalTitle}>Nueva factura puntual</Text>
              <Text style={styles.modalSubtitle}>
                Luz, agua, gas o cualquier recibo con una parte distinta para cada inquilino.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Concepto</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. Factura de luz marzo"
                  placeholderTextColor={theme.colors.textMuted}
                  value={conceptoFacturaPuntual}
                  onChangeText={setConceptoFacturaPuntual}
                  maxLength={120}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formRowItem}>
                  <Text style={styles.inputLabel}>Periodo / fecha</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="2026-04-11"
                    placeholderTextColor={theme.colors.textMuted}
                    value={fechaFacturaPuntual}
                    onChangeText={setFechaFacturaPuntual}
                  />
                </View>
                <View style={styles.formRowItem}>
                  <Text style={styles.inputLabel}>Importe total</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0,00"
                    placeholderTextColor={theme.colors.textMuted}
                    value={importeFacturaPuntual}
                    onChangeText={setImporteFacturaPuntual}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Pressable style={styles.attachmentButton} onPress={seleccionarFacturaPuntual}>
                <View style={styles.attachmentIcon}>
                  <Ionicons name="document-attach-outline" size={20} color={theme.colors.info} />
                </View>
                <View style={styles.attachmentTextBox}>
                  <Text style={styles.attachmentTitle}>
                    {facturaAdjuntaPuntual
                      ? facturaAdjuntaPuntual.name
                      : 'Adjuntar foto o PDF (opcional)'}
                  </Text>
                  <Text style={styles.attachmentSubtitle}>
                    {facturaAdjuntaPuntual
                      ? 'Archivo preparado para subir'
                      : 'Puedes guardar la factura sin adjuntar archivo'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </Pressable>

              <View style={styles.splitHeader}>
                <Text style={styles.sectionTitle}>Reparto de la factura</Text>
                <Text style={styles.sectionSubtitle}>
                  Deja todos los importes vacíos para repartir a partes iguales. Si rellenas uno,
                  completa todos los seleccionados; el 0 marca que no paga esta factura.
                </Text>
              </View>

              <View style={styles.tenantList}>
                {inquilinosActivos.map((inquilino) => {
                  const seleccionado = participantesFacturaPuntual[inquilino.id] ?? true;
                  const lineaCalculada = obtenerLineaRepartoCalculado(inquilino.id);
                  const importeCalculado = lineaCalculada?.importe ?? 0;
                  const inputInformado = !normalizarInputImporte(
                    repartoFacturaPuntual[inquilino.id] ?? '',
                  ).vacio;

                  return (
                    <View
                      key={inquilino.id}
                      style={[styles.tenantRow, !seleccionado && styles.tenantRowDisabled]}
                    >
                      <Pressable
                        style={[
                          styles.participantToggle,
                          seleccionado && styles.participantToggleActive,
                        ]}
                        onPress={() => alternarParticipanteFacturaPuntual(inquilino.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: seleccionado }}
                        accessibilityLabel={`Incluir a ${nombreCompleto(
                          inquilino.nombre,
                          inquilino.apellidos,
                        )} en el reparto`}
                      >
                        {seleccionado && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
                        )}
                      </Pressable>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {obtenerIniciales(inquilino.nombre, inquilino.apellidos)}
                        </Text>
                      </View>
                      <View style={styles.tenantInfo}>
                        <Text style={styles.debtName} numberOfLines={1}>
                          {nombreCompleto(inquilino.nombre, inquilino.apellidos)}
                        </Text>
                        <Text style={styles.debtDate}>
                          {!seleccionado
                            ? 'No incluido'
                            : importeCalculado === 0 && (inputInformado || repartoPuntualAutomatico)
                              ? 'No paga esta factura'
                              : `Paga ${formatearImporte(importeCalculado)}`}
                        </Text>
                      </View>
                      <TextInput
                        style={[styles.splitInput, !seleccionado && styles.splitInputDisabled]}
                        placeholder={
                          repartoPuntualAutomatico ? formatearImporte(importeCalculado) : '0,00'
                        }
                        placeholderTextColor={theme.colors.textMuted}
                        value={repartoFacturaPuntual[inquilino.id] ?? ''}
                        onChangeText={(valor) => actualizarRepartoPuntual(inquilino.id, valor)}
                        keyboardType="decimal-pad"
                        editable={seleccionado}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={[styles.totalCounter, repartoPuntualCuadra && styles.totalCounterOk]}>
                <Text style={[styles.totalCounterText, repartoPuntualCuadra && styles.totalCounterTextOk]}>
                  Total asignado: {formatearImporte(totalAsignadoFacturaPuntual)} /{' '}
                  {formatearImporte(importeFacturaPuntualNumero)}
                </Text>
                <Text style={[styles.totalCounterHelp, repartoPuntualCuadra && styles.totalCounterHelpOk]}>
                  {repartoCalculadoFacturaPuntual.mensaje}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <CustomButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={cerrarModalFacturaPuntual}
                  disabled={guardandoFacturaPuntual}
                  style={styles.modalAction}
                />
                <CustomButton
                  label={guardandoFacturaPuntual ? 'Guardando...' : 'Guardar'}
                  onPress={guardarFacturaPuntual}
                  disabled={!puedeGuardarFacturaPuntual}
                  style={styles.modalAction}
                />
              </View>
              {guardandoFacturaPuntual && <ActivityIndicator color={theme.colors.primary} />}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!facturaEditando}
        transparent
        animationType="slide"
        onRequestClose={cerrarEditorFactura}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={cerrarEditorFactura} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Editar factura</Text>
            <Text style={styles.modalSubtitle}>
              Actualiza los datos del recibo y se reflejará en los cobros abiertos.
            </Text>

            {facturaTienePagos && (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} />
                <Text style={styles.warningBannerText}>
                  El importe no puede modificarse porque ya existen pagos parciales. Cancela los cobros primero.
                </Text>
              </View>
            )}

            <View style={styles.editForm}>
              <CustomInput
                label="Concepto"
                value={conceptoEditado}
                onChangeText={setConceptoEditado}
                placeholder="Mensualidad abril"
                autoCapitalize="sentences"
              />
              <CustomInput
                label="Importe"
                value={importeEditado}
                onChangeText={setImporteEditado}
                placeholder="850"
                keyboardType="decimal-pad"
                editable={!facturaTienePagos}
              />
              <CustomInput
                label="Periodo / fecha"
                value={fechaEditada}
                onChangeText={setFechaEditada}
                placeholder="2026-04-11"
                editable={!facturaTienePagos}
              />
            </View>

            <View style={styles.invoicePhotoBlock}>
              <View style={styles.invoicePhotoHeader}>
                <View style={styles.invoicePhotoIcon}>
                  <Ionicons name="image-outline" size={18} color={theme.colors.info} />
                </View>
                <View style={styles.invoicePhotoCopy}>
                  <Text style={styles.invoicePhotoTitle}>Foto de la factura</Text>
                  <Text style={styles.invoicePhotoSubtitle}>
                    {facturaEditando?.factura_url
                      ? 'Factura adjunta disponible.'
                      : 'Adjunta una imagen para conservar el recibo original.'}
                  </Text>
                </View>
              </View>

              {facturaEditando?.factura_url && (
                <Pressable
                  style={styles.invoicePhotoPreview}
                  onPress={() => setFacturaVisualizando(facturaEditando)}
                >
                  <Image
                    source={{ uri: facturaEditando.factura_url }}
                    contentFit="cover"
                    style={styles.invoicePhotoImage}
                  />
                </Pressable>
              )}

              <CustomButton
                label={
                  subiendoFactura
                    ? 'Subiendo...'
                    : facturaEditando?.factura_url
                      ? 'Reemplazar foto'
                      : 'Subir foto'
                }
                variant="outline"
                onPress={subirFotoFactura}
                disabled={subiendoFactura}
              />
            </View>

            <View style={styles.modalActions}>
              <CustomButton
                label="Cancelar"
                variant="secondary"
                onPress={cerrarEditorFactura}
                disabled={guardandoFactura}
                style={styles.modalAction}
              />
              <CustomButton
                label={guardandoFactura ? 'Guardando...' : 'Guardar'}
                onPress={guardarFactura}
                disabled={guardandoFactura}
                style={styles.modalAction}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!facturaVisualizando}
        transparent
        animationType="fade"
        onRequestClose={() => setFacturaVisualizando(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setFacturaVisualizando(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Factura adjunta</Text>
            <Text style={styles.modalSubtitle}>
              {facturaVisualizando?.concepto ?? ''}
            </Text>

            {facturaVisualizando?.factura_url && (
              <View style={styles.modalImageWrap}>
                <Image
                  source={{ uri: facturaVisualizando.factura_url }}
                  contentFit="contain"
                  style={styles.modalImage}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton
                label="Cerrar"
                variant="secondary"
                onPress={() => setFacturaVisualizando(null)}
                style={styles.modalAction}
              />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function FacturaCard({
  factura,
  styles,
  theme,
  onEditar,
  onVerFactura,
}: {
  factura: FacturaEmitida;
  styles: CobrosStyles;
  theme: AppTheme;
  onEditar: (factura: FacturaEmitida) => void;
  onVerFactura: (factura: FacturaEmitida) => void;
}) {
  const pagosRegistrados = factura.deudas.some((deuda) => deuda.estado === 'PAGADA');
  const pendientes = factura.deudas.filter((deuda) => deuda.estado === 'PENDIENTE').length;

  return (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceIcon}>
          <Ionicons name="receipt-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.invoiceBody}>
          <Text style={styles.invoiceConcept} numberOfLines={2}>
            {factura.concepto}
          </Text>
          <Text style={styles.invoiceMeta}>
            {formatearFecha(factura.fecha_creacion)} - {factura.deudas.length} cobros
          </Text>
        </View>
        <Pressable
          style={[
            styles.invoiceEditButton,
            pagosRegistrados && styles.invoiceEditButtonDisabled,
          ]}
          onPress={() => onEditar(factura)}
          accessibilityRole="button"
          accessibilityLabel={`Editar factura ${factura.concepto}`}
          accessibilityState={{ disabled: pagosRegistrados }}
        >
          <Ionicons
            name={pagosRegistrados ? 'lock-closed-outline' : 'create-outline'}
            size={18}
            color={pagosRegistrados ? theme.colors.textMuted : theme.colors.primary}
          />
          <Text
            style={[
              styles.invoiceEditText,
              pagosRegistrados && styles.invoiceEditTextDisabled,
            ]}
          >
            {pagosRegistrados ? 'Bloqueada' : 'Editar'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.invoiceFooter}>
        <Text style={styles.invoiceAmount}>{formatearImporte(factura.importe)}</Text>
        <Text style={styles.invoiceStatus}>
          {pagosRegistrados ? 'Con pagos registrados' : `${pendientes} pendientes`}
        </Text>
      </View>

      {factura.factura_url && (
        <Pressable style={styles.receiptLink} onPress={() => onVerFactura(factura)}>
          <Ionicons name="image-outline" size={15} color={theme.colors.info} />
          <Text style={styles.receiptLinkText}>Ver factura</Text>
        </Pressable>
      )}

      {factura.fecha_modificacion && factura.modificado_por && (
        <Text style={styles.invoiceTrace}>
          Editada el {formatearFecha(factura.fecha_modificacion)} por{' '}
          {nombreCompleto(factura.modificado_por.nombre, factura.modificado_por.apellidos)}
        </Text>
      )}
    </View>
  );
}

function DeudaCard({
  deuda,
  styles,
  theme,
  estadoBadgeColors,
  onVerJustificante,
  onVerFactura,
}: {
  deuda: DeudaCobro;
  styles: CobrosStyles;
  theme: AppTheme;
  estadoBadgeColors: EstadoBadgeColors;
  onVerJustificante: (deuda: DeudaCobro) => void;
  onVerFactura: (url: string) => void;
}) {
  return (
    <View style={styles.debtCard}>
      <View style={styles.debtRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {obtenerIniciales(deuda.deudor.nombre, deuda.deudor.apellidos)}
          </Text>
        </View>

        <View style={styles.debtBody}>
          <Text style={styles.debtName} numberOfLines={1}>
            {nombreCompleto(deuda.deudor.nombre, deuda.deudor.apellidos)}
          </Text>
          <Text style={styles.debtConcept} numberOfLines={2}>
            {deuda.gasto.concepto}
          </Text>
          <Text style={styles.debtDate}>{formatearFecha(deuda.gasto.fecha_creacion)}</Text>
        </View>

        <View style={styles.debtMeta}>
          <Text style={styles.debtAmount}>{formatearImporte(deuda.importe)}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: estadoBadgeColors.bg[deuda.estado],
                borderColor: estadoBadgeColors.border[deuda.estado],
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: estadoBadgeColors.text[deuda.estado] },
              ]}
            >
              {deuda.estado}
            </Text>
          </View>
        </View>
      </View>

      {deuda.estado === 'PAGADA' && deuda.justificante_url && (
        <Pressable style={styles.receiptLink} onPress={() => onVerJustificante(deuda)}>
          <Ionicons name="image-outline" size={15} color={theme.colors.info} />
          <Text style={styles.receiptLinkText}>Ver justificante</Text>
        </Pressable>
      )}

      {deuda.gasto.factura_url && (
        <Pressable style={styles.invoiceLink} onPress={() => onVerFactura(deuda.gasto.factura_url!)}>
          <Ionicons name="document-text-outline" size={15} color={theme.colors.primary} />
          <Text style={styles.invoiceLinkText}>Ver factura original</Text>
        </Pressable>
      )}
    </View>
  );
}

function nombreCompleto(nombre: string, apellidos: string | null) {
  return apellidos ? `${nombre} ${apellidos}` : nombre;
}
