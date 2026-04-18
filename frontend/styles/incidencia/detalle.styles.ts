import { StyleSheet } from 'react-native';
import { DefaultAppTheme, type AppTheme } from '@/constants/theme';

type Prioridad = 'VERDE' | 'AMARILLO' | 'ROJO';
type Estado = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTA';

export const getPrioridadBg = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.successLight,
  AMARILLO: theme.colors.warningLight,
  ROJO: theme.colors.dangerLight,
})[prioridad];

export const getPrioridadText = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.successText,
  AMARILLO: theme.colors.warningText,
  ROJO: theme.colors.dangerText,
})[prioridad];

export const getColorPrioridad = (theme: AppTheme, prioridad: Prioridad) => ({
  VERDE: theme.colors.success,
  AMARILLO: theme.colors.warning,
  ROJO: theme.colors.danger,
})[prioridad];

export const ETIQUETAS_ESTADO: Record<Estado, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En curso',
  RESUELTA: 'Resuelta',
};

export const ETIQUETAS_PRIORIDAD: Record<Prioridad, string> = {
  VERDE: 'Baja',
  AMARILLO: 'Media',
  ROJO: 'Alta',
};

export const getEstadoPillBg = (theme: AppTheme, estado: Estado) => ({
  PENDIENTE: theme.colors.warningLight,
  EN_PROCESO: theme.colors.primaryLight,
  RESUELTA: theme.colors.successLight,
})[estado];

export const getEstadoPillText = (theme: AppTheme, estado: Estado) => ({
  PENDIENTE: theme.colors.warningText,
  EN_PROCESO: theme.colors.primary,
  RESUELTA: theme.colors.successText,
})[estado];

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTexto: { textAlign: 'center', marginTop: 40, color: theme.colors.textTertiary },

  cabeceraCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cabeceraStripe: {
    height: 4,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.base,
    alignSelf: 'flex-start',
    width: 40,
  },
  cabeceraBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  prioridadBadge: {
    borderRadius: theme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  prioridadBadgeTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  titulo: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0,
    lineHeight: 32,
  },
  subtitulo: {
    fontSize: theme.typography.label,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },

  seccion: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  etiqueta: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: theme.spacing.sm,
  },
  valor: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },

  inputTexto: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.primaryLight,
    lineHeight: 22,
  },
  inputDescripcion: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  estadoSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  estadoPill: {
    flex: 1,
    borderRadius: theme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface2,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  estadoPillTexto: {
    fontSize: theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  estadoSoloLectura: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  estadoSoloLecturaTexto: {
    fontSize: theme.typography.label,
    fontWeight: '800',
  },

  accionFila: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.base,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.lg,
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
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.dangerText,
  },
  botonTextoClaro: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  botonTextoOscuro: {
    color: theme.colors.textMedium,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  botonTextoEliminar: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});

export const styles = createStyles();
