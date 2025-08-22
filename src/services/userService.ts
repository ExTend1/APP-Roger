import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '../config/api';

// Crear cliente axios para userService
const createUserApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.DEFAULT_HEADERS,
    withCredentials: true,
  });

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
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data: User | null;
  error?: string;
}

export const userService = {
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
}; 