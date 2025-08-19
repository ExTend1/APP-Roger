import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/src/components/HapticTab';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 84 : 64,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          // Configuración para ocultar tab bar cuando aparece el teclado
          tabBarHideOnKeyboard: true,
          // Configuración para transiciones más fluidas
          animation: 'fade',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="clases"
          options={{
            title: 'Clases',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="dumbbell" color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="turnos"
          options={{
            title: 'Mis Turnos',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-check" color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="ajustes"
          options={{
            title: 'Ajustes',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" color={color} size={size || 24} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
