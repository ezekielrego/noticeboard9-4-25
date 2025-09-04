import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ListingCard({ item, onPress }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity onPress={() => onPress && onPress(item)} style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
        <View style={{ height: 140, backgroundColor: '#e9ecef' }}>
          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center' }}>
            {item.verified && (
              <View style={{ backgroundColor: '#3ecf8e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginRight: 6 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Verified</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => {}} accessibilityLabel="Share" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="share-social-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {!!item.logo && (
            <View style={{ position: 'absolute', left: 8, bottom: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
              <Image source={{ uri: item.logo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          )}
        </View>
        <View style={{ paddingHorizontal: 12, paddingTop: 22, paddingBottom: 12 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: '#1f2937', minHeight: 18 }}>{item.title}</Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={{ fontSize: 12, color: '#6b7280', marginTop: 2, minHeight: 34, lineHeight: 17 }}>{item.subtitle}</Text>
          {!!item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af' }}>📍</Text>
              <Text numberOfLines={1} style={{ fontSize: 12, color: '#6b7280', marginLeft: 6, flex: 1 }}>{item.location}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {}} accessibilityLabel="Like" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="heart-outline" size={18} color="#6b7280" />
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity onPress={() => {}} accessibilityLabel="Message" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}


