import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ModulosViviendaManager } from '@/components/casero/vivienda/ModulosViviendaManager';
import api from '@/services/api';
import { styles } from '@/styles/casero/vivienda/detalle.styles';
import { ModulosVivienda } from '@/utils/viviendaModules';

type Vivienda = ModulosVivienda & {
  id: number;
  alias_nombre: string;
  direccion: string;
};

export default function OpcionesViviendaTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vivienda, setVivienda] = useState<Vivienda | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarVivienda = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda>(`/viviendas/${id}`);
      setVivienda(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo cargar la configuracion.' });
      setVivienda(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargarVivienda();
    }, [cargarVivienda]),
  );

  if (loading) return <LoadingScreen />;

  if (!vivienda) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTexto}>Vivienda no encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.headerNombre}>Opciones</Text>
          <Text style={styles.headerDireccion}>{vivienda.alias_nombre}</Text>
        </View>

        <ModulosViviendaManager vivienda={vivienda} onViviendaChange={setVivienda} />
      </ScrollView>
    </View>
  );
}
