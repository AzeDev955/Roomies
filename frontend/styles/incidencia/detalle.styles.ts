import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

// — Soft tints por prioridad —
export const PRIORIDAD_BG: Record<string, string> = {
  VERDE:    '#E5FAF3',
  AMARILLO: '#FFF5E0',
  ROJO:     '#FFE8E8',
};

export const PRIORIDAD_TEXT: Record<string, string> = {
  VERDE:    '#0D7A5E',
  AMARILLO: '#A05C00',
  ROJO:     '#C0392B',
};

export const COLORES_PRIORIDAD: Record<string, string> = {
  VERDE:    Theme.colors.success,
  AMARILLO: Theme.colors.warning,
  ROJO:     Theme.colors.danger,
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En curso',
  RESUELTA:   'Resuelta',
};

export const ETIQUETAS_PRIORIDAD: Record<string, string> = {
  VERDE:    'Baja',
  AMARILLO: 'Media',
  ROJO:     'Alta',
};

// — Colores activos por estado —
export const ESTADO_PILL_BG: Record<string, string> = {
  PENDIENTE:  '#FFF5E0',
  EN_PROCESO: Theme.colors.primary + '20',
  RESUELTA:   '#E5FAF3',
};

export const ESTADO_PILL_TEXT: Record<string, string> = {
  PENDIENTE:  '#A05C00',
  EN_PROCESO: Theme.colors.primary,
  RESUELTA:   '#0D7A5E',
};

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTexto: { textAlign: 'center', marginTop: 40, color: Theme.colors.textTertiary },

  // — Cabecera (hero card del ticket) —
  cabeceraCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cabeceraStripe: {
    height: 4,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.base,
    alignSelf: 'flex-start',
    width: 40,
  },
  cabeceraBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  prioridadBadge: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  prioridadBadgeTexto: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  titulo: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitulo: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textTertiary,
    marginTop: 4,
  },

  // — Tarjeta de sección —
  seccion: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  etiqueta: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.sm,
  },
  valor: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
    lineHeight: 24,
  },

  // — Edición inline —
  inputTexto: {
    fontSize: Theme.typography.body,
    color: Theme.colors.text,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.base,
    backgroundColor: Theme.colors.primaryLight,
    lineHeight: 22,
  },
  inputDescripcion: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // — Selector de estado —
  estadoSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  estadoPill: {
    flex: 1,
    borderRadius: Theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Theme.colors.surface2,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  estadoPillTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textMedium,
  },
  estadoSoloLectura: {
    alignSelf: 'flex-start',
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
  },
  estadoSoloLecturaTexto: {
    fontSize: Theme.typography.label,
    fontWeight: '800',
  },

  // — Acciones —
  accionFila: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.base,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: Theme.colors.success,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonDisabled: {
    opacity: 0.55,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: Theme.colors.surface2,
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: Theme.colors.danger + '18',
    borderRadius: Theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.danger + '40',
  },
  botonTextoClaro: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
  botonTextoOscuro: {
    color: Theme.colors.textMedium,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
  botonTextoEliminar: {
    color: Theme.colors.danger,
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
});
