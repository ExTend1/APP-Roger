import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from './contexts/authStore';
import ThemeProvider from './contexts/ThemeProvider';
import RootNavigator from './navigation/RootNavigator';
import CustomSplashScreen from './screens/SplashScreen';

// Prevenir que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

// Componente para el fondo, fix de el error de la barra de estado que rompia una banda los huevos
const StatusBarBackground = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        height: Platform.OS === 'android' ? StatusBar.currentHeight || insets.top : 0,
        backgroundColor: '#6200ee', // pone el color de la barra de estado que quieras pancho
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    />
  );
};

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
            <StatusBarBackground />
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