import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { useGlobalSearchParams } from 'expo-router';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { CustomInput } from '@/components/common/CustomInput';
import { styles } from '@/styles/casero/vivienda/limpieza.styles';

type ZonaLimpieza = {
  id: number;
  nombre: string;
  peso: number;
  activa: boolean;
};

export default function LimpiezaCaseroTab() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const [zonas, setZonas] = useState<ZonaLimpieza[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [peso, setPeso] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarZonas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ZonaLimpieza[]>(`/viviendas/${id}/limpieza/zonas`);
      setZonas(data);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudieron cargar las zonas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarZonas(); }, [id]);

  const cerrarModal = () => {
    setModalVisible(false);
    setNombre('');
    setPeso('');
  };

  const handleGuardar = async () => {
    const pesoNum = parseFloat(peso);
    if (!nombre.trim() || isNaN(pesoNum) || pesoNum <= 0) return;
    setGuardando(true);
    try {
      const { data } = await api.post<ZonaLimpieza>(`/viviendas/${id}/limpieza/zonas`, {
        nombre: nombre.trim(),
        peso: pesoNum,
      });
      setZonas((prev) => [...prev, data]);
      cerrarModal();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error ?? 'No se pudo crear la zona.' });
    } finally {
      setGuardando(false);
    }
  };

  const puedeGuardar = nombre.trim().length > 0 && parseFloat(peso) > 0;

  const renderZona = ({ item }: { item: ZonaLimpieza }) => (
    <Card style={{ marginBottom: Theme.spacing.md }}>
      <View style={styles.cardRow}>
        <Text style={styles.zonaNombre}>{item.nombre}</Text>
        <View style={[styles.badge, item.activa ? styles.badgeActiva : styles.badgeInactiva]}>
          <Text style={[styles.badgeTexto, item.activa ? styles.badgeTextoActiva : styles.badgeTextoInactiva]}>
            {item.activa ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>
      <Text style={styles.zonaPeso}>Peso: {item.peso}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={zonas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderZona}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay zonas definidas. Pulsa + para añadir la primera.</Text>
          }
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={cerrarModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Nueva zona</Text>
            <CustomInput
              label="Nombre de la zona"
              placeholder="ej. Cocina, Baño 1, Pasillo..."
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
            />
            <CustomInput
              label="Peso (esfuerzo relativo)"
              placeholder="ej. 10"
              value={peso}
              onChangeText={setPeso}
              keyboardType="decimal-pad"
            />
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonCancelar, pressed && styles.botonPressed]}
                onPress={cerrarModal}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.botonGuardar,
                  !puedeGuardar && styles.botonGuardarDisabled,
                  pressed && !guardando && styles.botonPressed,
                ]}
                onPress={handleGuardar}
                disabled={!puedeGuardar || guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
