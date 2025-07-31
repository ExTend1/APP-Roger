import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import ThemeProvider from './contexts/ThemeProvider';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './screens/SplashScreen';
import { useAuthStore } from './contexts/authStore';

// Prevenir que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  const { isLoading } = useAuthStore();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    // Ocultar el splash screen nativo cuando la app esté lista
    const hideSplashScreen = async () => {
      if (!isLoading) {
        // Pequeño delay para suavizar la transición
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 500);
      }
    };

    hideSplashScreen();
  }, [isLoading]);

  // Función para finalizar el splash personalizado
  const handleSplashFinish = () => {
    setShowCustomSplash(false);
  };

  // Mostrar splash personalizado si está activo
  if (showCustomSplash) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <CustomSplashScreen onFinish={handleSplashFinish} />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;