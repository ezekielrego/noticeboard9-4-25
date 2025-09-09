import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_KEYS = ['home', 'businesses', 'events', 'restaurants', 'account'];

export default function BottomTabs({ current, onChange }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
    { key: 'businesses', label: 'Business', icon: 'briefcase-outline', iconActive: 'briefcase' },
    { key: 'events', label: 'Places', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline', iconActive: 'restaurant' },
    { key: 'account', label: 'Account', icon: 'person-circle-outline', iconActive: 'person-circle' },
  ];
  return (
    <View style={{ paddingBottom: bottomPadding, minHeight: 56, borderTopWidth: 1, borderTopColor: '#e6e6e6', backgroundColor: '#ffffff', flexDirection: 'row', elevation: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: -2 } }}>
      {tabs.map(tab => {
        const isActive = current === tab.key;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onChange(tab.key)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={isActive ? tab.iconActive : tab.icon} size={20} color={isActive ? '#0b0c10' : '#777777'} />
            <Text style={{ marginTop: 2, fontSize: 12, color: isActive ? '#0b0c10' : '#777777', fontWeight: isActive ? '700' : '500' }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


