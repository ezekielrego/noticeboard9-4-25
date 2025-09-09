import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
import { listingsApi, getCachedListings, setCachedListings, CACHE_KEY_RESTAURANT } from '../services/api';
import { getLikesCount } from '../services/social';
import { mapListingsResponse } from '../utils/dataMapper';
import ErrorToast from '../components/ErrorToast';

export default function RestaurantsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didInit = useRef(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  useEffect(() => {
    (async () => {
      const cached = await getCachedListings(CACHE_KEY_RESTAURANT);
      if (cached && cached.length) {
        setListings(cached);
        setLoading(false);
      }
      if (!didInit.current) {
        didInit.current = true;
        fetchRestaurants();
      }
    })();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await listingsApi.getListings({ postType: 'restaurant', postsPerPage: 20 });
      const data = mapListingsResponse(response);
      // incremental to ease UI
      let first = [];
      for (const item of data.listings) {
        first.push(item);
        setListings([...first]);
        await new Promise(r => setTimeout(r, 0));
      }
      setCachedListings(CACHE_KEY_RESTAURANT, data.listings);
      try {
        const ids = (data.listings || []).map(x => Number(x.id)).filter(Boolean);
        await Promise.allSettled(ids.map(id => getLikesCount(id)));
      } catch (_) {}
      
    } catch (err) {
      setError('Failed to load restaurants');
      setToastMessage('Poor network. Showing cached restaurants');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('PostDetail', { listingId: item.id, listing: item });
  };

  const handleLikePress = (listingId, action) => {
    if (action === 'comment') {
      const listing = listings.find(it => it.id === listingId);
      if (listing) {
        navigation.navigate('Comments', { listingId: listing.id, listingTitle: listing.title });
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <ActivityIndicator size="large" color="#0b0c10" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error && (!listings || listings.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 56, marginBottom: 12 }}>📡</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
          No internet connection
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
          Please check your network and try again.
        </Text>
        <TouchableOpacity onPress={() => fetchRestaurants()} activeOpacity={0.8}>
          <View style={{ backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ListingsGrid title="Restaurants and Bars" data={listings} onPressItem={handleItemPress} onLikePress={handleLikePress} />
      <ErrorToast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </View>
  );
}


