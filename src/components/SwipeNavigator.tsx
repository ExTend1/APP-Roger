import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  initialIndex?: number;
  screens: ReactNode[];
  threshold?: number; // fraction of width (0-1)
  edgeHitWidth?: number; // px from screen edge where swipe-back starts
  onIndexChange?: (index: number) => void;
  enableGestures?: boolean;
  disableEdgeSwipe?: boolean;
  animationDuration?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
  };
};

export default function SwipeNavigator({
  initialIndex = 0,
  screens,
  threshold = 0.3,
  edgeHitWidth = 30,
  onIndexChange,
  enableGestures = true,
  disableEdgeSwipe = false,
  animationDuration = 300,
  springConfig = { damping: 20, stiffness: 90 },
}: Props) {
  const total = screens.length;
  const index = useSharedValue(initialIndex);
  const translateX = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const isRTL = I18nManager.isRTL;
  const panRef = useRef<PanGestureHandler>(null);

  // Respect reduce motion accessibility preference
  const prefersReducedMotion = useSharedValue(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((val) => {
      prefersReducedMotion.value = val;
    });
  }, []);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const onFinish = useCallback((newIndex: number) => {
    if (onIndexChange) onIndexChange(newIndex);
  }, [onIndexChange]);

  // Animated style for the container that holds all screens side by side
  const animatedContainerStyle = useAnimatedStyle(() => {
    // Compute offset so that current index is centered
    const baseOffset = -index.value * SCREEN_WIDTH;
    // Apply current gesture translation
    return {
      transform: [{ translateX: baseOffset + translateX.value }],
    };
  });

  // Helper to animate to index
  const animateToIndex = (toIndex: number) => {
    index.value = clamp(toIndex, 0, total - 1);
    // Animate translateX to zero (because baseOffset changes)
    translateX.value = withTiming(0, { 
      duration: prefersReducedMotion.value ? 0 : animationDuration 
    }, () => {
      runOnJS(onFinish)(index.value);
    });
  };

  // Gesture event handler
  const onPanGestureEvent = useCallback(({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (!enableGestures) return;
    
    const { translationX, x, state } = nativeEvent;
    
    // Store initial touch position for edge detection
    if (state === State.BEGAN) {
      gestureStartX.value = x;
    }
    
    // Update translation
    translateX.value = translationX;
  }, [enableGestures]);

  const onHandlerStateChange = useCallback(({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (!enableGestures) return;
    
    const { translationX, velocityX, state, x } = nativeEvent;
    
    if (state === State.END || state === State.CANCELLED) {
      const dx = translationX;
      const startX = gestureStartX.value;
      
      // If RTL flip directions
      const dir = isRTL ? -1 : 1;
      const movedFraction = Math.abs(dx) / SCREEN_WIDTH;
      const goingBack = dx * dir > 0; // positive dx in LTR means dragging right -> go back
      
      // Edge swipe detection: only allow swipe-back when gesture started near edge
      const isEdgeSwipe = startX <= edgeHitWidth;
      const canGoBack = goingBack && index.value > 0 && !disableEdgeSwipe;
      const canGoForward = !goingBack && index.value < total - 1;
      
      // Determine allowed actions
      if (goingBack && !canGoBack) {
        // No back available or edge swipe disabled -> bounce
        translateX.value = withSpring(0, springConfig);
        return;
      }
      
      if (!goingBack && !canGoForward) {
        // No forward available -> bounce
        translateX.value = withSpring(0, springConfig);
        return;
      }
      
      // Edge swipe validation: only allow swipe-back from edge
      if (goingBack && !isEdgeSwipe) {
        translateX.value = withSpring(0, springConfig);
        return;
      }
      
      // Threshold logic
      if (movedFraction > threshold || Math.abs(velocityX) > 800) {
        // Commit navigation
        const nextIndex = clamp(index.value + (goingBack ? -1 : 1), 0, total - 1);
        
        // Animate container to new index
        translateX.value = withTiming(
          goingBack ? SCREEN_WIDTH * dir : -SCREEN_WIDTH * dir, 
          { 
            duration: prefersReducedMotion.value ? 0 : animationDuration 
          }, 
          () => {
            // After movement, update index and reset translateX
            index.value = nextIndex;
            translateX.value = 0;
            runOnJS(onFinish)(nextIndex);
          }
        );
      } else {
        // Revert to original position
        translateX.value = withSpring(0, springConfig);
      }
    }
  }, [enableGestures, threshold, edgeHitWidth, disableEdgeSwipe, total, isRTL, prefersReducedMotion, animationDuration, springConfig]);

  // Animated styles for individual screens (optional visual effects)
  const getScreenStyle = (screenIndex: number) => {
    return useAnimatedStyle(() => {
      const screenOffset = screenIndex - index.value;
      const screenTranslateX = screenOffset * SCREEN_WIDTH + translateX.value;
      
      // Calculate scale and opacity based on distance from center
      const scale = interpolate(
        Math.abs(screenTranslateX),
        [0, SCREEN_WIDTH],
        [1, 0.95],
        Extrapolate.CLAMP
      );
      
      const opacity = interpolate(
        Math.abs(screenTranslateX),
        [0, SCREEN_WIDTH * 0.5],
        [1, 0.8],
        Extrapolate.CLAMP
      );
      
      return {
        transform: [
          { translateX: screenTranslateX },
          { scale },
        ],
        opacity,
      };
    });
  };

  // Render screens side-by-side inside Animated.View
  return (
    <View style={styles.wrapper}>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-5, 5]} // Small deadzone to allow vertical scrolls in children
        failOffsetY={[-10, 10]}
        shouldCancelWhenOutside={false}
      >
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          {screens.map((Screen, i) => (
            <Animated.View 
              key={i} 
              style={[
                styles.page, 
                { width: SCREEN_WIDTH },
                getScreenStyle(i)
              ]}
            > 
              {Screen}
            </Animated.View>
          ))}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 3, // Will expand but it's ok; dynamic sizing is possible
  },
  page: {
    flex: 1,
  },
});

// USAGE EXAMPLE:
// import SwipeNavigator from './SwipeNavigator';
// 
// <SwipeNavigator
//   initialIndex={0}
//   screens={[<Home/>, <Details/>, <Profile/>]}
//   threshold={0.28}
//   edgeHitWidth={24}
//   onIndexChange={(i) => console.log('nuevo index', i)}
//   disableEdgeSwipe={false}
//   animationDuration={300}
//   springConfig={{ damping: 20, stiffness: 90 }}
// />

// DEPENDENCIES TO INSTALL:
// yarn add react-native-gesture-handler react-native-reanimated
// 
// For Reanimated setup:
// 1. Add babel plugin: "react-native-reanimated/plugin" to babel.config.js
// 2. For iOS: pod install in ios/ directory
// 3. For Android: ensure android/app/build.gradle has the correct Reanimated version
// 4. Clean and rebuild: npx react-native clean && npx react-native run-ios/android
