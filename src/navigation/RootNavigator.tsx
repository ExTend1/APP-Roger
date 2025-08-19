import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { useAuthStore } from '../contexts/authStore';
import AuthNavigator from './AuthNavigator';
import TestNavigator from './TestNavigator';

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
      {/* Temporalmente mostrar TestNavigator para diagnosticar la API */}
      <TestNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;