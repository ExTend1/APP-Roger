import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface SafeTabBarProps {
  children: React.ReactNode;
}

export function SafeTabBar({ children }: SafeTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outline,
        paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8),
        paddingTop: 8,
        height: (Platform.OS === 'ios' ? 84 : 64) + Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 8),
      }
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
