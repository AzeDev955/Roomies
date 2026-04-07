import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import { styles } from './CustomInput.styles';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  secureToggle?: boolean;
}

export function CustomInput({ label, error, secureToggle = false, ...rest }: CustomInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureToggle);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          style={styles.input}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={Theme.colors.textMuted}
          {...rest}
        />
        {secureToggle && (
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setHidden(h => !h)}
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            accessibilityRole="button"
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Theme.colors.textTertiary}
            />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
