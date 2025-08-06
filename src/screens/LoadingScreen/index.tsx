import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../contexts/authStore';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {}

const LoadingScreen: React.FC<LoadingScreenProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { checkAuthStatus, isAuthenticated, isLoading } = useAuthStore();

  // Valores animados
  const logoScale = useSharedValue(0.3);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);

  // Iniciar verificación de autenticación
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('Error en verificación de auth:', error);
      }
    };

    initializeApp();
  }, [checkAuthStatus]);

  // Manejar navegación basada en el estado de autenticación
  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay para que se vea la animación
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  // Iniciar animaciones al montar el componente
  useEffect(() => {
    const startAnimations = () => {
      // Animación de entrada del logo
      logoScale.value = withSpring(1, { damping: 8, stiffness: 100 });
      logoOpacity.value = withTiming(1, { duration: 800 });
      
      // Animación de rotación suave
      logoRotation.value = withRepeat(
        withTiming(360, { duration: 4000 }),
        -1,
        false
      );

      // Animación del texto con delay
      setTimeout(() => {
        textOpacity.value = withTiming(1, { duration: 600 });
      }, 400);

      // Animación de pulso
      pulseAnimation.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    };

    startAnimations();
  }, []);

  // Estilos animados del logo
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnimation.value,
      [0, 1],
      [logoScale.value * 0.95, logoScale.value * 1.05]
    );

    return {
      transform: [
        { scale },
        { rotate: `${logoRotation.value}deg` },
      ],
      opacity: logoOpacity.value,
    };
  });

  // Estilos animados del texto
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      {
        translateY: interpolate(
          textOpacity.value,
          [0, 1],
          [20, 0]
        ),
      },
    ],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {/* Logo animado */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Surface 
            style={[
              styles.logoSurface, 
              { backgroundColor: theme.colors.primary }
            ]} 
            elevation={8}
          >
            <Text style={[styles.logoEmoji, { color: theme.colors.onPrimary }]}>
              🏋️‍♂️
            </Text>
          </Surface>
        </Animated.View>

        {/* Texto animado */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={[styles.gymName, { color: theme.colors.onBackground }]}>
            Roger Gym
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
            Tu entrenamiento, nuestra pasión
          </Text>
          
          {/* Indicador de carga */}
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, textAnimatedStyle]}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
            Cargando tu experiencia de entrenamiento...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoSurface: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  gymName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});

export default LoadingScreen;