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
  deudor: UsuarioBasico;
  acreedor: UsuarioBasico;
  gasto: { concepto: string };
};

type Gasto = {
  id: number;
  concepto: string;
  importe: number;
  fecha_creacion: string;
  pagador_id: number;
  pagador: UsuarioBasico;
  deudas: Omit<Deuda, 'deudor' | 'acreedor' | 'gasto'>[];
};

type GastoRecurrente = {
  id: number;
  concepto: string;
  importe: number;
  dia_del_mes: number;
  activo: boolean;
  pagador_id: number;
  pagador: UsuarioBasico;
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

export default function GastosInquilinoTab() {
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miId, setMiId] = useState<number | null>(null);
  const [companerosPiso, setCompanerosPiso] = useState<UsuarioBasico[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [gastosRecurrentes, setGastosRecurrentes] = useState<GastoRecurrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldando, setSaldando] = useState<number | null>(null);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<Deuda | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [conceptoFocused, setConceptoFocused] = useState(false);
  const [importeFocused, setImporteFocused] = useState(false);
  const [implicadosSeleccionados, setImplicadosSeleccionados] = useState<number[]>([]);

  const [mensualidadModalVisible, setMensualidadModalVisible] = useState(false);
  const [conceptoMensualidad, setConceptoMensualidad] = useState('');
  const [importeMensualidad, setImporteMensualidad] = useState('');
  const [diaMensualidad, setDiaMensualidad] = useState('');
  const [guardandoMensualidad, setGuardandoMensualidad] = useState(false);
  const [conceptoMensualidadFocused, setConceptoMensualidadFocused] = useState(false);
  const [importeMensualidadFocused, setImporteMensualidadFocused] = useState(false);
  const [diaMensualidadFocused, setDiaMensualidadFocused] = useState(false);

  const cargarTodo = useCallback(async (vId: number) => {
    try {
      const [{ data: gastosData }, { data: deudasData }, { data: recurrentesData }] =
        await Promise.all([
          api.get<Gasto[]>(`/viviendas/${vId}/gastos`),
          api.get<Deuda[]>(`/viviendas/${vId}/deudas`),
          api.get<GastoRecurrente[]>(`/viviendas/${vId}/gastos-recurrentes`),
        ]);

      setGastos(gastosData);
      setDeudas(deudasData);
      setGastosRecurrentes(recurrentesData);
    } catch {
      setGastos([]);
      setDeudas([]);
      setGastosRecurrentes([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const inicializar = async () => {
        setLoading(true);
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
        } catch {
          if (!activo) return;
          setViviendaId(null);
          setMiId(null);
          setCompanerosPiso([]);
          setImplicadosSeleccionados([]);
          setGastos([]);
          setDeudas([]);
          setGastosRecurrentes([]);
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

  const calcularBalance = (): number => {
    if (!miId) return 0;

    let balance = 0;
    for (const deuda of deudas) {
      if (deuda.estado === 'PAGADA') continue;
      if (deuda.acreedor_id === miId) balance += deuda.importe;
      if (deuda.deudor_id === miId) balance -= deuda.importe;
    }

    return balance;
  };

  const deudasPendientes = deudas.filter((deuda) => deuda.estado === 'PENDIENTE');
  const deudasPagadasConJustificante = deudas.filter(
    (deuda) => deuda.estado === 'PAGADA' && !!deuda.justificante_url,
  );
  const mensualidadesActivas = gastosRecurrentes.filter((gasto) => gasto.activo);

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

  const handleGuardar = async () => {
    if (!concepto.trim() || !importe.trim() || !viviendaId) return;

    if (implicadosSeleccionados.length === 0) {
      Toast.show({ type: 'error', text1: 'Selecciona al menos un participante para el gasto.' });
      return;
    }

    const importeNum = parseFloat(importe.replace(',', '.'));
    if (isNaN(importeNum) || importeNum <= 0) {
      Toast.show({ type: 'error', text1: 'Introduce un importe valido mayor que 0.' });
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

  const cerrarModalMensualidad = () => {
    setMensualidadModalVisible(false);
    setConceptoMensualidad('');
    setImporteMensualidad('');
    setDiaMensualidad('');
  };

  const abrirModalMensualidad = () => {
    setMensualidadModalVisible(true);
  };

  const handleGuardarMensualidad = async () => {
    if (!viviendaId) return;

    const importeNum = parseFloat(importeMensualidad.replace(',', '.'));
    const diaNum = parseInt(diaMensualidad, 10);

    if (!conceptoMensualidad.trim()) {
      Toast.show({ type: 'error', text1: 'Indica un concepto para la mensualidad.' });
      return;
    }

    if (isNaN(importeNum) || importeNum <= 0) {
      Toast.show({ type: 'error', text1: 'Introduce un importe valido mayor que 0.' });
      return;
    }

    if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 31) {
      Toast.show({ type: 'error', text1: 'El dia del mes debe estar entre 1 y 31.' });
      return;
    }

    setGuardandoMensualidad(true);
    try {
      await api.post(`/viviendas/${viviendaId}/gastos-recurrentes`, {
        concepto: conceptoMensualidad.trim(),
        importe: importeNum,
        dia_del_mes: diaNum,
      });
      await cargarTodo(viviendaId);
      cerrarModalMensualidad();
      Toast.show({
        type: 'success',
        text1: 'Mensualidad creada',
        text2: `${conceptoMensualidad.trim()} · ${formatImporte(importeNum)} · Dia ${diaNum}`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo crear la mensualidad.',
      });
    } finally {
      setGuardandoMensualidad(false);
    }
  };

  const puedeGuardar =
    concepto.trim().length > 0 &&
    importe.trim().length > 0 &&
    implicadosSeleccionados.length > 0;

  const puedeGuardarMensualidad =
    conceptoMensualidad.trim().length > 0 &&
    importeMensualidad.trim().length > 0 &&
    diaMensualidad.trim().length > 0;

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  const balance = calcularBalance();
  const debeMas = balance < 0;
  const heroColor = debeMas ? Theme.colors.danger : Theme.colors.success;
  const heroBackground = balance === 0 ? Theme.colors.surface2 : Theme.colors.surface;
  const heroBadgeBackground =
    balance === 0
      ? Theme.colors.surface2
      : debeMas
        ? Theme.colors.dangerLight
        : Theme.colors.successLight;
  const heroLabel = debeMas ? 'Debes al grupo' : balance === 0 ? 'Estas al dia' : 'Te deben';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEtiqueta}>Gastos comunes</Text>
          <Text style={styles.headerTitulo}>Balance del piso</Text>
          <Text style={styles.headerSubtitulo}>
            Divide los gastos de forma justa y transparente.
          </Text>
        </View>

        <View style={[styles.heroCard, { backgroundColor: heroBackground }]}>
          <View style={[styles.heroEtiquetaBadge, { backgroundColor: heroBadgeBackground }]}>
            <Text style={[styles.heroEtiqueta, { color: heroColor }]}>{heroLabel.toUpperCase()}</Text>
          </View>
          <Text style={[styles.heroImporte, { color: heroColor }]}>
            {formatImporte(Math.abs(balance))}
          </Text>
          <Text style={styles.heroDescripcion}>
            {debeMas
              ? 'Tienes deudas pendientes con tus companeros'
              : balance === 0
                ? 'No tienes deudas pendientes'
                : 'Tus companeros te deben dinero'}
          </Text>
        </View>

        {deudasPendientes.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Deudas pendientes</Text>
            {deudasPendientes.map((deuda) => {
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
                      {companero.nombre}
                      {companero.apellidos ? ` ${companero.apellidos}` : ''}
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
                </View>
              );
            })}
          </>
        )}

        {deudasPagadasConJustificante.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Pagadas con justificante</Text>
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
                        {companero.nombre}
                        {companero.apellidos ? ` ${companero.apellidos}` : ''}
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
                </View>
              );
            })}
          </>
        )}

        <View style={styles.seccionHeaderRow}>
          <View style={styles.seccionHeaderTextos}>
            <Text style={styles.seccionTitulo}>Gastos Fijos / Mensualidades</Text>
            <Text style={styles.seccionDescripcion}>
              Suscripciones activas que el backend genera automaticamente cada mes.
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.botonSecundario, pressed && styles.botonPressed]}
            onPress={abrirModalMensualidad}
            accessibilityLabel="Crear nuevo gasto fijo o mensualidad"
            accessibilityRole="button"
          >
            <Ionicons name="repeat-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.botonSecundarioTexto}>Nueva</Text>
          </Pressable>
        </View>

        {mensualidadesActivas.length === 0 ? (
          <View style={styles.mensualidadEmptyCard}>
            <View style={styles.mensualidadEmptyIcon}>
              <Ionicons name="calendar-outline" size={22} color={Theme.colors.primary} />
            </View>
            <View style={styles.mensualidadEmptyTextos}>
              <Text style={styles.mensualidadEmptyTitulo}>Aun no hay mensualidades activas</Text>
              <Text style={styles.mensualidadEmptySubtitulo}>
                Crea alquiler, internet o suministros para que el cron los convierta en gastos
                normales.
              </Text>
            </View>
          </View>
        ) : (
          mensualidadesActivas.map((gasto) => (
            <View key={gasto.id} style={styles.mensualidadCard}>
              <View style={styles.mensualidadIcono}>
                <Ionicons name="repeat" size={18} color={Theme.colors.primary} />
              </View>
              <View style={styles.mensualidadInfo}>
                <Text style={styles.mensualidadConcepto}>{gasto.concepto}</Text>
                <Text style={styles.mensualidadMeta}>
                  {formatImporte(gasto.importe)} · Dia {gasto.dia_del_mes}
                </Text>
              </View>
              <View style={styles.mensualidadBadge}>
                <Text style={styles.mensualidadBadgeTexto}>Activa</Text>
              </View>
            </View>
          ))
        )}

        {gastos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="wallet-outline" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitulo}>Sin gastos todavia</Text>
            <Text style={styles.emptySubtitulo}>
              Cuando alguien pague algo por la casa, aparecera aqui para que todos contribuyan su
              parte.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.seccionTitulo}>Movimientos</Text>
            {gastos.map((gasto) => (
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
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={abrirModal}
        accessibilityLabel="Anadir nuevo gasto"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={Theme.colors.surface} />
      </Pressable>

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
                placeholder="Ej. Papel higienico, gas, pizza..."
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
              <Text style={styles.inputLabel}>Quien participa?</Text>
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
                        estaSeleccionado ? 'Quitar de' : 'Anadir a'
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
                          {esYo ? 'Tu' : inquilino.nombre}
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

      <Modal
        visible={mensualidadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarModalMensualidad}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModalMensualidad} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitulo}>Nueva mensualidad</Text>

            <View style={styles.infoBanner}>
              <Ionicons name="time-outline" size={16} color={Theme.colors.primary} />
              <Text style={styles.infoBannerTexto}>
                El backend creara un gasto automatico cada mes a las 02:00 del dia elegido.
              </Text>
            </View>

            <View>
              <Text style={styles.inputLabel}>Concepto</Text>
              <TextInput
                style={[
                  styles.input,
                  conceptoMensualidadFocused && {
                    borderColor: Theme.colors.primary,
                    backgroundColor: Theme.colors.primaryLight,
                  },
                ]}
                placeholder="Ej. Alquiler, internet, luz"
                placeholderTextColor={Theme.colors.textMuted}
                value={conceptoMensualidad}
                onChangeText={setConceptoMensualidad}
                onFocus={() => setConceptoMensualidadFocused(true)}
                onBlur={() => setConceptoMensualidadFocused(false)}
                maxLength={120}
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Importe (€)</Text>
              <TextInput
                style={[
                  styles.input,
                  importeMensualidadFocused && {
                    borderColor: Theme.colors.primary,
                    backgroundColor: Theme.colors.primaryLight,
                  },
                ]}
                placeholder="800,00"
                placeholderTextColor={Theme.colors.textMuted}
                value={importeMensualidad}
                onChangeText={setImporteMensualidad}
                onFocus={() => setImporteMensualidadFocused(true)}
                onBlur={() => setImporteMensualidadFocused(false)}
                keyboardType="decimal-pad"
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Dia del mes</Text>
              <TextInput
                style={[
                  styles.input,
                  diaMensualidadFocused && {
                    borderColor: Theme.colors.primary,
                    backgroundColor: Theme.colors.primaryLight,
                  },
                ]}
                placeholder="1"
                placeholderTextColor={Theme.colors.textMuted}
                value={diaMensualidad}
                onChangeText={setDiaMensualidad}
                onFocus={() => setDiaMensualidadFocused(true)}
                onBlur={() => setDiaMensualidadFocused(false)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModalMensualidad}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.botonGuardar,
                  !puedeGuardarMensualidad && styles.botonGuardarDisabled,
                  pressed && !guardandoMensualidad && styles.botonPressed,
                ]}
                onPress={handleGuardarMensualidad}
                disabled={!puedeGuardarMensualidad || guardandoMensualidad}
              >
                {guardandoMensualidad ? (
                  <ActivityIndicator color={Theme.colors.surface} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Crear</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
