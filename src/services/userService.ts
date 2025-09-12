import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';
import { useAuthStore } from '../contexts/authStore';

// Crear cliente axios para userService
const createUserApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
    withCredentials: true,
  });

  // Interceptor para requests - agregar token de autenticación
  client.interceptors.request.use(
    (config) => {
      // Obtener el token del authStore
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      console.log(`🌐 UserService API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔗 UserService URL completa: ${config.baseURL}${config.url}`);
      console.log(`📋 UserService Headers:`, config.headers);
      
      return config;
    },
    (error) => {
      console.error('❌ UserService Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  client.interceptors.response.use(
    (response) => {
      console.log(`✅ UserService API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ UserService Response Error:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url,
        code: error.code,
        isNetworkError: !error.response,
      });
      
      return Promise.reject(error);
    }
  );

  return client;
};

const userApiClient = createUserApiClient();

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  genero?: string;
  rol: 'ADMIN' | 'USER';
  activo: boolean;
  token?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data: User | null;
  error?: string;
}

export const userService = {
  // Comentado temporalmente por problemas de autenticación en producción
  /*
  // Obtener perfil del usuario autenticado
  async getMyProfile(): Promise<UserResponse> {
    try {
      console.log('🔍 [userService] Getting my profile');
      const response = await userApiClient.get('/users/me/profile');
      console.log('✅ [userService] Profile obtained:', response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ [userService] Error getting profile:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Error al obtener perfil'
      };
    }
  },

  // Actualizar perfil del usuario autenticado
  async updateMyProfile(profileData: {
    nombre: string;
    apellido: string;
    telefono?: string;
    genero?: string;
  }): Promise<UserResponse> {
    try {
      console.log('🔍 [userService] Updating my profile:', profileData);
      const response = await userApiClient.patch('/users/me/profile', profileData);
      console.log('✅ [userService] Profile updated:', response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('❌ [userService] Error updating profile:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Error al actualizar perfil'
      };
    }
  },
  */
}; 