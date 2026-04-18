import { useCallback, useEffect, useState } from 'react';
import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import api from '@/services/api';
import { onModulosViviendaActualizados } from '@/utils/viviendaModules';
import { useViviendaIdParam } from '@/hooks/useViviendaIdParam';
import { useAppTheme } from '@/contexts/ThemeContext';

type ViviendaModulos = {
  mod_limpieza: boolean;
  mod_gastos: boolean;
  mod_inventario: boolean;
};

export default function ViviendaTabsLayout() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const id = useViviendaIdParam();
  const [modulos, setModulos] = useState({ limpieza: true });

  const cargarModulos = useCallback(async () => {
    if (!id) return;

    try {
      const { data } = await api.get<ViviendaModulos>(`/viviendas/${id}`);
      setModulos({ limpieza: data.mod_limpieza });
    } catch {
      setModulos({ limpieza: true });
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarModulosSeguro = async () => {
        if (!id) return;

        try {
          const { data } = await api.get<ViviendaModulos>(`/viviendas/${id}`);
          if (activo) {
            setModulos({ limpieza: data.mod_limpieza });
          }
        } catch {
          if (activo) {
            setModulos({ limpieza: true });
          }
        }
      };

      cargarModulosSeguro();
      return () => {
        activo = false;
      };
    }, [id]),
  );

  useEffect(
    () =>
      onModulosViviendaActualizados((event) => {
        if (String(event.viviendaId) === String(id)) {
          setModulos({ limpieza: event.modulos.mod_limpieza });
        } else {
          cargarModulos();
        }
      }),
    [cargarModulos, id],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: '600',
          fontSize: theme.typography.body,
        },
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{ paddingLeft: 12, paddingRight: 8 }}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={26} color={theme.colors.primary} />
          </Pressable>
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.caption,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="incidencias"
        options={{
          title: 'Incidencias',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tablon"
        options={{
          title: 'Tablón',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="limpieza"
        options={{
          title: 'Limpieza',
          href: modulos.limpieza ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="opciones"
        options={{
          title: 'Opciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
