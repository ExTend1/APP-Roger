import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Logo SVG como string
const logoSvg = `
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="150.000000pt" height="150.000000pt" viewBox="0 0 150.000000 150.000000"
 preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,150.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M411 970 l63 -70 194 0 194 0 29 -29 c32 -32 38 -73 19 -128 -16 -44
-49 -57 -146 -58 -46 0 -84 -2 -84 -5 0 -3 61 -71 135 -152 l136 -148 49 0 50
0 0 48 c0 44 -4 51 -54 101 l-54 53 35 31 c52 46 76 101 77 177 1 79 -22 145
-67 188 -58 57 -91 62 -379 62 l-259 0 62 -70z"/>
</g>
</svg>
`;

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Valores animados
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  // Iniciar animaciones
  useEffect(() => {
    const startAnimations = () => {
      // Animación del logo con rebote
      logoScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      logoOpacity.value = withSpring(1, { damping: 8 });

      // Animación del texto con delay
      textOpacity.value = withDelay(500, withSpring(1, { damping: 8 }));
      textTranslateY.value = withDelay(500, withSpring(0, { damping: 8 }));

      // Finalizar splash después de 2.5 segundos
      setTimeout(() => {
        onFinish();
      }, 2500);
    };

    startAnimations();
  }, []);

  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      {/* Logo animado */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoCircle}>
          <SvgXml xml={logoSvg} width={80} height={80} />
        </View>
      </Animated.View>

      {/* Texto animado */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.appName}>Roger Gym</Text>
        <Text style={styles.subtitle}>Tu entrenamiento, nuestra pasión</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default SplashScreen; 