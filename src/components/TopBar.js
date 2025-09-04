import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ onPressSearch }) {
  const insets = useSafeAreaInsets();
  const titleFontSize = 17;
  const iconSize = 20;
  const contentMinHeight = 60;
  const verticalPadding = 0;

  return (
    <View style={{ backgroundColor: '#0b0c10', paddingTop: insets.top }}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
      <View style={{ minHeight: contentMinHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between', paddingTop: verticalPadding, paddingBottom: verticalPadding }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateY: -5 }] }}>
          <Image source={require('../../assets/icon.png')} style={{ width: 18, height: 18, marginRight: 6 }} resizeMode="contain" />
          <Text style={{ color: '#ffffff', fontSize: titleFontSize, fontWeight: '700', letterSpacing: 1, includeFontPadding: false }}>
            NOTICEBOARD
          </Text>
        </View>
        <TouchableOpacity onPress={onPressSearch} accessibilityLabel="Search button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ transform: [{ translateY: -5 }] }}>
          <Ionicons name="search-outline" size={iconSize} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


