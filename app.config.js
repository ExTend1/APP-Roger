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
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.roger.gym",
      splash: {
        image: "./assets/images/splashscreen_logo.png",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      }
    },
    android: {
      package: "com.roger.gym",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#1a1a1a"
      },
      edgeToEdgeEnabled: true,
      splash: {
        image: "./assets/images/splashscreen_logo.png",
        resizeMode: "contain",
        backgroundColor: "#1a1a1a"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/logo.png"
    },
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
      "expo-dev-client"
    ],
    experiments: {
      typedRoutes: true
    }
  }
}; 