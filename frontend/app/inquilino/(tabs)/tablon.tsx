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
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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

type ContextoInquilino = {
  viviendaId: number;
  usuarioId: number;
} | null;

export default function InquilinoTablonScreen() {
  const [contexto, setContexto] = useState<ContextoInquilino>(null);
  const [loadingCtx, setLoadingCtx] = useState(true);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [publicando, setPublicando] = useState(false);

  const cargarContexto = async () => {
    setLoadingCtx(true);
    try {
      const { data } = await api.get<{ miHabitacionId: number; vivienda: { id: number; habitaciones: { id: number; inquilino: { id: number } | null }[] } }>(
        '/inquilino/vivienda'
      );
      const miHab = data.vivienda.habitaciones.find((h) => h.id === data.miHabitacionId);
      setContexto({
        viviendaId: data.vivienda.id,
        usuarioId: miHab?.inquilino?.id ?? 0,
      });
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
      Alert.alert('Error', 'No se pudieron cargar los anuncios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (contexto) cargarAnuncios(contexto.viviendaId);
    }, [contexto])
  );

  const handlePublicar = async () => {
    if (!titulo.trim() || !contenido.trim() || !contexto) return;
    setPublicando(true);
    try {
      const { data } = await api.post<Anuncio>('/anuncios', {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        vivienda_id: contexto.viviendaId,
      });
      setAnuncios((prev) => [data, ...prev]);
      setTitulo('');
      setContenido('');
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error ?? 'No se pudo publicar el anuncio.');
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
              Alert.alert('Error', err.response?.data?.error ?? 'No se pudo eliminar el anuncio.');
            }
          },
        },
      ]
    );
  };

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loadingCtx) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      </View>
    );
  }

  if (!contexto) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Únete a una vivienda con tu código de invitación para ver el tablón.
        </Text>
      </View>
    );
  }

  const puedeEliminar = (anuncio: Anuncio) => anuncio.autor_id === contexto.usuarioId;
  const puedePublicar = titulo.trim().length > 0 && contenido.trim().length > 0;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={anuncios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                {puedeEliminar(item) && (
                  <Pressable onPress={() => handleEliminar(item)} hitSlop={8}>
                    <Text style={styles.eliminarBtn}>✕</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.cardContenido}>{item.contenido}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAutor}>{item.autor.nombre}</Text>
                <Text style={styles.cardFecha}>{formatearFecha(item.fecha_creacion)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay anuncios todavía. ¡Sé el primero en publicar!</Text>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Nuevo anuncio</Text>
            <TextInput
              style={styles.inputTitulo}
              placeholder="Título"
              placeholderTextColor="#9e9e9e"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
            />
            <TextInput
              style={styles.inputContenido}
              placeholder="¿Qué quieres comunicar?"
              placeholderTextColor="#9e9e9e"
              value={contenido}
              onChangeText={setContenido}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.modalAcciones}>
              <Pressable style={styles.botonCancelar} onPress={cerrarModal}>
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.botonPublicar, !puedePublicar && styles.botonPublicarDisabled]}
                onPress={handlePublicar}
                disabled={!puedePublicar || publicando}
              >
                {publicando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.botonPublicarTexto}>Publicar</Text>
                }
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
