import { StyleSheet, Text, type TextProps } from 'react-native';

import { Theme } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
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
    color: Theme.colors.info,
  },
});
