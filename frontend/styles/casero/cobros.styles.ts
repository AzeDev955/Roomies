import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const ESTADO_BADGE_BG = {
  PENDIENTE: `${Theme.colors.warning}16`,
  PAGADA: `${Theme.colors.success}18`,
} as const;

export const ESTADO_BADGE_TEXT = {
  PENDIENTE: Theme.colors.warning,
  PAGADA: Theme.colors.success,
} as const;

export const ESTADO_BADGE_BORDER = {
  PENDIENTE: `${Theme.colors.warning}32`,
  PAGADA: `${Theme.colors.success}30`,
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
  headerEyebrow: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: Theme.typography.hero,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.8,
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
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
  },
  viviendaChipActive: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  viviendaChipText: {
    fontSize: Theme.typography.label,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  viviendaChipTextActive: {
    color: Theme.colors.primary,
  },
  heroCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  heroTop: {
    gap: Theme.spacing.xs,
  },
  heroLabel: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.4,
  },
  heroAddress: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  heroAmounts: {
    flexDirection: 'row',
    gap: Theme.spacing.base,
  },
  heroAmountCard: {
    flex: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    gap: Theme.spacing.xs,
  },
  heroAmountCardPaid: {
    backgroundColor: `${Theme.colors.success}12`,
  },
  heroAmountCardPending: {
    backgroundColor: `${Theme.colors.warning}14`,
  },
  heroAmountLabel: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroAmountLabelPaid: {
    color: Theme.colors.success,
  },
  heroAmountLabelPending: {
    color: Theme.colors.warning,
  },
  heroAmountValue: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  heroAmountHelp: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.base,
    gap: Theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
  },
  debtList: {
    gap: Theme.spacing.base,
  },
  invoiceList: {
    gap: Theme.spacing.base,
  },
  invoiceCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
    ...Theme.shadows.sm,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
  },
  invoiceIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  invoiceBody: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  invoiceConcept: {
    fontSize: Theme.typography.body,
    fontWeight: '800',
    color: Theme.colors.text,
    lineHeight: 21,
  },
  invoiceMeta: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  invoiceEditButton: {
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    flexShrink: 0,
  },
  invoiceEditText: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  invoiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.base,
    paddingTop: Theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  invoiceAmount: {
    fontSize: Theme.typography.heading,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  invoiceStatus: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    textAlign: 'right',
    flexShrink: 1,
  },
  debtCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.base,
    ...Theme.shadows.sm,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Theme.radius.full,
    backgroundColor: `${Theme.colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  debtBody: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  debtName: {
    fontSize: Theme.typography.body,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  debtConcept: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },
  debtDate: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textTertiary,
  },
  debtMeta: {
    alignItems: 'flex-end',
    gap: Theme.spacing.sm,
  },
  debtAmount: {
    fontSize: Theme.typography.subtitle,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
  },
  receiptLink: {
    marginTop: Theme.spacing.base,
    alignSelf: 'flex-start',
    backgroundColor: `${Theme.colors.info}12`,
    borderRadius: Theme.radius.full,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  receiptLinkText: {
    fontSize: Theme.typography.caption,
    fontWeight: '800',
    color: Theme.colors.info,
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
    width: '100%',
    marginTop: Theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: Theme.radius.full,
    backgroundColor: Theme.colors.textMuted,
    alignSelf: 'center',
    marginBottom: Theme.spacing.base,
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
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
  },
  modalImageWrap: {
    width: '100%',
    height: 320,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface2,
    marginBottom: Theme.spacing.lg,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.surface2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  modalAction: {
    flex: 1,
  },
  editForm: {
    gap: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
  },
  invoicePhotoBlock: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.base,
    gap: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
  },
  invoicePhotoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  invoicePhotoIcon: {
    width: 40,
    height: 40,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  invoicePhotoCopy: {
    flex: 1,
    gap: Theme.spacing.xs,
  },
  invoicePhotoTitle: {
    fontSize: Theme.typography.label,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  invoicePhotoSubtitle: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  invoicePhotoPreview: {
    height: 150,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface2,
  },
  invoicePhotoImage: {
    width: '100%',
    height: '100%',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Theme.spacing.sm,
    backgroundColor: Theme.colors.warningLight,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: `${Theme.colors.warning}30`,
    padding: Theme.spacing.base,
    marginBottom: Theme.spacing.lg,
  },
  warningBannerText: {
    flex: 1,
    fontSize: Theme.typography.label,
    color: Theme.colors.textMedium,
    lineHeight: 20,
    fontWeight: '600',
  },
});
