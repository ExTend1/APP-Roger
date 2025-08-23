import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export function useAndroidSafeArea() {
  const insets = useSafeAreaInsets();
  
  // En Android, necesitamos considerar la gesture bar y la barra de navegación del sistema
  const getBottomPadding = () => {
    if (Platform.OS === 'android') {
      // Para dispositivos con gesture bar, usar un padding mínimo más alto
      return Math.max(insets.bottom, 16);
    }
    // En iOS, usar el padding estándar
    return Math.max(insets.bottom, 20);
  };

  const getTabBarHeight = () => {
    const baseHeight = Platform.OS === 'ios' ? 84 : 64;
    return baseHeight + getBottomPadding();
  };

  const getTabBarStyle = () => ({
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Asegurar que esté por encima de la gesture bar
    zIndex: 1000,
  });

  return {
    insets,
    getBottomPadding,
    getTabBarHeight,
    getTabBarStyle,
  };
}
