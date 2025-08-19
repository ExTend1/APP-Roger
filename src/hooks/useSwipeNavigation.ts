import { useRouter, useSegments } from 'expo-router';
import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export const useSwipeNavigation = () => {
  const router = useRouter();
  const segments = useSegments();

  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    // Obtener la ruta actual usando segments
    const currentRoute = segments[segments.length - 1] || 'index';
    
    // Mapeo de rutas para navegación circular
    const routeOrder = ['index', 'clases', 'turnos', 'ajustes'];
    const currentIndex = routeOrder.indexOf(currentRoute as string);
    
    if (currentIndex === -1) return;
    
    let targetRoute: string;
    
    if (direction === 'left') {
      // Swipe izquierda: ir a la siguiente pestaña (circular)
      targetRoute = routeOrder[(currentIndex + 1) % routeOrder.length];
    } else {
      // Swipe derecha: ir a la pestaña anterior (circular)
      targetRoute = routeOrder[(currentIndex - 1 + routeOrder.length) % routeOrder.length];
    }
    
    // Navegar con transición suave usando rutas específicas
    switch (targetRoute) {
      case 'index':
        router.navigate('/(tabs)');
        break;
      case 'clases':
        router.navigate('/(tabs)/clases');
        break;
      case 'turnos':
        router.navigate('/(tabs)/turnos');
        break;
      case 'ajustes':
        router.navigate('/(tabs)/ajustes');
        break;
    }
  }, [router, segments]);

  const createSwipeGesture = useCallback(() => {
    return Gesture.Pan()
      .activeOffsetX([-20, 20]) // Solo activar después de 20px de movimiento
      .failOffsetY([-15, 15]) // Fallar si se mueve más de 15px verticalmente
      .onEnd((event) => {
        const { translationX, velocityX } = event;
        
        // Determinar la dirección del swipe basado en la velocidad y distancia
        if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500) {
          if (translationX > 0 || velocityX > 0) {
            runOnJS(navigateToTab)('right'); // Swipe derecha
          } else {
            runOnJS(navigateToTab)('left'); // Swipe izquierda
          }
        }
      });
  }, [navigateToTab]);

  return {
    createSwipeGesture,
    navigateToTab,
  };
};
