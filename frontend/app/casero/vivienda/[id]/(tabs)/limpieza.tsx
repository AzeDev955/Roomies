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
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { useGlobalSearchParams } from 'expo-router';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { styles } from '@/styles/casero/vivienda/limpieza.styles';

// ── T-Shirt Sizing ────────────────────────────────────────────────────────────
const TALLAS = [
  { label: 'Ligera', peso: 3 },
  { label: 'Normal', peso: 6 },
  { label: 'Intensa', peso: 10 },
] as const;

const ETIQUETA_ESFUERZO: Record<number, string> = { 3: 'Ligera', 6: 'Normal', 10: 'Intensa' };

const etiquetaEsfuerzo = (peso: number) =>
  ETIQUETA_ESFUERZO[peso] ? `Esfuerzo: ${ETIQUETA_ESFUERZO[peso]}` : `Peso: ${peso}`;

const QUICK_CHIPS = ['Cocina', 'Baño', 'Salón', 'Pasillo'];

const ZONAS_BASE = [
  { nombre: 'Cocina', peso: 10 },
  { nombre: 'Salón', peso: 6 },
  { nombre: 'Baño', peso: 6 },
];

// ─────────────────────────────────────────────────────────────────────────────

type Inquilino = {
  id: number;
  nombre: string;
  apellidos: string | null;
};

type AsignacionFija = {
  id: number;
  usuario_id: number;
  usuario: Inquilino;
};

type ZonaLimpieza = {
  id: number;
  nombre: string;
  peso: number;
  activa: boolean;
  asignaciones_fijas: AsignacionFija[];
};

export default function LimpiezaCaseroTab() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [zonas, setZonas] = useState<ZonaLimpieza[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [loading, setLoading] = useState(true);

  // — Modal nueva zona —
  const [modalZonaVisible, setModalZonaVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [pesoSeleccionado, setPesoSeleccionado] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  // — Modal asignación fija (multi-select) —
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaLimpieza | null>(null);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [asignando, setAsignando] = useState(false);

  // — Acciones globales —
  const [generando, setGenerando] = useState(false);
  const [creandoBase, setCreandoBase] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await Promise.all([cargarZonas(), cargarInquilinos()]);
      setLoading(false);
    };
    inicializar();
  }, [id]);

  const cargarZonas = async () => {
    try {
      const { data } = await api.get<ZonaLimpieza[]>(`/viviendas/${id}/limpieza/zonas`);
      setZonas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar las zonas.' });
    }
  };

  const cargarInquilinos = async () => {
    try {
      const { data } = await api.get<{ habitaciones: { inquilino: Inquilino | null }[] }>(`/viviendas/${id}`);
      setInquilinos(
        data.habitaciones
          .filter((h) => h.inquilino !== null)
          .map((h) => h.inquilino!)
      );
    } catch {
      // non-critical
    }
  };

  // — Nueva zona —
  const cerrarModalZona = () => {
    setModalZonaVisible(false);
    setNombre('');
    setPesoSeleccionado(null);
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || pesoSeleccionado === null) return;
    setGuardando(true);
    try {
      const { data } = await api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, {
        nombre: nombre.trim(),
        peso: pesoSeleccionado,
      });
      setZonas((prev) => [...prev, { ...data, asignaciones_fijas: [] }]);
      cerrarModalZona();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo crear la zona.' });
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = nombre.trim().length > 0 && pesoSeleccionado !== null;

  // — Starter Pack —
  const handleGenerarZonasBasicas = async () => {
    setCreandoBase(true);
    try {
      const resultados = await Promise.all(
        ZONAS_BASE.map((z) => api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, z))
      );
      setZonas(resultados.map((r) => ({ ...r.data, asignaciones_fijas: [] })));
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudieron crear las zonas base.' });
    } finally {
      setCreandoBase(false);
    }
  };

  // — Asignación fija multi-select —
  const abrirModalAsignacion = (zona: ZonaLimpieza) => {
    setZonaSeleccionada(zona);
    setSeleccionados((zona.asignaciones_fijas ?? []).map((a) => a.usuario_id));
  };

  const cerrarModalAsignacion = () => {
    setZonaSeleccionada(null);
    setSeleccionados([]);
  };

  const toggleSeleccion = (usuarioId: number) => {
    setSeleccionados((prev) =>
      prev.includes(usuarioId) ? prev.filter((x) => x !== usuarioId) : [...prev, usuarioId]
    );
  };

  const handleGuardarAsignacion = async () => {
    if (!zonaSeleccionada) return;
    setAsignando(true);
    try {
      const { data } = await api.post<AsignacionFija[]>(
        `/viviendas/${id}/limpieza/zonas/${zonaSeleccionada.id}/asignacion`,
        { usuario_ids: seleccionados }
      );
      setZonas((prev) =>
        prev.map((z) =>
          z.id === zonaSeleccionada.id ? { ...z, asignaciones_fijas: data } : z
        )
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
      'Eliminar zona',
      `¿Eliminar "${zona.nombre}"? Se borrarán también sus asignaciones y turnos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/viviendas/${id}/limpieza/zonas/${zona.id}`);
              setZonas((prev) => prev.filter((z) => z.id !== zona.id));
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo eliminar la zona.' });
            }
          },
        },
      ]
    );
  };

  const handleGenerarTurnos = async () => {
    setGenerando(true);
    try {
      await api.post(`/viviendas/${id}/limpieza/generar`);
      Alert.alert(
        '¡Turnos generados!',
        'El algoritmo ha repartido las tareas de limpieza para la próxima semana.'
      );
    } catch (err: any) {
      Alert.alert(
        'No se pudieron generar los turnos',
        err.response?.data?.error ?? 'Ha ocurrido un error inesperado.'
      );
    } finally {
      setGenerando(false);
    }
  };

  const nombreCorto = (inq: Inquilino) =>
    `${inq.nombre}${inq.apellidos ? ` ${inq.apellidos[0]}.` : ''}`;

  const renderZona = ({ item }: { item: ZonaLimpieza }) => {
    const asignaciones = item.asignaciones_fijas ?? [];
    const etiquetaFijos =
      asignaciones.length > 0
        ? `👤 Fijos: ${asignaciones.map((a) => nombreCorto(a.usuario)).join(', ')}`
        : null;

    return (
      <Card style={{ marginBottom: Theme.spacing.md }}>
        <View style={styles.cardRow}>
          <Text style={styles.zonaNombre}>{item.nombre}</Text>
          <View style={[styles.badge, item.activa ? styles.badgeActiva : styles.badgeInactiva]}>
            <Text style={[styles.badgeTexto, item.activa ? styles.badgeTextoActiva : styles.badgeTextoInactiva]}>
              {item.activa ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
          <Pressable onPress={() => handleEliminarZona(item)} hitSlop={8} style={{ paddingLeft: 8 }}>
            <Text style={styles.eliminarBtn}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.zonaPeso}>{etiquetaEsfuerzo(item.peso)}</Text>
        <View style={styles.asignacionRow}>
          <Pressable onPress={() => abrirModalAsignacion(item)} hitSlop={6}>
            {etiquetaFijos ? (
              <Text style={styles.asignacionFija}>{etiquetaFijos}</Text>
            ) : (
              <Text style={styles.asignarLink}>+ Asignar inquilino(s) fijo(s)</Text>
            )}
          </Pressable>
        </View>
      </Card>
    );
  };

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay zonas definidas todavía.</Text>
      <CustomButton
        label={creandoBase ? 'Creando...' : 'Generar zonas básicas'}
        variant="outline"
        onPress={handleGenerarZonasBasicas}
        disabled={creandoBase}
        style={{ marginTop: Theme.spacing.md }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomButton
        label={generando ? 'Generando...' : 'Generar Turnos Semanales (Test)'}
        variant="primary"
        onPress={handleGenerarTurnos}
        disabled={generando || loading}
        style={styles.botonGenerar}
      />
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={zonas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderZona}
          ListEmptyComponent={emptyComponent}
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalZonaVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>

      {/* Modal nueva zona */}
      <Modal visible={modalZonaVisible} animationType="slide" transparent onRequestClose={cerrarModalZona}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Nueva zona</Text>

            {/* Quick Chips */}
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
              label="Nombre de la zona"
              placeholder="ej. Cocina, Baño 1, Pasillo..."
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
            />

            {/* T-Shirt Sizing */}
            <Text style={styles.tshirtLabel}>Esfuerzo</Text>
            <View style={styles.tshirtRow}>
              {TALLAS.map((talla) => (
                <Pressable
                  key={talla.peso}
                  style={[
                    styles.tshirtBtn,
                    pesoSeleccionado === talla.peso && styles.tshirtBtnActivo,
                  ]}
                  onPress={() => setPesoSeleccionado(talla.peso)}
                >
                  <Text
                    style={[
                      styles.tshirtBtnTexto,
                      pesoSeleccionado === talla.peso && styles.tshirtBtnTextoActivo,
                    ]}
                  >
                    {talla.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModalZona}
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal asignación fija — multi-select */}
      <Modal
        visible={zonaSeleccionada !== null}
        animationType="slide"
        transparent
        onRequestClose={cerrarModalAsignacion}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Asignar fijos</Text>
            {zonaSeleccionada && (
              <Text style={styles.modalSubtitulo}>{zonaSeleccionada.nombre}</Text>
            )}
            {inquilinos.length === 0 ? (
              <Text style={styles.emptyText}>No hay inquilinos en esta vivienda.</Text>
            ) : (
              inquilinos.map((inq) => {
                const seleccionado = seleccionados.includes(inq.id);
                return (
                  <Pressable
                    key={inq.id}
                    style={({ pressed }) => [
                      styles.inquilinoRow,
                      seleccionado && styles.inquilinoRowActual,
                      pressed && styles.botonPressed,
                    ]}
                    onPress={() => toggleSeleccion(inq.id)}
                    disabled={asignando}
                  >
                    <Text style={[styles.inquilinoNombre, seleccionado && styles.inquilinoNombreActual]}>
                      {inq.nombre} {inq.apellidos ?? ''}
                    </Text>
                    {seleccionado && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })
            )}
            <View style={[styles.modalAcciones, { marginTop: Theme.spacing.md }]}>
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
                {asignando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
