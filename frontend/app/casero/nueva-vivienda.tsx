import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import api from '@/services/api';
import { styles } from '@/styles/casero/nueva-vivienda.styles';

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  context?: { id: string; text: string }[];
};

export default function NuevaViviendaScreen() {
  const router = useRouter();

  // Buscador Mapbox
  const [queryBusqueda, setQueryBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<MapboxFeature[]>([]);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  // Campos del formulario
  const [aliasNombre, setAliasNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [loading, setLoading] = useState(false);

  const puedeGuardar = aliasNombre.trim() && direccion.trim() && codigoPostal.trim() && ciudad.trim() && provincia.trim();

  const buscarDireccion = async () => {
    if (!queryBusqueda.trim()) return;
    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      Alert.alert('Configuración', 'Falta EXPO_PUBLIC_MAPBOX_TOKEN en las variables de entorno.');
      return;
    }
    setBuscandoDireccion(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(queryBusqueda)}.json?access_token=${token}&language=es&country=es`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      setResultadosBusqueda(datos.features ?? []);
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el buscador de direcciones.');
    } finally {
      setBuscandoDireccion(false);
    }
  };

  const seleccionarDireccion = (feature: MapboxFeature) => {
    const calle = feature.text ?? '';
    const numero = feature.address ?? '';
    setDireccion(numero ? `${calle} ${numero}`.trim() : calle);

    for (const ctx of feature.context ?? []) {
      if (ctx.id.startsWith('place')) setCiudad(ctx.text);
      else if (ctx.id.startsWith('region')) setProvincia(ctx.text.replace(/^Provincia de /i, ''));
      else if (ctx.id.startsWith('postcode')) setCodigoPostal(ctx.text);
    }

    setResultadosBusqueda([]);
    setQueryBusqueda('');
  };

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

        {/* — Buscador Mapbox — */}
        <Text style={styles.label}>Buscar dirección</Text>
        <View style={styles.buscadorFila}>
          <TextInput
            style={styles.buscadorInput}
            placeholder="Ej: Calle Mayor 10, Madrid"
            placeholderTextColor="#9e9e9e"
            value={queryBusqueda}
            onChangeText={setQueryBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={buscarDireccion}
            returnKeyType="search"
          />
          <Pressable
            style={[styles.buscadorBoton, buscandoDireccion && styles.buscadorBotonDisabled]}
            onPress={buscarDireccion}
            disabled={buscandoDireccion}
          >
            {buscandoDireccion ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buscadorBotonTexto}>Buscar</Text>
            )}
          </Pressable>
        </View>

        {resultadosBusqueda.length > 0 && (
          <View style={styles.resultadosContainer}>
            {resultadosBusqueda.map((feature) => (
              <Pressable
                key={feature.id}
                style={styles.resultadoItem}
                onPress={() => seleccionarDireccion(feature)}
              >
                <Text style={styles.resultadoTexto} numberOfLines={2}>
                  {feature.place_name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* — Campos manuales — */}
        <Text style={styles.labelSeccion}>Revisa o edita los datos</Text>

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
