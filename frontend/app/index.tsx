import { View, Text, Pressable, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { styles } from '@/styles/index.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken =
        googleResponse.authentication?.idToken ??
        (googleResponse.params as Record<string, string>)?.['id_token'];
      if (idToken) handleGoogleLogin(idToken);
    }
  }, [googleResponse]);

  const irAlDashboard = (rol: string) => {
    const destino = rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
    router.replace(destino);
  };

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string }; esNuevo: boolean }>(
        '/auth/google',
        { idToken }
      );
      await guardarToken(data.token);
      if (data.esNuevo) {
        router.replace('/rol');
      } else {
        irAlDashboard(data.usuario.rol);
      }
    } catch {
      Alert.alert('Error', 'No se pudo completar el inicio de sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string } }>(
        '/auth/login',
        { email, password }
      );
      await guardarToken(data.token);
      irAlDashboard(data.usuario.rol);
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'Credenciales inválidas o sin conexión al servidor.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Roomies</Text>
      <Text style={styles.subtitulo}>Gestión de pisos compartidos</Text>

      <CustomInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <CustomInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        autoCapitalize="none"
        autoCorrect={false}
        secureToggle
      />

      <CustomButton
        label="Iniciar Sesión"
        onPress={handleLogin}
        loading={loading}
        style={{ marginTop: 8 }}
      />

      <View style={styles.separador}>
        <View style={styles.separadorLinea} />
        <Text style={styles.separadorTexto}>o</Text>
        <View style={styles.separadorLinea} />
      </View>

      <Pressable style={styles.botonGoogle} onPress={() => googlePromptAsync()} disabled={loading}>
        <AntDesign name="google" size={20} color="#DB4437" />
        <Text style={styles.botonGoogleTexto}>Continuar con Google</Text>
      </Pressable>

      <Pressable style={styles.enlaceRegistro} onPress={() => router.push('/registro')}>
        <Text style={styles.enlaceRegistroTexto}>¿No tienes cuenta? Regístrate</Text>
      </Pressable>
    </View>
  );
}
