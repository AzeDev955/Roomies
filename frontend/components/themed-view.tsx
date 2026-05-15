import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { theme, resolvedMode } = useAppTheme();
  const backgroundColor = (resolvedMode === 'dark' ? darkColor : lightColor) ?? theme.colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
