import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textMedium,
    marginBottom: Theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  inputWrapperError: { borderColor: Theme.colors.danger },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: Theme.spacing.base,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
  },
  toggleBtn: {
    paddingHorizontal: Theme.spacing.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.danger,
    marginTop: Theme.spacing.xs,
    fontWeight: '500',
  },
});
