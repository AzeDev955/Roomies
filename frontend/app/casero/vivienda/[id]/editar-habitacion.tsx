import { View, Text, TextInput, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
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
  const { id, habId, nombre: nombreParam, tipo: tipoParam, esHabitable: esHabitableParam, metrosCuadrados: metrosParam } =
    useLocalSearchParams<{
      id: string;
      habId: string;
      nombre: string;
      tipo: string;
      esHabitable: string;
      metrosCuadrados: string;
    }>();

  const tipoInicial = (TIPOS.includes(tipoParam as TipoHabitacion) ? tipoParam : 'DORMITORIO') as TipoHabitacion;

  const [nombre, setNombre] = useState(nombreParam ?? '');
  const [tipo, setTipo] = useState<TipoHabitacion>(tipoInicial);
  const [esHabitable, setEsHabitable] = useState(esHabitableParam === 'true');
  const [metrosCuadrados, setMetrosCuadrados] = useState(metrosParam ?? '');
  const [loading, setLoading] = useState(false);

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
          style={styles.input}
          placeholder="Ej: Habitación 1"
          placeholderTextColor="#9e9e9e"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
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
                trackColor={{ false: '#dee2e6', true: '#34C759' }}
                thumbColor="#fff"
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Metros cuadrados (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 12.5"
          placeholderTextColor="#9e9e9e"
          value={metrosCuadrados}
          onChangeText={setMetrosCuadrados}
          keyboardType="decimal-pad"
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
      </ScrollView>
    </View>
  );
}
