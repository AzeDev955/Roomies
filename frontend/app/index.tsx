import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './index.styles';

export default function LoginScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Login</Text>
      <Pressable style={styles.button} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>Ir a Home</Text>
      </Pressable>
    </View>
  );
}
