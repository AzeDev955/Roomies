import { useCallback, useEffect, useState } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/constants/theme';
import api from '@/services/api';
import { onModulosViviendaActualizados } from '@/utils/viviendaModules';

type ViviendaModulos = {
  mod_gastos: boolean;
  mod_inventario: boolean;
};

export default function CaseroTabsLayout() {
  const [modulos, setModulos] = useState({
    gastos: true,
    inventario: true,
  });

  const cargarModulos = useCallback(async () => {
    try {
      const { data } = await api.get<ViviendaModulos[]>('/viviendas');

      setModulos({
        gastos: data.some((vivienda) => vivienda.mod_gastos),
        inventario: data.some((vivienda) => vivienda.mod_inventario),
      });
    } catch {
      setModulos({ gastos: true, inventario: true });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarModulosSeguro = async () => {
        try {
          const { data } = await api.get<ViviendaModulos[]>('/viviendas');
          if (!activo || data.length === 0) return;

          setModulos({
            gastos: data.some((vivienda) => vivienda.mod_gastos),
            inventario: data.some((vivienda) => vivienda.mod_inventario),
          });
        } catch {
          if (activo) {
            setModulos({ gastos: true, inventario: true });
          }
        }
      };

      cargarModulosSeguro();
      return () => {
        activo = false;
      };
    }, []),
  );

  useEffect(() => onModulosViviendaActualizados(() => cargarModulos()), [cargarModulos]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: Theme.colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.07,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: Theme.typography.caption,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="viviendas"
        options={{
          title: 'Mis viviendas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cobros"
        options={{
          title: 'Cobros',
          href: modulos.gastos ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: 'Inventario',
          href: modulos.inventario ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color} />
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
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
