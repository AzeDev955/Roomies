import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { Redirect, useLocalSearchParams, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/tablon/tablon.styles';

type Anuncio = {
  id: number;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  autor_id: number;
  autor: { id: number; nombre: string };
};

export default function TablonScreen() {
  const { viviendaId, esCasero, miUsuarioId } = useLocalSearchParams<{
    viviendaId: string;
    esCasero?: string;
    miUsuarioId?: string;
  }>();
  const viviendaIdNumero = Number(viviendaId);
  const viviendaIdValido = !!viviendaId && !Number.isNaN(viviendaIdNumero);

  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [tituloFocused, setTituloFocused] = useState(false);
  const [contenidoFocused, setContenidoFocused] = useState(false);

  const cargarAnuncios = useCallback(async () => {
    if (!viviendaIdValido) return;

    setLoading(true);
    try {
      const { data } = await api.get<Anuncio[]>(`/anuncios?viviendaId=${viviendaIdNumero}`);
      setAnuncios(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los anuncios.' });
    } finally {
      setLoading(false);
    }
  }, [viviendaIdNumero, viviendaIdValido]);

  useFocusEffect(
    useCallback(() => {
      cargarAnuncios();
    }, [cargarAnuncios])
  );

  const handlePublicar = async () => {
    if (!viviendaIdValido || !titulo.trim() || !contenido.trim()) return;
    setPublicando(true);
    try {
      const { data } = await api.post<Anuncio>('/anuncios', {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        vivienda_id: viviendaIdNumero,
      });
      setAnuncios((prev) => [data, ...prev]);
      setTitulo('');
      setContenido('');
      setModalVisible(false);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo publicar el anuncio.' });
    } finally {
      setPublicando(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setTitulo('');
    setContenido('');
  };

  const handleEliminar = (anuncio: Anuncio) => {
    Alert.alert(
      'Eliminar anuncio',
      `¿Eliminar "${anuncio.titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/anuncios/${anuncio.id}`);
              setAnuncios((prev) => prev.filter((a) => a.id !== anuncio.id));
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo eliminar el anuncio.' });
            }
          },
        },
      ]
    );
  };

  const puedeEliminar = (anuncio: Anuncio): boolean => {
    if (esCasero === 'true') return true;
    return anuncio.autor_id === Number(miUsuarioId);
  };

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const renderAnuncio = ({ item }: { item: Anuncio }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        {puedeEliminar(item) && (
          <Pressable
            onPress={() => handleEliminar(item)}
            style={styles.eliminarBtn}
            hitSlop={8}
            accessibilityLabel="Eliminar anuncio"
            accessibilityRole="button"
          >
            <Text style={styles.eliminarBtnTexto}>✕</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.cardContenido}>{item.contenido}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardAutorRow}>
          <View style={styles.cardAutorDot} />
          <Text style={styles.cardAutor}>{item.autor.nombre}</Text>
        </View>
        <Text style={styles.cardFecha}>{formatearFecha(item.fecha_creacion)}</Text>
      </View>
    </View>
  );

  const puedePublicar = titulo.trim().length > 0 && contenido.trim().length > 0;

  if (!viviendaIdValido) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Theme.colors.primary} />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={anuncios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAnuncio}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="megaphone-outline" size={44} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitulo}>¡Rompe el hielo!</Text>
              <Text style={styles.emptySubtitulo}>
                Todavía no hay anuncios. Sé el primero en publicar algo para tu vivienda.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Nuevo anuncio"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={Theme.colors.surface} />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitulo}>Nuevo anuncio</Text>

            <TextInput
              style={[
                styles.inputTitulo,
                tituloFocused && { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
              ]}
              placeholder="Título"
              placeholderTextColor={Theme.colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
              onFocus={() => setTituloFocused(true)}
              onBlur={() => setTituloFocused(false)}
              maxLength={100}
            />
            <TextInput
              style={[
                styles.inputContenido,
                contenidoFocused && { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
              ]}
              placeholder="¿Qué quieres comunicar?"
              placeholderTextColor={Theme.colors.textMuted}
              value={contenido}
              onChangeText={setContenido}
              onFocus={() => setContenidoFocused(true)}
              onBlur={() => setContenidoFocused(false)}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModal}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.botonPublicar,
                  !puedePublicar && styles.botonPublicarDisabled,
                  pressed && !publicando && styles.botonPressed,
                ]}
                onPress={handlePublicar}
                disabled={!puedePublicar || publicando}
              >
                {publicando ? (
                  <ActivityIndicator color={Theme.colors.surface} />
                ) : (
                  <Text style={styles.botonPublicarTexto}>Publicar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
