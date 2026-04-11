import { useCallback, useState } from "react";
import { Tabs, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import api from "@/services/api";

type ViviendaModulos = {
  mod_limpieza: boolean;
  mod_gastos: boolean;
  mod_inventario: boolean;
};

export default function InquilinoTabsLayout() {
  const [modulos, setModulos] = useState({
    limpieza: false,
    gastos: false,
    inventario: false,
  });
  const [tieneVivienda, setTieneVivienda] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarModulos = async () => {
        try {
          const { data } = await api.get<{ vivienda: ViviendaModulos }>("/inquilino/vivienda");
          if (!activo) return;

          setTieneVivienda(true);
          setModulos({
            limpieza: data.vivienda.mod_limpieza,
            gastos: data.vivienda.mod_gastos,
            inventario: data.vivienda.mod_inventario,
          });
        } catch {
          if (activo) {
            setTieneVivienda(false);
            setModulos({ limpieza: false, gastos: false, inventario: false });
          }
        }
      };

      cargarModulos();
      return () => {
        activo = false;
      };
    }, []),
  );

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
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Mi vivienda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tablon"
        options={{
          title: "Tablón",
          href: tieneVivienda ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="limpieza"
        options={{
          title: "Limpieza",
          href: modulos.limpieza ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: "Gastos",
          href: modulos.gastos ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventario"
        options={{
          title: "Inventario",
          href: modulos.inventario ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
