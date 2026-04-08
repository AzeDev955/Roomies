import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: Theme.spacing.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  disabled: { opacity: 0.45 },

  // — Variantes de fondo —
  primary:   { backgroundColor: Theme.colors.primary },
  secondary: { backgroundColor: Theme.colors.surface2 },
  outline:   {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  danger:    { backgroundColor: Theme.colors.danger },
  success:   { backgroundColor: Theme.colors.success },

  // — Texto —
  textLight: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textDark: {
    color: Theme.colors.textMedium,
    fontSize: Theme.typography.body,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
