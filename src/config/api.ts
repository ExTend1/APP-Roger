// Configuración de la API
export const API_CONFIG = {
  // URL base de la API - asegurar que no termine en /
  BASE_URL: 'https://api-gym.extendsystem.com/api/v1',
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
    },
  },
  
  // Configuración de timeout
  TIMEOUT: 15000,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Log de configuración
console.log('🔧 API Config:', {
  BASE_URL: API_CONFIG.BASE_URL,
  LOGIN_URL: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  TIMEOUT: API_CONFIG.TIMEOUT,
});
