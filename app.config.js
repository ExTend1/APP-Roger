export default {
  expo: {
    name: "APP-Roger",
    slug: "APP-Roger",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "approger",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    
    // Configuración de splash screen
    splash: {
      image: "./assets/images/splashscreen_logo.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a1a"
    },
    
    // Configuración de EAS
    owner: "martiinvan",
    extra: {
      eas: {
        projectId: "5d24f8fe-6c24-4dbf-8d4f-3f8869f08595"
      }
    },
    
    // Configuración de iOS
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.roger.gym",
      splash: {
        image: "./assets/images/splashscreen_logo.png",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      },
      // Configuración de permisos iOS
      infoPlist: {
        // Permisos de notificaciones
        NSUserNotificationUsageDescription: "Esta app necesita acceso a las notificaciones para enviarte recordatorios de tus clases de gimnasio.",
        
        // Permisos de red
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "localhost": {
              NSExceptionAllowsInsecureHTTPLoads: true
            }
          }
        },
        
        // Configuración de privacidad
        NSUserTrackingUsageDescription: "Esta app no rastrea tu actividad personal. Solo usamos datos para gestionar tus reservas de clases.",
        
        // Permisos de almacenamiento
        NSDocumentsFolderUsageDescription: "Esta app guarda tu configuración de tema y tokens de autenticación localmente.",
        
        // Configuración de notificaciones push
        UIBackgroundModes: ["remote-notification"],
        
        // Configuración de seguridad
        NSFaceIDUsageDescription: "Esta app no usa Face ID. Solo autenticación por usuario y contraseña."
      }
    },
    
    // Configuración de Android
    android: {
      package: "com.roger.gym",
      versionCode: 1, // Incrementar en cada release
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#1a1a1a"
      },
      splash: {
        image: "./assets/images/splashscreen_logo.png",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      },
      // Permisos de Android - solo los necesarios
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.WAKE_LOCK",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.FOREGROUND_SERVICE"
      ],
      // Configuración de notificaciones
      useNextNotificationsApi: true
    },
    
    // Configuración web
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png"
    },
    
    // Plugins
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splashscreen_logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1a1a1a"
        }
      ],
      "expo-dev-client",
      // Plugin de notificaciones
      [
        "expo-notifications",
        {
          icon: "./assets/images/logo.png",
          color: "#FFD700"
        }
      ],
      // Plugin para optimizar builds
      "expo-build-properties"
    ],
    
    // Configuración de notificaciones
    notification: {
      icon: "./assets/images/logo.png",
      color: "#FFD700",
      iosDisplayInForeground: true,
      androidMode: "default",
      androidCollapsedTitle: "Nueva notificación"
    },
    
    // Configuración de privacidad
    privacy: "unlisted",
    
    // Configuración de actualizaciones
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/5d24f8fe-6c24-4dbf-8d4f-3f8869f08595"
    },
    
    // Configuración de runtime
    runtimeVersion: {
      policy: "sdkVersion"
    },
    
    // Experimentos
    experiments: {
      typedRoutes: true
    }
  }
}; 