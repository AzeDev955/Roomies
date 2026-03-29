import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/index.styles';
import { guardarToken } from '@/services/auth.service';

// En dispositivo físico, reemplaza localhost por la IP de tu máquina en la red local
// Ej: http://192.168.1.X:3000/api/auth/login
const LOGIN_URL = 'http://localhost:3000/api/auth/login';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        Alert.alert('Error', 'Credenciales inválidas. Comprueba tu email y contraseña.');
        return;
      }

      const data = await res.json() as { token: string; usuario: { rol: string } };
      await guardarToken(data.token);

      if (data.usuario.rol === 'CASERO') {
        router.replace('/casero/viviendas');
      } else {
        router.replace('/inquilino/inicio');
      }
    } catch {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Roomies</Text>
      <Text style={styles.subtitulo}>Gestión de pisos compartidos</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        placeholderTextColor="#c7c7cc"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor="#c7c7cc"
        secureTextEntry
      />

      <Pressable
        style={loading ? styles.botonLoginDeshabilitado : styles.botonLogin}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonLoginTexto}>Iniciar Sesión</Text>
        }
      </Pressable>
    </View>
  );
}
