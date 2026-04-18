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
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  header: {
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
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.base,
  },
  heroLabel: {
    fontSize: theme.typography.caption,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: theme.typography.heading,
    color: theme.colors.text,
    fontWeight: '800',
  },
  heroSubtitle: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  heroStatPrimary: {
    backgroundColor: theme.colors.primaryLight,
  },
  heroStatSuccess: {
    backgroundColor: theme.colors.successLight,
  },
  heroStatText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  heroStatTextPrimary: {
    color: theme.colors.primary,
  },
  heroStatTextSuccess: {
    color: theme.colors.success,
  },
  loaderBlock: {
    paddingVertical: theme.spacing.xxl,
  },
  section: {
    gap: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    color: theme.colors.text,
  },
  groupSection: {
    gap: theme.spacing.base,
  },
  groupHeader: {
    gap: theme.spacing.xs,
  },
  groupTitle: {
    fontSize: theme.typography.title,
    color: theme.colors.text,
    fontWeight: '800',
  },
  groupSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
  },
  itemList: {
    gap: theme.spacing.base,
  },
  itemCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.base,
    gap: theme.spacing.base,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  itemNameBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  itemName: {
    fontSize: theme.typography.title,
    color: theme.colors.text,
    fontWeight: '800',
  },
  itemDescription: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  statusPill: {
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  statusPillText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  photoScroller: {
    marginHorizontal: -theme.spacing.xs,
  },
  photoScrollerContent: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  photoThumb: {
    width: 108,
    height: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
  },
  photoPlaceholder: {
    height: 148,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  photoPlaceholderTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  photoPlaceholderSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  metaPillText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textMedium,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  validatedBadgeText: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.success,
  },
  itemActions: {
    marginTop: theme.spacing.xs,
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
    maxHeight: '90%',
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
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.base,
  },
  modalTitle: {
    fontSize: theme.typography.heading,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalImage: {
    width: '100%',
    height: 280,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
  },
  modalThumbScrollerContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xs,
  },
  modalThumbButton: {
    borderRadius: theme.radius.md,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalThumbButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  modalThumb: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
  },
  modalMetaCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  modalMetaTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalMetaText: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  destructiveSoftButton: {
    minHeight: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1.5,
    borderColor: `${theme.colors.danger}30`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
  },
  destructiveSoftButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  destructiveSoftButtonText: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.danger,
  },
});

export const styles = createStyles();
