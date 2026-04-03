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
  const [peso, setPeso] = useState('');
  const [guardando, setGuardando] = useState(false);

  // — Modal asignación fija —
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaLimpieza | null>(null);
  const [asignando, setAsignando] = useState(false);

  // — Generar turnos —
  const [generando, setGenerando] = useState(false);

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
    setPeso('');
  };

  const handleGuardar = async () => {
    const pesoNum = parseFloat(peso);
    if (!nombre.trim() || isNaN(pesoNum) || pesoNum <= 0) return;
    setGuardando(true);
    try {
      const { data } = await api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, {
        nombre: nombre.trim(),
        peso: pesoNum,
      });
      setZonas((prev) => [...prev, data]);
      cerrarModalZona();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo crear la zona.' });
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = nombre.trim().length > 0 && parseFloat(peso) > 0;

  // — Asignación fija —
  const abrirModalAsignacion = (zona: ZonaLimpieza) => setZonaSeleccionada(zona);
  const cerrarModalAsignacion = () => { setZonaSeleccionada(null); };

  const handleAsignar = async (usuarioId: number) => {
    if (!zonaSeleccionada) return;
    setAsignando(true);
    try {
      const { data } = await api.post<AsignacionFija>(
        `/viviendas/${id}/limpieza/zonas/${zonaSeleccionada.id}/asignacion`,
        { usuario_id: usuarioId }
      );
      setZonas((prev) =>
        prev.map((z) =>
          z.id === zonaSeleccionada.id
            ? { ...z, asignaciones_fijas: [{ id: data.id, usuario_id: data.usuario_id, usuario: data.usuario }] }
            : z
        )
      );
      cerrarModalAsignacion();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo asignar.' });
    } finally {
      setAsignando(false);
    }
  };

  const handleQuitarAsignacion = async () => {
    if (!zonaSeleccionada) return;
    setAsignando(true);
    try {
      await api.delete(`/viviendas/${id}/limpieza/zonas/${zonaSeleccionada.id}/asignacion`);
      setZonas((prev) =>
        prev.map((z) =>
          z.id === zonaSeleccionada.id ? { ...z, asignaciones_fijas: [] } : z
        )
      );
      cerrarModalAsignacion();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo quitar la asignación.' });
    } finally {
      setAsignando(false);
    }
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
    const asignacion = (item.asignaciones_fijas ?? [])[0] ?? null;
    return (
      <Card style={{ marginBottom: Theme.spacing.md }}>
        <View style={styles.cardRow}>
          <Text style={styles.zonaNombre}>{item.nombre}</Text>
          <View style={[styles.badge, item.activa ? styles.badgeActiva : styles.badgeInactiva]}>
            <Text style={[styles.badgeTexto, item.activa ? styles.badgeTextoActiva : styles.badgeTextoInactiva]}>
              {item.activa ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
        </View>
        <Text style={styles.zonaPeso}>Peso: {item.peso}</Text>
        <View style={styles.asignacionRow}>
          {asignacion ? (
            <Pressable onPress={() => abrirModalAsignacion(item)} hitSlop={6}>
              <Text style={styles.asignacionFija}>👤 Fijo: {nombreCorto(asignacion.usuario)}</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => abrirModalAsignacion(item)} hitSlop={6}>
              <Text style={styles.asignarLink}>+ Asignar inquilino fijo</Text>
            </Pressable>
          )}
        </View>
      </Card>
    );
  };

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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay zonas definidas. Pulsa + para añadir la primera.</Text>
          }
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
            <CustomInput
              label="Nombre de la zona"
              placeholder="ej. Cocina, Baño 1, Pasillo..."
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
            />
            <CustomInput
              label="Peso (esfuerzo relativo)"
              placeholder="ej. 10"
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />
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

      {/* Modal asignación fija */}
      <Modal
        visible={zonaSeleccionada !== null}
        animationType="slide"
        transparent
        onRequestClose={cerrarModalAsignacion}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Asignar inquilino fijo</Text>
            {zonaSeleccionada && (
              <Text style={styles.modalSubtitulo}>{zonaSeleccionada.nombre}</Text>
            )}
            {inquilinos.length === 0 ? (
              <Text style={styles.emptyText}>No hay inquilinos en esta vivienda.</Text>
            ) : (
              inquilinos.map((inq) => {
                const esActual = (zonaSeleccionada?.asignaciones_fijas ?? [])[0]?.usuario_id === inq.id;
                return (
                  <Pressable
                    key={inq.id}
                    style={({ pressed }) => [
                      styles.inquilinoRow,
                      esActual && styles.inquilinoRowActual,
                      pressed && styles.botonPressed,
                    ]}
                    onPress={() => handleAsignar(inq.id)}
                    disabled={asignando}
                  >
                    <Text style={[styles.inquilinoNombre, esActual && styles.inquilinoNombreActual]}>
                      {inq.nombre} {inq.apellidos ?? ''}
                    </Text>
                    {esActual && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })
            )}
            {((zonaSeleccionada?.asignaciones_fijas ?? []).length > 0) && (
              <Pressable
                style={({ pressed }) => [styles.botonQuitarAsignacion, pressed && styles.botonPressed]}
                onPress={handleQuitarAsignacion}
                disabled={asignando}
              >
                {asignando ? (
                  <ActivityIndicator color={Theme.colors.danger} />
                ) : (
                  <Text style={styles.botonQuitarTexto}>Quitar asignación</Text>
                )}
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.botonCancelar, { marginTop: Theme.spacing.xs }, pressed && styles.botonPressed]}
              onPress={cerrarModalAsignacion}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
