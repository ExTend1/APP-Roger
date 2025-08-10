# Navegación por Swipe - APP Roger

## 🎯 Funcionalidad Implementada

La aplicación ahora permite navegar entre las pestañas principales deslizando horizontalmente con el dedo, proporcionando una experiencia de usuario más fluida e intuitiva.

## 🔄 Navegación Circular

La navegación funciona de manera circular, permitiendo ir de una pestaña a otra en ambas direcciones:

- **Home** ↔ **Clases** ↔ **Mis Turnos** ↔ **Ajustes**
- **Deslizar hacia la izquierda**: Avanza a la siguiente pestaña
- **Deslizar hacia la derecha**: Retrocede a la pestaña anterior

### Ejemplos de Navegación:
- Desde **Home**: Deslizar izquierda → **Clases**, Deslizar derecha → **Ajustes**
- Desde **Clases**: Deslizar izquierda → **Mis Turnos**, Deslizar derecha → **Home**
- Desde **Mis Turnos**: Deslizar izquierda → **Ajustes**, Deslizar derecha → **Clases**
- Desde **Ajustes**: Deslizar izquierda → **Home**, Deslizar derecha → **Mis Turnos**

## 🛠️ Configuración Técnica

### Dependencias Requeridas:
```json
{
  "react-native-gesture-handler": "^2.x.x",
  "react-native-reanimated": "^3.x.x"
}
```

### Archivos Principales:

#### 1. Hook de Navegación (`src/hooks/useSwipeNavigation.ts`)
- Maneja la lógica de detección de gestos
- Implementa la navegación circular entre tabs
- Configura los umbrales de sensibilidad para el swipe

#### 2. Componente Wrapper (`src/components/SwipeableScreen.tsx`)
- Envuelve las pantallas para habilitar la detección de gestos
- Aplica el detector de gestos a sus hijos
- No muestra indicadores visuales (diseño limpio)

#### 3. Layout de Tabs (`app/(tabs)/_layout.tsx`)
- Configura la navegación principal
- Habilita animaciones de transición
- Integra `GestureHandlerRootView` para el manejo de gestos

## 🎨 Características Visuales

- **Transiciones suaves**: Animación `fade` entre pestañas
- **Sin indicadores**: Interfaz limpia sin carteles de instrucciones
- **Sensibilidad optimizada**: 
  - Umbral mínimo: 50px de movimiento
  - Velocidad mínima: 500px/s
  - Fallback vertical: 15px máximo

## 📱 Implementación en Pantallas

Todas las pantallas principales están envueltas con `SwipeableScreen`:

- `app/(tabs)/index.tsx` → **Home**
- `app/(tabs)/clases.tsx` → **Clases** 
- `app/(tabs)/turnos.tsx` → **Mis Turnos**
- `app/(tabs)/ajustes.tsx` → **Ajustes**

## 🚀 Beneficios

1. **Experiencia fluida**: Transiciones suaves entre secciones
2. **Navegación intuitiva**: Gestos naturales de swipe
3. **Interfaz limpia**: Sin elementos visuales distractores
4. **Navegación circular**: Acceso rápido a cualquier sección
5. **Rendimiento optimizado**: Gestos detectados solo cuando es necesario

## 🔧 Personalización

### Ajustar Sensibilidad:
```typescript
// En useSwipeNavigation.ts
.activeOffsetX([-20, 20])     // Umbral de activación
.failOffsetY([-15, 15])       // Límite vertical
// En onEnd:
if (Math.abs(translationX) > 50 || Math.abs(velocityX) > 500)
```

### Cambiar Orden de Navegación:
```typescript
const routeOrder = ['index', 'clases', 'turnos', 'ajustes'];
```

## 🐛 Solución de Problemas

### Error: "router.getState is not a function"
- **Causa**: API incompatible de Expo Router
- **Solución**: Usar `useSegments()` para obtener la ruta actual

### Advertencia: "Layout children must be of type Screen"
- **Causa**: Elementos no válidos como hijos directos de `Tabs`
- **Solución**: Mover elementos fuera del componente `Tabs`

### Gestos no responden:
- **Verificar**: `GestureHandlerRootView` esté envolviendo toda la app
- **Verificar**: `SwipeableScreen` esté aplicado a todas las pantallas
- **Verificar**: Dependencias estén correctamente instaladas

## 📋 Estado Actual

✅ **Implementado:**
- Navegación por swipe entre todas las pestañas
- Transiciones fluidas con animaciones
- Navegación circular bidireccional
- Interfaz limpia sin indicadores

✅ **Funcional:**
- Home ↔ Clases ↔ Mis Turnos ↔ Ajustes
- Gestos de swipe izquierda/derecha
- Detección de velocidad y distancia
- Fallback para movimientos verticales

La navegación por swipe está completamente funcional y optimizada para una experiencia de usuario fluida y profesional.
