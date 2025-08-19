import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// Configuración de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api-gym.extendsystem.com/api/v1';

// Asegurar que la URL base termine correctamente
const normalizedBaseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

// Log para debugging
console.log('🌐 API_BASE_URL configurada:', API_BASE_URL);
console.log('🌐 EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
console.log('🌐 URL normalizada:', normalizedBaseURL);

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
    baseURL: normalizedBaseURL,
    timeout: 15000, // Aumentado para conexiones HTTPS
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Importante: incluir cookies para el refresh token
    withCredentials: true,
  });

  // Interceptor para requests
  client.interceptors.request.use(
    (config) => {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔗 URL completa: ${config.baseURL}${config.url}`);
      console.log(`📋 Headers:`, config.headers);
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
        code: error.code,
        isNetworkError: !error.response,
      });
      
      // Manejo específico para problemas de red/HTTPS
      if (!error.response) {
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
          console.error('🌐 Error de red - Verificar conectividad y certificados HTTPS');
        } else if (error.code === 'ECONNABORTED') {
          console.error('⏰ Timeout - La conexión tardó demasiado');
        }
      }
      
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
      console.log('🔍 Verificando conectividad con:', API_BASE_URL);
      
      // Probar el endpoint raíz primero
      try {
        const rootResponse = await apiClient.get('/', { timeout: 8000 });
        console.log('✅ Servidor responde correctamente en endpoint raíz');
        console.log('📡 Respuesta del servidor:', rootResponse.data);
        return rootResponse.status === 200;
      } catch (rootError) {
        console.warn('⚠️ Endpoint raíz no disponible, probando /health...');
        
        // Si falla el endpoint raíz, probar health
        try {
          const healthResponse = await apiClient.get('/health', { timeout: 8000 });
          console.log('✅ Servidor responde en /health');
          return healthResponse.status === 200;
        } catch (healthError) {
          console.warn('⚠️ Endpoint /health tampoco disponible');
          throw rootError; // Usar el error del endpoint raíz
        }
      }
    } catch (error: any) {
      console.error('❌ Servidor no disponible:', {
        message: error.message,
        code: error.code,
        url: API_BASE_URL
      });
      
      // Log específico para problemas de HTTPS
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        console.error('🌐 Problema de conectividad de red detectado');
      } else if (error.code === 'ECONNABORTED') {
        console.error('⏰ Timeout en la conexión');
      }
      
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

  // Función para probar la conectividad antes del login
  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🧪 Probando conectividad con la API...');
      
      const isConnected = await authService.checkConnection();
      
      if (isConnected) {
        return {
          success: true,
          message: 'Conexión exitosa con la API'
        };
      } else {
        return {
          success: false,
          message: 'No se pudo conectar con la API. Verifica tu conexión a internet.'
        };
      }
    } catch (error: any) {
      console.error('❌ Error en test de conectividad:', error);
      return {
        success: false,
        message: `Error de conectividad: ${error.message}`
      };
    }
  },

  // Función para probar específicamente el endpoint de login
  testLoginEndpoint: async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔐 Probando endpoint de login...');
      
      // Probar diferentes rutas posibles
      const possibleRoutes = [
        '/auth/login',
        '/api/v1/auth/login',
        '/auth',
        '/api/v1/auth'
      ];
      
      for (const route of possibleRoutes) {
        try {
          console.log(`🧪 Probando ruta: ${route}`);
          
          // Intentar con OPTIONS primero
          try {
            const response = await apiClient.options(route, { timeout: 5000 });
            console.log(`✅ Endpoint ${route} disponible (OPTIONS) - Status: ${response.status}`);
            return {
              success: true,
              message: `Endpoint disponible en: ${route}`
            };
          } catch (optionsError: any) {
            console.log(`⚠️ OPTIONS falló para ${route}: ${optionsError.response?.status || 'Error de red'}`);
            
            // Si OPTIONS falla, probar con HEAD
            try {
              const response = await apiClient.head(route, { timeout: 5000 });
              console.log(`✅ Endpoint ${route} disponible (HEAD) - Status: ${response.status}`);
              return {
                success: true,
                message: `Endpoint disponible en: ${route}`
              };
            } catch (headError: any) {
              console.log(`⚠️ HEAD falló para ${route}: ${headError.response?.status || 'Error de red'}`);
              
              // Si ambos fallan, probar con GET para ver qué error devuelve
              try {
                const response = await apiClient.get(route, { timeout: 5000 });
                console.log(`✅ Endpoint ${route} responde a GET - Status: ${response.status}`);
                return {
                  success: true,
                  message: `Endpoint disponible en: ${route} (pero no es POST)`
                };
              } catch (getError: any) {
                if (getError.response?.status === 405) {
                  // Method Not Allowed significa que el endpoint existe pero no acepta GET
                  console.log(`✅ Endpoint ${route} existe (405 Method Not Allowed)`);
                  return {
                    success: true,
                    message: `Endpoint existe en: ${route} y está configurado correctamente`
                  };
                } else {
                  console.log(`❌ GET falló para ${route}: ${getError.response?.status || 'Error de red'}`);
                }
              }
            }
          }
        } catch (error: any) {
          console.log(`❌ Error general probando ${route}:`, error.message);
        }
      }
      
      // Si ninguna ruta funcionó
      console.error('❌ Ninguna ruta de login funcionó');
      return {
        success: false,
        message: 'No se encontró ninguna ruta de login válida'
      };
      
    } catch (error: any) {
      console.error('❌ Error probando endpoint de login:', error);
      return {
        success: false,
        message: `Error probando endpoint: ${error.message}`
      };
    }
  },

  // Función para hacer un test completo de la API
  testApiCompletely: async (): Promise<{ success: boolean; message: string; details: any }> => {
    try {
      console.log('🧪 Test completo de la API...');
      
      const results = {
        baseUrl: API_BASE_URL,
        rootEndpoint: null,
        healthEndpoint: null,
        authEndpoints: [],
        errors: []
      };
      
      // 1. Probar endpoint raíz
      try {
        const rootResponse = await apiClient.get('/', { timeout: 8000 });
        results.rootEndpoint = {
          status: rootResponse.status,
          data: rootResponse.data
        };
        console.log('✅ Endpoint raíz funciona:', rootResponse.status);
      } catch (error: any) {
        results.errors.push(`Root endpoint: ${error.response?.status || error.message}`);
        console.log('❌ Endpoint raíz falló:', error.response?.status || error.message);
      }
      
      // 2. Probar endpoint health
      try {
        const healthResponse = await apiClient.get('/health', { timeout: 8000 });
        results.healthEndpoint = {
          status: healthResponse.status,
          data: healthResponse.data
        };
        console.log('✅ Endpoint health funciona:', healthResponse.status);
      } catch (error: any) {
        results.errors.push(`Health endpoint: ${error.response?.status || error.message}`);
        console.log('❌ Endpoint health falló:', error.response?.status || error.message);
      }
      
      // 3. Probar diferentes rutas de auth
      const authRoutes = ['/auth', '/auth/login', '/api/v1/auth', '/api/v1/auth/login'];
      
      for (const route of authRoutes) {
        try {
          const response = await apiClient.options(route, { timeout: 5000 });
          results.authEndpoints.push({
            route,
            method: 'OPTIONS',
            status: response.status,
            headers: response.headers
          });
          console.log(`✅ ${route} (OPTIONS): ${response.status}`);
        } catch (error: any) {
          try {
            const response = await apiClient.head(route, { timeout: 5000 });
            results.authEndpoints.push({
              route,
              method: 'HEAD',
              status: response.status,
              headers: response.headers
            });
            console.log(`✅ ${route} (HEAD): ${response.status}`);
          } catch (headError: any) {
            try {
              const response = await apiClient.get(route, { timeout: 5000 });
              results.authEndpoints.push({
                route,
                method: 'GET',
                status: response.status,
                data: response.data
              });
              console.log(`✅ ${route} (GET): ${response.status}`);
            } catch (getError: any) {
              if (getError.response?.status === 405) {
                results.authEndpoints.push({
                  route,
                  method: 'GET',
                  status: 405,
                  message: 'Method Not Allowed - Endpoint existe pero no acepta GET'
                });
                console.log(`✅ ${route} existe (405 Method Not Allowed)`);
              } else {
                results.errors.push(`${route}: ${getError.response?.status || getError.message}`);
                console.log(`❌ ${route} falló: ${getError.response?.status || getError.message}`);
              }
            }
          }
        }
      }
      
      // 4. Resumen
      const hasWorkingAuth = results.authEndpoints.some(endpoint => 
        endpoint.status === 200 || endpoint.status === 405
      );
      
      if (hasWorkingAuth) {
        return {
          success: true,
          message: 'API funciona correctamente',
          details: results
        };
      } else {
        return {
          success: false,
          message: 'No se encontraron endpoints de autenticación funcionales',
          details: results
        };
      }
      
    } catch (error: any) {
      console.error('❌ Error en test completo:', error);
      return {
        success: false,
        message: `Error en test: ${error.message}`,
        details: { error: error.message }
      };
    }
  },
};

export default authService;