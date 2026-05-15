import { StyleSheet, Text, type TextProps } from 'react-native';

import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme, resolvedMode } = useAppTheme();
  const color = (resolvedMode === 'dark' ? darkColor : lightColor) ?? theme.colors.text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: theme.colors.info }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Theme.typography.input,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: Theme.typography.input,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: Theme.typography.hero,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Theme.typography.title,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: Theme.typography.input,
  },
});
