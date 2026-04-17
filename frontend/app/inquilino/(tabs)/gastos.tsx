import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/inquilino/gastos.styles';

type UsuarioBasico = { id: number; nombre: string; apellidos: string | null };

type HabitacionVivienda = {
  id: number;
  tipo: string;
  es_habitable?: boolean;
  inquilino: UsuarioBasico | null;
};

type Deuda = {
  id: number;
  gasto_id: number;
  deudor_id: number;
  acreedor_id: number;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADA';
  justificante_url: string | null;
  categoria?: 'CASERO' | 'COMPANEROS';
  deudor: UsuarioBasico;
  acreedor: UsuarioBasico;
  gasto: {
    concepto: string;
    tipo?: 'ENTRE_COMPANEROS' | 'FACTURA_PUNTUAL' | 'FACTURA_MENSUAL' | 'CARGO_RECURRENTE';
    factura_url: string | null;
  };
};

type Gasto = {
  id: number;
  concepto: string;
  importe: number;
  tipo?: 'ENTRE_COMPANEROS' | 'FACTURA_PUNTUAL' | 'FACTURA_MENSUAL' | 'CARGO_RECURRENTE';
  fecha_creacion: string;
  pagador_id: number;
  pagador: UsuarioBasico;
  deudas: Omit<Deuda, 'deudor' | 'acreedor' | 'gasto'>[];
};

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
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: Theme.colors.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: Theme.colors.primary }}>
        {initials}
      </Text>
    </View>
  );
};

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

const formatImporte = (n: number) =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const formatNombreCompleto = ({ nombre, apellidos }: UsuarioBasico) =>
  `${nombre}${apellidos ? ` ${apellidos}` : ''}`;

const sumarImportes = (items: Deuda[]) =>
  items.reduce((total, deuda) => total + deuda.importe, 0);

export default function GastosInquilinoTab() {
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miId, setMiId] = useState<number | null>(null);
  const [companerosPiso, setCompanerosPiso] = useState<UsuarioBasico[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [saldando, setSaldando] = useState<number | null>(null);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [conceptoFocused, setConceptoFocused] = useState(false);
  const [importeFocused, setImporteFocused] = useState(false);
  const [implicadosSeleccionados, setImplicadosSeleccionados] = useState<number[]>([]);

  const cargarTodo = useCallback(async (vId: number) => {
    try {
      const [{ data: gastosData }, { data: deudasData }] = await Promise.all([
        api.get<Gasto[]>(`/viviendas/${vId}/gastos`),
        api.get<Deuda[]>(`/viviendas/${vId}/deudas`),
      ]);

      setGastos(gastosData);
      setDeudas(deudasData);
      setErrorCarga(null);
    } catch (err: any) {
      const mensaje = err.response?.data?.error as string | undefined;
      setGastos([]);
      setDeudas([]);
      setErrorCarga(
        err.response?.status === 403 && mensaje?.toLowerCase().includes('desactivado')
          ? 'El modulo de gastos esta desactivado para esta vivienda.'
          : 'No se pudieron cargar tus gastos y deudas.',
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const inicializar = async () => {
        setLoading(true);
        setErrorCarga(null);
        try {
          const { data: viviendaData } = await api.get<{
            miHabitacionId: number;
            vivienda: {
              id: number;
              habitaciones: HabitacionVivienda[];
            };
          }>('/inquilino/vivienda');

          const vId = viviendaData.vivienda.id;
          const miHab = viviendaData.vivienda.habitaciones.find(
            (habitacion) => habitacion.id === viviendaData.miHabitacionId,
          );
          const uId = miHab?.inquilino?.id ?? 0;
          const participantes = viviendaData.vivienda.habitaciones
            .filter((habitacion) => habitacion.tipo === 'DORMITORIO' && habitacion.inquilino !== null)
            .map((habitacion) => habitacion.inquilino!);

          if (!activo) return;

          setViviendaId(vId);
          setMiId(uId);
          setCompanerosPiso(participantes);
          setImplicadosSeleccionados(participantes.map((inquilino) => inquilino.id));
          await cargarTodo(vId);
        } catch (err: any) {
          if (!activo) return;
          const mensaje = err.response?.data?.error as string | undefined;
          setViviendaId(null);
          setMiId(null);
          setCompanerosPiso([]);
          setImplicadosSeleccionados([]);
          setGastos([]);
          setDeudas([]);
          setErrorCarga(
            err.response?.status === 403 && mensaje?.toLowerCase().includes('desactivado')
              ? 'El modulo de gastos esta desactivado para esta vivienda.'
              : 'No pudimos cargar tu vivienda para revisar los gastos.',
          );
        } finally {
          if (activo) setLoading(false);
        }
      };

      inicializar();
      return () => {
        activo = false;
      };
    }, [cargarTodo]),
  );

  const idsCompaneros = new Set(companerosPiso.map((inquilino) => inquilino.id));
  const esDeudaMia = (deuda: Deuda) =>
    miId !== null && (deuda.deudor_id === miId || deuda.acreedor_id === miId);
  const esDeudaEntreCompaneros = (deuda: Deuda) =>
    deuda.categoria
      ? deuda.categoria === 'COMPANEROS'
      : deuda.gasto.tipo
        ? deuda.gasto.tipo === 'ENTRE_COMPANEROS'
        : idsCompaneros.has(deuda.deudor_id) && idsCompaneros.has(deuda.acreedor_id);

  const gastosEntreCompaneros = gastos.filter(
    (gasto) =>
      gasto.tipo !== 'FACTURA_PUNTUAL' &&
      gasto.tipo !== 'FACTURA_MENSUAL' &&
      gasto.tipo !== 'CARGO_RECURRENTE',
  );
  const deudasRelacionadas = deudas.filter(esDeudaMia);
  const deudasPendientes = deudasRelacionadas.filter((deuda) => deuda.estado === 'PENDIENTE');
  const deudasPendientesCompaneros = deudasPendientes.filter(esDeudaEntreCompaneros);
  const deudasPendientesCasero = deudasPendientes.filter(
    (deuda) => !esDeudaEntreCompaneros(deuda),
  );
  const deudasPagadasConJustificante = deudasRelacionadas.filter(
    (deuda) => deuda.estado === 'PAGADA' && !!deuda.justificante_url,
  );
  const totalDeboCompaneros = sumarImportes(
    deudasPendientesCompaneros.filter((deuda) => deuda.deudor_id === miId),
  );
  const totalMeDebenCompaneros = sumarImportes(
    deudasPendientesCompaneros.filter((deuda) => deuda.acreedor_id === miId),
  );
  const totalDeboCasero = sumarImportes(
    deudasPendientesCasero.filter((deuda) => deuda.deudor_id === miId),
  );
  const totalMeDebenCasero = sumarImportes(
    deudasPendientesCasero.filter((deuda) => deuda.acreedor_id === miId),
  );
  const noHayPendientes = deudasPendientes.length === 0;
  const mostrarPendientesVacios =
    noHayPendientes && (deudasRelacionadas.length > 0 || gastos.length > 0);

  const abrirModalPago = (deuda: Deuda) => {
    setDeudaSeleccionada(deuda);
  };

  const cerrarModalPago = () => {
    if (saldando) return;
    setDeudaSeleccionada(null);
  };

  const saldarDeuda = async (deuda: Deuda, mensajeExito: string) => {
    if (!viviendaId) return;

    setSaldando(deuda.id);
    try {
      await api.patch(`/viviendas/${viviendaId}/deudas/${deuda.id}/saldar`);
      await cargarTodo(viviendaId);
      setDeudaSeleccionada(null);
      Toast.show({
        type: 'success',
        text1: 'Deuda saldada',
        text2: mensajeExito,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo saldar la deuda.',
      });
    } finally {
      setSaldando(null);
    }
  };

  const subirJustificante = async (deuda: Deuda, asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();

    if (Platform.OS === 'web' && asset.file) {
      formData.append('justificante', asset.file);
    } else {
      formData.append('justificante', {
        uri: asset.uri,
        name: asset.fileName ?? `justificante-deuda-${deuda.id}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as never);
    }

    await api.post(`/deudas/${deuda.id}/justificante`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleSaldarSinJustificante = async () => {
    if (!deudaSeleccionada) return;

    await saldarDeuda(
      deudaSeleccionada,
      `${formatImporte(deudaSeleccionada.importe)} marcados como pagados.`,
    );
  };

  const handleSubirJustificanteYSaldar = async () => {
    if (!deudaSeleccionada || !viviendaId) return;

    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Toast.show({
          type: 'info',
          text1: 'Permiso necesario',
          text2: 'Necesitamos acceso a tu galería para adjuntar el justificante.',
        });
        return;
      }
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.82,
    });

    if (resultado.canceled || !resultado.assets[0]) {
      return;
    }

    setSaldando(deudaSeleccionada.id);
    try {
      await subirJustificante(deudaSeleccionada, resultado.assets[0]);
      await api.patch(`/viviendas/${viviendaId}/deudas/${deudaSeleccionada.id}/saldar`);
      await cargarTodo(viviendaId);
      setDeudaSeleccionada(null);
      Toast.show({
        type: 'success',
        text1: 'Pago registrado',
        text2: 'Se ha subido el justificante y la deuda ya figura como pagada.',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo subir el justificante y saldar la deuda.',
      });
    } finally {
      setSaldando(null);
    }
  };

  const abrirJustificante = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'No se pudo abrir el justificante.',
      });
    }
  };

  const abrirFacturaOriginal = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'No se pudo abrir la factura original.',
      });
    }
  };

  const handleGuardar = async () => {
    if (!viviendaId) {
      Toast.show({ type: 'error', text1: 'No pudimos identificar tu vivienda.' });
      return;
    }

    if (!concepto.trim() || !importe.trim()) {
      Toast.show({ type: 'error', text1: 'Completa concepto e importe antes de guardar.' });
      return;
    }

    if (implicadosSeleccionados.length === 0) {
      Toast.show({ type: 'error', text1: 'Selecciona al menos un participante para el gasto.' });
      return;
    }

    const importeNum = parseFloat(importe.replace(',', '.'));
    if (isNaN(importeNum) || importeNum <= 0) {
      Toast.show({ type: 'error', text1: 'Introduce un importe válido mayor que 0.' });
      return;
    }

    setGuardando(true);
    try {
      await api.post(`/viviendas/${viviendaId}/gastos`, {
        concepto: concepto.trim(),
        importe: importeNum,
        implicadosIds: implicadosSeleccionados,
      });
      await cargarTodo(viviendaId);
      cerrarModal();
      Toast.show({
        type: 'success',
        text1: 'Gasto registrado',
        text2: `${concepto.trim()} · ${formatImporte(importeNum)}`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo registrar el gasto.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setConcepto('');
    setImporte('');
    setImplicadosSeleccionados(companerosPiso.map((inquilino) => inquilino.id));
  };

  const abrirModal = () => {
    setImplicadosSeleccionados(companerosPiso.map((inquilino) => inquilino.id));
    setModalVisible(true);
  };

  const toggleImplicado = (inquilinoId: number) => {
    setImplicadosSeleccionados((actuales) =>
      actuales.includes(inquilinoId)
        ? actuales.filter((id) => id !== inquilinoId)
        : [...actuales, inquilinoId],
    );
  };

  const puedeGuardar =
    concepto.trim().length > 0 &&
    importe.trim().length > 0 &&
    implicadosSeleccionados.length > 0;

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEtiqueta}>Gastos comunes</Text>
          <Text style={styles.headerTitulo}>Gastos del piso</Text>
          <Text style={styles.headerSubtitulo}>
            Separa lo que os debéis entre compañeros de cualquier pendiente con el casero.
          </Text>
        </View>

        {errorCarga && (
          <View style={styles.errorCard}>
            <View style={styles.errorIconBox}>
              <Ionicons name="alert-circle-outline" size={22} color={Theme.colors.danger} />
            </View>
            <View style={styles.errorTextos}>
              <Text style={styles.errorTitulo}>
                {errorCarga.includes('desactivado') ? 'Modulo desactivado' : 'No se pudieron cargar los gastos'}
              </Text>
              <Text style={styles.errorSubtitulo}>{errorCarga}</Text>
            </View>
          </View>
        )}

        {!errorCarga && (
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconBox}>
              <Ionicons name="people-outline" size={18} color={Theme.colors.primary} />
            </View>
            <View style={styles.heroHeaderTextos}>
              <Text style={styles.heroTitulo}>Entre compañeros</Text>
              <Text style={styles.heroSubtitulo}>
                Solo recoge gastos compartidos por quienes viven en el piso.
              </Text>
            </View>
          </View>

          <View style={styles.heroResumenGrid}>
            <View
              style={[
                styles.heroResumenCard,
                {
                  backgroundColor:
                    totalDeboCompaneros > 0 ? Theme.colors.dangerLight : Theme.colors.surface,
                },
              ]}
            >
              <View style={[styles.heroResumenBadge, { backgroundColor: Theme.colors.dangerLight }]}>
                <Text style={[styles.heroResumenBadgeText, { color: Theme.colors.danger }]}>
                  Tú debes
                </Text>
              </View>
              <Text style={[styles.heroResumenImporte, { color: Theme.colors.danger }]}>
                {formatImporte(totalDeboCompaneros)}
              </Text>
              <Text style={styles.heroResumenTexto}>A compañeros por gastos comunes</Text>
            </View>

            <View
              style={[
                styles.heroResumenCard,
                {
                  backgroundColor:
                    totalMeDebenCompaneros > 0 ? Theme.colors.successLight : Theme.colors.surface,
                },
              ]}
            >
              <View style={[styles.heroResumenBadge, { backgroundColor: Theme.colors.successLight }]}>
                <Text style={[styles.heroResumenBadgeText, { color: Theme.colors.success }]}>
                  Te deben
                </Text>
              </View>
              <Text style={[styles.heroResumenImporte, { color: Theme.colors.success }]}>
                {formatImporte(totalMeDebenCompaneros)}
              </Text>
              <Text style={styles.heroResumenTexto}>Compañeros pendientes contigo</Text>
            </View>
          </View>

        </View>
        )}

        {!errorCarga && (totalDeboCasero > 0 || totalMeDebenCasero > 0) && (
          <View style={styles.caseroCard}>
            <View style={styles.caseroHeader}>
              <View style={styles.caseroIconBox}>
                <Ionicons name="business-outline" size={18} color={Theme.colors.info} />
              </View>
              <View style={styles.caseroHeaderTextos}>
                <Text style={styles.caseroTitulo}>Relación con el casero</Text>
                <Text style={styles.caseroSubtitulo}>
                  Pagos asociados al propietario, separados del balance entre compañeros.
                </Text>
              </View>
            </View>

            <View style={styles.caseroResumenGrid}>
              <View style={[styles.caseroResumenCard, { backgroundColor: Theme.colors.dangerLight }]}>
                <Text style={[styles.caseroResumenLabel, { color: Theme.colors.danger }]}>Debes</Text>
                <Text style={[styles.caseroResumenImporte, { color: Theme.colors.danger }]}>
                  {formatImporte(totalDeboCasero)}
                </Text>
              </View>

              <View style={[styles.caseroResumenCard, { backgroundColor: Theme.colors.successLight }]}>
                <Text style={[styles.caseroResumenLabel, { color: Theme.colors.success }]}>
                  Te deben
                </Text>
                <Text style={[styles.caseroResumenImporte, { color: Theme.colors.success }]}>
                  {formatImporte(totalMeDebenCasero)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!errorCarga && mostrarPendientesVacios && (
          <View style={styles.pendientesEmptyCard}>
            <View style={styles.pendientesEmptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={22} color={Theme.colors.success} />
            </View>
            <View style={styles.pendientesEmptyTextos}>
              <Text style={styles.pendientesEmptyTitulo}>Sin pagos pendientes</Text>
              <Text style={styles.pendientesEmptySubtitulo}>
                Cuando haya una deuda real con un compañero o con el casero, aparecerá en esta
                zona.
              </Text>
            </View>
          </View>
        )}

        {!errorCarga && deudasPendientesCompaneros.length > 0 && (
          <>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionTitulo}>Pendientes entre compañeros</Text>
              <Text style={styles.seccionSubtitulo}>
                Deudas generadas por gastos comunes del piso.
              </Text>
            </View>
            {deudasPendientesCompaneros.map((deuda) => {
              const yoDebo = deuda.deudor_id === miId;
              const companero = yoDebo ? deuda.acreedor : deuda.deudor;
              const amountColor = yoDebo ? Theme.colors.danger : Theme.colors.success;
              const statusBackground = yoDebo
                ? Theme.colors.dangerLight
                : Theme.colors.successLight;
              const statusText = yoDebo ? Theme.colors.danger : Theme.colors.success;

              return (
                <View key={deuda.id} style={styles.deudaCard}>
                  <AvatarInitials
                    nombre={companero.nombre}
                    apellidos={companero.apellidos}
                    size={52}
                  />
                  <View style={styles.deudaInfo}>
                    <Text style={styles.deudaNombre} numberOfLines={1}>
                      {formatNombreCompleto(companero)}
                    </Text>
                    <Text style={styles.deudaConcepto} numberOfLines={2}>
                      {deuda.gasto.concepto}
                    </Text>
                  </View>
                  <View style={styles.deudaMeta}>
                    <Text style={[styles.deudaImporte, { color: amountColor }]}>
                      {formatImporte(deuda.importe)}
                    </Text>

                    {yoDebo ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.botonSaldar,
                          { backgroundColor: statusBackground },
                          pressed && styles.botonSaldarPressed,
                          saldando === deuda.id && { opacity: 0.6 },
                        ]}
                        onPress={() => abrirModalPago(deuda)}
                        disabled={saldando === deuda.id}
                        accessibilityLabel={`Saldar deuda de ${formatImporte(deuda.importe)} con ${companero.nombre}`}
                        accessibilityRole="button"
                      >
                        {saldando === deuda.id ? (
                          <ActivityIndicator size="small" color={statusText} />
                        ) : (
                          <Text style={[styles.botonSaldarTexto, { color: statusText }]}>Saldar</Text>
                        )}
                      </Pressable>
                    ) : (
                      <View style={[styles.badgeEsperando, { backgroundColor: statusBackground }]}>
                        <Ionicons name="time-outline" size={13} color={statusText} />
                        <Text style={[styles.badgeEsperandoTexto, { color: statusText }]}>
                          Esperando
                        </Text>
                      </View>
                    )}
                  </View>
                  {deuda.gasto.factura_url && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.botonFacturaOriginal,
                        pressed && styles.botonPressed,
                      ]}
                      onPress={() => abrirFacturaOriginal(deuda.gasto.factura_url!)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver factura original de ${deuda.gasto.concepto}`}
                    >
                      <Ionicons name="document-text-outline" size={16} color={Theme.colors.primary} />
                      <Text style={styles.botonFacturaOriginalTexto}>Ver factura original</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </>
        )}

        {!errorCarga && deudasPendientesCasero.length > 0 && (
          <>
            <View style={[styles.seccionHeader, styles.seccionHeaderCasero]}>
              <Text style={styles.seccionTitulo}>Pendientes con el casero</Text>
              <Text style={styles.seccionSubtitulo}>
                Importes que no forman parte del reparto entre compañeros.
              </Text>
            </View>
            {deudasPendientesCasero.map((deuda) => {
              const yoDebo = deuda.deudor_id === miId;
              const contraparte = yoDebo ? deuda.acreedor : deuda.deudor;
              const amountColor = yoDebo ? Theme.colors.danger : Theme.colors.success;
              const statusBackground = yoDebo ? Theme.colors.dangerLight : Theme.colors.infoLight;
              const statusText = yoDebo ? Theme.colors.danger : Theme.colors.info;

              return (
                <View key={deuda.id} style={styles.deudaCard}>
                  <AvatarInitials
                    nombre={contraparte.nombre}
                    apellidos={contraparte.apellidos}
                    size={52}
                  />
                  <View style={styles.deudaInfo}>
                    <Text style={styles.deudaNombre} numberOfLines={1}>
                      {formatNombreCompleto(contraparte)}
                    </Text>
                    <Text style={styles.deudaConcepto} numberOfLines={2}>
                      {deuda.gasto.concepto}
                    </Text>
                  </View>
                  <View style={styles.deudaMeta}>
                    <Text style={[styles.deudaImporte, { color: amountColor }]}>
                      {formatImporte(deuda.importe)}
                    </Text>

                    {yoDebo ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.botonSaldar,
                          { backgroundColor: statusBackground },
                          pressed && styles.botonSaldarPressed,
                          saldando === deuda.id && { opacity: 0.6 },
                        ]}
                        onPress={() => abrirModalPago(deuda)}
                        disabled={saldando === deuda.id}
                        accessibilityLabel={`Saldar deuda de ${formatImporte(deuda.importe)} con ${contraparte.nombre}`}
                        accessibilityRole="button"
                      >
                        {saldando === deuda.id ? (
                          <ActivityIndicator size="small" color={statusText} />
                        ) : (
                          <Text style={[styles.botonSaldarTexto, { color: statusText }]}>Saldar</Text>
                        )}
                      </Pressable>
                    ) : (
                      <View style={[styles.badgeEsperando, { backgroundColor: statusBackground }]}>
                        <Ionicons name="time-outline" size={13} color={statusText} />
                        <Text style={[styles.badgeEsperandoTexto, { color: statusText }]}>
                          Pendiente
                        </Text>
                      </View>
                    )}
                  </View>
                  {deuda.gasto.factura_url && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.botonFacturaOriginal,
                        pressed && styles.botonPressed,
                      ]}
                      onPress={() => abrirFacturaOriginal(deuda.gasto.factura_url!)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver factura original de ${deuda.gasto.concepto}`}
                    >
                      <Ionicons name="document-text-outline" size={16} color={Theme.colors.primary} />
                      <Text style={styles.botonFacturaOriginalTexto}>Ver factura original</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </>
        )}

        {!errorCarga && deudasPagadasConJustificante.length > 0 && (
          <>
            <Text style={[styles.seccionTitulo, styles.seccionTituloSolo]}>
              Pagadas con justificante
            </Text>
            {deudasPagadasConJustificante.map((deuda) => {
              const yoPague = deuda.deudor_id === miId;
              const companero = yoPague ? deuda.acreedor : deuda.deudor;

              return (
                <View key={deuda.id} style={styles.deudaPagadaCard}>
                  <View style={styles.deudaPagadaHeader}>
                    <AvatarInitials
                      nombre={companero.nombre}
                      apellidos={companero.apellidos}
                      size={48}
                    />
                    <View style={styles.deudaPagadaInfo}>
                      <Text style={styles.deudaNombre} numberOfLines={1}>
                        {formatNombreCompleto(companero)}
                      </Text>
                      <Text style={styles.deudaConcepto} numberOfLines={2}>
                        {deuda.gasto.concepto}
                      </Text>
                      <Text style={[styles.deudaImporte, { color: Theme.colors.success }]}>
                        {formatImporte(deuda.importe)}
                      </Text>
                    </View>
                    <View style={styles.deudaPagadaEstado}>
                      <Text style={styles.deudaPagadaEstadoTexto}>Pagada</Text>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.botonJustificante,
                      pressed && styles.botonPressed,
                    ]}
                    onPress={() => abrirJustificante(deuda.justificante_url!)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver justificante de ${deuda.gasto.concepto}`}
                  >
                    <Ionicons name="image-outline" size={16} color={Theme.colors.info} />
                    <Text style={styles.botonJustificanteTexto}>Ver justificante</Text>
                  </Pressable>
                  {deuda.gasto.factura_url && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.botonFacturaOriginal,
                        pressed && styles.botonPressed,
                      ]}
                      onPress={() => abrirFacturaOriginal(deuda.gasto.factura_url!)}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver factura original de ${deuda.gasto.concepto}`}
                    >
                      <Ionicons name="document-text-outline" size={16} color={Theme.colors.primary} />
                      <Text style={styles.botonFacturaOriginalTexto}>Ver factura original</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </>
        )}

        {!errorCarga && (gastosEntreCompaneros.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="wallet-outline" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitulo}>Sin gastos todavía</Text>
            <Text style={styles.emptySubtitulo}>
              Cuando alguien pague algo por la casa, aparecerá aquí para que todos contribuyan su
              parte.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.seccionTitulo, styles.seccionTituloSolo]}>Movimientos</Text>
            {gastosEntreCompaneros.map((gasto) => (
              <View key={gasto.id} style={styles.gastoCard}>
                <AvatarInitials nombre={gasto.pagador.nombre} apellidos={gasto.pagador.apellidos} size={46} />
                <View style={styles.gastoInfo}>
                  <Text style={styles.gastoConcepto}>{gasto.concepto}</Text>
                  <Text style={styles.gastoPagador}>Pagado por {gasto.pagador.nombre}</Text>
                  <Text style={styles.gastoFecha}>{formatFecha(gasto.fecha_creacion)}</Text>
                </View>
                <View style={styles.gastoImporteBox}>
                  <Text style={styles.gastoImporte}>{formatImporte(gasto.importe)}</Text>
                  <Text style={styles.gastoImporteSub}>total</Text>
                </View>
              </View>
            ))}
          </>
        ))}
      </ScrollView>

      {!errorCarga && viviendaId && (
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={abrirModal}
        accessibilityLabel="Añadir nuevo gasto"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={Theme.colors.surface} />
      </Pressable>
      )}

      <Modal
        visible={!!deudaSeleccionada}
        animationType="slide"
        transparent
        onRequestClose={cerrarModalPago}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={cerrarModalPago} />
          <View style={styles.pagoSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.pagoSheetHero}>
              <View style={styles.pagoSheetIcon}>
                <Ionicons name="wallet-outline" size={22} color={Theme.colors.success} />
              </View>
              <View style={styles.pagoSheetHeroTextos}>
                <Text style={styles.pagoSheetTitulo}>Confirmar pago</Text>
                <Text style={styles.pagoSheetSubtitulo}>
                  {deudaSeleccionada
                    ? `¿Ya has enviado ${formatImporte(deudaSeleccionada.importe)} a ${deudaSeleccionada.acreedor.nombre}?`
                    : ''}
                </Text>
                {deudaSeleccionada && (
                  <Text style={styles.pagoSheetAmount}>
                    {deudaSeleccionada.gasto.concepto} ·{' '}
                    {formatImporte(deudaSeleccionada.importe)}
                  </Text>
                )}
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.pagoSheetOption,
                styles.pagoSheetOptionSecundaria,
                pressed && !saldando && styles.botonPressed,
                !!saldando && { opacity: 0.7 },
              ]}
              onPress={handleSaldarSinJustificante}
              disabled={!!saldando}
            >
              <View style={styles.pagoSheetOptionHeader}>
                <View style={styles.pagoSheetOptionHeaderLeft}>
                  <View
                    style={[styles.pagoSheetOptionIcon, styles.pagoSheetOptionIconSecundaria]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color={Theme.colors.textMedium}
                    />
                  </View>
                  <Text style={styles.pagoSheetOptionTitle}>Saldar sin justificante</Text>
                </View>
                {deudaSeleccionada && saldando === deudaSeleccionada.id ? (
                  <ActivityIndicator color={Theme.colors.textMedium} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Theme.colors.textSecondary} />
                )}
              </View>
              <Text style={styles.pagoSheetOptionDescription}>
                Marca la deuda como pagada inmediatamente y cierra este pendiente.
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.pagoSheetOption,
                styles.pagoSheetOptionPrimaria,
                pressed && !saldando && styles.botonPressed,
                !!saldando && { opacity: 0.7 },
              ]}
              onPress={handleSubirJustificanteYSaldar}
              disabled={!!saldando}
            >
              <View style={styles.pagoSheetOptionHeader}>
                <View style={styles.pagoSheetOptionHeaderLeft}>
                  <View
                    style={[styles.pagoSheetOptionIcon, styles.pagoSheetOptionIconPrimaria]}
                  >
                    <Ionicons name="image-outline" size={20} color={Theme.colors.primary} />
                  </View>
                  <Text style={styles.pagoSheetOptionTitle}>Subir captura y saldar</Text>
                </View>
                {deudaSeleccionada && saldando === deudaSeleccionada.id ? (
                  <ActivityIndicator color={Theme.colors.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={Theme.colors.primary} />
                )}
              </View>
              <Text style={styles.pagoSheetOptionDescription}>
                Adjunta una captura de Bizum o transferencia, la guardamos y después marcamos la
                deuda como pagada.
              </Text>
            </Pressable>

            <View style={styles.pagoSheetFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.pagoSheetCancel,
                  pressed && !saldando && styles.botonPressed,
                ]}
                onPress={cerrarModalPago}
                disabled={!!saldando}
              >
                <Text style={styles.pagoSheetCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitulo}>Nuevo gasto</Text>

            <View>
              <Text style={styles.inputLabel}>Concepto</Text>
              <TextInput
                style={[
                  styles.input,
                  conceptoFocused && {
                    borderColor: Theme.colors.primary,
                    backgroundColor: Theme.colors.primaryLight,
                  },
                ]}
                placeholder="Ej. Papel higiénico, gas, pizza..."
                placeholderTextColor={Theme.colors.textMuted}
                value={concepto}
                onChangeText={setConcepto}
                onFocus={() => setConceptoFocused(true)}
                onBlur={() => setConceptoFocused(false)}
                maxLength={120}
                returnKeyType="next"
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Importe (€)</Text>
              <TextInput
                style={[
                  styles.input,
                  importeFocused && {
                    borderColor: Theme.colors.primary,
                    backgroundColor: Theme.colors.primaryLight,
                  },
                ]}
                placeholder="0,00"
                placeholderTextColor={Theme.colors.textMuted}
                value={importe}
                onChangeText={setImporte}
                onFocus={() => setImporteFocused(true)}
                onBlur={() => setImporteFocused(false)}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            <View style={styles.participantesSection}>
              <Text style={styles.inputLabel}>¿Quién participa?</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.participantesRow}
              >
                {companerosPiso.map((inquilino) => {
                  const estaSeleccionado = implicadosSeleccionados.includes(inquilino.id);
                  const esYo = inquilino.id === miId;

                  return (
                    <Pressable
                      key={inquilino.id}
                      style={({ pressed }) => [
                        styles.participantePill,
                        estaSeleccionado && styles.participantePillSelected,
                        pressed && styles.participantePillPressed,
                      ]}
                      onPress={() => toggleImplicado(inquilino.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`${
                        estaSeleccionado ? 'Quitar de' : 'Añadir a'
                      } participantes a ${esYo ? 'ti' : inquilino.nombre}`}
                    >
                      <AvatarInitials
                        nombre={inquilino.nombre}
                        apellidos={inquilino.apellidos}
                        size={36}
                      />
                      <View style={styles.participanteTextoBox}>
                        <Text
                          style={[
                            styles.participanteNombre,
                            estaSeleccionado && styles.participanteNombreSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {esYo ? 'Tú' : inquilino.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.participanteEstado,
                            estaSeleccionado && styles.participanteEstadoSelected,
                          ]}
                        >
                          {estaSeleccionado ? 'Incluido' : 'Fuera'}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModal}
              >
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
                {guardando ? (
                  <ActivityIndicator color={Theme.colors.surface} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
