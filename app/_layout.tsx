import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useAuthStore } from '@/src/contexts/authStore';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { PaperThemeProvider } from '@/src/contexts/ThemeProvider';
import { ReservasProvider } from '@/src/contexts/ReservasContext';
import { NotificationConfigProvider } from '@/src/contexts/NotificationConfigContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import { GestureBarAwareView } from '@/src/components/GestureBarAwareView';

// Prevenir que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Inicializar sistema de notificaciones
  useNotifications();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Protección de rutas
  useEffect(() => {
    if (!isLoading && loaded) {
      const inAuthGroup = segments[0] === '(tabs)';
      const isProfileEdit = segments[0] === 'profile-edit';
      
      if (!isAuthenticated && (inAuthGroup || isProfileEdit)) {
        // Usuario no autenticado intentando acceder a rutas protegidas
        console.log('🚫 Acceso denegado, redirigiendo a login');
        router.replace('/login');
      } else if (isAuthenticated && segments[0] === 'login') {
        // Usuario autenticado en login, redirigir a home
        console.log('✅ Usuario autenticado, redirigiendo a home');
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, loaded]);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  // Log para debugging
  useEffect(() => {
    console.log('🔍 RootLayout - Estado:', { isAuthenticated, isLoading, loaded });
  }, [isAuthenticated, isLoading, loaded]);

  // Log para verificar que ReservasProvider se monta


  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperThemeProvider>
            <NotificationConfigProvider>
              <ReservasProvider>
                <GestureBarAwareView>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="loading" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
                    <Stack.Screen name="politica-privacidad" options={{ headerShown: false }} />
                    <Stack.Screen name="terminos-condiciones" options={{ headerShown: false }} />
                    <Stack.Screen name="acercade" options={{ headerShown: false }} />
                    <Stack.Screen name="centro-ayuda" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </GestureBarAwareView>
              </ReservasProvider>
            </NotificationConfigProvider>
          </PaperThemeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
