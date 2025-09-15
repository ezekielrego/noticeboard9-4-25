import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_KEYS = ['home', 'businesses', 'places', 'events', 'restaurants', 'account'];

export default function BottomTabs({ current, onChange }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  const tabs = [
    { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
    { key: 'businesses', label: 'Business', icon: 'briefcase-outline', iconActive: 'briefcase' },
    { key: 'places', label: 'Places', icon: 'map-outline', iconActive: 'map' },
    { key: 'events', label: 'Events', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'restaurants', label: 'Restaurant', icon: 'restaurant-outline', iconActive: 'restaurant' },
    { key: 'account', label: 'Account', icon: 'person-circle-outline', iconActive: 'person-circle' },
  ];
  const [createPressed, setCreatePressed] = React.useState(false);
  return (
    <View style={{ paddingBottom: bottomPadding, minHeight: 56, borderTopWidth: 1, borderTopColor: '#e6e6e6', backgroundColor: '#ffffff', flexDirection: 'row', elevation: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: -2 }, position: 'relative' }}>
      {tabs.map(tab => {
        const isActive = current === tab.key;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onChange(tab.key)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={isActive ? tab.iconActive : tab.icon} size={20} color={isActive ? '#0b0c10' : '#777777'} />
            <Text style={{ marginTop: 2, fontSize: 12, color: isActive ? '#0b0c10' : '#777777', fontWeight: isActive ? '700' : '500' }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={() => onChange && onChange('create')}
        onPressIn={() => setCreatePressed(true)}
        onPressOut={() => setCreatePressed(false)}
        activeOpacity={0.8}
        style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 16, backgroundColor: '#ffffff', top: -16, left: '50%', marginLeft: -16 }}
      >
        <Ionicons name="add" size={18} color={createPressed ? '#0b0c10' : '#777777'} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 16, borderColor: '#e6e6e6', borderWidth: 1, borderBottomWidth: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: 'transparent' }} />
      </TouchableOpacity>
    </View>
  );
}


