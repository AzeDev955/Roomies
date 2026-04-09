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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/inquilino/gastos.styles';

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Deuda = {
  id: number;
  deudor_id: number;
  acreedor_id: number;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADA';
};

type Gasto = {
  id: number;
  concepto: string;
  importe: number;
  fecha_creacion: string;
  pagador_id: number;
  pagador: { id: number; nombre: string; apellidos: string | null };
  deudas: Deuda[];
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
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [conceptoFocused, setConceptoFocused] = useState(false);
  const [importeFocused, setImporteFocused] = useState(false);

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarGastos = useCallback(async (vId: number) => {
    try {
      const { data } = await api.get<Gasto[]>(`/viviendas/${vId}/gastos`);
      setGastos(data);
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

          if (!activo) return;
          setViviendaId(vId);
          setMiId(uId);
          await cargarGastos(vId);
        } catch {
          // Sin vivienda — se muestra empty state
        } finally {
          if (activo) setLoading(false);
        }
      };

      inicializar();
      return () => { activo = false; };
    }, [cargarGastos])
  );

  // ── Cálculo de balance ────────────────────────────────────────────────────

  const calcularBalance = (): number => {
    if (!miId) return 0;
    let balance = 0;
    for (const g of gastos) {
      for (const d of g.deudas) {
        if (d.estado === 'PAGADA') continue;
        if (d.acreedor_id === miId) balance += d.importe;
        if (d.deudor_id === miId) balance -= d.importe;
      }
    }
    return balance;
  };

  // ── Guardar gasto ─────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!concepto.trim() || !importe.trim() || !viviendaId) return;
    const importeNum = parseFloat(importe.replace(',', '.'));
    if (isNaN(importeNum) || importeNum <= 0) {
      Toast.show({ type: 'error', text1: 'Introduce un importe válido mayor que 0.' });
      return;
    }
    setGuardando(true);
    try {
      const { data: nuevoGasto } = await api.post<Gasto>(
        `/viviendas/${viviendaId}/gastos`,
        { concepto: concepto.trim(), importe: importeNum }
      );
      setGastos((prev) => [nuevoGasto, ...prev]);
      cerrarModal();
      Toast.show({ type: 'success', text1: '¡Gasto registrado!', text2: `${concepto.trim()} · ${formatImporte(importeNum)}` });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo registrar el gasto.' });
    } finally {
      setGuardando(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setConcepto('');
    setImporte('');
  };

  const puedeGuardar = concepto.trim().length > 0 && importe.trim().length > 0;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  const balance = calcularBalance();
  const debeMas = balance < 0;
  const heroColor = debeMas ? Theme.colors.danger : Theme.colors.success;
  const heroBackground = heroColor + '15';
  const heroLabel = debeMas ? 'Debes al grupo' : balance === 0 ? 'Estás al día' : 'Te deben';

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
          <Text style={[styles.heroEtiqueta, { color: heroColor }]}>
            {heroLabel.toUpperCase()}
          </Text>
          <Text style={[styles.heroImporte, { color: heroColor }]}>
            {formatImporte(Math.abs(balance))}
          </Text>
          <Text style={[styles.heroDescripcion, { color: heroColor }]}>
            {debeMas
              ? 'Tienes deudas pendientes con tus compañeros'
              : balance === 0
              ? 'No tienes deudas pendientes'
              : 'Tus compañeros te deben dinero'}
          </Text>
        </View>

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
        onPress={() => setModalVisible(true)}
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

            {/* Concepto */}
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

            {/* Importe */}
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

            {/* Acciones */}
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
