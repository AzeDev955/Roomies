import { View, Text, TextInput, ScrollView, Pressable, Switch, ActivityIndicator, Alert, LayoutAnimation } from 'react-native';
import Toast from 'react-native-toast-message';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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

export default function EditarHabitacionScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const keyboardAppearance = theme.isDark ? 'dark' : 'light';
  const { id, habId, nombre: nombreParam, tipo: tipoParam, esHabitable: esHabitableParam, metrosCuadrados: metrosParam, precio: precioParam, inquilinoId } =
    useLocalSearchParams<{
      id: string;
      habId: string;
      nombre: string;
      tipo: string;
      esHabitable: string;
      metrosCuadrados: string;
      precio: string;
      inquilinoId: string;
    }>();
  const viviendaId = parsePositiveIntParam(id);
  const habitacionId = parsePositiveIntParam(habId);

  const tipoInicial = (TIPOS.includes(tipoParam as TipoHabitacion) ? tipoParam : 'DORMITORIO') as TipoHabitacion;

  const [nombre, setNombre] = useState(nombreParam ?? '');
  const [tipo, setTipo] = useState<TipoHabitacion>(tipoInicial);
  const [esHabitable, setEsHabitable] = useState(esHabitableParam === 'true');
  const [metrosCuadrados, setMetrosCuadrados] = useState(metrosParam ?? '');
  const [precio, setPrecio] = useState(precioParam ?? '');
  const [loading, setLoading] = useState(false);
  const [expulsando, setExpulsando] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mostrarPeligro, setMostrarPeligro] = useState(false);

  const togglePeligro = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarPeligro(!mostrarPeligro);
  };

  const expulsarInquilino = () => {
    if (!viviendaId || !habitacionId) return;

    Alert.alert(
      '¿Expulsar inquilino?',
      'Esta acción desvinculará al usuario de la habitación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Expulsar',
          style: 'destructive',
          onPress: async () => {
            setExpulsando(true);
            try {
              await api.delete(`/viviendas/${viviendaId}/habitaciones/${habitacionId}/inquilino`);
              router.back();
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo expulsar al inquilino.' });
            } finally {
              setExpulsando(false);
            }
          },
        },
      ]
    );
  };

  const eliminarHabitacion = () => {
    if (!viviendaId || !habitacionId) return;

    Alert.alert(
      'Eliminar habitación',
      `¿Eliminar "${nombre.trim()}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/viviendas/${viviendaId}/habitaciones/${habitacionId}`);
              router.back();
            } catch (err: any) {
              Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo eliminar la habitación.' });
            }
          },
        },
      ]
    );
  };

  const handleTipoChange = (t: TipoHabitacion) => {
    setTipo(t);
    if (t !== 'DORMITORIO') setEsHabitable(false);
    else setEsHabitable(true);
  };

  const guardar = async () => {
    if (!viviendaId || !habitacionId) {
      Toast.show({ type: 'error', text1: 'La ruta de la habitacion no es valida.' });
      return;
    }

    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await api.put(`/viviendas/${viviendaId}/habitaciones/${habitacionId}`, {
        nombre: nombre.trim(),
        tipo,
        es_habitable: tipo === 'DORMITORIO' ? esHabitable : false,
        metros_cuadrados: metrosCuadrados ? parseFloat(metrosCuadrados) : null,
        precio: tipo === 'DORMITORIO' && esHabitable && precio ? parseFloat(precio.replace(',', '.')) : null,
      });
      router.back();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo actualizar la habitación.';
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoading(false);
    }
  };

  if (!viviendaId || !habitacionId) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Habitacion no encontrada</Text>
          <Text style={styles.errorText}>
            No podemos editar esta habitacion porque el enlace no tiene parametros validos.
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
            <Text style={styles.botonTexto}>Guardar cambios</Text>
          )}
        </Pressable>

        {/* Zona de peligro — acordeón */}
        <View style={styles.zonaPeligroSeparador} />
        <Pressable style={styles.acordeonCabecera} onPress={togglePeligro}>
          <Text style={styles.zonaPeligroTitulo}>Zona de peligro</Text>
          <Ionicons
            name={mostrarPeligro ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.colors.danger}
          />
        </Pressable>

        {mostrarPeligro && (
          <View>
            {!!inquilinoId && (
              <Pressable
                style={[styles.botonDestructivoSoft, expulsando && styles.botonDestructivoSoftDisabled]}
                onPress={expulsarInquilino}
                disabled={expulsando}
              >
                <Text style={styles.botonDestructivoSoftTexto}>
                  {expulsando ? 'Expulsando…' : 'Expulsar al inquilino'}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.botonDestructivoSoft}
              onPress={eliminarHabitacion}
            >
              <Text style={styles.botonDestructivoSoftTexto}>Eliminar habitación</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
