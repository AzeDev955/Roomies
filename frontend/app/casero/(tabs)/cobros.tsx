import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
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

type InquilinoActivo = {
  id: number;
  nombre: string;
  apellidos: string | null;
  avatar: string | null;
};

type ViviendaDetalle = Vivienda & {
  habitaciones: {
    id: number;
    tipo: string;
    es_habitable: boolean;
    inquilino: {
      id: number;
      nombre: string;
      apellidos: string | null;
      email?: string;
    } | null;
  }[];
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
    factura_url: string | null;
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

const parsearImporte = (valor: string) => {
  const numero = parseFloat(valor.replace(',', '.'));
  return Number.isFinite(numero) ? numero : 0;
};

const aCentimos = (importe: number) => Math.round(importe * 100);

export default function CaseroCobrosScreen() {
  const router = useRouter();
  const [viviendas, setViviendas] = useState<Vivienda[]>([]);
  const [viviendaSeleccionadaId, setViviendaSeleccionadaId] = useState<number | null>(null);
  const [resumen, setResumen] = useState<CobrosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCobros, setLoadingCobros] = useState(false);
  const [justificanteSeleccionado, setJustificanteSeleccionado] = useState<DeudaCobro | null>(null);
  const [inquilinosActivos, setInquilinosActivos] = useState<InquilinoActivo[]>([]);
  const [modalFacturaVisible, setModalFacturaVisible] = useState(false);
  const [conceptoFactura, setConceptoFactura] = useState('');
  const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().slice(0, 10));
  const [importeFactura, setImporteFactura] = useState('');
  const [repartoFactura, setRepartoFactura] = useState<Record<number, string>>({});
  const [facturaAdjunta, setFacturaAdjunta] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [guardandoFactura, setGuardandoFactura] = useState(false);

  const deudasPendientes = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PENDIENTE') ?? [],
    [resumen],
  );
  const deudasPagadas = useMemo(
    () => resumen?.deudas.filter((deuda) => deuda.estado === 'PAGADA') ?? [],
    [resumen],
  );
  const importeFacturaNumero = useMemo(() => parsearImporte(importeFactura), [importeFactura]);
  const totalAsignadoFactura = useMemo(
    () => Object.values(repartoFactura).reduce((total, valor) => total + parsearImporte(valor), 0),
    [repartoFactura],
  );
  const repartoCuadra =
    importeFacturaNumero > 0 &&
    aCentimos(totalAsignadoFactura) === aCentimos(importeFacturaNumero);
  const puedeGuardarFactura =
    conceptoFactura.trim().length > 0 &&
    fechaFactura.trim().length > 0 &&
    inquilinosActivos.length > 0 &&
    repartoCuadra &&
    !guardandoFactura;

  const cargarInquilinosActivos = useCallback(async (viviendaId: number) => {
    try {
      const { data } = await api.get<ViviendaDetalle>(`/viviendas/${viviendaId}`);
      const activos = data.habitaciones
        .filter((habitacion) => habitacion.es_habitable && habitacion.inquilino)
        .map((habitacion) => ({
          id: habitacion.inquilino!.id,
          nombre: habitacion.inquilino!.nombre,
          apellidos: habitacion.inquilino!.apellidos,
          avatar: null,
        }));

      setInquilinosActivos(activos);
      setRepartoFactura((actual) => {
        const siguiente: Record<number, string> = {};
        activos.forEach((inquilino) => {
          siguiente[inquilino.id] = actual[inquilino.id] ?? '';
        });
        return siguiente;
      });
    } catch {
      setInquilinosActivos([]);
      setRepartoFactura({});
      Toast.show({ type: 'error', text1: 'No se pudieron cargar los inquilinos activos.' });
    }
  }, []);

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
      await Promise.all([cargarCobros(viviendaInicial.id), cargarInquilinosActivos(viviendaInicial.id)]);
    } catch {
      setViviendas([]);
      setViviendaSeleccionadaId(null);
      setResumen(null);
      Toast.show({ type: 'error', text1: 'No se pudieron cargar tus viviendas.' });
    } finally {
      setLoading(false);
    }
  }, [cargarCobros, cargarInquilinosActivos, viviendaSeleccionadaId]);

  useFocusEffect(
    useCallback(() => {
      cargarContexto();
    }, [cargarContexto]),
  );

  const cambiarVivienda = async (viviendaId: number) => {
    setViviendaSeleccionadaId(viviendaId);
    await Promise.all([cargarCobros(viviendaId), cargarInquilinosActivos(viviendaId)]);
  };

  const limpiarModalFactura = () => {
    setConceptoFactura('');
    setFechaFactura(new Date().toISOString().slice(0, 10));
    setImporteFactura('');
    setFacturaAdjunta(null);
    setRepartoFactura(
      inquilinosActivos.reduce<Record<number, string>>((total, inquilino) => {
        total[inquilino.id] = '';
        return total;
      }, {}),
    );
  };

  const cerrarModalFactura = () => {
    if (guardandoFactura) return;
    setModalFacturaVisible(false);
    limpiarModalFactura();
  };

  const seleccionarFactura = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (resultado.canceled || !resultado.assets[0]) {
      return;
    }

    setFacturaAdjunta(resultado.assets[0]);
  };

  const actualizarReparto = (usuarioId: number, valor: string) => {
    setRepartoFactura((actual) => ({ ...actual, [usuarioId]: valor }));
  };

  const guardarFacturaPuntual = async () => {
    if (!viviendaSeleccionadaId || !puedeGuardarFactura) {
      return;
    }

    const formData = new FormData();
    formData.append('concepto', conceptoFactura.trim());
    formData.append('fecha', fechaFactura.trim());
    formData.append('importe', importeFacturaNumero.toFixed(2));
    formData.append(
      'repartoManual',
      JSON.stringify(
        inquilinosActivos.map((inquilino) => ({
          usuario_id: inquilino.id,
          importe: parseFloat(parsearImporte(repartoFactura[inquilino.id] ?? '').toFixed(2)),
        })),
      ),
    );

    if (facturaAdjunta) {
      if (Platform.OS === 'web' && facturaAdjunta.file) {
        formData.append('factura', facturaAdjunta.file);
      } else {
        formData.append('factura', {
          uri: facturaAdjunta.uri,
          name: facturaAdjunta.name ?? `factura-${Date.now()}`,
          type: facturaAdjunta.mimeType ?? 'application/octet-stream',
        } as never);
      }
    }

    setGuardandoFactura(true);
    try {
      await api.post(`/viviendas/${viviendaSeleccionadaId}/gastos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await cargarCobros(viviendaSeleccionadaId);
      setModalFacturaVisible(false);
      limpiarModalFactura();
      Toast.show({
        type: 'success',
        text1: 'Factura registrada',
        text2: `${conceptoFactura.trim()} queda repartida entre los inquilinos.`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.error ?? 'No se pudo registrar la factura puntual.',
      });
    } finally {
      setGuardandoFactura(false);
    }
  };

  const abrirUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo abrir el archivo.' });
    }
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

        <CustomButton
          label="Nueva Factura Puntual (Luz, Agua...)"
          variant="secondary"
          onPress={() => setModalFacturaVisible(true)}
          style={styles.invoiceButton}
        />

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
                <DeudaCard
                  key={deuda.id}
                  deuda={deuda}
                  onVerJustificante={setJustificanteSeleccionado}
                  onVerFactura={abrirUrl}
                />
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
                <DeudaCard
                  key={deuda.id}
                  deuda={deuda}
                  onVerJustificante={setJustificanteSeleccionado}
                  onVerFactura={abrirUrl}
                />
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

      <Modal
        visible={modalFacturaVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModalFactura}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable style={{ flex: 1 }} onPress={cerrarModalFactura} />
          <View style={styles.invoiceSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.invoiceContent}>
              <Text style={styles.modalTitle}>Nueva factura puntual</Text>
              <Text style={styles.modalSubtitle}>
                Luz, agua, gas o cualquier recibo con una parte distinta para cada inquilino.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Concepto</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. Factura de luz marzo"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={conceptoFactura}
                  onChangeText={setConceptoFactura}
                  maxLength={120}
                />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formRowItem}>
                  <Text style={styles.inputLabel}>Periodo / fecha</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="2026-04-10"
                    placeholderTextColor={Theme.colors.textMuted}
                    value={fechaFactura}
                    onChangeText={setFechaFactura}
                  />
                </View>
                <View style={styles.formRowItem}>
                  <Text style={styles.inputLabel}>Importe total</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0,00"
                    placeholderTextColor={Theme.colors.textMuted}
                    value={importeFactura}
                    onChangeText={setImporteFactura}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Pressable style={styles.attachmentButton} onPress={seleccionarFactura}>
                <View style={styles.attachmentIcon}>
                  <Ionicons name="document-attach-outline" size={20} color={Theme.colors.info} />
                </View>
                <View style={styles.attachmentTextBox}>
                  <Text style={styles.attachmentTitle}>
                    {facturaAdjunta ? facturaAdjunta.name : 'Adjuntar foto o PDF (opcional)'}
                  </Text>
                  <Text style={styles.attachmentSubtitle}>
                    {facturaAdjunta
                      ? 'Archivo preparado para subir'
                      : 'Puedes guardar la factura sin adjuntar archivo'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Theme.colors.textSecondary} />
              </Pressable>

              <View style={styles.splitHeader}>
                <Text style={styles.sectionTitle}>Reparto desigual</Text>
                <Text style={styles.sectionSubtitle}>Introduce la parte exacta de cada inquilino.</Text>
              </View>

              <View style={styles.tenantList}>
                {inquilinosActivos.map((inquilino) => (
                  <View key={inquilino.id} style={styles.tenantRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {obtenerIniciales(inquilino.nombre, inquilino.apellidos)}
                      </Text>
                    </View>
                    <View style={styles.tenantInfo}>
                      <Text style={styles.debtName} numberOfLines={1}>
                        {nombreCompleto(inquilino.nombre, inquilino.apellidos)}
                      </Text>
                      <Text style={styles.debtDate}>Parte asignada</Text>
                    </View>
                    <TextInput
                      style={styles.splitInput}
                      placeholder="0,00"
                      placeholderTextColor={Theme.colors.textMuted}
                      value={repartoFactura[inquilino.id] ?? ''}
                      onChangeText={(valor) => actualizarReparto(inquilino.id, valor)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                ))}
              </View>

              <View style={[styles.totalCounter, repartoCuadra && styles.totalCounterOk]}>
                <Text style={[styles.totalCounterText, repartoCuadra && styles.totalCounterTextOk]}>
                  Total asignado: {formatearImporte(totalAsignadoFactura)} /{' '}
                  {formatearImporte(importeFacturaNumero)}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <CustomButton
                  label="Cancelar"
                  variant="secondary"
                  onPress={cerrarModalFactura}
                  style={styles.modalAction}
                />
                <CustomButton
                  label={guardandoFactura ? 'Guardando...' : 'Guardar'}
                  onPress={guardarFacturaPuntual}
                  disabled={!puedeGuardarFactura}
                  style={styles.modalAction}
                />
              </View>
              {guardandoFactura && <ActivityIndicator color={Theme.colors.primary} />}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

function DeudaCard({
  deuda,
  onVerJustificante,
  onVerFactura,
}: {
  deuda: DeudaCobro;
  onVerJustificante: (deuda: DeudaCobro) => void;
  onVerFactura: (url: string) => void;
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

      {deuda.gasto.factura_url && (
        <Pressable style={styles.invoiceLink} onPress={() => onVerFactura(deuda.gasto.factura_url!)}>
          <Ionicons name="document-text-outline" size={15} color={Theme.colors.primary} />
          <Text style={styles.invoiceLinkText}>Ver factura original</Text>
        </Pressable>
      )}
    </View>
  );
}

function nombreCompleto(nombre: string, apellidos: string | null) {
  return apellidos ? `${nombre} ${apellidos}` : nombre;
}
