import { StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Theme.spacing.base },
  title: { fontSize: Theme.typography.heading, fontWeight: 'bold', textAlign: 'center' },
  button: {
    backgroundColor: Theme.colors.textSecondary,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: { color: Theme.colors.surface, fontSize: Theme.typography.input, fontWeight: '600' },
  buttonPrimary: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Theme.colors.success,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
    minWidth: 160,
    alignItems: 'center',
  },
});
