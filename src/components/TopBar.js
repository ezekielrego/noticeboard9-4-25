import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar, Image, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ onPressSearch, isSearching, query, onChangeQuery, onSubmitQuery, onCancelSearch, onPressNotifications, notificationsCount = 0 }) {
  const insets = useSafeAreaInsets();
  const titleFontSize = 17;
  const iconSize = 20;
  const contentMinHeight = 60;
  const verticalPadding = 0;

  const handlePressLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[LocationSearch] permission status =', status);
      if (status !== 'granted') {
        console.log('[LocationSearch] permission not granted');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      console.log('[LocationSearch] coords =', position?.coords);
      const places = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      console.log('[LocationSearch] reverseGeocode results =', places);
      const first = Array.isArray(places) && places[0] ? places[0] : null;
      const city = first?.city || first?.subregion || first?.region || '';
      const cityName = String(city).trim();
      console.log('[LocationSearch] chosen city =', cityName);
      if (!cityName) return;
      if (!isSearching) {
        onPressSearch && onPressSearch();
        setTimeout(() => {
          onChangeQuery && onChangeQuery(cityName);
          console.log('[LocationSearch] submitting query while opening =', cityName);
          setTimeout(() => { onSubmitQuery && onSubmitQuery(); }, 75);
        }, 75);
      } else {
        onChangeQuery && onChangeQuery(cityName);
        console.log('[LocationSearch] submitting query while open =', cityName);
        setTimeout(() => { onSubmitQuery && onSubmitQuery(); }, 75);
      }
    } catch (e) {
      console.log('[LocationSearch] error =', e);
    }
  };

  return (
    <View style={{ backgroundColor: '#0b0c10', paddingTop: insets.top }}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
      <View style={{ minHeight: contentMinHeight, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between', paddingTop: verticalPadding, paddingBottom: verticalPadding }}>
        {isSearching ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', transform: [{ translateY: -5 }] }}>
            <TouchableOpacity onPress={onCancelSearch} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={iconSize} color="#ffffff" />
            </TouchableOpacity>
            <Ionicons name="search-outline" size={iconSize} color="#ffffff" />
            <TextInput
              autoFocus
              value={query}
              onChangeText={onChangeQuery}
              onSubmitEditing={onSubmitQuery}
              placeholder="Search listings, categories..."
              placeholderTextColor="#cbd5e1"
              style={{ marginLeft: 8, flex: 1, color: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingVertical: 4 }}
            />
            <TouchableOpacity onPress={handlePressLocation} accessibilityLabel="Use my location" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: 8 }}>
              <Ionicons name="location-outline" size={iconSize} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateY: -5 }] }}>
              <Image source={require('../../assets/icon.png')} style={{ width: 18, height: 18, marginRight: 6 }} resizeMode="contain" />
              <Text style={{ color: '#ffffff', fontSize: titleFontSize, fontWeight: '700', letterSpacing: 1, includeFontPadding: false }}>
                NOTICEBOARD
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateY: -5 }] }}>
              <TouchableOpacity onPress={onPressNotifications} accessibilityLabel="Notifications" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 10 }}>
                <View style={{ position: 'relative', paddingRight: 22 }}>
                  <Ionicons name="notifications-outline" size={iconSize} color="#ffffff" />
                  {notificationsCount > 0 ? (
                    <Text numberOfLines={1} allowFontScaling={false} style={{ position: 'absolute', top: -6, right: 4, color: '#ef4444', fontSize: 10, fontWeight: '800', lineHeight: 12, includeFontPadding: false }}>
                      {notificationsCount > 9 ? '9+' : String(notificationsCount)}
                    </Text>
                  ) : (
                    <Text numberOfLines={1} allowFontScaling={false} style={{ position: 'absolute', top: -6, right: 4, color: '#ef4444', fontSize: 10, fontWeight: '800', lineHeight: 12, includeFontPadding: false }}>New</Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePressLocation} accessibilityLabel="Search by location" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
                <Ionicons name="location-outline" size={iconSize} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressSearch} accessibilityLabel="Search button" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="search-outline" size={iconSize} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}


