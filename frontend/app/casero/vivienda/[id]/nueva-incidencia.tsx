import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  createStyles,
  ETIQUETAS_PRIORIDAD,
  getPrioridadBg,
  getPrioridadText,
  getPrioridadBorder,
} from '@/styles/casero/vivienda/nueva-incidencia.styles';
import { parseJsonArrayParam, parsePositiveIntParam } from '@/utils/routeParams';

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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const keyboardAppearance = theme.isDark ? 'dark' : 'light';
  const { id: viviendaId, habitacionesJson } = useLocalSearchParams<{
    id: string;
    habitacionesJson: string;
  }>();
  const viviendaIdNumerico = parsePositiveIntParam(viviendaId);

  const habitaciones = parseJsonArrayParam<Partial<HabitacionResumen> | null>(habitacionesJson).filter(
    (habitacion): habitacion is HabitacionResumen =>
      !!habitacion &&
      typeof habitacion.id === 'number' &&
      Number.isSafeInteger(habitacion.id) &&
      habitacion.id > 0 &&
      typeof habitacion.nombre === 'string' &&
      habitacion.nombre.trim().length > 0,
  );

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('VERDE');
  // ZONA_COMUN_ID = sin habitación específica; cualquier otro número = id real
  const [ubicacionId, setUbicacionId] = useState<number>(ZONA_COMUN_ID);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleEnviar = async () => {
    if (!viviendaIdNumerico) {
      Toast.show({ type: 'error', text1: 'La ruta de la vivienda no es valida.' });
      return;
    }

    setLoading(true);
    try {
      const habitacion_id = ubicacionId !== ZONA_COMUN_ID ? ubicacionId : undefined;
      await api.post('/incidencias', {
        titulo,
        descripcion,
        prioridad,
        vivienda_id: viviendaIdNumerico,
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

  if (!viviendaIdNumerico) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Vivienda no encontrada</Text>
          <Text style={styles.errorText}>
            No podemos abrir el formulario porque el enlace no apunta a una vivienda valida.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/casero/viviendas')}>
            <Text style={styles.secondaryButtonText}>Volver a viviendas</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Nueva incidencia</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.inputTexto, focusedInput === 'titulo' && styles.inputFocused]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="¿Qué ha ocurrido?"
          placeholderTextColor={theme.colors.textMuted}
          keyboardAppearance={keyboardAppearance}
          onFocus={() => setFocusedInput('titulo')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.inputTexto, styles.inputDescripcion, focusedInput === 'descripcion' && styles.inputFocused]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el problema con detalle..."
          placeholderTextColor={theme.colors.textMuted}
          keyboardAppearance={keyboardAppearance}
          multiline
          onFocus={() => setFocusedInput('descripcion')}
          onBlur={() => setFocusedInput(null)}
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
                {
                  backgroundColor: getPrioridadBg(theme, p),
                  borderColor: prioridad === p ? getPrioridadBorder(theme, p) : theme.colors.background,
                  opacity: prioridad === p ? 1 : 0.55,
                },
              ]}
              onPress={() => setPrioridad(p)}
            >
              <Text style={[styles.selectorBtnTexto, { color: getPrioridadText(theme, p) }]}>
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
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.botonEnviarTexto}>Enviar Incidencia</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
