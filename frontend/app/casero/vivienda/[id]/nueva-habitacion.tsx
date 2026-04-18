import { View, Text, TextInput, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { useAppTheme } from '@/contexts/ThemeContext';
import { createStyles } from '@/styles/casero/vivienda/nueva-habitacion.styles';
import { parsePositiveIntParam } from '@/utils/routeParams';

const TIPOS = ['DORMITORIO', 'BANO', 'COCINA', 'SALON', 'OTRO'] as const;
type TipoHabitacion = typeof TIPOS[number];

const ETIQUETAS_TIPO: Record<TipoHabitacion, string> = {
  DORMITORIO: 'Dormitorio',
  BANO: 'Baño',
  COCINA: 'Cocina',
  SALON: 'Salón',
  OTRO: 'Otro',
};

const NOMBRE_SUGERIDO: Partial<Record<TipoHabitacion, string>> = {
  BANO: 'Baño',
  COCINA: 'Cocina',
  SALON: 'Salón',
};

export default function NuevaHabitacionScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const keyboardAppearance = theme.isDark ? 'dark' : 'light';
  const { id } = useLocalSearchParams<{ id: string }>();
  const viviendaId = parsePositiveIntParam(id);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoHabitacion>('DORMITORIO');
  const [esHabitable, setEsHabitable] = useState(true);
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleTipoChange = (t: TipoHabitacion) => {
    setTipo(t);
    if (t !== 'DORMITORIO') setEsHabitable(false);
    else setEsHabitable(true);
    if (NOMBRE_SUGERIDO[t]) setNombre(NOMBRE_SUGERIDO[t]!);
  };

  const guardar = async () => {
    if (!viviendaId) {
      Toast.show({ type: 'error', text1: 'La ruta de la vivienda no es valida.' });
      return;
    }

    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await api.post(`/viviendas/${viviendaId}/habitaciones`, {
        nombre: nombre.trim(),
        tipo,
        es_habitable: tipo === 'DORMITORIO' ? esHabitable : false,
        metros_cuadrados: metrosCuadrados ? parseFloat(metrosCuadrados) : undefined,
        precio: tipo === 'DORMITORIO' && esHabitable && precio ? parseFloat(precio.replace(',', '.')) : null,
      });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo crear la habitación. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (!viviendaId) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Vivienda no encontrada</Text>
          <Text style={styles.errorText}>
            No podemos crear una habitacion porque el enlace no apunta a una vivienda valida.
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[styles.input, focusedInput === 'nombre' && styles.inputFocused]}
          placeholder="Ej: Habitación 1"
          placeholderTextColor={theme.colors.textMuted}
          keyboardAppearance={keyboardAppearance}
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          onFocus={() => setFocusedInput('nombre')}
          onBlur={() => setFocusedInput(null)}
        />

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.tipoFila}>
          {TIPOS.map((t) => (
            <Pressable
              key={t}
              style={[styles.tipoPill, tipo === t && styles.tipoPillActivo]}
              onPress={() => handleTipoChange(t)}
            >
              <Text style={[styles.tipoPillTexto, tipo === t && styles.tipoPillTextoActivo]}>
                {ETIQUETAS_TIPO[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        {tipo === 'DORMITORIO' && (
          <>
            <Text style={styles.label}>¿Es habitable?</Text>
            <View style={styles.switchFila}>
              <Text style={styles.switchLabel}>
                {esHabitable ? 'Sí — se generará código de invitación' : 'No — zona común'}
              </Text>
              <Switch
                value={esHabitable}
                onValueChange={setEsHabitable}
                trackColor={{ false: theme.colors.surface2, true: theme.colors.success }}
                thumbColor={theme.colors.surface}
                ios_backgroundColor={theme.colors.surface2}
              />
            </View>
          </>
        )}

        {tipo === 'DORMITORIO' && esHabitable && (
          <>
            <Text style={styles.label}>Precio mensual (€)</Text>
            <TextInput
              style={[styles.input, focusedInput === 'precio' && styles.inputFocused]}
              placeholder="Ej: 450"
              placeholderTextColor={theme.colors.textMuted}
              keyboardAppearance={keyboardAppearance}
              value={precio}
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
              onFocus={() => setFocusedInput('precio')}
              onBlur={() => setFocusedInput(null)}
            />
          </>
        )}

        <Text style={styles.label}>Metros cuadrados (opcional)</Text>
        <TextInput
          style={[styles.input, focusedInput === 'metros' && styles.inputFocused]}
          placeholder="Ej: 12.5"
          placeholderTextColor={theme.colors.textMuted}
          keyboardAppearance={keyboardAppearance}
          value={metrosCuadrados}
          onChangeText={setMetrosCuadrados}
          keyboardType="decimal-pad"
          onFocus={() => setFocusedInput('metros')}
          onBlur={() => setFocusedInput(null)}
        />

        <Pressable
          style={[styles.boton, (!nombre.trim() || loading) && styles.botonDisabled]}
          onPress={guardar}
          disabled={!nombre.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.botonTexto}>Añadir habitación</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
