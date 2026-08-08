import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  elevation = 'sm',
  className = '',
  ...props
}) => {
  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'md': return 'p-5';
      case 'lg': return 'p-6';
      default: return 'p-5';
    }
  };

  const getElevationClass = () => {
    switch (elevation) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-sm';
    }
  };

  // Note on shadows in React Native: NativeWind handles `shadow-*` utility classes 
  // by mapping them to platform-specific shadow styles (elevation on Android, shadow* on iOS).
  
  return (
    <View
      className={`bg-white rounded-2xl ${getPaddingClass()} ${getElevationClass()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
