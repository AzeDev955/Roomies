import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { styles } from '@/styles/registro.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

type Rol = 'CASERO' | 'INQUILINO';

export default function RegistroScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol | ''>('');
  const [verPass, setVerPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Error', 'No se pudo completar el registro con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    if (
      !nombre.trim() || !apellidos.trim() || !dni.trim() ||
      !email.trim() || !telefono.trim() || !password
    ) {
      Alert.alert('Campos incompletos', 'Rellena todos los campos antes de continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Email inválido', 'Introduce un email con formato válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña demasiado corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!rol) {
      Alert.alert('Selecciona un rol', 'Elige si eres Casero o Inquilino.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { nombre, apellidos, dni, email, telefono, password, rol });
      Alert.alert('¡Cuenta creada!', 'Ya puedes iniciar sesión con tus credenciales.', [
        { text: 'Ir al login', onPress: () => router.replace('/') },
      ]);
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo crear la cuenta. Inténtalo de nuevo.';
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Roomies</Text>
      <Text style={styles.subtitulo}>Crea tu cuenta para empezar</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        placeholderTextColor="#c7c7cc"
        autoCorrect={false}
      />

      <Text style={styles.label}>Apellidos</Text>
      <TextInput
        style={styles.input}
        value={apellidos}
        onChangeText={setApellidos}
        placeholder="Tus apellidos"
        placeholderTextColor="#c7c7cc"
        autoCorrect={false}
      />

      <Text style={styles.label}>DNI</Text>
      <TextInput
        style={styles.input}
        value={dni}
        onChangeText={(t) => setDni(t.toUpperCase())}
        placeholder="12345678A"
        placeholderTextColor="#c7c7cc"
        autoCapitalize="characters"
        autoCorrect={false}
      />

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

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="600 000 000"
        placeholderTextColor="#c7c7cc"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputPasswordFila}>
        <TextInput
          style={styles.inputPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor="#c7c7cc"
          secureTextEntry={!verPass}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.botonVerPass} onPress={() => setVerPass((v) => !v)}>
          <Text style={styles.botonVerPassTexto}>{verPass ? 'Ocultar' : 'Ver'}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Rol</Text>
      <View style={styles.rolFila}>
        <Pressable
          style={[styles.rolPill, rol === 'CASERO' && styles.rolPillActivo]}
          onPress={() => setRol('CASERO')}
        >
          <Text style={[styles.rolPillTexto, rol === 'CASERO' && styles.rolPillTextoActivo]}>
            Casero
          </Text>
        </Pressable>
        <Pressable
          style={[styles.rolPill, rol === 'INQUILINO' && styles.rolPillActivo]}
          onPress={() => setRol('INQUILINO')}
        >
          <Text style={[styles.rolPillTexto, rol === 'INQUILINO' && styles.rolPillTextoActivo]}>
            Inquilino
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={loading ? styles.botonRegistrarDisabled : styles.botonRegistrar}
        onPress={handleRegistrar}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonRegistrarTexto}>Crear cuenta</Text>
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

      <Pressable style={styles.enlaceLogin} onPress={() => router.back()}>
        <Text style={styles.enlaceLoginTexto}>¿Ya tienes cuenta? Inicia sesión</Text>
      </Pressable>
    </ScrollView>
  );
}
