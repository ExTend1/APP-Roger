import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../contexts/authStore';
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
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;