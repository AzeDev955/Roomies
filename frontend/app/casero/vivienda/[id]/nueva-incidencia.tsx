import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD } from '@/styles/casero/vivienda/nueva-incidencia.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

type HabitacionResumen = {
  id: number;
  nombre: string;
  tipo: string;
};

const PRIORIDADES: Prioridad[] = ['VERDE', 'AMARILLO', 'ROJO'];

// Elemento estático que representa "sin habitación concreta"
const ZONA_COMUN_ID = -1;

export default function NuevaIncidenciaCaseroScreen() {
  const router = useRouter();
  const { id: viviendaId, habitacionesJson } = useLocalSearchParams<{
    id: string;
    habitacionesJson: string;
  }>();

  const habitaciones: HabitacionResumen[] = JSON.parse(habitacionesJson ?? '[]');

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('VERDE');
  // ZONA_COMUN_ID = sin habitación específica; cualquier otro número = id real
  const [ubicacionId, setUbicacionId] = useState<number>(ZONA_COMUN_ID);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    setLoading(true);
    try {
      const habitacion_id = ubicacionId !== ZONA_COMUN_ID ? ubicacionId : undefined;
      await api.post('/incidencias', {
        titulo,
        descripcion,
        prioridad,
        vivienda_id: Number(viviendaId),
        ...(habitacion_id !== undefined ? { habitacion_id } : {}),
      });
      router.back();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo enviar la incidencia. Inténtalo de nuevo.';
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoading(false);
    }
  };

  const puedeEnviar = titulo.trim().length > 0 && descripcion.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Nueva incidencia</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.inputTexto}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="¿Qué ha ocurrido?"
          placeholderTextColor="#c7c7cc"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.inputTexto, styles.inputDescripcion]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el problema con detalle..."
          placeholderTextColor="#c7c7cc"
          multiline
        />

        <Text style={styles.label}>¿Dónde ocurre?</Text>
        <View style={styles.habitacionFila}>
          {/* Opción estática: sin habitación concreta */}
          <Pressable
            style={[styles.habitacionPill, ubicacionId === ZONA_COMUN_ID && styles.habitacionPillActivo]}
            onPress={() => setUbicacionId(ZONA_COMUN_ID)}
          >
            <Text
              style={[styles.habitacionPillTexto, ubicacionId === ZONA_COMUN_ID && styles.habitacionPillTextoActivo]}
            >
              Zonas comunes
            </Text>
          </Pressable>

          {/* Habitaciones dinámicas de la vivienda */}
          {habitaciones.map((h) => (
            <Pressable
              key={h.id}
              style={[styles.habitacionPill, ubicacionId === h.id && styles.habitacionPillActivo]}
              onPress={() => setUbicacionId(ubicacionId === h.id ? ZONA_COMUN_ID : h.id)}
            >
              <Text
                style={[styles.habitacionPillTexto, ubicacionId === h.id && styles.habitacionPillTextoActivo]}
              >
                {h.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Prioridad</Text>
        <View style={styles.selectorFila}>
          {PRIORIDADES.map((p) => (
            <Pressable
              key={p}
              style={[
                styles.selectorBtn,
                { backgroundColor: COLORES_PRIORIDAD[p], opacity: prioridad === p ? 1 : 0.35 },
              ]}
              onPress={() => setPrioridad(p)}
            >
              <Text style={styles.selectorBtnTexto}>{ETIQUETAS_PRIORIDAD[p]}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.botonEnviar, (!puedeEnviar || loading) && styles.botonEnviarDisabled]}
          onPress={handleEnviar}
          disabled={!puedeEnviar || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonEnviarTexto}>Enviar Incidencia</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
