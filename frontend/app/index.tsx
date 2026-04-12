import { View, Text, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking'; // Deep link deshabilitado temporalmente — verificación SMTP pendiente
import { styles } from '@/styles/index.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { syncPushToken } from '@/utils/notifications';
import { getDashboardRoute } from '@/utils/authRoutes';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // const url = Linking.useURL();
  // useEffect(() => {
  //   if (!url) return;
  //   const { path, queryParams } = Linking.parse(url);
  //   if (path === 'verificacion' && queryParams?.['status'] === 'success') {
  //     Alert.alert('¡Éxito!', 'Tu correo ha sido verificado. Ya puedes iniciar sesión.');
  //   }
  // }, [url]);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  const irAlDashboard = useCallback((rol: string) => {
    router.replace(getDashboardRoute(rol));
  }, [router]);

  const handleGoogleLogin = useCallback(async (idToken: string) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string }; esNuevo: boolean }>(
        '/auth/google',
        { idToken }
      );
      await guardarToken(data.token);
      void syncPushToken();
      if (data.esNuevo) {
        router.replace('/rol');
      } else {
        irAlDashboard(data.usuario.rol);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo completar el inicio de sesión con Google.' });
    } finally {
      setLoading(false);
    }
  }, [irAlDashboard, router]);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken =
        googleResponse.authentication?.idToken ??
        (googleResponse.params as Record<string, string>)?.['id_token'];
      if (idToken) void handleGoogleLogin(idToken);
    }
  }, [googleResponse, handleGoogleLogin]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post<{ token: string; usuario: { rol: string } }>(
        '/auth/login',
        { email, password }
      );
      await guardarToken(data.token);
      void syncPushToken();
      irAlDashboard(data.usuario.rol);
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'Credenciales inválidas o sin conexión al servidor.';
      Toast.show({ type: 'error', text1: mensaje });
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

      <Pressable
        style={({ pressed }) => [styles.botonGoogle, pressed && styles.pressed]}
        onPress={() => googlePromptAsync()}
        disabled={loading}
      >
        <AntDesign name="google" size={20} color="#DB4437" />
        <Text style={styles.botonGoogleTexto}>Continuar con Google</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.enlaceRegistro, pressed && styles.pressed]}
        onPress={() => router.push('/registro')}
      >
        <Text style={styles.enlaceRegistroTexto}>¿No tienes cuenta? Regístrate</Text>
      </Pressable>
    </View>
  );
}
