import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAppTheme } from '@/contexts/ThemeContext';
import api from '@/services/api';
import {
  createEstadoItemStyles,
  createStyles,
} from '@/styles/inquilino/inventario.styles';

type EstadoItem = 'NUEVO' | 'BUENO' | 'DESGASTADO' | 'ROTO';

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
};

type FotoAsset = {
  id: number;
  url: string;
  fecha_subida: string;
};

type ItemInventario = {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoItem;
  revisado_por_inquilino: boolean;
  habitacion_id: number | null;
  vivienda_id: number | null;
  fecha_registro: string;
  habitacion: Habitacion | null;
  fotos: FotoAsset[];
};

type DatosVivienda = {
  miHabitacionId: number;
  vivienda: {
    id: number;
    alias_nombre: string;
    direccion?: string;
  };
};

type GrupoInventario = {
  key: string;
  titulo: string;
  subtitulo: string;
  items: ItemInventario[];
};

const ETIQUETAS_ESTADO: Record<EstadoItem, string> = {
  NUEVO: 'Nuevo',
  BUENO: 'Bueno',
  DESGASTADO: 'Desgastado',
  ROTO: 'Roto',
};

export default function InquilinoInventarioScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const estadoItemStyles = useMemo(() => createEstadoItemStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datosVivienda, setDatosVivienda] = useState<DatosVivienda | null>(null);
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [itemSeleccionado, setItemSeleccionado] = useState<ItemInventario | null>(null);
  const [fotoSeleccionadaIndex, setFotoSeleccionadaIndex] = useState(0);
  const [guardandoConformidad, setGuardandoConformidad] = useState(false);
  const [moduloDesactivado, setModuloDesactivado] = useState(false);

  const grupos = useMemo(() => construirGruposInventario(items), [items]);
  const itemsValidados = useMemo(
    () => items.filter((item) => item.revisado_por_inquilino).length,
    [items],
  );

  const cerrarModal = () => {
    setItemSeleccionado(null);
    setFotoSeleccionadaIndex(0);
    setGuardandoConformidad(false);
  };

  const cargarInventario = useCallback(async (esRecarga = false) => {
    if (esRecarga) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data: viviendaData } = await api.get<DatosVivienda>('/inquilino/vivienda');
      setDatosVivienda(viviendaData);

      const { data: inventarioData } = await api.get<ItemInventario[]>(
        `/viviendas/${viviendaData.vivienda.id}/inventario`,
      );
      setItems(inventarioData);
      setModuloDesactivado(false);
    } catch (error: any) {
      const mensaje = error.response?.data?.error;

      if (error.response?.status === 404) {
        setDatosVivienda(null);
        setItems([]);
        setModuloDesactivado(false);
        return;
      }

      if (error.response?.status === 403 && mensaje?.toLowerCase().includes('desactivado')) {
        setItems([]);
        setModuloDesactivado(true);
        return;
      }

      setModuloDesactivado(false);
      Toast.show({
        type: 'error',
        text1: mensaje ?? 'No se pudo cargar el inventario de la vivienda.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarInventario();
    }, [cargarInventario]),
  );

  const abrirRevision = (item: ItemInventario) => {
    setItemSeleccionado(item);
    setFotoSeleccionadaIndex(0);
  };

  const actualizarItemLocal = (itemActualizado: ItemInventario) => {
    setItems((prev) => prev.map((item) => (item.id === itemActualizado.id ? itemActualizado : item)));
    setItemSeleccionado(itemActualizado);
  };

  const confirmarConformidad = async () => {
    if (!itemSeleccionado) {
      return;
    }

    setGuardandoConformidad(true);
    try {
      const { data } = await api.patch<ItemInventario>(
        `/inventario/${itemSeleccionado.id}/conformidad`,
      );
      actualizarItemLocal(data);
      Toast.show({
        type: 'success',
        text1: 'Inventario validado',
        text2: 'Hemos guardado tu conformidad para este elemento.',
      });
      cerrarModal();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo guardar tu conformidad.',
      });
      setGuardandoConformidad(false);
    }
  };

  const marcarNoCoincide = () => {
    cerrarModal();
    Alert.alert(
      'No coincide',
      'Por favor, ve a la pestaña de Incidencias y abre un ticket adjuntando tus propias fotos del desperfecto para notificar al casero',
    );
  };

  const fotoActiva =
    itemSeleccionado && itemSeleccionado.fotos.length > 0
      ? itemSeleccionado.fotos[Math.min(fotoSeleccionadaIndex, itemSeleccionado.fotos.length - 1)]
      : null;

  if (loading) {
    return <LoadingScreen />;
  }

  if (moduloDesactivado) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="lock-closed-outline" size={44} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Inventario desactivado</Text>
          <Text style={styles.emptySubtitle}>
            El casero ha desactivado este modulo para la vivienda. Cuando vuelva a estar activo,
            podras revisar los elementos desde aqui.
          </Text>
        </View>
      </View>
    );
  }

  if (!datosVivienda) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="home-outline" size={44} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Todavía no tienes vivienda asignada</Text>
          <Text style={styles.emptySubtitle}>
            Cuando te unas a una habitación verás aquí el inventario con fotos para revisar el estado de entrada.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Check-in visual</Text>
          <Text style={styles.headerSubtitle}>
            Revisa el inventario estancia por estancia y valida lo que coincide con lo que ves en la vivienda.
          </Text>
        </View>

        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>Vivienda activa</Text>
          <Text style={styles.heroTitle}>{datosVivienda.vivienda.alias_nombre}</Text>
          <Text style={styles.heroSubtitle}>
            Consulta fotos, confirma elementos correctos y usa incidencias si detectas diferencias.
          </Text>

          <View style={styles.heroStats}>
            <View style={[styles.heroStat, styles.heroStatPrimary]}>
              <Ionicons name="images-outline" size={14} color={theme.colors.primary} />
              <Text style={[styles.heroStatText, styles.heroStatTextPrimary]}>
                {items.length} ítems
              </Text>
            </View>
            <View style={[styles.heroStat, styles.heroStatSuccess]}>
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.success} />
              <Text style={[styles.heroStatText, styles.heroStatTextSuccess]}>
                {itemsValidados} validados
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventario por estancia</Text>

          {refreshing ? (
            <View style={styles.loaderBlock}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : grupos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="file-tray-outline" size={42} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Aún no hay inventario registrado</Text>
              <Text style={styles.emptySubtitle}>
                En cuanto el casero suba los elementos y sus fotos, podrás revisarlos desde aquí.
              </Text>
            </View>
          ) : (
            grupos.map((grupo) => (
              <View key={grupo.key} style={styles.groupSection}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{grupo.titulo}</Text>
                  <Text style={styles.groupSubtitle}>{grupo.subtitulo}</Text>
                </View>

                <View style={styles.itemList}>
                  {grupo.items.map((item) => (
                    <Card key={item.id} style={styles.itemCard}>
                      <View style={styles.itemTopRow}>
                        <View style={styles.itemNameBlock}>
                          <Text style={styles.itemName}>{item.nombre}</Text>
                          {!!item.descripcion && (
                            <Text style={styles.itemDescription}>{item.descripcion}</Text>
                          )}
                        </View>

                        <View
                          style={[
                            styles.statusPill,
                            {
                              backgroundColor: estadoItemStyles[item.estado].background,
                              borderColor: estadoItemStyles[item.estado].border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: estadoItemStyles[item.estado].text },
                            ]}
                          >
                            {ETIQUETAS_ESTADO[item.estado]}
                          </Text>
                        </View>
                      </View>

                      {item.fotos.length > 0 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.photoScroller}
                          contentContainerStyle={styles.photoScrollerContent}
                        >
                          {item.fotos.map((foto) => (
                            <Image
                              key={foto.id}
                              source={{ uri: foto.url }}
                              contentFit="cover"
                              style={styles.photoThumb}
                            />
                          ))}
                        </ScrollView>
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Ionicons name="image-outline" size={32} color={theme.colors.primary} />
                          <Text style={styles.photoPlaceholderTitle}>Sin fotos todavía</Text>
                          <Text style={styles.photoPlaceholderSubtitle}>
                            Este elemento aún no tiene evidencia visual cargada.
                          </Text>
                        </View>
                      )}

                      <View style={styles.metaRow}>
                        <View style={styles.metaPill}>
                          <Ionicons name="camera-outline" size={13} color={theme.colors.textMedium} />
                          <Text style={styles.metaPillText}>
                            {item.fotos.length} foto{item.fotos.length === 1 ? '' : 's'}
                          </Text>
                        </View>

                        {item.revisado_por_inquilino ? (
                          <View style={styles.validatedBadge}>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={13}
                              color={theme.colors.success}
                            />
                            <Text style={styles.validatedBadgeText}>✓ Validado por ti</Text>
                          </View>
                        ) : null}
                      </View>

                      {!item.revisado_por_inquilino && (
                        <View style={styles.itemActions}>
                          <CustomButton
                            label="Revisar y Validar"
                            onPress={() => abrirRevision(item)}
                          />
                        </View>
                      )}
                    </Card>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={!!itemSeleccionado} transparent animationType="slide" onRequestClose={cerrarModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={cerrarModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {itemSeleccionado && (
              <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{itemSeleccionado.nombre}</Text>
                <Text style={styles.modalSubtitle}>
                  Comprueba las fotos en grande antes de dar conformidad al estado registrado.
                </Text>

                {fotoActiva ? (
                  <>
                    <Image source={{ uri: fotoActiva.url }} contentFit="cover" style={styles.modalImage} />

                    {itemSeleccionado.fotos.length > 1 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.modalThumbScrollerContent}
                      >
                        {itemSeleccionado.fotos.map((foto, index) => {
                          const activa = index === fotoSeleccionadaIndex;
                          return (
                            <Pressable
                              key={foto.id}
                              onPress={() => setFotoSeleccionadaIndex(index)}
                              style={[
                                styles.modalThumbButton,
                                activa && styles.modalThumbButtonActive,
                              ]}
                            >
                              <Image
                                source={{ uri: foto.url }}
                                contentFit="cover"
                                style={styles.modalThumb}
                              />
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    )}
                  </>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
                    <Text style={styles.photoPlaceholderTitle}>No hay fotos para revisar</Text>
                    <Text style={styles.photoPlaceholderSubtitle}>
                      Puedes marcar “No coincide” para que se te recuerde abrir una incidencia con tus propias imágenes.
                    </Text>
                  </View>
                )}

                <View style={styles.modalMetaCard}>
                  <Text style={styles.modalMetaTitle}>Estado registrado</Text>
                  <Text style={styles.modalMetaText}>{ETIQUETAS_ESTADO[itemSeleccionado.estado]}</Text>
                  {!!itemSeleccionado.descripcion && (
                    <Text style={styles.modalMetaText}>{itemSeleccionado.descripcion}</Text>
                  )}
                </View>

                <View style={styles.modalActions}>
                  <CustomButton
                    label={guardandoConformidad ? 'Guardando conformidad...' : 'Todo correcto (Dar Conformidad)'}
                    onPress={confirmarConformidad}
                    loading={guardandoConformidad}
                  />

                  <Pressable
                    onPress={marcarNoCoincide}
                    style={({ pressed }) => [
                      styles.destructiveSoftButton,
                      pressed && styles.destructiveSoftButtonPressed,
                    ]}
                  >
                    <Text style={styles.destructiveSoftButtonText}>No coincide</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function construirGruposInventario(items: ItemInventario[]): GrupoInventario[] {
  const grupos = new Map<string, GrupoInventario>();

  items.forEach((item) => {
    const key = item.habitacion
      ? `habitacion-${item.habitacion.id}`
      : `vivienda-${item.vivienda_id ?? 'comun'}`;
    const titulo = item.habitacion?.nombre ?? 'Zonas comunes';
    const subtitulo = item.habitacion
      ? 'Elementos asignados a esta estancia'
      : 'Cocina, salón, baño y demás espacios compartidos';

    if (!grupos.has(key)) {
      grupos.set(key, { key, titulo, subtitulo, items: [] });
    }

    grupos.get(key)!.items.push(item);
  });

  return Array.from(grupos.values());
}
