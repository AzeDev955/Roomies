import { View, Text, Pressable, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { styles } from '@/styles/registro.styles';
import { guardarToken } from '@/services/auth.service';
import api from '@/services/api';
import { CustomButton } from '@/components/common/CustomButton';
import { CustomInput } from '@/components/common/CustomInput';
import { dniNieSchema, pasaporteSchema, passwordSchema } from '@/utils/schemas';

WebBrowser.maybeCompleteAuthSession();

type Rol = 'CASERO' | 'INQUILINO';
type TipoDocumento = 'DNI/NIE' | 'PASAPORTE';

export default function RegistroScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [documento_identidad, setDocumentoIdentidad] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('DNI/NIE');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol | ''>('');
  const [loading, setLoading] = useState(false);
  const [errorDoc, setErrorDoc] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

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
        const destino = data.usuario.rol === 'CASERO' ? '/casero/viviendas' : '/inquilino/inicio';
        router.replace(destino);
      }
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo completar el registro con Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    if (
      !nombre.trim() || !apellidos.trim() || !documento_identidad.trim() ||
      !email.trim() || !telefono.trim() || !password
    ) {
      Toast.show({ type: 'error', text1: 'Campos incompletos', text2: 'Rellena todos los campos antes de continuar.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: 'error', text1: 'Email inválido', text2: 'Introduce un email con formato válido.' });
      return;
    }
    if (!rol) {
      Toast.show({ type: 'error', text1: 'Selecciona un rol', text2: 'Elige si eres Casero o Inquilino.' });
      return;
    }

    let hayError = false;

    const docSchema = tipoDocumento === 'DNI/NIE' ? dniNieSchema : pasaporteSchema;
    const docResult = docSchema.safeParse(documento_identidad);
    if (!docResult.success) {
      setErrorDoc(docResult.error.issues[0].message);
      hayError = true;
    }

    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) {
      setErrorPassword(passResult.error.issues[0].message);
      hayError = true;
    }

    if (hayError) return;

    setLoading(true);
    try {
      await api.post('/auth/register', { nombre, apellidos, documento_identidad, email, telefono, password, rol });
      Toast.show({ type: 'success', text1: '¡Cuenta creada!', text2: 'Ya puedes iniciar sesión con tus credenciales.' });
      router.replace('/');
    } catch (err: any) {
      const mensaje = err.response?.data?.error ?? 'No se pudo crear la cuenta. Inténtalo de nuevo.';
      Toast.show({ type: 'error', text1: mensaje });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Roomies</Text>
      <Text style={styles.subtitulo}>Crea tu cuenta para empezar</Text>

      <CustomInput
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Tu nombre"
        autoCorrect={false}
      />

      <CustomInput
        label="Apellidos"
        value={apellidos}
        onChangeText={setApellidos}
        placeholder="Tus apellidos"
        autoCorrect={false}
      />

      <Text style={styles.labelDoc}>Tipo de documento</Text>
      <View style={styles.docFila}>
        <Pressable
          style={({ pressed }) => [styles.docChip, tipoDocumento === 'DNI/NIE' && styles.docChipActivo, pressed && styles.pressed]}
          onPress={() => { setTipoDocumento('DNI/NIE'); setDocumentoIdentidad(''); setErrorDoc(''); }}
        >
          <Text style={[styles.docChipTexto, tipoDocumento === 'DNI/NIE' && styles.docChipTextoActivo]}>
            DNI / NIE
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.docChip, tipoDocumento === 'PASAPORTE' && styles.docChipActivo, pressed && styles.pressed]}
          onPress={() => { setTipoDocumento('PASAPORTE'); setDocumentoIdentidad(''); setErrorDoc(''); }}
        >
          <Text style={[styles.docChipTexto, tipoDocumento === 'PASAPORTE' && styles.docChipTextoActivo]}>
            Pasaporte
          </Text>
        </Pressable>
      </View>

      <CustomInput
        label="Documento de identidad"
        value={documento_identidad}
        onChangeText={(t) => { setDocumentoIdentidad(t.toUpperCase()); setErrorDoc(''); }}
        placeholder={tipoDocumento === 'DNI/NIE' ? '12345678A / X1234567A' : 'AB123456'}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      {!!errorDoc && <Text style={styles.errorTexto}>{errorDoc}</Text>}

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
        label="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        placeholder="600 000 000"
        keyboardType="phone-pad"
      />

      <CustomInput
        label="Contraseña"
        value={password}
        onChangeText={(t) => { setPassword(t); setErrorPassword(''); }}
        placeholder="Mínimo 8 caracteres, una mayúscula y un número"
        autoCapitalize="none"
        autoCorrect={false}
        secureToggle
      />
      {!!errorPassword && <Text style={styles.errorTexto}>{errorPassword}</Text>}

      <Text style={styles.labelRol}>Rol</Text>
      <View style={styles.rolFila}>
        <Pressable
          style={({ pressed }) => [styles.rolPill, rol === 'CASERO' && styles.rolPillActivo, pressed && styles.pressed]}
          onPress={() => setRol('CASERO')}
        >
          <Text style={[styles.rolPillTexto, rol === 'CASERO' && styles.rolPillTextoActivo]}>
            Casero
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.rolPill, rol === 'INQUILINO' && styles.rolPillActivo, pressed && styles.pressed]}
          onPress={() => setRol('INQUILINO')}
        >
          <Text style={[styles.rolPillTexto, rol === 'INQUILINO' && styles.rolPillTextoActivo]}>
            Inquilino
          </Text>
        </Pressable>
      </View>

      <CustomButton
        label="Crear cuenta"
        onPress={handleRegistrar}
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
        style={({ pressed }) => [styles.enlaceLogin, pressed && styles.pressed]}
        onPress={() => router.back()}
      >
        <Text style={styles.enlaceLoginTexto}>¿Ya tienes cuenta? Inicia sesión</Text>
      </Pressable>
    </ScrollView>
  );
}
