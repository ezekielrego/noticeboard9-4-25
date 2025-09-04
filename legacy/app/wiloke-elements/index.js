import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

export const P = ({ children, style }) => <Text style={style}>{children}</Text>;
export const H4 = ({ children, style }) => (
  <Text style={[{ fontSize: 18, fontWeight: '600' }, style]}>{children}</Text>
);

export const Button = ({ children, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[{ padding: 12, borderRadius: 6, backgroundColor: '#333' }, style]}>
    <Text style={{ color: '#fff', textAlign: 'center' }}>{children}</Text>
  </TouchableOpacity>
);

export const KeyboardAnimationRP = ({ children, style }) => (
  <View style={style}>{typeof children === 'function' ? children() : children}</View>
);

export const FontIcon = ({ name, size = 16, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
);

export const RTL = () => false;

export default {
  P,
  H4,
  Button,
  KeyboardAnimationRP,
  FontIcon,
  RTL,
};


