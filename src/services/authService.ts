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
    user: userSchema,
  }).nullable(),
});

// Tipos TypeScript
export type LoginRequest = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

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
      
      // Manejar errores de validación de Zod
      if (error.name === 'ZodError') {
        return {
          success: false,
          error: 'Datos de entrada inválidos',
          data: null,
        };
      }
      
      // Manejar errores de la API
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Error del servidor',
          data: null,
        };
      }
      
      // Manejar errores de red
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        return {
          success: false,
          error: 'No se pudo conectar al servidor. Verifica tu conexión.',
          data: null,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error desconocido',
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
      
      if (validatedResponse.success) {
        console.log('✅ Token refrescado exitosamente');
      } else {
        console.warn('⚠️ Refresh token fallido:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error refrescando token:', error);
      
      // Manejar errores de la API
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Token inválido',
          data: null,
        };
      }
      
      return {
        success: false,
        error: 'Error de conexión',
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
  validateCredentials: (credentials: any): { isValid: boolean; errors: string[] } => {
    try {
      loginSchema.parse(credentials);
      return { isValid: true, errors: [] };
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map((err: any) => err.message);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ['Error de validación'] };
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
};

export default authService;