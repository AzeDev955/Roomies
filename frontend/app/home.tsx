import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from './home.styles';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Roomies - Home</Text>
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver</Text>
      </Pressable>
    </View>
  );
}
