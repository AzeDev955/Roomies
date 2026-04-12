import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { Theme } from '@/constants/theme';
import {
  styles,
  ETIQUETAS_PRIORIDAD,
  PRIORIDAD_BG,
  PRIORIDAD_TEXT,
  PRIORIDAD_BORDER,
} from '@/styles/inquilino/nueva-incidencia.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

type HabitacionResumen = {
  id: number;
  nombre: string;
  tipo: string;
};

const PRIORIDADES: Prioridad[] = ['VERDE', 'AMARILLO', 'ROJO'];

const parseHabitaciones = (habitacionesJson?: string): HabitacionResumen[] => {
  if (!habitacionesJson) return [];

  try {
    const parsed = JSON.parse(habitacionesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function NuevaIncidenciaScreen() {
  const router = useRouter();
  const { viviendaId, habitacionesJson, miHabitacionId } = useLocalSearchParams<{
    viviendaId: string;
    habitacionesJson: string;
    miHabitacionId: string;
  }>();

  const habitaciones = parseHabitaciones(habitacionesJson);
  const viviendaIdNumero = Number(viviendaId);
  const viviendaIdValido = Number.isInteger(viviendaIdNumero) && viviendaIdNumero > 0;
  const opcionesHabitacion = habitaciones.filter(
    (h) => h.tipo !== 'DORMITORIO' || h.id === Number(miHabitacionId)
  );

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('VERDE');
  const [habitacionId, setHabitacionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleEnviar = async () => {
    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!tituloLimpio || !descripcionLimpia) {
      Toast.show({ type: 'error', text1: 'Completa titulo y descripcion antes de enviar.' });
      return;
    }

    if (!viviendaIdValido) {
      Toast.show({ type: 'error', text1: 'No pudimos identificar tu vivienda.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/incidencias', {
        titulo: tituloLimpio,
        descripcion: descripcionLimpia,
        prioridad,
        vivienda_id: viviendaIdNumero,
        ...(habitacionId ? { habitacion_id: habitacionId } : {}),
      });
      router.back();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo enviar la incidencia. Inténtalo de nuevo.';
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoading(false);
    }
  };

  const puedeEnviar = titulo.trim().length > 0 && descripcion.trim().length > 0 && viviendaIdValido;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Nueva incidencia</Text>

        {!viviendaIdValido && (
          <View style={styles.contextoAviso}>
            <Text style={styles.contextoAvisoTitulo}>Vivienda no disponible</Text>
            <Text style={styles.contextoAvisoTexto}>
              Vuelve a tu panel y abre el formulario desde Reportar problema.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.inputTexto, focusedInput === 'titulo' && styles.inputFocused]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="¿Qué ha ocurrido?"
          placeholderTextColor={Theme.colors.textMuted}
          onFocus={() => setFocusedInput('titulo')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.inputTexto, styles.inputDescripcion, focusedInput === 'descripcion' && styles.inputFocused]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el problema con detalle..."
          placeholderTextColor={Theme.colors.textMuted}
          multiline
          onFocus={() => setFocusedInput('descripcion')}
          onBlur={() => setFocusedInput(null)}
        />

        {opcionesHabitacion.length > 0 && (
          <>
            <Text style={styles.label}>¿Dónde ocurre?</Text>
            <View style={styles.habitacionFila}>
              {opcionesHabitacion.map((h) => (
                <Pressable
                  key={h.id}
                  style={[styles.habitacionPill, habitacionId === h.id && styles.habitacionPillActivo]}
                  onPress={() => setHabitacionId(habitacionId === h.id ? null : h.id)}
                >
                  <Text
                    style={[styles.habitacionPillTexto, habitacionId === h.id && styles.habitacionPillTextoActivo]}
                  >
                    {h.nombre}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Prioridad</Text>
        <View style={styles.selectorFila}>
          {PRIORIDADES.map((p) => (
            <Pressable
              key={p}
              style={[
                styles.selectorBtn,
                {
                  backgroundColor: PRIORIDAD_BG[p],
                  borderColor: prioridad === p ? PRIORIDAD_BORDER[p] : 'transparent',
                  opacity: prioridad === p ? 1 : 0.55,
                },
              ]}
              onPress={() => setPrioridad(p)}
            >
              <Text style={[styles.selectorBtnTexto, { color: PRIORIDAD_TEXT[p] }]}>
                {ETIQUETAS_PRIORIDAD[p]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.botonEnviar, (!puedeEnviar || loading) && styles.botonEnviarDisabled]}
          onPress={handleEnviar}
          disabled={!puedeEnviar || loading}
        >
          {loading ? (
            <ActivityIndicator color={Theme.colors.surface} />
          ) : (
            <Text style={styles.botonEnviarTexto}>Enviar Incidencia</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
