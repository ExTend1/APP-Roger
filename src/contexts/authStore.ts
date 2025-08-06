import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '../services/authService';

// Tipos para el usuario y estado de autenticación
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  genero?: string;
  rol: string;
}

export interface FieldErrors {
  email?: string;
  password?: string;
}

export interface AuthState {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  error: string | null;
  fieldErrors: FieldErrors;
  
  // Acciones
  login: (email: string, password: string) => Promise<{ success: boolean; fieldErrors: FieldErrors }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  clearFieldErrors: () => void;
  checkAuthStatus: () => Promise<void>;
  validateForm: (email: string, password: string) => FieldErrors;
  updateUser: (userData: Partial<User>) => void;
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
      fieldErrors: {},

      // Validar formulario localmente
      validateForm: (email: string, password: string) => {
        const fieldErrors = authService.getFieldErrors({ email, password });
        return fieldErrors;
      },

      // Acción de login
      login: async (email: string, password: string) => {
        try {
          // Limpiar errores previos
          set({ isLoading: true, error: null, fieldErrors: {} });
          
          // Validar formulario primero
          const fieldErrors = get().validateForm(email, password);
          if (Object.keys(fieldErrors).length > 0) {
            set({ isLoading: false, fieldErrors });
            return { success: false, fieldErrors };
          }
          
          const response = await authService.login({ email, password });
          
          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              isLoading: false,
              error: null,
              fieldErrors: {},
            });
            
            console.log('✅ Login exitoso:', response.data.user?.email);
            return { success: true, fieldErrors: {} };
          } else {
            // Manejar errores específicos del servidor
            let serverFieldErrors: FieldErrors = {};
            
            // Si es un error de credenciales, marcar ambos campos
            if (response.error?.includes('Credenciales incorrectas')) {
              serverFieldErrors = {
                email: 'Email o contraseña incorrectos',
                password: 'Email o contraseña incorrectos',
              };
            }
            
            // Si es un error de validación específico, asignarlo al campo correspondiente
            if (response.error?.includes('Email inválido')) {
              serverFieldErrors.email = response.error;
            } else if (response.error?.includes('contraseña debe tener')) {
              serverFieldErrors.password = response.error;
            }
            
            set({
              isAuthenticated: false,
              user: null,
              accessToken: null,
              isLoading: false,
              error: response.error || 'Error desconocido',
              fieldErrors: serverFieldErrors,
            });
            return { success: false, fieldErrors: serverFieldErrors };
          }
        } catch (error: any) {
          console.error('❌ Error en login:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: error.message || 'Error de conexión',
            fieldErrors: {},
          });
          return { success: false, fieldErrors: {} };
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
            fieldErrors: {},
          });
          
          console.log('✅ Logout exitoso');
          
        } catch (error: any) {
          console.error('❌ Error en logout:', error);
          set({ 
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false, 
            error: error.message,
            fieldErrors: {},
          });
        }
      },

      // Refrescar token
      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();
          
          if (response.success && response.data) {
            // El refresh token solo devuelve el accessToken, no el usuario
            // Mantenemos el usuario existente y actualizamos solo el token
            const currentState = get();
            

            set({
              isAuthenticated: true,
              user: currentState.user, // Mantener el usuario existente
              accessToken: response.data.accessToken, // Actualizar solo el token
              error: null,
              fieldErrors: {},
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
              fieldErrors: {},
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
            fieldErrors: {},
          });
          return false;
        }
      },

      // Limpiar errores
      clearError: () => {
        set({ error: null });
      },

      // Limpiar errores de campos
      clearFieldErrors: () => {
        set({ fieldErrors: {} });
      },

      // Actualizar datos del usuario
      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (state.user) {
            return {
              ...state,
              user: { ...state.user, ...userData }
            };
          }
          return state;
        });
      },

      // Verificar estado de autenticación al iniciar la app
      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          
          const state = get();
          console.log('🔍 Verificando estado de auth...');
          console.log('📊 Estado actual:', {
            isAuthenticated: state.isAuthenticated,
            hasUser: !!state.user,
            hasToken: !!state.accessToken
          });
          
          // Si ya tenemos datos de autenticación, intentar refrescar el token
          if (state.accessToken && state.user) {
            console.log('🔄 Intentando refrescar token existente...');
            const refreshSuccess = await get().refreshToken();
            if (refreshSuccess) {
              console.log('✅ Token refrescado, usuario autenticado');
              set({ isLoading: false });
              return;
            }
            console.log('❌ Refresh falló, limpiando estado');
          } else {
            console.log('ℹ️ No hay datos de autenticación');
          }
          
          // Si no hay datos o el refresh falló, no está autenticado
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
            fieldErrors: {},
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
            fieldErrors: {},
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