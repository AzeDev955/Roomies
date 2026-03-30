import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/index.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string } }>(
        '/auth/login',
        { email, password }
      );
      await guardarToken(data.token);

      if (data.usuario.rol === 'CASERO') {
        router.replace('/casero/viviendas');
      } else {
        router.replace('/inquilino/inicio');
      }
    } catch {
      Alert.alert('Error', 'Credenciales inválidas o sin conexión al servidor.');
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
