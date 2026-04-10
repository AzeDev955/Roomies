import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Clipboard from 'expo-clipboard';
import api from '@/services/api';
import { Theme } from '@/constants/theme';
import { styles } from '@/styles/casero/vivienda/detalle.styles';
import { COLORES_PRIORIDAD } from '@/styles/casero/vivienda/incidencias.styles';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

type Inquilino = {
  id: number;
  nombre: string;
  apellidos: string | null;
  email: string;
};

type IncidenciaResumen = {
  id: number;
  titulo: string;
  prioridad: Prioridad;
  estado: Estado;
};

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  metros_cuadrados: number | null;
  codigo_invitacion: string | null;
  inquilino: Inquilino | null;
  incidencias: IncidenciaResumen[];
};

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

type GastoRecurrente = {
  id: number;
  concepto: string;
  importe: number;
  dia_del_mes: number;
  activo: boolean;
};

const ETIQUETAS_TIPO: Record<string, string> = {
  DORMITORIO: 'Dormitorio',
  BANO: 'Baño',
  COCINA: 'Cocina',
  SALON: 'Salón',
  OTRO: 'Otro',
};

const HAB_ICONS: Record<string, any> = {
  DORMITORIO: 'bed-outline',
  BANO: 'water-outline',
  COCINA: 'restaurant-outline',
  SALON: 'tv-outline',
  OTRO: 'grid-outline',
};

const formatearImporte = (importe: number) =>
  importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const AvatarInitials = ({
  nombre,
  apellidos,
  size = 36,
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
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '700', color: Theme.colors.surface }}>
        {initials}
      </Text>
    </View>
  );
};

export default function ResumenViviendaTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [vivienda, setVivienda] = useState<Vivienda | null>(null);
  const [gastosRecurrentes, setGastosRecurrentes] = useState<GastoRecurrente[]>([]);
  const [loading, setLoading] = useState(true);
  const [codigosRevelados, setCodigosRevelados] = useState<Record<number, boolean>>({});
  const [mensualidadModalVisible, setMensualidadModalVisible] = useState(false);
  const [conceptoMensualidad, setConceptoMensualidad] = useState('');
  const [importeMensualidad, setImporteMensualidad] = useState('');
  const [diaMensualidad, setDiaMensualidad] = useState('');
  const [guardandoMensualidad, setGuardandoMensualidad] = useState(false);

  const cargarVivienda = useCallback(async () => {
    try {
      const { data } = await api.get<Vivienda>(`/viviendas/${id}`);
      setVivienda(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo cargar la vivienda.' });
    }
  }, [id]);

  const cargarGastosRecurrentes = useCallback(async () => {
    try {
      const { data } = await api.get<GastoRecurrente[]>(`/viviendas/${id}/gastos-recurrentes`);
      setGastosRecurrentes(data);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudieron cargar los gastos fijos.',
      });
      setGastosRecurrentes([]);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const cargarTodo = async () => {
        setLoading(true);
        await Promise.all([cargarVivienda(), cargarGastosRecurrentes()]);
        setLoading(false);
      };

      cargarTodo();
    }, [cargarGastosRecurrentes, cargarVivienda])
  );

  const revelarCodigo = async (habitacionId: number) => {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate para ver el código de invitación',
    });
    if (resultado.success) {
      setCodigosRevelados((prev) => ({ ...prev, [habitacionId]: true }));
    }
  };

  const copiarCodigo = async (codigo: string) => {
    const codigoLimpio = codigo.replace(/^room[-\s]*/i, '').trim();
    await Clipboard.setStringAsync(codigoLimpio);
    Toast.show({
      type: 'info',
      text1: 'Código copiado',
      text2: 'Pégalo en la app para unirte a la habitación.',
    });
  };

  const compartirCodigo = async (codigo: string) => {
    await Share.share({
      message: `Únete a tu nueva habitación en Roomies. Tu código de invitación es: ${codigo}`,
    });
  };

  const handleEliminarHabitacion = (hab: Habitacion) => {
    Alert.alert('Eliminar habitación', `¿Eliminar "${hab.nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/viviendas/${id}/habitaciones/${hab.id}`);
            cargarVivienda();
          } catch (err: any) {
            const mensaje = err.response?.data?.error ?? 'No se pudo eliminar la habitación.';
            Toast.show({ type: 'error', text1: mensaje });
          }
        },
      },
    ]);
  };

  const handleExpulsarInquilino = (hab: Habitacion) => {
    Alert.alert('¿Expulsar inquilino?', 'Esta acción desvinculará al usuario de la habitación.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Expulsar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/viviendas/${id}/habitaciones/${hab.id}/inquilino`);
            setVivienda((prev) =>
              prev
                ? {
                    ...prev,
                    habitaciones: prev.habitaciones.map((h) =>
                      h.id === hab.id ? { ...h, inquilino: null } : h
                    ),
                  }
                : prev
            );
          } catch (err: any) {
            const mensaje = err.response?.data?.error ?? 'No se pudo expulsar al inquilino.';
            Toast.show({ type: 'error', text1: mensaje });
          }
        },
      },
    ]);
  };

  const handleEditarHabitacion = (hab: Habitacion) => {
    router.push({
      pathname: '/casero/vivienda/[id]/editar-habitacion',
      params: {
        id,
        habId: String(hab.id),
        nombre: hab.nombre,
        tipo: hab.tipo,
        esHabitable: String(hab.es_habitable),
        metrosCuadrados: String(hab.metros_cuadrados ?? ''),
        inquilinoId: String(hab.inquilino?.id ?? ''),
      },
    });
  };

  const cerrarModalMensualidad = () => {
    setMensualidadModalVisible(false);
    setConceptoMensualidad('');
    setImporteMensualidad('');
    setDiaMensualidad('');
  };

  const handleGuardarMensualidad = async () => {
    const importeNum = parseFloat(importeMensualidad.replace(',', '.'));
    const diaNum = parseInt(diaMensualidad, 10);

    if (!conceptoMensualidad.trim()) {
      Toast.show({ type: 'error', text1: 'Indica un concepto para el gasto fijo.' });
      return;
    }

    if (isNaN(importeNum) || importeNum <= 0) {
      Toast.show({ type: 'error', text1: 'Introduce un importe válido mayor que 0.' });
      return;
    }

    if (!Number.isInteger(diaNum) || diaNum < 1 || diaNum > 31) {
      Toast.show({ type: 'error', text1: 'El día del mes debe estar entre 1 y 31.' });
      return;
    }

    setGuardandoMensualidad(true);
    try {
      await api.post(`/viviendas/${id}/gastos-recurrentes`, {
        concepto: conceptoMensualidad.trim(),
        importe: importeNum,
        dia_del_mes: diaNum,
      });
      await cargarGastosRecurrentes();
      cerrarModalMensualidad();
      Toast.show({
        type: 'success',
        text1: 'Gasto fijo creado',
        text2: `${conceptoMensualidad.trim()} · ${formatearImporte(importeNum)} · Día ${diaNum}`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo crear el gasto fijo.',
      });
    } finally {
      setGuardandoMensualidad(false);
    }
  };

  const puedeGuardarMensualidad =
    conceptoMensualidad.trim().length > 0 &&
    importeMensualidad.trim().length > 0 &&
    diaMensualidad.trim().length > 0;

  if (loading) return <LoadingScreen />;

  if (!vivienda) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTexto}>Vivienda no encontrada.</Text>
      </View>
    );
  }

  const numInquilinos = vivienda.habitaciones.filter((h) => h.inquilino !== null).length;
  const mensualidadesActivas = gastosRecurrentes.filter((gasto) => gasto.activo);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.headerNombre}>{vivienda.alias_nombre}</Text>
          <Text style={styles.headerDireccion}>{vivienda.direccion}</Text>
          <View style={styles.headerChips}>
            <View style={styles.chipHabitaciones}>
              <Text style={styles.chipHabitacionesTexto}>
                {vivienda.habitaciones.length} Habitaciones
              </Text>
            </View>
            <View style={styles.chipInquilinos}>
              <Text style={styles.chipInquilinosTexto}>{numInquilinos} Inquilinos</Text>
            </View>
          </View>
        </View>

        <View style={styles.accionesGrid}>
          <Pressable
            style={({ pressed }) => [styles.accionBtn, pressed && styles.accionBtnPressed]}
            onPress={() => router.push(`/casero/vivienda/${id}/incidencias`)}
          >
            <View style={styles.accionIconIncidencias}>
              <Ionicons name="warning-outline" size={22} color="#EA580C" />
            </View>
            <Text style={styles.accionLabel}>Incidencias</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accionBtn, pressed && styles.accionBtnPressed]}
            onPress={() =>
              router.push({
                pathname: '/casero/vivienda/[id]/nueva-incidencia',
                params: {
                  id: vivienda.id,
                  habitacionesJson: JSON.stringify(vivienda.habitaciones),
                },
              })
            }
          >
            <View style={styles.accionIconNuevaInc}>
              <Ionicons name="add-circle-outline" size={22} color="#059669" />
            </View>
            <Text style={styles.accionLabel}>Nueva Incidencia</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderTextGroup}>
            <Text style={styles.seccionTitulo}>Gastos fijos / Mensualidades</Text>
            <Text style={styles.sectionDescription}>
              Suscripciones y recibos fijos que la app divide de forma automática cada mes.
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
            onPress={() => setMensualidadModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Crear nuevo gasto fijo"
          >
            <Ionicons name="repeat-outline" size={16} color={Theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>Nuevo</Text>
          </Pressable>
        </View>

        {mensualidadesActivas.length === 0 ? (
          <View style={styles.recurringEmptyCard}>
            <View style={styles.recurringEmptyIcon}>
              <Ionicons name="calendar-outline" size={22} color={Theme.colors.primary} />
            </View>
            <View style={styles.recurringEmptyContent}>
              <Text style={styles.recurringEmptyTitle}>Aún no hay gastos fijos activos</Text>
              <Text style={styles.recurringEmptySubtitle}>
                Añade alquiler, internet o suministros para que Roomies los reparta
                automáticamente cada mes.
              </Text>
            </View>
          </View>
        ) : (
          mensualidadesActivas.map((gasto) => (
            <View key={gasto.id} style={styles.recurringCard}>
              <View style={styles.recurringIcon}>
                <Ionicons name="repeat" size={18} color={Theme.colors.primary} />
              </View>
              <View style={styles.recurringBody}>
                <Text style={styles.recurringTitle}>{gasto.concepto}</Text>
                <Text style={styles.recurringMeta}>
                  {formatearImporte(gasto.importe)} · Día {gasto.dia_del_mes}
                </Text>
              </View>
              <View style={styles.recurringBadge}>
                <Text style={styles.recurringBadgeText}>Activa</Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.seccionTitulo}>Habitaciones</Text>

        {[...vivienda.habitaciones]
          .sort((a, b) => Number(b.es_habitable) - Number(a.es_habitable) || a.id - b.id)
          .map((habitacion) => (
            <Pressable
              key={habitacion.id}
              style={({ pressed }) => [styles.habCard, pressed && styles.habCardPressed]}
              onPress={() => handleEditarHabitacion(habitacion)}
            >
              <View style={styles.habCardTop}>
                <View style={styles.habLeft}>
                  <View style={styles.habIconBox}>
                    <Ionicons
                      name={HAB_ICONS[habitacion.tipo] ?? 'grid-outline'}
                      size={20}
                      color={Theme.colors.textSecondary}
                    />
                  </View>
                  <View>
                    <Text style={styles.habNombre}>{habitacion.nombre}</Text>
                    <Text style={styles.habTipo}>
                      {ETIQUETAS_TIPO[habitacion.tipo] ?? habitacion.tipo}
                    </Text>
                  </View>
                </View>

                {habitacion.tipo === 'DORMITORIO' && habitacion.inquilino ? (
                  <Pressable
                    style={({ pressed }) => [styles.habInquilinoRight, pressed && styles.enlacePressed]}
                    onPress={() => router.push(`/casero/inquilino/${habitacion.inquilino!.id}`)}
                  >
                    <Text style={styles.habInquilinoNombre}>{habitacion.inquilino.nombre}</Text>
                    <AvatarInitials
                      nombre={habitacion.inquilino.nombre}
                      apellidos={habitacion.inquilino.apellidos}
                      size={36}
                    />
                  </Pressable>
                ) : habitacion.tipo === 'DORMITORIO' ? (
                  <Text style={styles.sinInquilino}>Vacía</Text>
                ) : null}
              </View>

              {habitacion.tipo === 'DORMITORIO' &&
              habitacion.es_habitable &&
              habitacion.codigo_invitacion ? (
                <View style={styles.codigoContainer}>
                  <Text style={styles.codigoLabel}>Código de invitación</Text>
                  {codigosRevelados[habitacion.id] ? (
                    <View style={styles.codigoReveladoFila}>
                      <Pressable
                        style={styles.codigoReveladoTextoArea}
                        onLongPress={() => copiarCodigo(habitacion.codigo_invitacion!)}
                      >
                        <Text style={styles.codigo}>{habitacion.codigo_invitacion}</Text>
                        <Text style={styles.codigoHint}>Mantén pulsado para copiar</Text>
                      </Pressable>
                      <CustomButton
                        label="Compartir"
                        variant="success"
                        onPress={() => compartirCodigo(habitacion.codigo_invitacion!)}
                        style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }}
                      />
                    </View>
                  ) : (
                    <Pressable
                      style={styles.codigoOcultoBtn}
                      onPress={() => revelarCodigo(habitacion.id)}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={14}
                        color={Theme.colors.textTertiary}
                      />
                      <Text style={styles.revelarTexto}>Toca para revelar código de invitación</Text>
                    </Pressable>
                  )}
                </View>
              ) : null}

              {habitacion.incidencias.length > 0 && (
                <View style={styles.incidenciasHabitacion}>
                  {habitacion.incidencias.map((inc) => (
                    <Pressable
                      key={inc.id}
                      style={styles.incidenciaFila}
                      onPress={() => router.push(`/incidencia/${inc.id}?puedeGestionar=true`)}
                    >
                      <View
                        style={[
                          styles.incidenciaDot,
                          { backgroundColor: COLORES_PRIORIDAD[inc.prioridad] },
                        ]}
                      />
                      <Text style={styles.incidenciaTitulo} numberOfLines={1}>
                        {inc.titulo}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </Pressable>
          ))}

        <CustomButton
          variant="outline"
          label="+ Añadir nueva habitación"
          onPress={() => router.push(`/casero/vivienda/${id}/nueva-habitacion`)}
          style={styles.botonAnadir}
        />
      </ScrollView>

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
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitulo}>Nuevo gasto fijo</Text>
            <Text style={styles.modalSubtitulo}>
              Configura un recibo recurrente para esta vivienda y Roomies se encargará del reparto.
            </Text>

            <View style={styles.infoBanner}>
              <Ionicons name="time-outline" size={16} color={Theme.colors.primary} />
              <Text style={styles.infoBannerTexto}>
                Roomies generará el gasto de forma automática la madrugada del día elegido y
                notificará a los inquilinos.
              </Text>
            </View>

            <CustomInput
              label="Concepto"
              placeholder="Ej. Alquiler, internet, luz"
              value={conceptoMensualidad}
              onChangeText={setConceptoMensualidad}
              maxLength={120}
            />

            <CustomInput
              label="Importe (€)"
              placeholder="800,00"
              value={importeMensualidad}
              onChangeText={setImporteMensualidad}
              keyboardType="decimal-pad"
            />

            <CustomInput
              label="Día del mes"
              placeholder="1"
              value={diaMensualidad}
              onChangeText={setDiaMensualidad}
              keyboardType="number-pad"
              maxLength={2}
            />

            <View style={styles.modalAcciones}>
              <CustomButton
                label="Cancelar"
                variant="secondary"
                onPress={cerrarModalMensualidad}
                style={styles.modalBoton}
              />
              <CustomButton
                label="Crear"
                onPress={handleGuardarMensualidad}
                disabled={!puedeGuardarMensualidad}
                loading={guardandoMensualidad}
                style={styles.modalBoton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
