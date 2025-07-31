import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  ActivityIndicator,
  Snackbar,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useAuthStore } from '../../contexts/authStore';
import { authService, type LoginRequest } from '../../services/authService';

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

interface LoginScreenProps {}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Valores animados
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  // Iniciar animaciones al montar el componente
  useEffect(() => {
    const startAnimations = () => {
      // Animación del logo
      logoScale.value = withSpring(1, { damping: 8 });
      logoOpacity.value = withSpring(1, { damping: 8 });

      // Animación del formulario con delay
      formTranslateY.value = withDelay(300, withSpring(0, { damping: 8 }));
      formOpacity.value = withDelay(300, withSpring(1, { damping: 8 }));
    };

    startAnimations();
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('🔍 LoginScreen - Estado auth:', { isAuthenticated, isLoading });
    if (isAuthenticated && !isLoading) {
      console.log('🔄 LoginScreen - Redirigiendo a tabs...');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar errores en snackbar
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  // Validar formulario
  const validateForm = (): boolean => {
    const credentials = { email, password };
    const validation = authService.validateCredentials(credentials);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return false;
    }

    setFormErrors([]);
    return true;
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      const success = await login(email, password);

      if (success) {
        // El store manejará la redirección automáticamente
        console.log('✅ Login exitoso, redirigiendo...');
      }
    } catch (error) {
      console.error('❌ Error inesperado en login:', error);
    }
  };

  // Manejar entrada de texto del email
  const handleEmailChange = (text: string) => {
    setEmail(text.toLowerCase().trim());
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Manejar entrada de texto de la contraseña
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  // Determinar si el botón debe estar habilitado
  const isButtonDisabled = isLoading || !email.trim() || !password.trim();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
             <View style={styles.contentContainer}>
         {/* Logo animado */}
         <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
           {/* Logo circular amarillo con SVG */}
           <View style={styles.logoCircle}>
             <SvgXml xml={logoSvg} width={50} height={50} />
           </View>
           <Text style={styles.gymName}>
             Bienvenido
           </Text>
           <Text style={styles.subtitle}>
             Ingresa a tu cuenta del gimnasio
           </Text>
         </Animated.View>

         {/* Formulario animado */}
         <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
           <Surface style={styles.formSurface} elevation={2}>
             {/* Campo de email */}
             <View style={styles.inputContainer}>
               <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                 value={email}
                 onChangeText={handleEmailChange}
                 mode="outlined"
                 placeholder="tu@email.com"
                 keyboardType="email-address"
                 autoCapitalize="none"
                 autoComplete="email"
                 autoCorrect={false}
                 style={styles.input}
                 error={formErrors.some(err => err.includes('Email'))}
                 disabled={isLoading}
                 outlineColor="#FFFFFF"
                 activeOutlineColor="#FFD700"
                 textColor="#FFFFFF"
                 placeholderTextColor="#CCCCCC"
               />
             </View>

             {/* Campo de contraseña */}
             <View style={styles.inputContainer}>
               <Text style={styles.inputLabel}>Contraseña</Text>
                                <TextInput
                 value={password}
                 onChangeText={handlePasswordChange}
                 mode="outlined"
                 placeholder="••••••••"
                 secureTextEntry={!showPassword}
                 autoCapitalize="none"
                 autoComplete="password"
                 autoCorrect={false}
                 right={
                   <TextInput.Icon
                     icon={showPassword ? "eye-off" : "eye"}
                     onPress={() => setShowPassword(!showPassword)}
                   />
                 }
                 style={styles.input}
                 error={formErrors.some(err => err.includes('contraseña'))}
                 disabled={isLoading}
                 outlineColor="#FFFFFF"
                 activeOutlineColor="#FFD700"
                 textColor="#FFFFFF"
                 placeholderTextColor="#CCCCCC"
               />
             </View>

             {/* Mostrar errores de validación */}
             {formErrors.length > 0 && (
               <View style={styles.errorContainer}>
                 {formErrors.map((error, index) => (
                   <Text key={index} style={styles.errorText}>
                     • {error}
                   </Text>
                 ))}
               </View>
             )}

             {/* Botón de login */}
             <Button
               mode="contained"
               onPress={handleLogin}
               disabled={isButtonDisabled}
               loading={isLoading}
               style={styles.loginButton}
               contentStyle={styles.loginButtonContent}
               labelStyle={styles.loginButtonLabel}
               buttonColor="#FFD700"
               textColor="#000000"
             >
               {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
             </Button>

             {/* Información de cuenta */}
                            <View style={styles.infoContainer}>
               <View style={styles.infoBox}>
                 <IconButton
                   icon="information"
                   size={20}
                   iconColor="#FFD700"
                   style={styles.infoIcon}
                 />
                 <View style={styles.infoTextContainer}>
                   <Text style={styles.infoTitle}>
                     ¿No tienes cuenta?
                   </Text>
                   <Text style={styles.infoText}>
                     Solicita tu cuenta en recepción para acceder a la app del gimnasio.
                   </Text>
                 </View>
               </View>
             </View>
           </Surface>
         </Animated.View>
       </View>

      {/* Snackbar para errores */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={4000}
        style={{ backgroundColor: '#f44336' }}
        action={{
          label: 'Cerrar',
          onPress: () => {
            setSnackbarVisible(false);
            clearError();
          },
        }}
      >
        <Text style={{ color: 'white' }}>
          {error || 'Error desconocido'}
        </Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gymName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formSurface: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#f44336',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    marginTop: 16,
  },
  infoBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 0,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

export default LoginScreen;