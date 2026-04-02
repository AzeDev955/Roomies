import { View, Text, TextInput, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
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

type HabitacionLocal = {
  nombre: string;
  tipo: TipoHabitacion;
  esHabitable: boolean;
  metrosCuadrados: string;
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

  // Habitaciones inline
  const [habitaciones, setHabitaciones] = useState<HabitacionLocal[]>([]);
  const [habNombre, setHabNombre] = useState('');
  const [habTipo, setHabTipo] = useState<TipoHabitacion>('DORMITORIO');
  const [habEsHabitable, setHabEsHabitable] = useState(true);
  const [habMetros, setHabMetros] = useState('');

  const puedeGuardar = aliasNombre.trim() && direccion.trim() && codigoPostal.trim() && ciudad.trim() && provincia.trim();

  const buscarDireccion = async () => {
    if (!queryBusqueda.trim()) return;
    const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      Toast.show({ type: 'error', text1: 'Falta EXPO_PUBLIC_MAPBOX_TOKEN en las variables de entorno.' });
      return;
    }
    setBuscandoDireccion(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(queryBusqueda)}.json?access_token=${token}&language=es&country=es`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      setResultadosBusqueda(datos.features ?? []);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo conectar con el buscador de direcciones.' });
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

  const handleHabTipoChange = (t: TipoHabitacion) => {
    setHabTipo(t);
    if (t !== 'DORMITORIO') setHabEsHabitable(false);
    else setHabEsHabitable(true);
    if (NOMBRE_SUGERIDO[t]) setHabNombre(NOMBRE_SUGERIDO[t]!);
  };

  const añadirHabitacion = () => {
    if (!habNombre.trim()) return;
    setHabitaciones((prev) => [
      ...prev,
      {
        nombre: habNombre.trim(),
        tipo: habTipo,
        esHabitable: habTipo === 'DORMITORIO' ? habEsHabitable : false,
        metrosCuadrados: habMetros,
      },
    ]);
    setHabNombre('');
    setHabTipo('DORMITORIO');
    setHabEsHabitable(true);
    setHabMetros('');
  };

  const eliminarHabitacionLocal = (index: number) => {
    setHabitaciones((prev) => prev.filter((_, i) => i !== index));
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
        habitaciones: habitaciones.map((h) => ({
          nombre: h.nombre,
          tipo: h.tipo,
          es_habitable: h.esHabitable,
          metros_cuadrados: h.metrosCuadrados ? parseFloat(h.metrosCuadrados) : undefined,
        })),
      });
      router.replace('/casero/viviendas');
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo crear la vivienda. Inténtalo de nuevo.' });
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

        {/* — Habitaciones inline — */}
        <Text style={styles.labelSeccion}>Habitaciones (opcional)</Text>

        <Text style={styles.label}>Nombre de la habitación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Habitación 1"
          placeholderTextColor="#9e9e9e"
          value={habNombre}
          onChangeText={setHabNombre}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.tipoFila}>
          {TIPOS.map((t) => (
            <Pressable
              key={t}
              style={[styles.tipoPill, habTipo === t && styles.tipoPillActivo]}
              onPress={() => handleHabTipoChange(t)}
            >
              <Text style={[styles.tipoPillTexto, habTipo === t && styles.tipoPillTextoActivo]}>
                {ETIQUETAS_TIPO[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        {habTipo === 'DORMITORIO' && (
          <>
            <Text style={styles.label}>¿Es habitable?</Text>
            <View style={styles.switchFila}>
              <Text style={styles.switchLabel}>
                {habEsHabitable ? 'Sí — se generará código de invitación' : 'No — zona común'}
              </Text>
              <Switch
                value={habEsHabitable}
                onValueChange={setHabEsHabitable}
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
          value={habMetros}
          onChangeText={setHabMetros}
          keyboardType="decimal-pad"
        />

        <Pressable
          style={[styles.botonAnadirHabitacion, !habNombre.trim() && styles.botonDisabled]}
          onPress={añadirHabitacion}
          disabled={!habNombre.trim()}
        >
          <Text style={styles.botonAnadirHabitacionTexto}>+ Añadir habitación</Text>
        </Pressable>

        {habitaciones.map((h, i) => (
          <View key={i} style={styles.habitacionItem}>
            <View style={styles.habitacionItemWrapper}>
              <Text style={styles.habitacionItemTexto}>{h.nombre}</Text>
              <Text style={styles.habitacionItemBadgeTexto}>{ETIQUETAS_TIPO[h.tipo]}{h.esHabitable ? ' · habitable' : ''}</Text>
            </View>
            <Pressable style={styles.habitacionItemEliminar} onPress={() => eliminarHabitacionLocal(i)}>
              <Text style={styles.habitacionItemEliminarTexto}>×</Text>
            </Pressable>
          </View>
        ))}

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
