import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useRouter } from 'expo-router';
import { Card } from '@/components/common/Card';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Theme } from '@/constants/theme';
import api from '@/services/api';
import { onModulosViviendaActualizados } from '@/utils/viviendaModules';
import {
  ESTADO_ITEM_BG,
  ESTADO_ITEM_BORDER,
  ESTADO_ITEM_TEXT,
  styles,
} from '@/styles/casero/inventario.styles';

type EstadoItem = 'NUEVO' | 'BUENO' | 'DESGASTADO' | 'ROTO';

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
};

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  mod_inventario: boolean;
  habitaciones: Habitacion[];
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
  habitacion_id: number | null;
  vivienda_id: number | null;
  fecha_registro: string;
  habitacion: Habitacion | null;
  fotos: FotoAsset[];
};

type UbicacionFormulario =
  | { tipo: 'VIVIENDA'; id: number }
  | { tipo: 'HABITACION'; id: number }
  | null;

type GrupoInventario = {
  key: string;
  titulo: string;
  subtitulo: string;
  items: ItemInventario[];
};

const ESTADOS_ITEM: EstadoItem[] = ['NUEVO', 'BUENO', 'DESGASTADO', 'ROTO'];

const ETIQUETAS_ESTADO: Record<EstadoItem, string> = {
  NUEVO: 'Nuevo',
  BUENO: 'Bueno',
  DESGASTADO: 'Desgastado',
  ROTO: 'Roto',
};

export default function CaseroInventarioScreen() {
  const router = useRouter();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [hayViviendas, setHayViviendas] = useState(false);
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<number | null>(null);
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<EstadoItem>('BUENO');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<UbicacionFormulario>(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const viviendaSeleccionada =
    viviendas.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ?? null;

  const grupos = construirGruposInventario(items);

  const cargarInventario = useCallback(async (viviendaId: number) => {
    setLoadingItems(true);
    try {
      const { data } = await api.get<ItemInventario[]>(`/viviendas/${viviendaId}/inventario`);
      setItems(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo cargar el inventario.' });
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const cargarContexto = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda[]>('/viviendas');
      const viviendasConInventario = data.filter((vivienda) => vivienda.mod_inventario);
      setHayViviendas(data.length > 0);
      setViviendas(viviendasConInventario);

      if (viviendasConInventario.length === 0) {
        setViviendaSeleccionadaId(null);
        setItems([]);
        return;
      }

      const viviendaInicial =
        viviendasConInventario.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ??
        viviendasConInventario[0];

      setViviendaSeleccionadaId(viviendaInicial.id);
      await cargarInventario(viviendaInicial.id);
    } catch {
      setViviendas([]);
      setHayViviendas(false);
      setViviendaSeleccionadaId(null);
      setItems([]);
      Toast.show({ type: 'error', text1: 'No se pudieron cargar tus viviendas.' });
    } finally {
      setLoading(false);
    }
  }, [cargarInventario, viviendaSeleccionadaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  useEffect(() => onModulosViviendaActualizados(() => cargarContexto()), [cargarContexto]);

  const reiniciarFormulario = useCallback(() => {
    setNombre('');
    setDescripcion('');
    setEstado('BUENO');
    setImagenSeleccionada(null);
    setUbicacionSeleccionada(
      viviendaSeleccionadaId ? { tipo: 'VIVIENDA', id: viviendaSeleccionadaId } : null,
    );
  }, [viviendaSeleccionadaId]);

  const abrirModal = () => {
    reiniciarFormulario();
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    reiniciarFormulario();
  };

  const cambiarVivienda = async (viviendaId: number) => {
    setViviendaSeleccionadaId(viviendaId);
    await cargarInventario(viviendaId);
  };

  const seleccionarImagen = async () => {
    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Toast.show({
          type: 'info',
          text1: 'Permiso necesario',
          text2: 'Necesitamos acceso a tu galería para adjuntar una foto.',
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

    if (!resultado.canceled && resultado.assets[0]) {
      setImagenSeleccionada(resultado.assets[0]);
    }
  };

  const subirFotoInventario = async (itemId: number, asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();

    if (Platform.OS === 'web' && asset.file) {
      formData.append('foto', asset.file);
    } else {
      formData.append('foto', {
        uri: asset.uri,
        name: asset.fileName ?? `inventario-${itemId}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as never);
    }

    await api.post(`/inventario/${itemId}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const crearItem = async () => {
    if (!viviendaSeleccionadaId) {
      return;
    }

    if (!nombre.trim()) {
      Toast.show({ type: 'info', text1: 'Añade un nombre para el ítem.' });
      return;
    }

    if (!ubicacionSeleccionada) {
      Toast.show({ type: 'info', text1: 'Selecciona una ubicación.' });
      return;
    }

    setGuardando(true);
    try {
      const payload =
        ubicacionSeleccionada.tipo === 'HABITACION'
          ? {
              nombre: nombre.trim(),
              descripcion: descripcion.trim() || undefined,
              estado,
              habitacion_id: ubicacionSeleccionada.id,
            }
          : {
              nombre: nombre.trim(),
              descripcion: descripcion.trim() || undefined,
              estado,
              vivienda_id: viviendaSeleccionadaId,
            };

      const { data } = await api.post<ItemInventario>(
        `/viviendas/${viviendaSeleccionadaId}/inventario`,
        payload,
      );

      if (imagenSeleccionada) {
        await subirFotoInventario(data.id, imagenSeleccionada);
      }

      await cargarInventario(viviendaSeleccionadaId);
      cerrarModal();
      Toast.show({ type: 'success', text1: 'Ítem creado correctamente.' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo guardar el ítem.',
      });
    } finally {
      setGuardando(false);
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
            <Ionicons name="home-outline" size={44} color={Theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Primero añade una vivienda</Text>
          <Text style={styles.emptySubtitle}>
            En cuanto tengas una propiedad creada podrás registrar muebles, electrodomésticos y su estado.
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
          <Text style={styles.headerTitle}>Inventario</Text>
          <Text style={styles.headerSubtitle}>
            Deja registrado qué hay en cada estancia y acompáñalo de fotos para blindar el estado de entrada.
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

        {viviendaSeleccionada && (
          <Card style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>Vivienda activa</Text>
              <Text style={styles.heroTitle}>{viviendaSeleccionada.alias_nombre}</Text>
              <Text style={styles.heroAddress}>{viviendaSeleccionada.direccion}</Text>
            </View>
            <View style={styles.heroStats}>
              <View style={[styles.heroStat, styles.heroStatPrimary]}>
                <Ionicons name="albums-outline" size={14} color={Theme.colors.primary} />
                <Text style={[styles.heroStatText, styles.heroStatTextPrimary]}>
                  {items.length} ítems
                </Text>
              </View>
              <View style={[styles.heroStat, styles.heroStatNeutral]}>
                <Ionicons name="grid-outline" size={14} color={Theme.colors.textMedium} />
                <Text style={[styles.heroStatText, styles.heroStatTextNeutral]}>
                  {viviendaSeleccionada.habitaciones.length} ubicaciones
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Items registrados</Text>

        {loadingItems ? (
          <View style={styles.loaderBlock}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        ) : grupos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="file-tray-outline" size={42} color={Theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Todavía no hay inventario</Text>
            <Text style={styles.emptySubtitle}>
              Empieza por las piezas clave de la vivienda y añade al menos una foto de referencia.
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
                {grupo.items.map((item) => {
                  const fotoPrincipal = item.fotos[0]?.url;
                  return (
                    <Card key={item.id} style={styles.itemCard}>
                      <View style={styles.itemCardRow}>
                        {fotoPrincipal ? (
                          <Image
                            source={{ uri: fotoPrincipal }}
                            contentFit="cover"
                            style={styles.itemThumb}
                          />
                        ) : (
                          <View style={styles.itemThumbPlaceholder}>
                            <Ionicons
                              name="image-outline"
                              size={28}
                              color={Theme.colors.primary}
                            />
                          </View>
                        )}
                        <View style={styles.itemBody}>
                          <View style={styles.itemTopRow}>
                            <Text style={styles.itemName}>{item.nombre}</Text>
                            <View
                              style={[
                                styles.itemMetaPill,
                                {
                                  backgroundColor: ESTADO_ITEM_BG[item.estado],
                                  borderColor: ESTADO_ITEM_BORDER[item.estado],
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.itemMetaText,
                                  { color: ESTADO_ITEM_TEXT[item.estado] },
                                ]}
                              >
                                {ETIQUETAS_ESTADO[item.estado]}
                              </Text>
                            </View>
                          </View>

                          {!!item.descripcion && (
                            <Text style={styles.itemDescription}>{item.descripcion}</Text>
                          )}

                          <View style={styles.itemMetaRow}>
                            <View style={styles.photoCount}>
                              <Ionicons
                                name="images-outline"
                                size={13}
                                color={Theme.colors.textMedium}
                              />
                              <Text style={styles.photoCountText}>
                                {item.fotos.length} foto{item.fotos.length === 1 ? '' : 's'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={abrirModal}
      >
        <Ionicons name="add" size={24} color={Theme.colors.surface} />
        <Text style={styles.fabText}>Añadir ítem</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>Nuevo ítem</Text>
              <Text style={styles.modalSubtitle}>
                Registra el elemento, su estado y la ubicación donde se encuentra.
              </Text>

              <CustomInput
                label="Nombre"
                placeholder="Ej. Sofá de tres plazas"
                value={nombre}
                onChangeText={setNombre}
                maxLength={80}
              />

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Descripción</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Añade notas útiles, desperfectos o detalles del modelo"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                  maxLength={240}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Estado</Text>
                <View style={styles.optionList}>
                  {ESTADOS_ITEM.map((estadoOption) => {
                    const activo = estado === estadoOption;
                    return (
                      <Pressable
                        key={estadoOption}
                        style={[styles.optionPill, activo && styles.optionPillActive]}
                        onPress={() => setEstado(estadoOption)}
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            activo && styles.optionPillTextActive,
                          ]}
                        >
                          {ETIQUETAS_ESTADO[estadoOption]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Ubicación</Text>
                <View style={styles.optionList}>
                  {construirOpcionesUbicacion(viviendaSeleccionada).map((opcion) => {
                    const activa =
                      ubicacionSeleccionada?.tipo === opcion.tipo &&
                      ubicacionSeleccionada.id === opcion.id;

                    return (
                      <Pressable
                        key={`${opcion.tipo}-${opcion.id}`}
                        style={[styles.optionPill, activa && styles.optionPillActive]}
                        onPress={() =>
                          setUbicacionSeleccionada({
                            tipo: opcion.tipo,
                            id: opcion.id,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.optionPillText,
                            activa && styles.optionPillTextActive,
                          ]}
                        >
                          {opcion.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Imagen de referencia</Text>
                <View style={styles.imagePickerCard}>
                  {imagenSeleccionada ? (
                    <Image
                      source={{ uri: imagenSeleccionada.uri }}
                      contentFit="cover"
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={34} color={Theme.colors.primary} />
                      <Text style={styles.imagePlaceholderTitle}>Añade una foto</Text>
                      <Text style={styles.imagePlaceholderSubtitle}>
                        Se subirá justo después de crear el ítem para dejar trazabilidad visual.
                      </Text>
                    </View>
                  )}

                  <View style={styles.imageActions}>
                    <CustomButton
                      label={imagenSeleccionada ? 'Cambiar foto' : 'Seleccionar foto'}
                      variant="outline"
                      onPress={seleccionarImagen}
                      style={styles.imageActionButton}
                    />
                    {imagenSeleccionada && (
                      <CustomButton
                        label="Quitar"
                        variant="secondary"
                        onPress={() => setImagenSeleccionada(null)}
                        style={styles.imageActionButton}
                      />
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <CustomButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={cerrarModal}
                  style={styles.modalActionButton}
                />
                <CustomButton
                  label={guardando ? 'Guardando...' : 'Guardar ítem'}
                  onPress={crearItem}
                  loading={guardando}
                  disabled={!nombre.trim() || !ubicacionSeleccionada}
                  style={styles.modalActionButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function construirOpcionesUbicacion(vivienda: Vivienda | null) {
  if (!vivienda) {
    return [];
  }

  return [
    {
      tipo: 'VIVIENDA' as const,
      id: vivienda.id,
      label: 'Zonas comunes',
    },
    ...vivienda.habitaciones.map((habitacion) => ({
      tipo: 'HABITACION' as const,
      id: habitacion.id,
      label: habitacion.nombre,
    })),
  ];
}

function construirGruposInventario(items: ItemInventario[]): GrupoInventario[] {
  const grupos = new Map<string, GrupoInventario>();

  items.forEach((item) => {
    const key = item.habitacion
      ? `habitacion-${item.habitacion.id}`
      : `vivienda-${item.vivienda_id ?? 'comun'}`;
    const titulo = item.habitacion?.nombre ?? 'Zonas comunes';
    const subtitulo = item.habitacion
      ? 'Elementos vinculados a esta estancia'
      : 'Salón, cocina, baños y resto de espacios compartidos';

    if (!grupos.has(key)) {
      grupos.set(key, { key, titulo, subtitulo, items: [] });
    }

    grupos.get(key)!.items.push(item);
  });

  return Array.from(grupos.values());
}
