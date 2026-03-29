import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_ESTADO } from '@/styles/inquilino/inicio.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

type Incidencia = {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: Estado;
  fecha_creacion: string;
};

const MOCK_INCIDENCIAS: Incidencia[] = [
  {
    id: 1,
    titulo: 'Fuga de agua en el baño',
    descripcion: 'Hay agua saliendo por debajo del inodoro, urge revisión.',
    prioridad: 'ROJO',
    estado: 'PENDIENTE',
    fecha_creacion: '29/03/2026',
  },
  {
    id: 2,
    titulo: 'Persiana rota en habitación',
    descripcion: 'La persiana no sube correctamente, se queda a medias.',
    prioridad: 'AMARILLO',
    estado: 'EN_PROCESO',
    fecha_creacion: '27/03/2026',
  },
  {
    id: 3,
    titulo: 'Luz fundida en el pasillo',
    descripcion: 'La bombilla del pasillo lleva varios días sin funcionar.',
    prioridad: 'VERDE',
    estado: 'RESUELTA',
    fecha_creacion: '25/03/2026',
  },
];

export default function InquilinoInicioScreen() {
  const router = useRouter();
  const [tieneCasa, setTieneCasa] = useState(false);
  const [codigo, setCodigo] = useState('');

  if (!tieneCasa) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.onboardingTitle}>Únete a tu nuevo hogar</Text>
        <Text style={styles.onboardingSubtitle}>
          Introduce el código de invitación que te ha proporcionado tu casero para acceder a tu habitación.
        </Text>
        <TextInput
          style={styles.input}
          value={codigo}
          onChangeText={(text) => setCodigo(text.toUpperCase())}
          placeholder="ROOM-XXXX"
          placeholderTextColor="#c7c7cc"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
        />
        <Pressable style={styles.botonCanjear} onPress={() => setTieneCasa(true)}>
          <Text style={styles.botonCanjearTexto}>Canjear Código</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.bienvenida}>Piso Madrid</Text>
        <Text style={styles.subtituloDashboard}>Habitación Principal</Text>

        <Text style={styles.seccionTitulo}>Incidencias</Text>

        <FlatList
          data={MOCK_INCIDENCIAS}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[styles.indicador, { backgroundColor: COLORES_PRIORIDAD[item.prioridad] }]}
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={styles.cardDescripcion}>{item.descripcion}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardEstado}>{ETIQUETAS_ESTADO[item.estado]}</Text>
                  <Text style={styles.cardFecha}>{item.fecha_creacion}</Text>
                </View>
              </View>
            </View>
          )}
        />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/inquilino/nueva-incidencia')}>
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>
    </View>
  );
}
