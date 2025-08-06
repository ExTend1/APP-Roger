import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Configuración de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.111:3000/api/v1';

// Log para debugging
console.log('🌐 API_BASE_URL configurada:', API_BASE_URL);
console.log('🌐 EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

// Schemas de validación basados en el backend
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const userSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  rol: z.string(),
});

export const loginResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.object({
    accessToken: z.string(),
    user: userSchema,
  }).nullable(),
});

export const refreshResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.object({
    accessToken: z.string(),
    // El refresh token no devuelve el usuario, solo el token
  }).nullable(),
});

// Tipos TypeScript
export type LoginRequest = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

// Tipos de errores para manejo específico
export interface ValidationError {
  field: 'email' | 'password' | 'general';
  message: string;
}

export interface ApiError {
  type: 'validation' | 'auth' | 'server' | 'network' | 'unknown';
  message: string;
  field?: 'email' | 'password' | 'general';
}

// Configuración de Axios
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    // Importante: incluir cookies para el refresh token
    withCredentials: true,
  });

  // Interceptor para requests
  client.interceptors.request.use(
    (config) => {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
      });
      return Promise.reject(error);
    }
  );

  return client;
};

// Instancia del cliente API
const apiClient = createApiClient();

// Función para extraer errores de validación de Zod
const extractValidationErrors = (error: any): ValidationError[] => {
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map((err: any) => {
      const field = err.path?.[0] as 'email' | 'password';
      return {
        field: field || 'general',
        message: err.message || 'Error de validación',
      };
    });
  }
  return [{ field: 'general', message: 'Error de validación' }];
};

// Función para manejar errores de la API
const handleApiError = (error: any): ApiError => {
  // Errores de validación Zod
  if (error.name === 'ZodError' || error instanceof z.ZodError) {
    const validationErrors = extractValidationErrors(error);
    const firstError = validationErrors[0];
    return {
      type: 'validation',
      message: firstError.message,
      field: firstError.field,
    };
  }

  // Errores de respuesta del servidor
  if (error.response?.data) {
    const { status, data } = error.response;
    const errorMessage = data.error || 'Error del servidor';

    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: errorMessage,
          field: 'general',
        };
      case 401:
        return {
          type: 'auth',
          message: errorMessage,
          field: 'general',
        };
      case 403:
        return {
          type: 'auth',
          message: errorMessage,
          field: 'general',
        };
      case 500:
        return {
          type: 'server',
          message: errorMessage,
          field: 'general',
        };
      default:
        return {
          type: 'server',
          message: errorMessage,
          field: 'general',
        };
    }
  }

  // Errores de red
  if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
    return {
      type: 'network',
      message: 'No se pudo conectar al servidor. Verifica tu conexión.',
      field: 'general',
    };
  }

  // Errores desconocidos
  return {
    type: 'unknown',
    message: error.message || 'Error desconocido',
    field: 'general',
  };
};

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // Validar datos de entrada
      const validatedCredentials = loginSchema.parse(credentials);
      
      console.log('🔐 Intentando login para:', validatedCredentials.email);
      
      const response = await apiClient.post('/auth/login', validatedCredentials);
      
      // Validar respuesta del servidor
      const validatedResponse = loginResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Login exitoso para:', validatedResponse.data?.user.email);
      } else {
        console.warn('⚠️ Login fallido:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      
      // Si es un error de validación Zod, no usar handleApiError
      if (error.name === 'ZodError' || error instanceof z.ZodError) {
        const validationErrors = extractValidationErrors(error);
        const firstError = validationErrors[0];
        return {
          success: false,
          error: firstError.message,
          data: null,
        };
      }
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Refresh Token
  refreshToken: async (): Promise<RefreshResponse> => {
    try {
      console.log('🔄 Intentando refrescar token...');
      
      const response = await apiClient.post('/auth/refresh');
      
      // Validar respuesta del servidor
      const validatedResponse = refreshResponseSchema.parse(response.data);
      
      if (validatedResponse.success && validatedResponse.data) {
        console.log('✅ Token refrescado exitosamente');
      } else {
        console.warn('⚠️ Refresh token fallido:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error refrescando token:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Logout (opcional, ya que el backend usa cookies)
  logout: async (): Promise<void> => {
    try {
      console.log('🚪 Cerrando sesión...');
      // No hay endpoint específico de logout en el backend actual
      // pero podríamos agregarlo si es necesario
      console.log('✅ Sesión cerrada');
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      // No lanzar error para no bloquear el logout local
    }
  },

  // Validar credenciales sin hacer login
  validateCredentials: (credentials: any): { isValid: boolean; errors: ValidationError[] } => {
    try {
      loginSchema.parse(credentials);
      return { isValid: true, errors: [] };
    } catch (error: any) {
      if (error.name === 'ZodError' || error instanceof z.ZodError) {
        const validationErrors = extractValidationErrors(error);
        return { isValid: false, errors: validationErrors };
      }
      return { 
        isValid: false, 
        errors: [{ field: 'general', message: 'Error de validación' }] 
      };
    }
  },

  // Verificar conectividad con el servidor
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ Servidor no disponible');
      return false;
    }
  },

  // Función para obtener errores específicos por campo
  getFieldErrors: (credentials: any): { email?: string; password?: string } => {
    try {
      loginSchema.parse(credentials);
      return {};
    } catch (error: any) {
      const fieldErrors: { email?: string; password?: string } = {};
      
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          const field = err.path?.[0] as 'email' | 'password';
          if (field === 'email') {
            fieldErrors.email = err.message;
          } else if (field === 'password') {
            fieldErrors.password = err.message;
          }
        });
      }
      
      return fieldErrors;
    }
  },
};

export default authService;