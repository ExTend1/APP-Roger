# SwipeNavigator - Navegación por Swipe Estilo iOS

## 🎯 Descripción

`SwipeNavigator` es un componente React Native que proporciona navegación por swipe horizontal con animaciones fluidas y físicas, similar a la experiencia nativa de iOS. Permite navegar entre pantallas deslizando horizontalmente con soporte para edge swipe y umbrales configurables.

## ✨ Características

- **Navegación horizontal por swipe** entre pantallas
- **Edge swipe** para volver (gesto iniciado desde el borde izquierdo)
- **Animaciones fluidas y físicas** con resistencia y rubber band
- **Umbral configurable** para completar transiciones
- **Soporte para accesibilidad** (reduce motion)
- **Funciona en iOS y Android**
- **API simple y fácil de usar**
- **Efectos visuales** (scale, opacity) durante la transición

## 📦 Instalación

### 1. Instalar Dependencias

```bash
yarn add react-native-gesture-handler react-native-reanimated
```

### 2. Configurar Babel

Agregar el plugin de Reanimated a tu `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // Debe ser el último plugin
  ],
};
```

### 3. Configuración Nativa

#### iOS
```bash
cd ios && pod install
```

#### Android
Asegúrate de que `android/app/build.gradle` tenga la versión correcta de Reanimated.

### 4. Limpiar y Reconstruir

```bash
npx react-native clean
npx react-native run-ios     # Para iOS
npx react-native run-android # Para Android
```

## 🚀 Uso Básico

```tsx
import React from 'react';
import SwipeNavigator from './src/components/SwipeNavigator';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  const handleIndexChange = (index: number) => {
    console.log('Nueva pantalla:', index);
  };

  return (
    <SwipeNavigator
      initialIndex={0}
      screens={[
        <HomeScreen />,
        <DetailsScreen />,
        <ProfileScreen />
      ]}
      onIndexChange={handleIndexChange}
    />
  );
}
```

## ⚙️ Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialIndex` | `number` | `0` | Índice inicial de la pantalla |
| `screens` | `ReactNode[]` | **requerido** | Array de pantallas a mostrar |
| `threshold` | `number` | `0.3` | Umbral para completar transición (0-1) |
| `edgeHitWidth` | `number` | `30` | Ancho del borde para edge swipe (px) |
| `onIndexChange` | `(index: number) => void` | `undefined` | Callback cuando cambia el índice |
| `enableGestures` | `boolean` | `true` | Habilitar/deshabilitar gestos |
| `disableEdgeSwipe` | `boolean` | `false` | Deshabilitar edge swipe |
| `animationDuration` | `number` | `300` | Duración de animación (ms) |
| `springConfig` | `object` | `{damping: 20, stiffness: 90}` | Configuración del spring |

## 🎨 Personalización Avanzada

### Configurar Umbral y Edge Swipe

```tsx
<SwipeNavigator
  threshold={0.25}           // 25% del ancho para completar
  edgeHitWidth={24}          // 24px desde el borde
  disableEdgeSwipe={false}   // Habilitar edge swipe
/>
```

### Configurar Animaciones

```tsx
<SwipeNavigator
  animationDuration={400}    // Animación más lenta
  springConfig={{
    damping: 15,             // Menos amortiguación
    stiffness: 100           // Más rigidez
  }}
/>
```

### Deshabilitar Gestos

```tsx
<SwipeNavigator
  enableGestures={false}     // Deshabilitar todos los gestos
  // o
  disableEdgeSwipe={true}    // Solo deshabilitar edge swipe
/>
```

## 🔄 Comportamiento de Navegación

### Swipe hacia la Izquierda
- Avanza a la siguiente pantalla
- Solo funciona si hay una pantalla siguiente disponible

### Swipe hacia la Derecha (Edge Swipe)
- Vuelve a la pantalla anterior
- Solo funciona si:
  - Hay una pantalla anterior disponible
  - El gesto se inicia dentro de `edgeHitWidth` píxeles del borde
  - `disableEdgeSwipe` es `false`

### Umbral de Transición
- Si el swipe supera `threshold` (por defecto 30% del ancho)
- O si la velocidad supera 800px/s
- La transición se completa
- Si no, la pantalla vuelve a su posición original

## 🎭 Efectos Visuales

Durante la transición, las pantallas tienen:
- **Scale**: Se reducen ligeramente (0.95x) cuando están fuera del centro
- **Opacity**: Se vuelven semi-transparentes (0.8) cuando están a medio camino
- **Transform**: Se mueven suavemente siguiendo el gesto del usuario

## ♿ Accesibilidad

El componente respeta automáticamente:
- **Reduce Motion**: Si está habilitado, las animaciones se desactivan
- **RTL**: Soporte para idiomas de derecha a izquierda
- **Gestos**: Se pueden deshabilitar completamente si es necesario

## 🧪 Testing

### Criterios de Aceptación

- ✅ Al deslizar desde el borde izquierdo se vuelve a la pantalla anterior
- ✅ Al deslizar hacia la izquierda se avanza a la siguiente pantalla
- ✅ Si el swipe no supera el umbral, la pantalla vuelve a su posición
- ✅ Las animaciones son fluidas y responden al gesto del usuario
- ✅ El edge swipe solo funciona desde el borde configurado
- ✅ Las transiciones respetan el umbral configurado

### Testing Manual

1. **Edge Swipe**: Desliza desde el borde izquierdo hacia la derecha
2. **Swipe Forward**: Desliza hacia la izquierda desde cualquier parte
3. **Umbral**: Desliza parcialmente y suelta para ver el bounce back
4. **Velocidad**: Desliza rápidamente para activar la transición por velocidad
5. **Límites**: Intenta ir más allá de la primera/última pantalla

## 🔧 Troubleshooting

### Gestos no responden
- Verifica que `GestureHandlerRootView` envuelva tu app
- Asegúrate de que las dependencias estén correctamente instaladas
- Revisa que `enableGestures` sea `true`

### Animaciones lentas
- Verifica la configuración de `springConfig`
- Ajusta `animationDuration` según tus necesidades
- Considera usar `prefersReducedMotion` para usuarios con necesidades de accesibilidad

### Edge swipe no funciona
- Verifica que `disableEdgeSwipe` sea `false`
- Ajusta `edgeHitWidth` si es muy pequeño
- Asegúrate de que haya una pantalla anterior disponible

## 📱 Integración con React Navigation

Para integrar con React Navigation, puedes usar `onIndexChange`:

```tsx
import { useNavigation } from '@react-navigation/native';

export default function MyScreen() {
  const navigation = useNavigation();
  
  const handleIndexChange = (index: number) => {
    if (index === 0) {
      navigation.navigate('Home');
    } else if (index === 1) {
      navigation.navigate('Details');
    }
  };

  return (
    <SwipeNavigator
      screens={[<HomeContent />, <DetailsContent />]}
      onIndexChange={handleIndexChange}
    />
  );
}
```

## 🎯 Casos de Uso

- **Onboarding**: Navegación entre pasos de configuración
- **Galerías**: Navegación entre imágenes o contenido
- **Tutoriales**: Pasos secuenciales con navegación por swipe
- **Dashboards**: Cambio entre vistas de datos
- **Formularios**: Navegación entre secciones de formulario

## 📄 Licencia

Este componente está diseñado para uso interno en APP Roger. Modifica según tus necesidades específicas.
