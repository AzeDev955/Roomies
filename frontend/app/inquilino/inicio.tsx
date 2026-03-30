import { View, Text, TextInput, FlatList, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
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

type DatosCasa = {
  nombreVivienda: string;
  nombreHabitacion: string;
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
  const [sufijo, setSufijo] = useState('');
  const [loading, setLoading] = useState(false);
  const [datosCasa, setDatosCasa] = useState<DatosCasa | null>(null);

  const handleCanjearCodigo = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/inquilino/unirse', {
        codigo_invitacion: `ROOM-${sufijo}`,
      });
      setDatosCasa({
        nombreVivienda: data.habitacion.vivienda.alias_nombre,
        nombreHabitacion: data.habitacion.nombre,
      });
      setTieneCasa(true);
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo canjear el código. Inténtalo de nuevo.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  if (!tieneCasa) {
    return (
      <View style={styles.onboardingContainer}>
        <Text style={styles.onboardingTitle}>Únete a tu nuevo hogar</Text>
        <Text style={styles.onboardingSubtitle}>
          Introduce el código de invitación que te ha proporcionado tu casero para acceder a tu habitación.
        </Text>
        <View style={styles.inputFila}>
          <Text style={styles.inputPrefijo}>ROOM-</Text>
          <TextInput
            style={styles.inputSufijo}
            value={sufijo}
            onChangeText={(text) => setSufijo(text.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor="#c7c7cc"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
        </View>
        <Pressable
          style={[styles.botonCanjear, (!sufijo.trim() || loading) && styles.botonCanjearDisabled]}
          onPress={handleCanjearCodigo}
          disabled={!sufijo.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonCanjearTexto}>Canjear Código</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.dashboardContainer}>
      <ScrollView contentContainerStyle={styles.dashboardContent}>
        <Text style={styles.bienvenida}>{datosCasa?.nombreVivienda ?? 'Mi vivienda'}</Text>
        <Text style={styles.subtituloDashboard}>{datosCasa?.nombreHabitacion ?? 'Mi habitación'}</Text>

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
