import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GestureBarAwareViewProps {
  children: React.ReactNode;
  style?: any;
}

export function GestureBarAwareView({ children, style }: GestureBarAwareViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'android' 
            ? Math.max(insets.bottom, 16) 
            : insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
