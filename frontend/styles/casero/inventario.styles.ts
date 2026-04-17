import { StyleSheet } from 'react-native';
import { AppTheme, DefaultAppTheme } from '@/constants/theme';

export const createEstadoItemStyles = (theme: AppTheme = DefaultAppTheme) => ({
  NUEVO: {
    background: theme.colors.primaryLight,
    text: theme.colors.primary,
    border: `${theme.colors.primary}30`,
  },
  BUENO: {
    background: theme.colors.successLight,
    text: theme.colors.success,
    border: `${theme.colors.success}30`,
  },
  DESGASTADO: {
    background: theme.colors.warningLight,
    text: theme.colors.warning,
    border: `${theme.colors.warning}35`,
  },
  ROTO: {
    background: theme.colors.dangerLight,
    text: theme.colors.danger,
    border: `${theme.colors.danger}30`,
  },
} as const);

export const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.hero,
    fontWeight: '800',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  viviendaSelector: {
    marginBottom: theme.spacing.lg,
  },
  viviendaSelectorContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
  },
  viviendaChip: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  viviendaChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  viviendaChipText: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  viviendaChipTextActive: {
    color: theme.colors.primary,
  },
  heroCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.base,
  },
  heroTop: {
    gap: theme.spacing.xs,
  },
  heroLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: theme.typography.heading,
    color: theme.colors.text,
    fontWeight: '800',
  },
  heroAddress: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  heroStat: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  heroStatPrimary: {
    backgroundColor: theme.colors.primaryLight,
  },
  heroStatNeutral: {
    backgroundColor: theme.colors.surface2,
  },
  heroStatText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  heroStatTextPrimary: {
    color: theme.colors.primary,
  },
  heroStatTextNeutral: {
    color: theme.colors.textMedium,
  },
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.base,
  },
  loaderBlock: {
    paddingVertical: theme.spacing.xxl,
  },
  groupSection: {
    marginBottom: theme.spacing.xl,
  },
  groupHeader: {
    marginBottom: theme.spacing.base,
    gap: theme.spacing.xs,
  },
  groupTitle: {
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
  },
  groupSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
  },
  itemList: {
    gap: theme.spacing.base,
  },
  itemCard: {
    padding: theme.spacing.base,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  itemCardRow: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    alignItems: 'flex-start',
  },
  itemThumb: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
  },
  itemThumbPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: theme.typography.title,
    fontWeight: '800',
    color: theme.colors.text,
  },
  itemDescription: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  itemMetaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  itemMetaPill: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
  },
  itemMetaText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  photoCount: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  photoCountText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMedium,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconBox: {
    width: 92,
    height: 92,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyAction: {
    marginTop: theme.spacing.xl,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDark ? 0.2 : 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.textMuted,
    alignSelf: 'center',
    marginBottom: theme.spacing.base,
  },
  modalScrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  fieldBlock: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.typography.label,
    color: theme.colors.textMedium,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  textArea: {
    minHeight: 112,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.base,
    fontSize: theme.typography.input,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  optionList: {
    gap: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionPillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionPillText: {
    fontSize: theme.typography.label,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  optionPillTextActive: {
    color: theme.colors.primary,
  },
  imagePickerCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    gap: theme.spacing.base,
  },
  imagePreview: {
    width: '100%',
    height: 196,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 196,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  imagePlaceholderTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
  },
  imagePlaceholderSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  imageActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  imageActionButton: {
    flex: 1,
  },
  modalActions: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalActionButton: {
    flex: 1,
  },
});

export const styles = createStyles();
