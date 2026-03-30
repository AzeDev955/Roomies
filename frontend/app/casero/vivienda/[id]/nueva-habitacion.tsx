import { View, Text, TextInput, ScrollView, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/casero/vivienda/nueva-habitacion.styles';

const TIPOS = ['DORMITORIO', 'BANO', 'COCINA', 'SALON', 'OTRO'] as const;
type TipoHabitacion = typeof TIPOS[number];

export default function NuevaHabitacionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoHabitacion>('DORMITORIO');
  const [esHabitable, setEsHabitable] = useState(true);
  const [metrosCuadrados, setMetrosCuadrados] = useState('');
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await api.post(`/viviendas/${id}/habitaciones`, {
        nombre: nombre.trim(),
        tipo,
        es_habitable: esHabitable,
        metros_cuadrados: metrosCuadrados ? parseFloat(metrosCuadrados) : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo crear la habitación. Inténtalo de nuevo.');
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
              onPress={() => setTipo(t)}
            >
              <Text style={[styles.tipoPillTexto, tipo === t && styles.tipoPillTextoActivo]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

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
            <Text style={styles.botonTexto}>Añadir habitación</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
