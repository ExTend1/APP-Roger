import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../contexts/authStore';
import { useReservas } from '../contexts/ReservasContext';

// Logo SVG como string (el mismo que usamos en login)
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

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = false,
}) => {
  const { user } = useAuthStore();
  const { state } = useReservas();
  const theme = useTheme();
  const router = useRouter();

  // Obtener el nombre del usuario o usar un valor por defecto
  const userName = user?.nombre || 'Usuario';
  const greeting = `Hola, ${userName}`;
  const subtitle = '¡Listo para entrenar!';

  // Si se muestra un título personalizado, no mostrar el saludo
  if (title) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        {/* Botón de retroceso */}
        {showBackButton && (
          <IconButton
            icon="arrow-left"
            size={28}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Volver"
            accessibilityHint="Toca para volver a la pantalla anterior"
          />
        )}
        
        {/* Título centrado */}
        <Text style={[styles.titleText, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        
        {/* Espaciador para mantener el título centrado */}
        {showBackButton && <View style={styles.spacer} />}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Lado izquierdo - Logo y texto */}
      <View style={styles.leftSection}>
        {/* Logo circular amarillo */}
        <View style={[
          styles.logoCircle, 
          { 
            backgroundColor: theme.colors.secondary,
            shadowColor: theme.colors.secondary,
          }
        ]}>
          <SvgXml xml={logoSvg} width={24} height={24} />
        </View>
        
        {/* Texto de saludo */}
        <View style={styles.textContainer}>
          <Text style={[styles.greetingText, { color: theme.colors.onSurface }]}>{greeting}</Text>
          <Text style={[styles.subtitleText, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
        </View>
      </View>

      {/* Lado derecho - Indicador de tokens */}
      <View style={styles.rightSection}>
        <View style={[styles.tokenIndicator, { backgroundColor: theme.colors.primary }]}>
          {/* Ícono de cubo naranja */}
          <View style={styles.tokenIcon}>
            <View style={styles.cubeIcon}>
              {/* Cara principal del cubo */}
              <View style={styles.cubeFace} />
              {/* Líneas de conexión */}
              <View style={styles.cubeLine1} />
              <View style={styles.cubeLine2} />
              <View style={styles.cubeLine3} />
              {/* Punto central */}
              <View style={styles.cubeCenter} />
            </View>
          </View>
          <Text style={[styles.tokenText, { color: theme.colors.onPrimary }]}>
            {state.userTokens}
          </Text>
        </View>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 48,
  },
  tokenIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 60,
    justifyContent: 'space-between',
  },
  tokenText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cubeIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  cubeFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  cubeLine1: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  cubeLine2: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  cubeLine3: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  cubeCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});

export default CustomHeader; 