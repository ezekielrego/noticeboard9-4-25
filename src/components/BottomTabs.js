import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_KEYS = ['home', 'businesses', 'events', 'restaurants', 'account'];

export default function BottomTabs({ current, onChange }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const tabs = [
    { key: 'home', label: 'Home' },
    { key: 'businesses', label: 'Business' },
    { key: 'events', label: 'Events' },
    { key: 'restaurants', label: 'Restaurants' },
    { key: 'account', label: 'Account' },
  ];
  return (
    <View style={{ paddingBottom: bottomPadding, minHeight: 56, borderTopWidth: 1, borderTopColor: '#e6e6e6', backgroundColor: '#ffffff', flexDirection: 'row', elevation: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: -2 } }}>
      {tabs.map(tab => {
        const isActive = current === tab.key;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onChange(tab.key)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, color: isActive ? '#0b0c10' : '#777777', fontWeight: isActive ? '700' : '500' }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


