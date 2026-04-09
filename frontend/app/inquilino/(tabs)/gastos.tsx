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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/inquilino/gastos.styles';

// ── Tipos ─────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

export default function GastosInquilinoTab() {
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miId, setMiId] = useState<number | null>(null);
  const [companerosPiso, setCompanerosPiso] = useState<UsuarioBasico[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saldando, setSaldando] = useState<number | null>(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [conceptoFocused, setConceptoFocused] = useState(false);
  const [importeFocused, setImporteFocused] = useState(false);
  const [implicadosSeleccionados, setImplicadosSeleccionados] = useState<number[]>([]);

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarTodo = useCallback(async (vId: number) => {
    try {
      const [{ data: gastosData }, { data: deudasData }] = await Promise.all([
        api.get<Gasto[]>(`/viviendas/${vId}/gastos`),
        api.get<Deuda[]>(`/viviendas/${vId}/deudas`),
      ]);
      setGastos(gastosData);
      setDeudas(deudasData);
    } catch {
      // Feed vacío — se muestra empty state
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
            vivienda: any;
          }>('/inquilino/vivienda');

          const vId: number = viviendaData.vivienda.id;
          const miHab = viviendaData.vivienda.habitaciones.find(
            (h: any) => h.id === viviendaData.miHabitacionId
          );
          const uId: number = miHab?.inquilino?.id ?? 0;
          const participantes = (viviendaData.vivienda.habitaciones as HabitacionVivienda[])
            .filter((h) => h.tipo === 'DORMITORIO' && h.inquilino !== null)
            .map((h) => h.inquilino!);

          if (!activo) return;
          setViviendaId(vId);
          setMiId(uId);
          setCompanerosPiso(participantes);
          setImplicadosSeleccionados(participantes.map((inquilino) => inquilino.id));
          await cargarTodo(vId);
        } catch {
          // Sin vivienda
        } finally {
          if (activo) setLoading(false);
        }
      };

      inicializar();
      return () => { activo = false; };
    }, [cargarTodo])
  );

  // ── Balance desde deudas PENDIENTE ───────────────────────────────────────

  const calcularBalance = (): number => {
    if (!miId) return 0;
    let bal = 0;
    for (const d of deudas) {
      if (d.estado === 'PAGADA') continue;
      if (d.acreedor_id === miId) bal += d.importe;
      if (d.deudor_id === miId)   bal -= d.importe;
    }
    return bal;
  };

  const deudoasPendientes = deudas.filter((d) => d.estado === 'PENDIENTE');

  // ── Saldar deuda ──────────────────────────────────────────────────────────

  const handleSaldar = (deuda: Deuda) => {
    Alert.alert(
      '¿Confirmar pago?',
      `¿Has hecho ya el Bizum o transferencia de ${formatImporte(deuda.importe)} a ${deuda.acreedor.nombre}?`,
      [
        { text: 'Aún no', style: 'cancel' },
        {
          text: 'Sí, ya lo hice',
          onPress: async () => {
            if (!viviendaId) return;
            setSaldando(deuda.id);
            try {
              await api.patch(`/viviendas/${viviendaId}/deudas/${deuda.id}/saldar`);
              await cargarTodo(viviendaId);
              Toast.show({
                type: 'success',
                text1: '¡Deuda saldada!',
                text2: `${formatImporte(deuda.importe)} marcados como pagados.`,
              });
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: err.response?.data?.error ?? 'No se pudo saldar la deuda.',
              });
            } finally {
              setSaldando(null);
            }
          },
        },
      ]
    );
  };

  // ── Guardar nuevo gasto ───────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!concepto.trim() || !importe.trim() || !viviendaId) return;
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
        text1: '¡Gasto registrado!',
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
        : [...actuales, inquilinoId]
    );
  };

  const puedeGuardar =
    concepto.trim().length > 0 &&
    importe.trim().length > 0 &&
    implicadosSeleccionados.length > 0;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  const balance = calcularBalance();
  const debeMas = balance < 0;
  const heroColor      = debeMas ? Theme.colors.danger : Theme.colors.success;
  const heroBackground = balance === 0 ? Theme.colors.surface2 : Theme.colors.surface;
  const heroBadgeBackground = balance === 0
    ? Theme.colors.surface2
    : debeMas
    ? Theme.colors.dangerLight
    : Theme.colors.successLight;
  const heroLabel      = debeMas ? 'Debes al grupo' : balance === 0 ? 'Estás al día' : 'Te deben';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Cabecera ── */}
        <View style={styles.header}>
          <Text style={styles.headerEtiqueta}>Gastos comunes</Text>
          <Text style={styles.headerTitulo}>Balance del piso</Text>
          <Text style={styles.headerSubtitulo}>
            Divide los gastos de forma justa y transparente.
          </Text>
        </View>

        {/* ── Hero Card Balance ── */}
        <View style={[styles.heroCard, { backgroundColor: heroBackground }]}> 
          <View style={[styles.heroEtiquetaBadge, { backgroundColor: heroBadgeBackground }]}>
            <Text style={[styles.heroEtiqueta, { color: heroColor }]}>
              {heroLabel.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.heroImporte, { color: heroColor }]}>
            {formatImporte(Math.abs(balance))}
          </Text>
          <Text style={styles.heroDescripcion}>
            {debeMas
              ? 'Tienes deudas pendientes con tus compañeros'
              : balance === 0
              ? 'No tienes deudas pendientes'
              : 'Tus compañeros te deben dinero'}
          </Text>
        </View>

        {/* ── Sección Deudas Pendientes ── */}
        {deudoasPendientes.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>Deudas pendientes</Text>
            {deudoasPendientes.map((d) => {
              const yoDebo = d.deudor_id === miId;
              const companero = yoDebo ? d.acreedor : d.deudor;
              const amountColor = yoDebo ? Theme.colors.danger : Theme.colors.success;
              const statusBackground = yoDebo ? Theme.colors.dangerLight : Theme.colors.successLight;
              const statusText = yoDebo ? Theme.colors.danger : Theme.colors.success;

              return (
                <View key={d.id} style={styles.deudaCard}>
                  <AvatarInitials nombre={companero.nombre} apellidos={companero.apellidos} size={52} />
                  <View style={styles.deudaInfo}>
                    <Text style={styles.deudaNombre} numberOfLines={1}>
                      {companero.nombre}
                      {companero.apellidos ? ` ${companero.apellidos}` : ''}
                    </Text>
                    <Text style={styles.deudaConcepto} numberOfLines={2}>
                      {d.gasto.concepto}
                    </Text>
                  </View>
                  <View style={styles.deudaMeta}>
                    <Text style={[styles.deudaImporte, { color: amountColor }]}>
                      {formatImporte(d.importe)}
                    </Text>

                    {yoDebo ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.botonSaldar,
                          { backgroundColor: statusBackground },
                          pressed && styles.botonSaldarPressed,
                          saldando === d.id && { opacity: 0.6 },
                        ]}
                        onPress={() => handleSaldar(d)}
                        disabled={saldando === d.id}
                        accessibilityLabel={`Saldar deuda de ${formatImporte(d.importe)} con ${companero.nombre}`}
                        accessibilityRole="button"
                      >
                        {saldando === d.id ? (
                          <ActivityIndicator size="small" color={statusText} />
                        ) : (
                          <Text style={[styles.botonSaldarTexto, { color: statusText }]}>Saldar</Text>
                        )}
                      </Pressable>
                    ) : (
                      <View style={[styles.badgeEsperando, { backgroundColor: statusBackground }]}>
                        <Ionicons name="time-outline" size={13} color={statusText} />
                        <Text style={[styles.badgeEsperandoTexto, { color: statusText }]}>Esperando</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── Feed de movimientos ── */}
        {gastos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="wallet-outline" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitulo}>Sin gastos todavía</Text>
            <Text style={styles.emptySubtitulo}>
              Cuando alguien pague algo por la casa, aparecerá aquí para que todos contribuyan su parte.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.seccionTitulo}>Movimientos</Text>
            {gastos.map((g) => (
              <View key={g.id} style={styles.gastoCard}>
                <AvatarInitials nombre={g.pagador.nombre} apellidos={g.pagador.apellidos} size={46} />
                <View style={styles.gastoInfo}>
                  <Text style={styles.gastoConcepto}>{g.concepto}</Text>
                  <Text style={styles.gastoPagador}>Pagado por {g.pagador.nombre}</Text>
                  <Text style={styles.gastoFecha}>{formatFecha(g.fecha_creacion)}</Text>
                </View>
                <View style={styles.gastoImporteBox}>
                  <Text style={styles.gastoImporte}>{formatImporte(g.importe)}</Text>
                  <Text style={styles.gastoImporteSub}>total</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={abrirModal}
        accessibilityLabel="Añadir nuevo gasto"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={Theme.colors.surface} />
      </Pressable>

      {/* ── Modal Nuevo Gasto ── */}
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
                  conceptoFocused && { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
                ]}
                placeholder="Ej. Papel higiénico, gas, pizza…"
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
                  importeFocused && { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
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
    </View>
  );
}

