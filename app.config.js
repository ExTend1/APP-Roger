export default {
  expo: {
    name: "APP-Roger",
    slug: "APP-Roger",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "approger",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      splash: {
        image: "./assets/images/splash-logo.svg",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#1a1a1a"
      },
      edgeToEdgeEnabled: true,
      splash: {
        image: "./assets/images/splash-logo.svg",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-logo.svg",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1a1a1a"
        }
      ],
      "expo-dev-client"
    ],
    experiments: {
      typedRoutes: true
    }
  }
}; 