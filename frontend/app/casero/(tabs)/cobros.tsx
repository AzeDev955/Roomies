import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { CustomButton } from '@/components/common/CustomButton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Theme } from '@/constants/theme';
import api from '@/services/api';
import {
  ESTADO_BADGE_BG,
  ESTADO_BADGE_BORDER,
  ESTADO_BADGE_TEXT,
  styles,
} from '@/styles/casero/cobros.styles';

type Vivienda = {
  id: number;
  alias_nombre: string;
  direccion: string;
};

type DeudaCobro = {
  id: number;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADA';
  justificante_url: string | null;
  gasto: {
    id: number;
    concepto: string;
    fecha_creacion: string;
  };
  deudor: {
    id: number;
    nombre: string;
    apellidos: string | null;
    avatar: string | null;
  };
};

type CobrosResponse = {
  vivienda: Vivienda;
  periodo: {
    inicio: string;
    fin: string;
  };
  resumen: {
    total_pagado_mes: number;
    total_pendiente: number;
    total_deudas: number;
  };
  deudas: DeudaCobro[];
};

const formatearImporte = (importe: number) =>
  importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const formatearFecha = (fechaIso: string) =>
  new Date(fechaIso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const obtenerIniciales = (nombre: string, apellidos: string | null) =>
  `${nombre[0] ?? ''}${apellidos?.[0] ?? ''}`.toUpperCase();

export default function CaseroCobrosScreen() {
  const router = useRouter();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<CobrosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCobros, setLoadingCobros] = useState(false);
  const [justificanteSeleccionado, setJustificanteSeleccionado] = useState<DeudaCobro | null>(null);

  const deudasPendientes = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PENDIENTE') ?? [],
    [resumen],
  );
  const deudasPagadas = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PAGADA') ?? [],
    [resumen],
  );

  const cargarCobros = useCallback(async (viviendaId: number) => {
    setLoadingCobros(true);
    try {
      const { data } = await api.get<CobrosResponse>(`/viviendas/${viviendaId}/cobros`);
      setResumen(data);
    } catch (error: any) {
      setResumen(null);
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo cargar el dashboard de cobros.',
      });
    } finally {
      setLoadingCobros(false);
    }
  }, []);

  const cargarContexto = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Vivienda[]>('/viviendas');
      setViviendas(data);

      if (data.length === 0) {
        setViviendaSeleccionadaId(null);
        setResumen(null);
        return;
      }

      const viviendaInicial =
        data.find((vivienda) => vivienda.id === viviendaSeleccionadaId) ?? data[0];

      setViviendaSeleccionadaId(viviendaInicial.id);
      await cargarCobros(viviendaInicial.id);
    } catch {
      setViviendas([]);
      setViviendaSeleccionadaId(null);
      setResumen(null);
      Toast.show({ type: 'error', text1: 'No se pudieron cargar tus viviendas.' });
    } finally {
      setLoading(false);
    }
  }, [cargarCobros, viviendaSeleccionadaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  const cambiarVivienda = async (viviendaId: number) => {
    setViviendaSeleccionadaId(viviendaId);
    await cargarCobros(viviendaId);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!viviendas.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="home-outline" size={44} color={Theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Primero añade una vivienda</Text>
          <Text style={styles.emptySubtitle}>
            El dashboard de cobros aparecerá aquí en cuanto tengas una propiedad creada.
          </Text>
          <CustomButton
            label="Crear vivienda"
            onPress={() => router.push('/casero/nueva-vivienda')}
            style={styles.emptyAction}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>Dashboard financiero</Text>
          <Text style={styles.headerTitle}>Cobros del mes</Text>
          <Text style={styles.headerSubtitle}>
            Controla qué recibos ya han entrado y qué importes siguen pendientes de cobro.
          </Text>
        </View>

        {viviendas.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viviendaSelectorContent}
            style={styles.viviendaSelector}
          >
            {viviendas.map((vivienda) => {
              const activa = vivienda.id === viviendaSeleccionadaId;
              return (
                <Pressable
                  key={vivienda.id}
                  style={[styles.viviendaChip, activa && styles.viviendaChipActive]}
                  onPress={() => cambiarVivienda(vivienda.id)}
                >
                  <Text
                    style={[
                      styles.viviendaChipText,
                      activa && styles.viviendaChipTextActive,
                    ]}
                  >
                    {vivienda.alias_nombre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {resumen && (
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <Text style={styles.heroLabel}>Vivienda activa</Text>
              <Text style={styles.heroTitle}>{resumen.vivienda.alias_nombre}</Text>
              <Text style={styles.heroAddress}>{resumen.vivienda.direccion}</Text>
            </View>

            <View style={styles.heroAmounts}>
              <View style={[styles.heroAmountCard, styles.heroAmountCardPaid]}>
                <Text style={[styles.heroAmountLabel, styles.heroAmountLabelPaid]}>
                  Ingresado
                </Text>
                <Text style={styles.heroAmountValue}>
                  {formatearImporte(resumen.resumen.total_pagado_mes)}
                </Text>
                <Text style={styles.heroAmountHelp}>Recibos marcados como pagados este mes</Text>
              </View>

              <View style={[styles.heroAmountCard, styles.heroAmountCardPending]}>
                <Text style={[styles.heroAmountLabel, styles.heroAmountLabelPending]}>
                  Pendiente
                </Text>
                <Text style={styles.heroAmountValue}>
                  {formatearImporte(resumen.resumen.total_pendiente)}
                </Text>
                <Text style={styles.heroAmountHelp}>Importe aún abierto por cobrar</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pendientes de cobro</Text>
            <Text style={styles.sectionSubtitle}>
              Recibos del mes actual que todavía no han sido marcados como pagados.
            </Text>
          </View>

          {loadingCobros ? (
            <LoadingScreen />
          ) : deudasPendientes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="checkmark-done-outline" size={40} color={Theme.colors.success} />
              </View>
              <Text style={styles.emptyTitle}>Nada pendiente por ahora</Text>
              <Text style={styles.emptySubtitle}>
                Cuando haya importes abiertos para esta vivienda aparecerán aquí agrupados.
              </Text>
            </View>
          ) : (
            <View style={styles.debtList}>
              {deudasPendientes.map((deuda) => (
                <DeudaCard key={deuda.id} deuda={deuda} onVerJustificante={setJustificanteSeleccionado} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cobrados</Text>
            <Text style={styles.sectionSubtitle}>
              Pagos ya registrados, con acceso rápido al justificante cuando existe.
            </Text>
          </View>

          {deudasPagadas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="wallet-outline" size={40} color={Theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Todavía no hay cobros cerrados</Text>
              <Text style={styles.emptySubtitle}>
                En cuanto un inquilino marque una deuda como pagada la verás aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.debtList}>
              {deudasPagadas.map((deuda) => (
                <DeudaCard key={deuda.id} deuda={deuda} onVerJustificante={setJustificanteSeleccionado} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!justificanteSeleccionado}
        transparent
        animationType="slide"
        onRequestClose={() => setJustificanteSeleccionado(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setJustificanteSeleccionado(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Justificante</Text>
            <Text style={styles.modalSubtitle}>
              {justificanteSeleccionado
                ? `${nombreCompleto(justificanteSeleccionado.deudor.nombre, justificanteSeleccionado.deudor.apellidos)} · ${justificanteSeleccionado.gasto.concepto}`
                : ''}
            </Text>

            {justificanteSeleccionado?.justificante_url && (
              <View style={styles.modalImageWrap}>
                <Image
                  source={{ uri: justificanteSeleccionado.justificante_url }}
                  contentFit="contain"
                  style={styles.modalImage}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton
                label="Cerrar"
                variant="secondary"
                onPress={() => setJustificanteSeleccionado(null)}
                style={styles.modalAction}
              />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function DeudaCard({
  deuda,
  onVerJustificante,
}: {
  deuda: DeudaCobro;
  onVerJustificante: (deuda: DeudaCobro) => void;
}) {
  return (
    <View style={styles.debtCard}>
      <View style={styles.debtRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {obtenerIniciales(deuda.deudor.nombre, deuda.deudor.apellidos)}
          </Text>
        </View>

        <View style={styles.debtBody}>
          <Text style={styles.debtName} numberOfLines={1}>
            {nombreCompleto(deuda.deudor.nombre, deuda.deudor.apellidos)}
          </Text>
          <Text style={styles.debtConcept} numberOfLines={2}>
            {deuda.gasto.concepto}
          </Text>
          <Text style={styles.debtDate}>{formatearFecha(deuda.gasto.fecha_creacion)}</Text>
        </View>

        <View style={styles.debtMeta}>
          <Text style={styles.debtAmount}>{formatearImporte(deuda.importe)}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: ESTADO_BADGE_BG[deuda.estado],
                borderColor: ESTADO_BADGE_BORDER[deuda.estado],
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: ESTADO_BADGE_TEXT[deuda.estado] },
              ]}
            >
              {deuda.estado}
            </Text>
          </View>
        </View>
      </View>

      {deuda.estado === 'PAGADA' && deuda.justificante_url && (
        <Pressable style={styles.receiptLink} onPress={() => onVerJustificante(deuda)}>
          <Ionicons name="image-outline" size={15} color={Theme.colors.info} />
          <Text style={styles.receiptLinkText}>Ver justificante</Text>
        </Pressable>
      )}
    </View>
  );
}

function nombreCompleto(nombre: string, apellidos: string | null) {
  return apellidos ? `${nombre} ${apellidos}` : nombre;
}
