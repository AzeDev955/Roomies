import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Theme } from '@/constants/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { styles } from '@/styles/inquilino/limpieza.styles';

// ─────────────────────────────────────────────────────────────────────────────

const ETIQUETA_ESFUERZO: Record<number, string> = { 3: 'Ligera', 6: 'Normal', 10: 'Intensa' };

const etiquetaEsfuerzo = (peso: number) =>
  ETIQUETA_ESFUERZO[peso] ? `Esfuerzo: ${ETIQUETA_ESFUERZO[peso]}` : `Peso: ${peso}`;

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  HECHO: '✓ Hecho',
  NO_HECHO: '✗ No hecho',
};

type Turno = {
  id: number;
  usuario_id: number;
  zona_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'PENDIENTE' | 'HECHO' | 'NO_HECHO';
  zona: { id: number; nombre: string; peso: number };
  usuario: { id: number; nombre: string; apellidos: string | null };
};

// ─────────────────────────────────────────────────────────────────────────────

export default function LimpiezaInquilinoTab() {
  const [viviendaId, setViviendaId] = useState<number | null>(null);
  const [miUsuarioId, setMiUsuarioId] = useState<number | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarDatos = async () => {
        setLoading(true);
        try {
          const { data: viviendaData } = await api.get<{ miHabitacionId: number; vivienda: any }>(
            '/inquilino/vivienda'
          );
          const miHab = viviendaData.vivienda.habitaciones.find(
            (h: any) => h.id === viviendaData.miHabitacionId
          );
          const vId = viviendaData.vivienda.id;
          const uId = miHab?.inquilino?.id ?? 0;
          if (!activo) return;
          setViviendaId(vId);
          setMiUsuarioId(uId);

          const { data: turnosData } = await api.get<Turno[]>(`/viviendas/${vId}/limpieza/turnos`);
          if (activo) setTurnos(turnosData);
        } catch {
          // Sin vivienda o sin turnos — se muestra estado vacío
        } finally {
          if (activo) setLoading(false);
        }
      };

      cargarDatos();
      return () => { activo = false; };
    }, [])
  );

  const handleMarcarHecho = async (turnoId: number) => {
    if (!viviendaId) return;
    setMarcando(turnoId);
    try {
      const { data } = await api.patch<Turno>(
        `/viviendas/${viviendaId}/limpieza/turnos/${turnoId}/hecho`
      );
      setTurnos((prev) => prev.map((t) => (t.id === turnoId ? data : t)));
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.error ?? 'No se pudo actualizar el turno.',
      });
    } finally {
      setMarcando(null);
    }
  };

  const getSemanaLabel = () => {
    const hoy = new Date();
    const offset = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - offset);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${fmt(lunes)} — ${fmt(domingo)}`;
  };

  const nombreCorto = (t: Turno) =>
    `${t.usuario.nombre}${t.usuario.apellidos ? ` ${t.usuario.apellidos[0]}.` : ''}`;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={Theme.colors.primary} />;
  }

  if (!viviendaId) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Todavía no formas parte de ninguna vivienda.</Text>
        </View>
      </View>
    );
  }

  const misTurnos = turnos.filter((t) => t.usuario_id === miUsuarioId);
  const turnosResto = turnos.filter((t) => t.usuario_id !== miUsuarioId);

  const turnosPorCompanero = turnosResto.reduce<
    Record<number, { nombre: string; turnos: Turno[] }>
  >((acc, t) => {
    if (!acc[t.usuario_id]) acc[t.usuario_id] = { nombre: nombreCorto(t), turnos: [] };
    acc[t.usuario_id].turnos.push(t);
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.semanaLabel}>{getSemanaLabel()}</Text>

        {/* ── Mi Tarea ── */}
        <Text style={styles.seccionTitulo}>Mi Tarea</Text>
        {misTurnos.length === 0 ? (
          <Text style={[styles.emptyText, { textAlign: 'left', marginTop: 0, marginBottom: Theme.spacing.lg }]}>
            No tienes turnos asignados esta semana.
          </Text>
        ) : (
          misTurnos.map((t) => {
            const esPendiente = t.estado === 'PENDIENTE';
            const esHecho = t.estado === 'HECHO';
            return (
              <Card key={t.id} style={{ marginBottom: Theme.spacing.md }}>
                <Text style={styles.zonaNombreMia}>{t.zona.nombre}</Text>
                <Text style={styles.esfuerzoTexto}>{etiquetaEsfuerzo(t.zona.peso)}</Text>
                <View style={styles.estadoRow}>
                  <View
                    style={[
                      styles.estadoBadge,
                      esHecho
                        ? styles.estadoBadgeHecho
                        : esPendiente
                        ? styles.estadoBadgePendiente
                        : styles.estadoBadgeNoHecho,
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoTexto,
                        esHecho
                          ? styles.estadoTextoHecho
                          : esPendiente
                          ? styles.estadoTextoPendiente
                          : styles.estadoTextoNoHecho,
                      ]}
                    >
                      {ESTADO_LABEL[t.estado]}
                    </Text>
                  </View>
                  {esPendiente && (
                    <Pressable
                      style={({ pressed }) => [
                        styles.botonHecho,
                        pressed && styles.botonHechoPressed,
                      ]}
                      onPress={() => handleMarcarHecho(t.id)}
                      disabled={marcando === t.id}
                    >
                      {marcando === t.id ? (
                        <ActivityIndicator color={Theme.colors.surface} size="small" />
                      ) : (
                        <Text style={styles.botonHechoTexto}>✅ Marcar como Hecho</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </Card>
            );
          })
        )}

        {/* ── Compañeros ── */}
        {Object.keys(turnosPorCompanero).length > 0 && (
          <>
            <Text style={[styles.seccionTitulo, { marginTop: Theme.spacing.lg }]}>
              Turnos de la casa
            </Text>
            {Object.values(turnosPorCompanero).map((grupo) => (
              <Card key={grupo.nombre} style={{ marginBottom: Theme.spacing.sm }}>
                <Text style={styles.companeroNombre}>{grupo.nombre}</Text>
                {grupo.turnos.map((t) => (
                  <View key={t.id} style={styles.companeroTurnoRow}>
                    <Text style={styles.companeroZona}>• {t.zona.nombre}</Text>
                    <Text
                      style={
                        t.estado === 'HECHO'
                          ? styles.companeroEstadoHecho
                          : styles.companeroEstadoPendiente
                      }
                    >
                      {ESTADO_LABEL[t.estado]}
                    </Text>
                  </View>
                ))}
              </Card>
            ))}
          </>
        )}

        {turnos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay turnos generados para esta semana.{'\n'}Tu casero todavía no los ha creado.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
