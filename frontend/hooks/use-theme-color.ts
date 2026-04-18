import { ThemeColors } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors
) {
  const { theme, resolvedMode } = useAppTheme();
  const colorFromProps = props[resolvedMode];

  if (colorFromProps) {
    return colorFromProps;
  }

  return theme.colors[colorName];
}
