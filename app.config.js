// app.config.js (ESM)
export default {
  name: "RogerAPP",
  slug: "RogerAPP",
  version: "1.0.6",
  orientation: "portrait",
  icon: "./assets/images/RogerAPP.png",
  scheme: "rogerAPP",
  userInterfaceStyle: "automatic",

  extra: {
    EXPO_PUBLIC_API_BASE_URL: "https://api.gimnasioroger.com/api/v1",
    JWT_SECRET: "ExtendLoMejor2025!", 
    eas: {
        projectId: "d0615ddf-8004-4158-81bd-c75ba81dacda"
      },
  },

  splash: {
    image: "./assets/images/splashscreen_logo.png",
    resizeMode: "contain",
    backgroundColor: "#1a1a1a"
  },

  owner: "jjuanbaez",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.roger.gym",
  buildNumber: "6",
    infoPlist: {
      NSUserNotificationUsageDescription:
        "Esta app necesita acceso a las notificaciones...",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true
          }
        }
      },
      UIBackgroundModes: ["remote-notification"],
      ITSAppUsesNonExemptEncryption: false
    }
  },

  android: {
    package: "com.roger.gym",
    versionCode: 3, // ¡Aumentalo en cada release!
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/RogerAPP.png",
      backgroundColor: "#1a1a1a"
    },
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.POST_NOTIFICATIONS"
    ]
    // ❌ useNextNotificationsApi eliminado
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/RogerAPP.png"
  },

  plugins: [
    "expo-router",
    "expo-splash-screen",
    [
      "expo-notifications",
      {
        icon: "./assets/images/RogerAPP.png",
        color: "#FFD700"
      }
    ],
    "expo-build-properties"
  ],

  privacy: "unlisted",

  experiments: {
    typedRoutes: true
  }
};
