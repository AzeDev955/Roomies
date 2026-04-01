import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
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
          placeholderTextColor="#c7c7cc"
          {...rest}
        />
        {secureToggle && (
          <Pressable style={styles.toggleBtn} onPress={() => setHidden(h => !h)}>
            <Text style={styles.toggleText}>{hidden ? '👁' : '🙈'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
