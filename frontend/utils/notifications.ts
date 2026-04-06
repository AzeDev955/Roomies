import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[push] Las notificaciones push solo funcionan en dispositivos físicos.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[push] Permiso de notificaciones denegado.');
    return null;
  }

  if (Constants.appOwnership === 'expo') {
    console.warn('[push] Expo Go no soporta push tokens nativos. Saltando registro.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? 'e4004191-4922-49cd-9f17-6cacd52578d1';

  let token: Awaited<ReturnType<typeof Notifications.getExpoPushTokenAsync>>;
  try {
    token = await Notifications.getExpoPushTokenAsync({ projectId });
  } catch {
    console.warn('[push] No se pudo obtener el token push en este entorno.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token.data;
}

export async function syncPushToken(): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await api.put('/users/push-token', { token });
    }
  } catch (err) {
    console.warn('[push] No se pudo sincronizar el push token:', err);
  }
}
