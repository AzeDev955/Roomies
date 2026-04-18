import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },

  label: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textMedium,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.base,
  },
  labelSeccion: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    fontSize: theme.typography.input,
    color: theme.colors.text,
    minHeight: 52,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.12 : 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  // — Buscador Mapbox —
  buscadorFila: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  buscadorInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    fontSize: theme.typography.input,
    color: theme.colors.text,
    minHeight: 52,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.12 : 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  buscadorBoton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    minHeight: 52,
  },
  buscadorBotonDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },
  buscadorBotonTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },

  // — Lista de resultados —
  resultadosContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.isDark ? 0.16 : 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultadoItem: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  resultadoTexto: {
    fontSize: theme.typography.label,
    color: theme.colors.text,
    lineHeight: 20,
  },

  // — Tipo pills —
  tipoFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tipoPill: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface2,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 40,
    justifyContent: 'center',
  },
  tipoPillActivo: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  tipoPillTexto: {
    fontSize: theme.typography.label,
    fontWeight: '600',
    color: theme.colors.textMedium,
  },
  tipoPillTextoActivo: {
    color: theme.colors.primary,
  },

  // — Switch habitable —
  switchFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  switchLabel: {
    fontSize: theme.typography.label,
    color: theme.colors.textMedium,
    flex: 1,
    marginRight: theme.spacing.md,
  },

  // — Botón añadir habitación —
  botonAnadirHabitacion: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonAnadirHabitacionTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },

  // — Lista de habitaciones añadidas —
  habitacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.12 : 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  habitacionItemWrapper: { flex: 1 },
  habitacionItemTexto: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  habitacionItemBadgeTexto: {
    fontSize: theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  habitacionItemEliminar: {
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  habitacionItemEliminarTexto: {
    color: theme.colors.danger,
    fontWeight: '700',
    fontSize: 16,
  },

  // — Botón guardar —
  boton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    minHeight: 52,
    justifyContent: 'center',
  },
  botonDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
  },
  botonTexto: {
    color: theme.colors.surface,
    fontSize: theme.typography.input,
    fontWeight: '700',
  },
});

export const styles = createStyles();
