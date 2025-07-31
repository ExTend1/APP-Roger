import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useAuthStore } from '../../contexts/authStore';
import { authService, type LoginRequest } from '../../services/authService';

const { width, height } = Dimensions.get('window');

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo animado */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <Surface style={[styles.logoSurface, { backgroundColor: theme.colors.primary }]} elevation={4}>
              <Text style={[styles.logoText, { color: theme.colors.onPrimary }]}>
                🏋️‍♂️
              </Text>
            </Surface>
            <Text style={[styles.gymName, { color: theme.colors.onBackground }]}>
              Roger Gym
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurface }]}>
              Tu entrenamiento, nuestra pasión
            </Text>
          </Animated.View>

          {/* Formulario animado */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <Surface style={[styles.formSurface, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Text style={[styles.formTitle, { color: theme.colors.onSurface }]}>
                Iniciar Sesión
              </Text>

              {/* Campo de email */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                error={formErrors.some(err => err.includes('Email'))}
                disabled={isLoading}
              />

              {/* Campo de contraseña */}
              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={handlePasswordChange}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect={false}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                error={formErrors.some(err => err.includes('contraseña'))}
                disabled={isLoading}
              />

              {/* Mostrar errores de validación */}
              {formErrors.length > 0 && (
                <View style={styles.errorContainer}>
                  {formErrors.map((error, index) => (
                    <Text key={index} style={[styles.errorText, { color: theme.colors.error }]}>
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
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Información adicional */}
              <View style={styles.infoContainer}>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  ¿Problemas para acceder?
                </Text>
                <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  Contacta al administrador del gimnasio
                </Text>
              </View>
            </Surface>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar para errores */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={4000}
        style={{ backgroundColor: theme.colors.errorContainer }}
        action={{
          label: 'Cerrar',
          onPress: () => {
            setSnackbarVisible(false);
            clearError();
          },
        }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>
          {error || 'Error desconocido'}
        </Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSurface: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  gymName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formSurface: {
    padding: 24,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default LoginScreen;