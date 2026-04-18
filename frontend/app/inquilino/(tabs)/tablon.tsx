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
import { useState, useCallback, useMemo } from 'react';
import { Redirect, useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { useAppTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/styles/tablon/tablon.styles';

type Anuncio = {
  id: number;
  titulo: string;
  contenido: string;
  fecha_creacion: string;
  autor_id: number;
  autor: { id: number; nombre: string };
};

type ContextoInquilino = {
  viviendaId: number;
  usuarioId: number;
} | null;

export default function InquilinoTablonScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [contexto, setContexto] = useState<ContextoInquilino>(null);
  const [loadingCtx, setLoadingCtx] = useState(true);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [tituloFocused, setTituloFocused] = useState(false);
  const [contenidoFocused, setContenidoFocused] = useState(false);

  const cargarContexto = async () => {
    setLoadingCtx(true);
    try {
      const { data } = await api.get<{ miHabitacionId: number; vivienda: { id: number; habitaciones: { id: number; inquilino: { id: number } | null }[] } }>(
        '/inquilino/vivienda'
      );
      const miHab = data.vivienda.habitaciones.find((h) => h.id === data.miHabitacionId);
      setContexto({ viviendaId: data.vivienda.id, usuarioId: miHab?.inquilino?.id ?? 0 });
    } catch {
      setContexto(null);
    } finally {
      setLoadingCtx(false);
    }
  };

  const cargarAnuncios = useCallback(async (viviendaId: number) => {
    setLoading(true);
    try {
      const { data } = await api.get<Anuncio[]>(`/anuncios?viviendaId=${viviendaId}`);
      setAnuncios(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los anuncios.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargarContexto(); }, []));
  useFocusEffect(useCallback(() => { if (contexto) cargarAnuncios(contexto.viviendaId); }, [cargarAnuncios, contexto]));

  const handlePublicar = async () => {
    const tituloLimpio = titulo.trim();
    const contenidoLimpio = contenido.trim();

    if (!tituloLimpio || !contenidoLimpio) {
      Toast.show({ type: 'error', text1: 'Completa titulo y contenido antes de publicar.' });
      return;
    }

    if (!contexto) {
      Toast.show({ type: 'error', text1: 'No pudimos identificar tu vivienda.' });
      return;
    }

    setPublicando(true);
    try {
      const { data } = await api.post<Anuncio>('/anuncios', {
        titulo: tituloLimpio,
        contenido: contenidoLimpio,
        vivienda_id: contexto.viviendaId,
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

  const cerrarModal = () => { setModalVisible(false); setTitulo(''); setContenido(''); };

  const handleEliminar = (anuncio: Anuncio) => {
    Alert.alert('Eliminar anuncio', `¿Eliminar "${anuncio.titulo}"? Esta acción no se puede deshacer.`, [
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
    ]);
  };

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const puedePublicar = titulo.trim().length > 0 && contenido.trim().length > 0;

  if (loadingCtx) {
    return <View style={styles.container}><ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} /></View>;
  }

  if (!contexto) {
    return <Redirect href="/inquilino/inicio" />;
  }

  const puedeEliminar = (anuncio: Anuncio) => anuncio.autor_id === contexto.usuarioId;

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
            <Ionicons name="close" size={16} color={theme.colors.dangerText} />
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
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
                <Ionicons name="megaphone-outline" size={44} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitulo}>¡Rompe el hielo!</Text>
              <Text style={styles.emptySubtitulo}>
                Todavía no hay anuncios. ¡Sé el primero en publicar!
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
        <Ionicons name="add" size={28} color={theme.colors.surface} />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={cerrarModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={cerrarModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitulo}>Nuevo anuncio</Text>
            <TextInput
              style={[styles.inputTitulo, tituloFocused && styles.inputFocused]}
              placeholder="Título"
              placeholderTextColor={theme.colors.textMuted}
              value={titulo}
              onChangeText={setTitulo}
              onFocus={() => setTituloFocused(true)}
              onBlur={() => setTituloFocused(false)}
              maxLength={100}
            />
            <TextInput
              style={[styles.inputContenido, contenidoFocused && styles.inputFocused]}
              placeholder="¿Qué quieres comunicar?"
              placeholderTextColor={theme.colors.textMuted}
              value={contenido}
              onChangeText={setContenido}
              onFocus={() => setContenidoFocused(true)}
              onBlur={() => setContenidoFocused(false)}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.modalAcciones}>
              <Pressable style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]} onPress={cerrarModal}>
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.botonPublicar, !puedePublicar && styles.botonPublicarDisabled, pressed && !publicando && styles.botonPressed]}
                onPress={handlePublicar}
                disabled={!puedePublicar || publicando}
              >
                {publicando ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={styles.botonPublicarTexto}>Publicar</Text>}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
