import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { useAuthStore } from '../contexts/authStore';
import {
  Clase,
  Reserva,
  ReservaConClase,
  ClasesResponse,
  ClaseResponse,
  ReservasResponse,
  ReservaResponse,
  ReservarClaseRequest,
  ReservaError,
  clasesResponseSchema,
  claseResponseSchema,
  reservasResponseSchema,
  reservaResponseSchema,
} from '../types/reservas';

// Configuración de la API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.111:3000/api/v1';

// Configuración de Axios
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Interceptor para requests - agregar token de autenticación
  client.interceptors.request.use(
    (config) => {
      console.log(`🌐 Reservas API Request: ${config.method?.toUpperCase()} ${config.url}`);
      
      // Obtener el token del authStore
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('🔐 Token agregado a la petición');
      } else {
        console.log('⚠️ No hay token disponible');
      }
      
      return config;
    },
    (error) => {
      console.error('❌ Reservas Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ Reservas API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ Reservas Response Error:', {
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

// Función para manejar errores de la API
const handleApiError = (error: any): ReservaError => {
  // Errores de validación Zod
  if (error.name === 'ZodError' || error instanceof z.ZodError) {
    return {
      type: 'validation',
      message: 'Error de validación de datos',
      field: 'general',
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
          message: 'No autorizado. Inicia sesión nuevamente.',
          field: 'general',
        };
      case 403:
        return {
          type: 'auth',
          message: 'No tienes permisos para esta acción.',
          field: 'general',
        };
      case 409:
        return {
          type: 'business',
          message: errorMessage,
          field: 'general',
        };
      case 500:
        return {
          type: 'server',
          message: 'Error interno del servidor',
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

export const reservaService = {
  // Obtener todas las clases
  getAllClases: async (): Promise<ClasesResponse> => {
    try {
      console.log('📚 Obteniendo todas las clases...');
      
      const response = await apiClient.get('/clases');
      
      // Validar respuesta del servidor
      const validatedResponse = clasesResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Clases obtenidas exitosamente:', validatedResponse.data?.length || 0);
      } else {
        console.warn('⚠️ Error obteniendo clases:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error obteniendo clases:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Obtener una clase por ID
  getClaseById: async (id: string): Promise<ClaseResponse> => {
    try {
      console.log('📖 Obteniendo clase por ID:', id);
      
      const response = await apiClient.get(`/clases/${id}`);
      
      // Validar respuesta del servidor
      const validatedResponse = claseResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Clase obtenida exitosamente:', validatedResponse.data?.nombre);
      } else {
        console.warn('⚠️ Error obteniendo clase:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error obteniendo clase:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Reservar una clase
  reservarClase: async (claseId: string, request: ReservarClaseRequest = {}): Promise<ReservaResponse> => {
    try {
      console.log('🎯 Reservando clase:', claseId);
      
      const response = await apiClient.post(`/reservas/clases/${claseId}/reservar`, request);
      
      // Validar respuesta del servidor
      const validatedResponse = reservaResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Clase reservada exitosamente');
      } else {
        console.warn('⚠️ Error reservando clase:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error reservando clase:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Cancelar una reserva
  cancelarReserva: async (claseId: string): Promise<ReservaResponse> => {
    try {
      console.log('❌ Cancelando reserva de clase:', claseId);
      
      const response = await apiClient.patch(`/reservas/clases/${claseId}/reservar`);
      
      // Validar respuesta del servidor
      const validatedResponse = reservaResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Reserva cancelada exitosamente');
      } else {
        console.warn('⚠️ Error cancelando reserva:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error cancelando reserva:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Obtener mis reservas
  getMisReservas: async (): Promise<ReservasResponse> => {
    try {
      console.log('📅 Obteniendo mis reservas...');
      
      const response = await apiClient.get('/reservas/mis-reservas');
      
      // Validar respuesta del servidor
      const validatedResponse = reservasResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Reservas obtenidas exitosamente:', validatedResponse.data?.length || 0);
      } else {
        console.warn('⚠️ Error obteniendo reservas:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error obteniendo reservas:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Obtener reservas de una clase específica (para admins)
  getReservasClase: async (claseId: string): Promise<ReservasResponse> => {
    try {
      console.log('👥 Obteniendo reservas de clase:', claseId);
      
      const response = await apiClient.get(`/reservas/clases/${claseId}/reservas`);
      
      // Validar respuesta del servidor
      const validatedResponse = reservasResponseSchema.parse(response.data);
      
      if (validatedResponse.success) {
        console.log('✅ Reservas de clase obtenidas exitosamente:', validatedResponse.data?.length || 0);
      } else {
        console.warn('⚠️ Error obteniendo reservas de clase:', validatedResponse.error);
      }
      
      return validatedResponse;
    } catch (error: any) {
      console.error('❌ Error obteniendo reservas de clase:', error);
      
      const apiError = handleApiError(error);
      
      return {
        success: false,
        error: apiError.message,
        data: null,
      };
    }
  },

  // Verificar conectividad con el servidor
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ Servidor de reservas no disponible');
      return false;
    }
  },
};

export default reservaService;