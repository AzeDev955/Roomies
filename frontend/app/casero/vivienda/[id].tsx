import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { styles } from '@/styles/casero/vivienda/detalle.styles';

type Habitacion = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  metros_cuadrados: number | null;
  codigo_invitacion: string | null;
};

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
  habitaciones: Habitacion[];
};

const MOCK_VIVIENDA: Vivienda = {
  id: 1,
  alias_nombre: 'Piso Centro',
  direccion: 'Calle Mayor 10, 3ºB - Madrid',
  habitaciones: [
    {
      id: 1,
      nombre: 'Habitación 1',
      tipo: 'DORMITORIO',
      es_habitable: true,
      metros_cuadrados: 12.5,
      codigo_invitacion: 'ROOM-X7B9',
    },
    {
      id: 2,
      nombre: 'Habitación 2',
      tipo: 'DORMITORIO',
      es_habitable: true,
      metros_cuadrados: 10.0,
      codigo_invitacion: 'ROOM-A3K2',
    },
    {
      id: 3,
      nombre: 'Baño',
      tipo: 'BANO',
      es_habitable: false,
      metros_cuadrados: null,
      codigo_invitacion: null,
    },
    {
      id: 4,
      nombre: 'Cocina',
      tipo: 'COCINA',
      es_habitable: false,
      metros_cuadrados: null,
      codigo_invitacion: null,
    },
  ],
};

export default function DetalleViviendaScreen() {
  const { id } = useLocalSearchParams();
  const [vivienda] = useState<Vivienda>(MOCK_VIVIENDA);
  const [codigosRevelados, setCodigosRevelados] = useState<Record<number, boolean>>({});

  const revelarCodigo = async (habitacionId: number) => {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate para ver el código de invitación',
    });
    if (resultado.success) {
      setCodigosRevelados((prev) => ({ ...prev, [habitacionId]: true }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{vivienda.alias_nombre}</Text>
        <Text style={styles.address}>{vivienda.direccion}</Text>

        {vivienda.habitaciones.map((habitacion) => (
          <View key={habitacion.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{habitacion.nombre}</Text>
              <Text style={styles.cardTipo}>{habitacion.tipo}</Text>
            </View>
            {habitacion.es_habitable && habitacion.codigo_invitacion ? (
              <View style={styles.codigoContainer}>
                <Text style={styles.codigoLabel}>Código de invitación</Text>
                {codigosRevelados[habitacion.id] ? (
                  <Text style={styles.codigo}>{habitacion.codigo_invitacion}</Text>
                ) : (
                  <Pressable onPress={() => revelarCodigo(habitacion.id)}>
                    <Text style={styles.codigoOculto}>••••••••</Text>
                    <Text style={styles.revelarTexto}>Toca para revelar</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <Text style={styles.zonaComun}>Zona común · Sin código</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => console.log('Añadir habitación')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}
