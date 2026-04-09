import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const ESTADO_ITEM_BG = {
  NUEVO: Theme.colors.primaryLight,
  BUENO: `${Theme.colors.success}18`,
  DESGASTADO: `${Theme.colors.warning}18`,
  ROTO: `${Theme.colors.danger}14`,
} as const;

export const ESTADO_ITEM_TEXT = {
  NUEVO: Theme.colors.primary,
  BUENO: Theme.colors.success,
  DESGASTADO: Theme.colors.warning,
  ROTO: Theme.colors.danger,
} as const;

export const ESTADO_ITEM_BORDER = {
  NUEVO: `${Theme.colors.primary}30`,
  BUENO: `${Theme.colors.success}30`,
  DESGASTADO: `${Theme.colors.warning}35`,
  ROTO: `${Theme.colors.danger}30`,
} as const;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.hero,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  viviendaSelector: {
    marginBottom: Theme.spacing.lg,
  },
  viviendaSelectorContent: {
    gap: Theme.spacing.sm,
    paddingRight: Theme.spacing.sm,
  },
  viviendaChip: {
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
  },
  viviendaChipActive: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  viviendaChipText: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  viviendaChipTextActive: {
    color: Theme.colors.primary,
  },
  heroCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    gap: Theme.spacing.base,
  },
  heroTop: {
    gap: Theme.spacing.xs,
  },
  heroLabel: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Theme.typography.heading,
    color: Theme.colors.text,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroAddress: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  heroStat: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  heroStatPrimary: {
    backgroundColor: `${Theme.colors.primary}16`,
  },
  heroStatNeutral: {
    backgroundColor: Theme.colors.surface2,
  },
  heroStatText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  heroStatTextPrimary: {
    color: Theme.colors.primary,
  },
  heroStatTextNeutral: {
    color: Theme.colors.textMedium,
  },
  sectionTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.base,
  },
  loaderBlock: {
    paddingVertical: Theme.spacing.xxl,
  },
  groupSection: {
    marginBottom: Theme.spacing.xl,
  },
  groupHeader: {
    marginBottom: Theme.spacing.base,
    gap: Theme.spacing.xs,
  },
  groupTitle: {
    fontSize: Theme.typography.title,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  groupSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
  },
  itemList: {
    gap: Theme.spacing.base,
  },
  itemCard: {
    padding: Theme.spacing.base,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface,
  },
  itemCardRow: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
    alignItems: 'flex-start',
  },
  itemThumb: {
    width: 84,
    height: 84,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surface2,
  },
  itemThumbPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: Theme.radius.md,
    backgroundColor: `${Theme.colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: {
    flex: 1,
    gap: Theme.spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
  },
  itemName: {
    flex: 1,
    fontSize: Theme.typography.title,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.2,
  },
  itemDescription: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  itemMetaRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  itemMetaPill: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
  },
  itemMetaText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  photoCount: {
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  photoCountText: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textMedium,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyIconBox: {
    width: 92,
    height: 92,
    borderRadius: Theme.radius.xl,
    backgroundColor: `${Theme.colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyAction: {
    marginTop: Theme.spacing.xl,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: Theme.spacing.lg,
    bottom: Theme.spacing.lg,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
  fabText: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.textMuted,
    alignSelf: 'center',
    marginBottom: Theme.spacing.base,
  },
  modalScrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  modalTitle: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  fieldBlock: {
    marginBottom: Theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textMedium,
    fontWeight: '700',
    marginBottom: Theme.spacing.sm,
  },
  textArea: {
    minHeight: 112,
    borderRadius: Theme.radius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.base,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
    textAlignVertical: 'top',
  },
  optionList: {
    gap: Theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  optionPillActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  optionPillText: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  optionPillTextActive: {
    color: Theme.colors.primary,
  },
  imagePickerCard: {
    borderRadius: Theme.radius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  imagePreview: {
    width: '100%',
    height: 196,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 196,
    borderRadius: Theme.radius.lg,
    backgroundColor: `${Theme.colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
  },
  imagePlaceholderTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  imagePlaceholderSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Theme.spacing.lg,
  },
  imageActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  imageActionButton: {
    flex: 1,
  },
  modalActions: {
    marginTop: Theme.spacing.sm,
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  modalActionButton: {
    flex: 1,
  },
});
