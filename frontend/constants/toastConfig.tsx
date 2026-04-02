import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Theme } from '@/constants/theme';

function ToastBase({ text1, text2, accent }: { text1?: string; text2?: string; accent: string }) {
  return (
    <View style={[styles.base, { borderLeftColor: accent }]}>
      {text1 ? <Text style={styles.title} numberOfLines={2}>{text1}</Text> : null}
      {text2 ? <Text style={styles.sub} numberOfLines={2}>{text2}</Text> : null}
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent={Theme.colors.success} />
  ),
  error: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent={Theme.colors.danger} />
  ),
  info: ({ text1, text2 }: ToastConfigParams<unknown>) => (
    <ToastBase text1={text1} text2={text2} accent={Theme.colors.primary} />
  ),
};

const styles = StyleSheet.create({
  base: {
    width: '90%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    borderLeftWidth: 4,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.base,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: Theme.typography.body,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  sub: {
    fontSize: Theme.typography.label,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
});
