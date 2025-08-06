import React, { ReactNode } from 'react';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useTheme as useAppTheme } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

// Tema oscuro personalizado para Roger Gym
const createDarkTheme = () => ({
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B35',        // Naranja vibrante para el gym
    primaryContainer: '#FF8A65', 
    secondary: '#FFD700',      // Amarillo dorado (más intenso para dark)
    secondaryContainer: '#FFE135',
    tertiary: '#4CAF50',       // Verde para éxito
    tertiaryContainer: '#81C784',
    error: '#F44336',          // Rojo para errores
    errorContainer: '#FFCDD2',
    surface: '#1E1E1E',        // Superficie oscura
    surfaceVariant: '#2E2E2E', 
    background: '#121212',     // Fondo muy oscuro
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    outline: '#444444',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onErrorContainer: '#000000',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#000000',
    inversePrimary: '#FF6B35',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#FF6B35',
  },
});

// Tema claro personalizado con amarillo adaptado
const createLightTheme = () => ({
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35',        // Naranja vibrante (se mantiene)
    primaryContainer: '#FFAB91',
    secondary: '#FFA000',      // Amarillo más suave para light
    secondaryContainer: '#FFD54F',
    tertiary: '#4CAF50',       // Verde para éxito
    tertiaryContainer: '#C8E6C9',
    error: '#F44336',          // Rojo para errores
    errorContainer: '#FFCDD2',
    surface: '#FFFFFF',        // Superficie clara
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',     // Fondo claro
    onBackground: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#666666',
    outline: '#CCCCCC',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onErrorContainer: '#000000',
    inverseSurface: '#121212',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#FF6B35',
    shadow: '#000000',
    scrim: '#000000',
    surfaceTint: '#FF6B35',
  },
});

export const PaperThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themeMode } = useAppTheme();
  
  // Usar tema claro u oscuro según el estado
  const theme = themeMode === 'light' ? createLightTheme() : createDarkTheme();

  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
};