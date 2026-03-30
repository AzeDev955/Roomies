import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/casero/nueva-vivienda.styles';

export default function NuevaViviendaScreen() {
  const router = useRouter();
  const [aliasNombre, setAliasNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [loading, setLoading] = useState(false);

  const puedeGuardar = aliasNombre.trim() && direccion.trim() && codigoPostal.trim() && ciudad.trim() && provincia.trim();

  const guardar = async () => {
    if (!puedeGuardar) return;
    setLoading(true);
    try {
      await api.post('/viviendas', {
        alias_nombre: aliasNombre.trim(),
        direccion: direccion.trim(),
        codigo_postal: codigoPostal.trim(),
        ciudad: ciudad.trim(),
        provincia: provincia.trim(),
      });
      router.replace('/casero/viviendas');
    } catch {
      Alert.alert('Error', 'No se pudo crear la vivienda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre / Alias</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Piso Centro"
          placeholderTextColor="#9e9e9e"
          value={aliasNombre}
          onChangeText={setAliasNombre}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Calle Mayor 10, 3ºB"
          placeholderTextColor="#9e9e9e"
          value={direccion}
          onChangeText={setDireccion}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Código Postal</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 28001"
          placeholderTextColor="#9e9e9e"
          value={codigoPostal}
          onChangeText={setCodigoPostal}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Madrid"
          placeholderTextColor="#9e9e9e"
          value={ciudad}
          onChangeText={setCiudad}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Provincia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Madrid"
          placeholderTextColor="#9e9e9e"
          value={provincia}
          onChangeText={setProvincia}
          autoCapitalize="words"
        />

        <Pressable
          style={[styles.boton, (!puedeGuardar || loading) && styles.botonDisabled]}
          onPress={guardar}
          disabled={!puedeGuardar || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Guardar vivienda</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
