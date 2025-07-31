import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

// Tipos para el usuario y estado de autenticación
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface AuthState {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  error: string | null;
  
  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Configuración de SecureStore para persistencia
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('Error reading from SecureStore:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error writing to SecureStore:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Error removing from SecureStore:', error);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null,

      // Acción de login
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login({ email, password });
          
          if (response.success) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              isLoading: false,
              error: null,
            });
            
            console.log('✅ Login exitoso:', response.data.user.email);
            return true;
          } else {
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              isLoading: false,
              error: response.error || 'Error desconocido',
            });
            return false;
          }
        } catch (error: any) {
          console.error('❌ Error en login:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: error.message || 'Error de conexión',
          });
          return false;
        }
      },

      // Acción de logout
      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Intentar logout en el servidor (opcional, ya que usa cookies)
          try {
            await authService.logout();
          } catch (error) {
            console.warn('⚠️ Error en logout del servidor:', error);
            // Continuar con logout local aunque falle el servidor
          }
          
          // Limpiar el almacenamiento seguro explícitamente
          try {
            await SecureStore.deleteItemAsync('auth-storage');
          } catch (error) {
            console.warn('⚠️ Error limpiando SecureStore:', error);
          }
          
          // Limpiar todo el estado
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ Logout exitoso');
          
          // Forzar reinicio de la verificación de autenticación para que navegue correctamente
          setTimeout(() => {
            get().checkAuthStatus();
          }, 100);
          
        } catch (error: any) {
          console.error('❌ Error en logout:', error);
          set({ 
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false, 
            error: error.message 
          });
        }
      },

      // Refrescar token
      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();
          
          if (response.success) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              error: null,
            });
            
            console.log('✅ Token refrescado exitosamente');
            return true;
          } else {
            // Si el refresh falla, hacer logout
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              error: null,
            });
            return false;
          }
        } catch (error: any) {
          console.error('❌ Error refrescando token:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            error: null,
          });
          return false;
        }
      },

      // Limpiar errores
      clearError: () => {
        set({ error: null });
      },

      // Verificar estado de autenticación al iniciar la app
      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          
          const state = get();
          console.log('🔍 Verificando estado de auth, token actual:', !!state.accessToken);
          
          // Si ya tenemos un token, intentar refrescarlo
          if (state.accessToken) {
            console.log('🔄 Intentando refrescar token existente...');
            const refreshSuccess = await get().refreshToken();
            if (refreshSuccess) {
              console.log('✅ Token refrescado, usuario autenticado');
              set({ isLoading: false });
              return;
            }
            console.log('❌ Refresh falló, limpiando estado');
          } else {
            console.log('ℹ️ No hay token, usuario no autenticado');
          }
          
          // Si no hay token o el refresh falló, no está autenticado
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
          });
          
          console.log('🔓 Estado final: No autenticado');
        } catch (error: any) {
          console.error('❌ Error verificando estado de auth:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      // Solo persistir datos esenciales
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);