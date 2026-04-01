import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: Theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },

  // — Variantes de fondo —
  primary:  { backgroundColor: Theme.colors.primary },
  secondary: { backgroundColor: Theme.colors.surface2 },
  outline:  { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Theme.colors.border },
  danger:   { backgroundColor: Theme.colors.danger },
  success:  { backgroundColor: Theme.colors.success },

  // — Texto —
  textLight: { color: Theme.colors.surface,     fontSize: Theme.typography.body, fontWeight: '700' },
  textDark:  { color: Theme.colors.textMedium,  fontSize: Theme.typography.body, fontWeight: '700' },
});
