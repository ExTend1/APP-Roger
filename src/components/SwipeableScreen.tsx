import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';

interface SwipeableScreenProps {
  children: React.ReactNode;
  style?: any;
}

export const SwipeableScreen: React.FC<SwipeableScreenProps> = ({
  children,
  style
}) => {
  const { createSwipeGesture } = useSwipeNavigation();
  const gesture = createSwipeGesture();

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
