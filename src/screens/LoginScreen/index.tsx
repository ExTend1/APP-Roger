import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
} from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../contexts/authStore';

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

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, fieldErrors, clearError, clearFieldErrors } = useAuthStore();
  
  // Estado local del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Referencias para los inputs
  const emailInputRef = React.useRef<any>(null);
  const passwordInputRef = React.useRef<any>(null);
  
  // Valores animados
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);
  const errorScale = useSharedValue(0.8);

  // Iniciar animaciones
  useEffect(() => {
    const startAnimations = () => {
      // Animación del logo
      logoScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      logoOpacity.value = withSpring(1, { damping: 8 });

      // Animación del formulario con delay
      formTranslateY.value = withDelay(300, withSpring(0, { damping: 8 }));
      formOpacity.value = withDelay(300, withSpring(1, { damping: 8 }));
    };

    startAnimations();
  }, []);

  // Animar error cuando aparece
  useEffect(() => {
    if (error || Object.keys(fieldErrors).length > 0) {
      errorOpacity.value = withSpring(1, { damping: 8 });
      errorScale.value = withSpring(1, { damping: 8 });
    } else {
      errorOpacity.value = withSpring(0, { damping: 8 });
      errorScale.value = withSpring(0.8, { damping: 8 });
    }
  }, [error, fieldErrors]);

  // Limpiar errores cuando los campos están completamente vacíos
  useEffect(() => {
    if (!email.trim() && !password.trim()) {
      clearError();
      clearFieldErrors();
    }
  }, [email, password]);

  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ scale: errorScale.value }],
  }));

  // Manejadores de eventos
  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Limpiar error de email si existe y el usuario está corrigiendo
    if (fieldErrors.email) {
      clearFieldErrors();
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Limpiar error de password si existe y el usuario está corrigiendo
    if (fieldErrors.password) {
      clearFieldErrors();
    }
  };

  const handleLogin = async () => {
    const result = await login(email, password);
    
    if (result.success) {
      router.replace('/(tabs)');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Función para manejar el submit del email (Enter)
  const handleEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };

  // Función para manejar el submit del password (Enter)
  const handlePasswordSubmit = () => {
    if (!isLoading) {
      handleLogin();
    }
  };

  // Determinar si hay errores en campos específicos
  const hasEmailError = !!fieldErrors.email;
  const hasPasswordError = !!fieldErrors.password;
  const hasGeneralError = !!error;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo animado */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
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

          {/* Mensaje de error general */}
          {hasGeneralError && (
            <Animated.View style={[styles.errorContainer, errorAnimatedStyle]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Formulario animado */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Surface style={styles.formSurface}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                                 <TextInput
                   ref={emailInputRef}
                   value={email}
                   onChangeText={handleEmailChange}
                   mode="outlined"
                   placeholder="tu@email.com"
                   keyboardType="email-address"
                   autoCapitalize="none"
                   autoComplete="email"
                   autoCorrect={false}
                   returnKeyType="next"
                   onSubmitEditing={handleEmailSubmit}
                   blurOnSubmit={false}
                   style={[
                     styles.input,
                     hasEmailError && styles.inputError
                   ]}
                   error={hasEmailError}
                   disabled={isLoading}
                   outlineColor={hasEmailError ? "#FF6B6B" : "#FFFFFF"}
                   activeOutlineColor={hasEmailError ? "#FF6B6B" : "#FFD700"}
                   textColor="#FFFFFF"
                   placeholderTextColor="#CCCCCC"
                 />
                {hasEmailError && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                                 <TextInput
                   ref={passwordInputRef}
                   value={password}
                   onChangeText={handlePasswordChange}
                   mode="outlined"
                   placeholder="••••••••"
                   secureTextEntry={!showPassword}
                   autoCapitalize="none"
                   autoComplete="password"
                   autoCorrect={false}
                   returnKeyType="done"
                   onSubmitEditing={handlePasswordSubmit}
                   blurOnSubmit={true}
                   style={[
                     styles.input,
                     hasPasswordError && styles.inputError
                   ]}
                   error={hasPasswordError}
                   disabled={isLoading}
                   outlineColor={hasPasswordError ? "#FF6B6B" : "#FFFFFF"}
                   activeOutlineColor={hasPasswordError ? "#FF6B6B" : "#FFD700"}
                   textColor="#FFFFFF"
                   placeholderTextColor="#CCCCCC"
                   right={
                     <TextInput.Icon
                       icon={showPassword ? "eye-off" : "eye"}
                       onPress={handleTogglePassword}
                     />
                   }
                 />
                {hasPasswordError && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                )}
              </View>

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonLabel}
                buttonColor="#FFD700"
                textColor="#000000"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Surface>
          </Animated.View>

          {/* Información */}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
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
  errorContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#FF6B6B',
  },
  fieldErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  loginButtonContent: {
    height: 48,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
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