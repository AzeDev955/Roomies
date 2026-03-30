import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { styles } from '@/styles/index.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verPass, setVerPass] = useState(false);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
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

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string } }>(
        '/auth/google',
        { idToken }
      );
      await guardarToken(data.token);
      router.replace(data.usuario.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio');
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

      if (data.usuario.rol === 'CASERO') {
        router.replace('/casero/viviendas');
      } else {
        router.replace('/inquilino/inicio');
      }
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
      <View style={styles.inputPasswordFila}>
        <TextInput
          style={styles.inputPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#c7c7cc"
          secureTextEntry={!verPass}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.botonVerPass} onPress={() => setVerPass((v) => !v)}>
          <Text style={styles.botonVerPassTexto}>{verPass ? 'Ocultar' : 'Ver'}</Text>
        </Pressable>
      </View>

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
