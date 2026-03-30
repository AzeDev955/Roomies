import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD } from '@/styles/inquilino/nueva-incidencia.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

const PRIORIDADES: Prioridad[] = ['VERDE', 'AMARILLO', 'ROJO'];

export default function NuevaIncidenciaScreen() {
  const router = useRouter();
  const { viviendaId } = useLocalSearchParams<{ viviendaId: string }>();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('VERDE');
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    setLoading(true);
    try {
      await api.post('/incidencias', {
        titulo,
        descripcion,
        prioridad,
        vivienda_id: Number(viviendaId),
      });
      router.back();
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo enviar la incidencia. Inténtalo de nuevo.';
      Alert.alert('Error', mensaje);
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
