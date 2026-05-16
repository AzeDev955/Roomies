import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { useAppTheme } from '@/contexts/ThemeContext';
import { useViviendaIdParam } from '@/hooks/useViviendaIdParam';
import { createStyles } from '@/styles/casero/vivienda/fotos.styles';

type FotoVivienda = {
  id: number;
  url: string | null;
  orden: number;
  es_portada: boolean;
  width: number | null;
  height: number | null;
  fecha_subida: string;
};

export default function FotosViviendaTab() {
  const id = useViviendaIdParam();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [fotos, setFotos] = useState<FotoVivienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const cargarFotos = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data } = await api.get<FotoVivienda[]>(`/viviendas/${id}/fotos`);
      setFotos(data);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudieron cargar las fotos.',
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargarFotos();
    }, [cargarFotos]),
  );

  const subirFoto = async () => {
    if (!id || subiendo) return;

    if (Platform.OS !== 'web') {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Toast.show({
          type: 'info',
          text1: 'Permiso necesario',
          text2: 'Necesitamos acceso a tu galeria para subir una foto.',
        });
        return;
      }
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.86,
    });

    if (resultado.canceled || !resultado.assets[0]) {
      return;
    }

    const asset = resultado.assets[0];
    const formData = new FormData();
    if (Platform.OS === 'web' && asset.file) {
      formData.append('foto', asset.file);
    } else {
      formData.append('foto', {
        uri: asset.uri,
        name: asset.fileName ?? `vivienda-${id}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as never);
    }

    setSubiendo(true);
    try {
      const { data } = await api.post<FotoVivienda>(`/viviendas/${id}/fotos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFotos((prev) => [...prev, data].sort(ordenarFotos));
      Toast.show({ type: 'success', text1: 'Foto subida' });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo subir la foto.',
      });
    } finally {
      setSubiendo(false);
    }
  };

  const actualizarFoto = async (fotoId: number, payload: Partial<Pick<FotoVivienda, 'orden' | 'es_portada'>>) => {
    if (!id) return;

    setActualizandoId(fotoId);
    try {
      const { data } = await api.patch<FotoVivienda>(`/viviendas/${id}/fotos/${fotoId}`, payload);
      setFotos((prev) =>
        prev
          .map((foto) => ({
            ...foto,
            ...(payload.es_portada ? { es_portada: false } : {}),
            ...(foto.id === fotoId ? data : {}),
          }))
          .sort(ordenarFotos),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo actualizar la foto.',
      });
    } finally {
      setActualizandoId(null);
    }
  };

  const moverFoto = async (foto: FotoVivienda, direccion: -1 | 1) => {
    const index = fotos.findIndex((item) => item.id === foto.id);
    const otra = fotos[index + direccion];
    if (!otra) return;

    setActualizandoId(foto.id);
    try {
      await Promise.all([
        api.patch(`/viviendas/${id}/fotos/${foto.id}`, { orden: otra.orden }),
        api.patch(`/viviendas/${id}/fotos/${otra.id}`, { orden: foto.orden }),
      ]);
      setFotos((prev) =>
        prev
          .map((item) =>
            item.id === foto.id
              ? { ...item, orden: otra.orden }
              : item.id === otra.id
                ? { ...item, orden: foto.orden }
                : item,
          )
          .sort(ordenarFotos),
      );
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo reordenar la galeria.',
      });
    } finally {
      setActualizandoId(null);
    }
  };

  const confirmarBorrado = (foto: FotoVivienda) => {
    Alert.alert('Eliminar foto', 'Esta foto se borrara de la galeria de la vivienda.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setActualizandoId(foto.id);
          try {
            await api.delete(`/viviendas/${id}/fotos/${foto.id}`);
            setFotos((prev) => prev.filter((item) => item.id !== foto.id));
            Toast.show({ type: 'success', text1: 'Foto eliminada' });
          } catch (err: any) {
            Toast.show({
              type: 'error',
              text1: err.response?.data?.error ?? 'No se pudo eliminar la foto.',
            });
          } finally {
            setActualizandoId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Fotos de la vivienda</Text>
              <Text style={styles.subtitle}>
                Sube la galeria principal, marca una portada y ordena como se mostrara a las personas vinculadas.
              </Text>
            </View>
            <Pressable
              style={[styles.uploadButton, subiendo && styles.uploadButtonDisabled]}
              onPress={subirFoto}
              disabled={subiendo}
              accessibilityRole="button"
              accessibilityLabel="Subir foto"
            >
              {subiendo ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.surface} />
              )}
            </Pressable>
          </View>
          <View style={styles.uploadHint}>
            <Ionicons name="image-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.uploadHintText}>{fotos.length} foto{fotos.length === 1 ? '' : 's'}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.loadingBox} />
        ) : fotos.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="images-outline" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aun no hay fotos</Text>
            <Text style={styles.emptyText}>
              Anade imagenes luminosas de las zonas comunes y dormitorios para que la vivienda sea reconocible.
            </Text>
          </View>
        ) : (
          fotos.map((foto, index) => (
            <View key={foto.id} style={styles.photoCard}>
              {foto.url ? (
                <Image source={{ uri: foto.url }} style={styles.photo} contentFit="cover" />
              ) : (
                <View style={styles.photo} />
              )}
              {foto.es_portada && (
                <View style={styles.coverBadge}>
                  <Ionicons name="star" size={13} color={theme.colors.success} />
                  <Text style={styles.coverBadgeText}>Portada</Text>
                </View>
              )}
              <View style={styles.photoActions}>
                <View style={styles.actionGroup}>
                  <Pressable
                    style={[styles.iconButton, index === 0 && styles.iconButtonDisabled]}
                    onPress={() => moverFoto(foto, -1)}
                    disabled={index === 0 || actualizandoId !== null}
                    accessibilityRole="button"
                    accessibilityLabel="Mover foto arriba"
                  >
                    <Ionicons name="arrow-up-outline" size={18} color={theme.colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconButton, index === fotos.length - 1 && styles.iconButtonDisabled]}
                    onPress={() => moverFoto(foto, 1)}
                    disabled={index === fotos.length - 1 || actualizandoId !== null}
                    accessibilityRole="button"
                    accessibilityLabel="Mover foto abajo"
                  >
                    <Ionicons name="arrow-down-outline" size={18} color={theme.colors.primary} />
                  </Pressable>
                </View>

                <View style={styles.actionGroup}>
                  {!foto.es_portada && (
                    <Pressable
                      style={styles.setCoverButton}
                      onPress={() => actualizarFoto(foto.id, { es_portada: true })}
                      disabled={actualizandoId !== null}
                      accessibilityRole="button"
                      accessibilityLabel="Marcar como portada"
                    >
                      <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.setCoverText}>Portada</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={[styles.iconButton, styles.deleteButton]}
                    onPress={() => confirmarBorrado(foto)}
                    disabled={actualizandoId !== null}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar foto"
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ordenarFotos(a: FotoVivienda, b: FotoVivienda) {
  if (a.es_portada !== b.es_portada) {
    return a.es_portada ? -1 : 1;
  }

  return a.orden - b.orden || a.id - b.id;
}
