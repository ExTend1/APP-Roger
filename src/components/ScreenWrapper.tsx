import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  backgroundColor = '#1a1a1a' 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* StatusBar Background para edge-to-edge */}
      <View
        style={{
          height: Platform.OS === 'android' ? StatusBar.currentHeight || insets.top : 0,
          backgroundColor,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      />
      {children}
    </View>
  );
};

export default ScreenWrapper; 