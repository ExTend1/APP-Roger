import Constants from 'expo-constants';

// Configuración de entorno
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                process.env.EXPO_PUBLIC_API_BASE_URL || 
                'https://api.gimnasioroger.com/api/v1',
  
  // JWT Secret
  JWT_SECRET: Constants.expoConfig?.extra?.JWT_SECRET || 
              process.env.JWT_SECRET || 
              'default_jwt_secret',
  
  // Environment
  IS_DEV: __DEV__,
  IS_PRODUCTION: !__DEV__,
  
  // Debug info
  DEBUG_INFO: {
    expoConfig: Constants.expoConfig,
    extra: Constants.expoConfig?.extra,
    processEnv: {
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
    }
  }
};

// Log de configuración
console.log('🔧 Environment Config:', {
  API_BASE_URL: ENV_CONFIG.API_BASE_URL,
  IS_DEV: ENV_CONFIG.IS_DEV,
  IS_PRODUCTION: ENV_CONFIG.IS_PRODUCTION,
  hasExpoConfig: !!Constants.expoConfig,
  hasExtra: !!Constants.expoConfig?.extra,
  extraKeys: Constants.expoConfig?.extra ? Object.keys(Constants.expoConfig.extra) : [],
});

export default ENV_CONFIG;
