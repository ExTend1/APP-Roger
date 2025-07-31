import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../contexts/authStore';
import { ReservasProvider } from '../contexts/ReservasContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Mientras está cargando, mostrar el splash/loading screen
  if (isLoading) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {/* Temporalmente mostrar AppNavigator para probar reservas */}
      <ReservasProvider>
        <AppNavigator />
      </ReservasProvider>
    </NavigationContainer>
  );
};

export default RootNavigator;