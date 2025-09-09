import React, { useEffect, useRef, useState, memo } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { likeListing, getLikesCount, checkUserLike } from '../services/social';

const ListingCard = memo(({ item, onPress, onLikePress }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    loadLikeData();
  }, [opacity, item.id]);

  const loadLikeData = async () => {
    try {
      const [liked, count] = await Promise.all([
        checkUserLike(item.id),
        getLikesCount(item.id)
      ]);
      setIsLiked(liked);
      setLikesCount(count);
    } catch (error) {
      console.error('Error loading like data:', error);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const action = isLiked ? 'unlike' : 'like';
      const result = await likeListing(item.id, action);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
      
      if (onLikePress) {
        onLikePress(item.id, result.liked, result.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  // No logging in production

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity onPress={() => onPress && onPress(item)} style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }}>
        <View style={{ height: 140, backgroundColor: '#e9ecef' }}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
            </View>
          )}
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
                <TouchableOpacity 
                  onPress={handleLike} 
                  accessibilityLabel="Like" 
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  disabled={isLiking}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={18} 
                      color={isLiked ? "#ef4444" : "#6b7280"} 
                    />
                    {likesCount > 0 && (
                      <Text style={{ 
                        fontSize: 12, 
                        color: isLiked ? "#ef4444" : "#6b7280", 
                        marginLeft: 4,
                        fontWeight: isLiked ? '600' : '400'
                      }}>
                        {likesCount}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={{ width: 10 }} />
                <TouchableOpacity onPress={() => onLikePress && onLikePress(item.id, 'comment')} accessibilityLabel="Comment" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ListingCard;
