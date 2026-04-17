import { View, Text, Pressable } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { createStyles } from '../styles/home.styles';
import { useAppTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Roomies - Home</Text>
      <Pressable style={styles.buttonPrimary} onPress={() => router.push('/casero/viviendas')}>
        <Text style={styles.buttonText}>Mis Viviendas</Text>
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={() => router.push('/inquilino/inicio')}>
        <Text style={styles.buttonText}>Soy Inquilino</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver</Text>
      </Pressable>
    </View>
  );
}
