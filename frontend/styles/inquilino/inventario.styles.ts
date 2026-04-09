import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const ESTADO_ITEM_BG = {
  NUEVO: Theme.colors.primaryLight,
  BUENO: Theme.colors.successLight,
  DESGASTADO: `${Theme.colors.warning}18`,
  ROTO: Theme.colors.dangerLight,
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
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.xl,
  },
  header: {
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
  heroCard: {
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    gap: Theme.spacing.base,
  },
  heroLabel: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: Theme.typography.heading,
    color: Theme.colors.text,
    fontWeight: '800',
  },
  heroSubtitle: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  heroStatPrimary: {
    backgroundColor: Theme.colors.primaryLight,
  },
  heroStatSuccess: {
    backgroundColor: Theme.colors.successLight,
  },
  heroStatText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  heroStatTextPrimary: {
    color: Theme.colors.primary,
  },
  heroStatTextSuccess: {
    color: Theme.colors.success,
  },
  loaderBlock: {
    paddingVertical: Theme.spacing.xxl,
  },
  section: {
    gap: Theme.spacing.base,
  },
  sectionTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  groupSection: {
    gap: Theme.spacing.base,
  },
  groupHeader: {
    gap: Theme.spacing.xs,
  },
  groupTitle: {
    fontSize: Theme.typography.title,
    color: Theme.colors.text,
    fontWeight: '800',
  },
  groupSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
  },
  itemList: {
    gap: Theme.spacing.base,
  },
  itemCard: {
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
  },
  itemNameBlock: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  itemName: {
    fontSize: Theme.typography.title,
    color: Theme.colors.text,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  itemDescription: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  statusPill: {
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  statusPillText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
  },
  photoScroller: {
    marginHorizontal: -Theme.spacing.xs,
  },
  photoScrollerContent: {
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
  },
  photoThumb: {
    width: 108,
    height: 84,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surface2,
  },
  photoPlaceholder: {
    height: 148,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  photoPlaceholderTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  photoPlaceholderSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    alignItems: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface2,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  metaPillText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.textMedium,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.successLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  validatedBadgeText: {
    fontSize: Theme.typography.caption,
    fontWeight: '700',
    color: Theme.colors.success,
  },
  itemActions: {
    marginTop: Theme.spacing.xs,
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
    backgroundColor: Theme.colors.primaryLight,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.34)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
    maxHeight: '90%',
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
    paddingBottom: Theme.spacing.lg,
    gap: Theme.spacing.base,
  },
  modalTitle: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalImage: {
    width: '100%',
    height: 280,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface2,
  },
  modalThumbScrollerContent: {
    gap: Theme.spacing.sm,
    paddingRight: Theme.spacing.xs,
  },
  modalThumbButton: {
    borderRadius: Theme.radius.md,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalThumbButtonActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  modalThumb: {
    width: 76,
    height: 76,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surface2,
  },
  modalMetaCard: {
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.base,
    gap: Theme.spacing.sm,
  },
  modalMetaTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalMetaText: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  destructiveSoftButton: {
    minHeight: 52,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.dangerLight,
    borderWidth: 1.5,
    borderColor: `${Theme.colors.danger}30`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
  },
  destructiveSoftButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  destructiveSoftButtonText: {
    fontSize: Theme.typography.body,
    fontWeight: '700',
    color: Theme.colors.danger,
  },
});
