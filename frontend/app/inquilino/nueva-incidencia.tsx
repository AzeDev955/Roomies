import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles, COLORES_PRIORIDAD, ETIQUETAS_PRIORIDAD } from '@/styles/inquilino/nueva-incidencia.styles';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';

const PRIORIDADES: Prioridad[] = ['VERDE', 'AMARILLO', 'ROJO'];

export default function NuevaIncidenciaScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('VERDE');

  const handleEnviar = () => {
    console.log({ titulo, descripcion, prioridad });
    router.back();
  };

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

        <Pressable style={styles.botonEnviar} onPress={handleEnviar}>
          <Text style={styles.botonEnviarTexto}>Enviar Incidencia</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
