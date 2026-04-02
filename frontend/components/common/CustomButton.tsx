import { ActivityIndicator, Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { Theme } from '@/constants/theme';
import { styles } from './CustomButton.styles';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DARK_TEXT_VARIANTS: ButtonVariant[] = ['secondary', 'outline'];

export function CustomButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: CustomButtonProps) {
  const isDarkText = DARK_TEXT_VARIANTS.includes(variant);
  const spinnerColor = isDarkText ? Theme.colors.textMedium : Theme.colors.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
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
