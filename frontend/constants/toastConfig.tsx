import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { AppTheme, DefaultAppTheme, ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

function ToastBase({ text1, text2, accent }: { text1?: string; text2?: string; accent: keyof ThemeColors }) {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.base, { borderLeftColor: theme.colors[accent] }]}>
      {text1 ? <Text style={styles.title} numberOfLines={2}>{text1}</Text> : null}
      {text2 ? <Text style={styles.sub} numberOfLines={2}>{text2}</Text> : null}
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent="success" />
  ),
  error: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent="danger" />
  ),
  info: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent="primary" />
  ),
};

const createStyles = (theme: AppTheme = DefaultAppTheme) => StyleSheet.create({
  base: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderLeftWidth: 4,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDark ? 0.25 : 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sub: {
    fontSize: theme.typography.label,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
