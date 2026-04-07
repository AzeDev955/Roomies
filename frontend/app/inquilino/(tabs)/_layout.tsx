import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";

export default function InquilinoTabsLayout() {
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="limpieza"
        options={{
          title: "Limpieza",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
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
