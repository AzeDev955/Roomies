import { View, Text, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/casero/viviendas.styles';

type Habitacion = { id: number; nombre: string };
type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

const MOCK_VIVIENDAS: Vivienda[] = [
  {
    id: 1,
    alias_nombre: 'Piso Centro',
    direccion: 'Calle Mayor 10, 3ºB - Madrid',
    habitaciones: [
      { id: 1, nombre: 'Habitación 1' },
      { id: 2, nombre: 'Habitación 2' },
      { id: 3, nombre: 'Baño' },
    ],
  },
  {
    id: 2,
    alias_nombre: 'Apartamento Gran Vía',
    direccion: 'Gran Vía 45, 2ºA - Madrid',
    habitaciones: [{ id: 4, nombre: 'Dormitorio' }],
  },
];

export default function ViviendasScreen() {
  const router = useRouter();
  const [viviendas] = useState<Vivienda[]>(MOCK_VIVIENDAS);

  return (
    <View style={styles.container}>
      <FlatList
        data={viviendas}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes viviendas registradas.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/casero/vivienda/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.alias_nombre}</Text>
            <Text style={styles.cardAddress}>{item.direccion}</Text>
            <Text style={styles.cardRooms}>{item.habitaciones.length} habitaciones</Text>
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
