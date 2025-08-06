import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuración base de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.111:3000/api/v1';

// Crear instancia de axios
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

// Función para procesar la cola de requests fallidos
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para debugging en desarrollo
      console.log(`🔗 [API] Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasAuth: !!config.headers?.Authorization,
        timeout: config.timeout
      });
    } catch (error) {
      console.error('❌ [API] Error getting token from SecureStore:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refresh token automático
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log para debugging en desarrollo
    console.log(`✅ [API] Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      size: JSON.stringify(response.data).length
    });
    
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ [API] Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      code: error.code
    });
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Si es error 401 y no es el endpoint de login o refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      
      // Si ya estamos refrescando el token, agregar a la cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // Marcar que estamos refrescando
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Intentando refrescar token...');
        
        const response = await api.post('/auth/refresh');
        
        if (response.data.success && response.data.data?.accessToken) {
          const { accessToken } = response.data.data;
          
          // Guardar nuevo token en SecureStore
          await SecureStore.setItemAsync('accessToken', accessToken);
          
          // Actualizar header del request original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          // Procesar cola de requests fallidos
          processQueue(null, accessToken);
          
          console.log('✅ Token refrescado exitosamente');
          
          // Reintentar request original
          return api(originalRequest);
        } else {
          throw new Error('Refresh token inválido');
        }
        
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError);
        
        // Limpiar tokens
        await SecureStore.deleteItemAsync('accessToken');
        processQueue(refreshError, null);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para errores 403 (Forbidden) - usuario no es admin
    if (error.response?.status === 403) {
      console.error('🚫 Acceso denegado: Solo administradores permitidos');
      
      // Limpiar sesión si no es admin
      await SecureStore.deleteItemAsync('accessToken');
    }

    return Promise.reject(error);
  }
);

// Función helper para manejar errores de API de forma consistente
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // Error de respuesta del servidor
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    // Errores por código de estado
    switch (error.response?.status) {
      case 400:
        return 'Datos inválidos enviados al servidor';
      case 401:
        return 'Credenciales incorrectas o sesión expirada';
      case 403:
        return 'Acceso denegado. Solo administradores permitidos';
      case 404:
        return 'Recurso no encontrado';
      case 429:
        return 'Demasiadas peticiones. Intente más tarde';
      case 500:
        return 'Error interno del servidor';
      default:
        return 'Error de conexión con el servidor';
    }
  }
  
  // Error de red o timeout
  if (error.code === 'ECONNREFUSED' || error.message?.includes('timeout')) {
    return 'No se puede conectar al servidor. Verifique su conexión';
  }
  
  return 'Error desconocido. Intente nuevamente';
};

// Función para verificar si el servidor está disponible
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('❌ Servidor no disponible:', error);
    return false;
  }
};

// Función para limpiar todos los tokens
export const clearAuthTokens = async (): Promise<void> => {
  try {
    // Intentar logout en el servidor
    await api.post('/auth/logout');
  } catch (error) {
    // Ignorar errores de logout
    console.warn('⚠️ Error en logout del servidor:', error);
  } finally {
    // Limpiar token local
    await SecureStore.deleteItemAsync('accessToken');
  }
};

// Función helper para requests con reintentos
export const apiWithRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = 2
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores 4xx (client errors)
      if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        console.log(`🔄 Reintentando request (${attempt}/${maxRetries})...`);
      }
    }
  }
  
  throw lastError;
};

export default api; 