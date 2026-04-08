import { View, Text, TextInput, ScrollView, Pressable, Switch, ActivityIndicator, Alert, LayoutAnimation } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { Theme } from '@/constants/theme';
import { styles } from '@/styles/casero/vivienda/nueva-habitacion.styles';

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
  const { id, habId, nombre: nombreParam, tipo: tipoParam, esHabitable: esHabitableParam, metrosCuadrados: metrosParam, inquilinoId } =
    useLocalSearchParams<{
      id: string;
      habId: string;
      nombre: string;
      tipo: string;
      esHabitable: string;
      metrosCuadrados: string;
      inquilinoId: string;
    }>();

  const tipoInicial = (TIPOS.includes(tipoParam as TipoHabitacion) ? tipoParam : 'DORMITORIO') as TipoHabitacion;

  const [nombre, setNombre] = useState(nombreParam ?? '');
  const [tipo, setTipo] = useState<TipoHabitacion>(tipoInicial);
  const [esHabitable, setEsHabitable] = useState(esHabitableParam === 'true');
  const [metrosCuadrados, setMetrosCuadrados] = useState(metrosParam ?? '');
  const [loading, setLoading] = useState(false);
  const [expulsando, setExpulsando] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mostrarPeligro, setMostrarPeligro] = useState(false);

  const togglePeligro = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarPeligro(!mostrarPeligro);
  };

  const expulsarInquilino = () => {
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
              await api.delete(`/viviendas/${id}/habitaciones/${habId}/inquilino`);
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
              await api.delete(`/viviendas/${id}/habitaciones/${habId}`);
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
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await api.put(`/viviendas/${id}/habitaciones/${habId}`, {
        nombre: nombre.trim(),
        tipo,
        es_habitable: tipo === 'DORMITORIO' ? esHabitable : false,
        metros_cuadrados: metrosCuadrados ? parseFloat(metrosCuadrados) : null,
      });
      router.back();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo actualizar la habitación.';
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[styles.input, focusedInput === 'nombre' && styles.inputFocused]}
          placeholder="Ej: Habitación 1"
          placeholderTextColor={Theme.colors.textMuted}
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
                trackColor={{ false: Theme.colors.border, true: Theme.colors.success }}
                thumbColor={Theme.colors.surface}
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Metros cuadrados (opcional)</Text>
        <TextInput
          style={[styles.input, focusedInput === 'metros' && styles.inputFocused]}
          placeholder="Ej: 12.5"
          placeholderTextColor={Theme.colors.textMuted}
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
            <ActivityIndicator color="#fff" />
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
            color={Theme.colors.danger}
          />
        </Pressable>

        {mostrarPeligro && (
          <View>
            {!!inquilinoId && (
              <Pressable
                style={[styles.botonDestructivoSoft, expulsando && { opacity: 0.5 }]}
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
