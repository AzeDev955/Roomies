import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: Theme.typography.label,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrapperFocused: { borderColor: Theme.colors.primary },
  inputWrapperError:   { borderColor: Theme.colors.danger },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.base,
    paddingVertical: 14,
    fontSize: Theme.typography.input,
    color: Theme.colors.text,
  },
  toggleBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
  },
  toggleText: {
    fontSize: 18,
    color: Theme.colors.textTertiary,
  },
  error: {
    fontSize: Theme.typography.caption,
    color: Theme.colors.danger,
    marginTop: Theme.spacing.xs,
  },
});
