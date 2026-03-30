import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/styles/casero/viviendas.styles';
import api from '@/services/api';

type Habitacion = { id: number; nombre: string };
type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

export default function ViviendasScreen() {
  const router = useRouter();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarViviendas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda[]>('/viviendas');
      setViviendas(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las viviendas.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarViviendas();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.iconoPerfil} onPress={() => router.push('/perfil')}>
        <Ionicons name="person-circle-outline" size={32} color="#007AFF" />
      </Pressable>
      <FlatList
        data={viviendas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyText}>Aún no tienes viviendas registradas.</Text>
            <Text style={styles.emptySubtext}>Pulsa el botón + para añadir tu primera vivienda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/casero/vivienda/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.alias_nombre}</Text>
            <Text style={styles.cardAddress}>{item.direccion}</Text>
            <Text style={styles.cardRooms}>{item.habitaciones?.length ?? 0} habitaciones</Text>
          </Pressable>
        )}
      />
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/casero/nueva-vivienda')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
