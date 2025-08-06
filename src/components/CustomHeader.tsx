import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';
import { useAuthStore } from '../contexts/authStore';

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
  onBellPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  onBellPress,
}) => {
  const { user } = useAuthStore();
  const theme = useTheme();

  // Obtener el nombre del usuario o usar un valor por defecto
  const userName = user?.nombre || 'Usuario';
  const greeting = `Hola, ${userName}`;
  const subtitle = '¡Listo para entrenar!';

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

      {/* Lado derecho - Iconos de acción */}
      <View style={styles.rightSection}>
        {/* Icono de notificaciones */}
        <IconButton
          icon="bell-outline"
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
          onPress={onBellPress}
          style={styles.iconButton}
        />
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  iconButton: {
    marginLeft: 4,
  },
});

export default CustomHeader; 