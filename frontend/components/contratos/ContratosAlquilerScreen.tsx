import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { CustomButton } from '@/components/common/CustomButton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { AppTheme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import { createStyles, getContratoStatusColors } from '@/styles/contratos/contratos.styles';

type Rol = 'CASERO' | 'INQUILINO';
type EstadoContrato = 'BORRADOR' | 'PENDIENTE_FIRMA' | 'FIRMADO' | 'RECHAZADO' | 'ANULADO';
type Styles = ReturnType<typeof createStyles>;
type StatusColors = ReturnType<typeof getContratoStatusColors>;

type UsuarioResumen = { id: number; nombre: string; apellidos: string | null; documento_identidad?: string | null };
type HabitacionResumen = {
  id: number;
  nombre: string;
  tipo: string;
  precio: number | null;
  inquilino_id?: number | null;
  inquilino?: UsuarioResumen | null;
};
type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  mod_gastos?: boolean;
  habitaciones?: HabitacionResumen[];
};
type Contrato = {
  id: number;
  version: number;
  estado: EstadoContrato;
  documento_url: string;
  documento_nombre: string | null;
  documento_hash: string;
  renta_mensual: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  enviado_en: string | null;
  firmado_en: string | null;
  rechazado_en: string | null;
  habitacion: { id: number; nombre: string; tipo: string } | null;
  inquilino: UsuarioResumen;
  vivienda: { id: number; alias_nombre: string; direccion: string };
};

const estadoLabel: Record<EstadoContrato, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_FIRMA: 'Pendiente de firma',
  FIRMADO: 'Firmado',
  RECHAZADO: 'Rechazado',
  ANULADO: 'Anulado',
};

const nombreCompleto = (usuario: UsuarioResumen) =>
  usuario.apellidos ? `${usuario.nombre} ${usuario.apellidos}` : usuario.nombre;

const formatearImporte = (importe: number) =>
  importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const formatearFecha = (fecha: string | null) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Sin fin';

const obtenerHabitacionesConInquilino = (vivienda: Vivienda | null) =>
  (vivienda?.habitaciones ?? []).filter((habitacion) => habitacion.tipo === 'DORMITORIO' && habitacion.inquilino);

export function ContratosAlquilerScreen({ rol }: { rol: Rol }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusColors = useMemo(() => getContratoStatusColors(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [loadingContratos, setLoadingContratos] = useState(false);
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [habitacionId, setHabitacionId] = useState<number | null>(null);
  const [renta, setRenta] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaFin, setFechaFin] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [firmandoId, setFirmandoId] = useState<number | null>(null);

  const viviendaSeleccionada = useMemo(
    () => viviendas.find((vivienda) => vivienda.id === viviendaId) ?? null,
    [viviendaId, viviendas],
  );
  const habitacionesConInquilino = useMemo(
    () => obtenerHabitacionesConInquilino(viviendaSeleccionada),
    [viviendaSeleccionada],
  );
  const habitacionSeleccionada = useMemo(
    () => habitacionesConInquilino.find((habitacion) => habitacion.id === habitacionId) ?? null,
    [habitacionId, habitacionesConInquilino],
  );

  const cargarContratos = useCallback(async (id: number) => {
    setLoadingContratos(true);
    try {
      const { data } = await api.get<Contrato[]>(`/viviendas/${id}/contratos`);
      setContratos(data);
    } catch (error: any) {
      setContratos([]);
      Toast.show({ type: 'error', text1: error.response?.data?.error ?? 'No se pudieron cargar los contratos.' });
    } finally {
      setLoadingContratos(false);
    }
  }, []);

  const cargarContexto = useCallback(async () => {
    setLoading(true);
    try {
      if (rol === 'CASERO') {
        const { data } = await api.get<Vivienda[]>('/viviendas');
        const activas = data.filter((vivienda) => vivienda.mod_gastos !== false);
        setViviendas(activas);
        const inicial = activas.find((vivienda) => vivienda.id === viviendaId) ?? activas[0] ?? null;
        setViviendaId(inicial?.id ?? null);
        const primeraHab = obtenerHabitacionesConInquilino(inicial)[0] ?? null;
        setHabitacionId((actual) => actual ?? primeraHab?.id ?? null);
        if (inicial) await cargarContratos(inicial.id);
      } else {
        const { data } = await api.get<{ miHabitacionId: number; vivienda: Vivienda }>('/inquilino/vivienda');
        setViviendas([data.vivienda]);
        setViviendaId(data.vivienda.id);
        setHabitacionId(data.miHabitacionId);
        await cargarContratos(data.vivienda.id);
      }
    } catch {
      setViviendas([]);
      setViviendaId(null);
      setContratos([]);
    } finally {
      setLoading(false);
    }
  }, [cargarContratos, rol, viviendaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  const seleccionarDocumento = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!resultado.canceled) {
      setAsset(resultado.assets[0]);
    }
  };

  const cambiarVivienda = async (id: number) => {
    setViviendaId(id);
    const vivienda = viviendas.find((item) => item.id === id) ?? null;
    const primeraHab = obtenerHabitacionesConInquilino(vivienda)[0] ?? null;
    setHabitacionId(primeraHab?.id ?? null);
    setRenta(primeraHab?.precio ? String(primeraHab.precio).replace('.', ',') : '');
    await cargarContratos(id);
  };

  const subirContrato = async () => {
    if (!viviendaSeleccionada || !asset || !habitacionSeleccionada?.inquilino) return;

    const rentaNumerica = Number(renta.trim().replace(',', '.'));
    if (!Number.isFinite(rentaNumerica) || rentaNumerica <= 0) {
      Toast.show({ type: 'error', text1: 'Indica una renta mensual valida.' });
      return;
    }

    const formData = new FormData();
    formData.append('contrato', {
      uri: asset.uri,
      name: asset.name ?? 'contrato.pdf',
      type: asset.mimeType ?? 'application/pdf',
    } as any);
    formData.append('habitacion_id', String(habitacionSeleccionada.id));
    formData.append('inquilino_id', String(habitacionSeleccionada.inquilino.id));
    formData.append('renta_mensual', String(rentaNumerica));
    formData.append('fecha_inicio', fechaInicio);
    if (fechaFin.trim()) formData.append('fecha_fin', fechaFin.trim());

    setSubiendo(true);
    try {
      await api.post(`/viviendas/${viviendaSeleccionada.id}/contratos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAsset(null);
      Toast.show({ type: 'success', text1: 'Contrato enviado a firma.' });
      await cargarContratos(viviendaSeleccionada.id);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.error ?? 'No se pudo subir el contrato.' });
    } finally {
      setSubiendo(false);
    }
  };

  const cambiarEstadoInquilino = async (contrato: Contrato, accion: 'firmar' | 'rechazar') => {
    setFirmandoId(contrato.id);
    try {
      await api.patch(`/viviendas/${contrato.vivienda.id}/contratos/${contrato.id}/${accion}`);
      Toast.show({ type: 'success', text1: accion === 'firmar' ? 'Contrato firmado.' : 'Contrato rechazado.' });
      await cargarContratos(contrato.vivienda.id);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.error ?? 'No se pudo actualizar el contrato.' });
    } finally {
      setFirmandoId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{rol === 'CASERO' ? 'Contratos' : 'Mi contrato'}</Text>
          <Text style={styles.title}>{rol === 'CASERO' ? 'Contratos de alquiler' : 'Firma del alquiler'}</Text>
          <Text style={styles.subtitle}>
            {rol === 'CASERO'
              ? 'Sube el documento asociado a una habitacion y conserva versiones, hash y estado de firma.'
              : 'Abre el documento completo antes de firmarlo o rechazarlo desde la app.'}
          </Text>
        </View>

        <View style={styles.warning}>
          <Ionicons name="shield-checkmark-outline" size={19} color={theme.colors.warningText} />
          <Text style={styles.warningText}>
            La aceptacion interna deja trazabilidad operativa. Si necesitas firma electronica avanzada o cualificada,
            revisa el caso con soporte legal y un proveedor especializado.
          </Text>
        </View>

        {viviendas.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContent}>
            {viviendas.map((vivienda) => {
              const activa = vivienda.id === viviendaId;
              return (
                <Pressable
                  key={vivienda.id}
                  style={[styles.chip, activa && styles.chipActive]}
                  onPress={() => cambiarVivienda(vivienda.id)}
                >
                  <Text style={[styles.chipText, activa && styles.chipTextActive]}>{vivienda.alias_nombre}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {rol === 'CASERO' && viviendaSeleccionada && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Enviar nuevo contrato</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Habitacion e inquilino</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContent}>
                {habitacionesConInquilino.map((habitacion) => {
                  const activa = habitacion.id === habitacionId;
                  return (
                    <Pressable
                      key={habitacion.id}
                      style={[styles.chip, activa && styles.chipActive]}
                      onPress={() => {
                        setHabitacionId(habitacion.id);
                        setRenta(habitacion.precio ? String(habitacion.precio).replace('.', ',') : '');
                      }}
                    >
                      <Text style={[styles.chipText, activa && styles.chipTextActive]}>
                        {habitacion.nombre} - {habitacion.inquilino ? nombreCompleto(habitacion.inquilino) : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Renta mensual</Text>
                <TextInput
                  style={styles.input}
                  value={renta}
                  onChangeText={setRenta}
                  placeholder="450"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Inicio</Text>
                <TextInput
                  style={styles.input}
                  value={fechaInicio}
                  onChangeText={setFechaInicio}
                  placeholder="2026-06-01"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Fin opcional</Text>
              <TextInput
                style={styles.input}
                value={fechaFin}
                onChangeText={setFechaFin}
                placeholder="2027-05-31"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <Pressable
              style={[styles.smallButton, { backgroundColor: theme.colors.infoLight, alignSelf: 'flex-start' }]}
              onPress={seleccionarDocumento}
            >
              <Ionicons name="document-attach-outline" size={16} color={theme.colors.info} />
              <Text style={[styles.smallButtonText, { color: theme.colors.info }]}>
                {asset?.name ?? 'Elegir PDF o imagen'}
              </Text>
            </Pressable>
            <CustomButton
              label={subiendo ? 'Subiendo...' : 'Subir y enviar a firma'}
              onPress={subirContrato}
              disabled={subiendo || !asset || !habitacionSeleccionada}
            />
          </View>
        )}

        {loadingContratos ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : contratos.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={42} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>Sin contratos todavia</Text>
            <Text style={styles.emptyText}>
              {rol === 'CASERO'
                ? 'Cuando subas un documento aparecera aqui con su version y estado.'
                : 'Tu casero todavia no ha enviado un contrato para revisar.'}
            </Text>
          </View>
        ) : (
          contratos.map((contrato) => (
            <ContratoCard
              key={contrato.id}
              contrato={contrato}
              rol={rol}
              styles={styles}
              theme={theme}
              statusColors={statusColors}
              busy={firmandoId === contrato.id}
              onFirmar={() => cambiarEstadoInquilino(contrato, 'firmar')}
              onRechazar={() => cambiarEstadoInquilino(contrato, 'rechazar')}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ContratoCard({
  contrato,
  rol,
  styles,
  theme,
  statusColors,
  busy,
  onFirmar,
  onRechazar,
}: {
  contrato: Contrato;
  rol: Rol;
  styles: Styles;
  theme: AppTheme;
  statusColors: StatusColors;
  busy: boolean;
  onFirmar: () => void;
  onRechazar: () => void;
}) {
  const colors = statusColors[contrato.estado];
  const puedeFirmar = rol === 'INQUILINO' && contrato.estado === 'PENDIENTE_FIRMA';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.cardTitle}>
            {contrato.habitacion?.nombre ?? contrato.vivienda.alias_nombre} - v{contrato.version}
          </Text>
          <Text style={styles.meta}>
            {nombreCompleto(contrato.inquilino)} - {formatearImporte(contrato.renta_mensual)} -{' '}
            {formatearFecha(contrato.fecha_inicio)} - {formatearFecha(contrato.fecha_fin)}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            Hash {contrato.documento_hash}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>{estadoLabel[contrato.estado]}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Pressable
          style={[styles.smallButton, { backgroundColor: theme.colors.infoLight }]}
          onPress={() => Linking.openURL(contrato.documento_url)}
        >
          <Ionicons name="open-outline" size={15} color={theme.colors.info} />
          <Text style={[styles.smallButtonText, { color: theme.colors.info }]}>Abrir documento</Text>
        </Pressable>
        {puedeFirmar && (
          <>
            <Pressable
              style={[styles.smallButton, { backgroundColor: theme.colors.successLight }]}
              onPress={onFirmar}
              disabled={busy}
            >
              <Ionicons name="checkmark-circle-outline" size={15} color={theme.colors.success} />
              <Text style={[styles.smallButtonText, { color: theme.colors.successText }]}>Firmar</Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, { backgroundColor: theme.colors.dangerLight }]}
              onPress={onRechazar}
              disabled={busy}
            >
              <Ionicons name="close-circle-outline" size={15} color={theme.colors.danger} />
              <Text style={[styles.smallButtonText, { color: theme.colors.dangerText }]}>Rechazar</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
