import { ActivityIndicator, Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { useMemo } from 'react';
import { useAppTheme } from '@/contexts/ThemeContext';
import { createStyles } from './CustomButton.styles';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const DARK_TEXT_VARIANTS: ButtonVariant[] = ['secondary', 'outline'];

export function CustomButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: CustomButtonProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDarkText = DARK_TEXT_VARIANTS.includes(variant);
  const spinnerColor = isDarkText ? theme.colors.textMedium : theme.colors.background;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={spinnerColor} size="small" />
        : <Text style={isDarkText ? styles.textDark : styles.textLight}>{label}</Text>
      }
    </Pressable>
  );
}
