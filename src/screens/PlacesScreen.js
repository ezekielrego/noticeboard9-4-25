import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
import { listingsApi, getCachedListings, setCachedListings, CACHE_KEY_PLACES } from '../services/api';
import { mapListingsResponse } from '../utils/dataMapper';
import ErrorToast from '../components/ErrorToast';

export default function PlacesScreen({ navigation, isAuthenticated, onNeedLogin }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didInit = useRef(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  useEffect(() => {
    (async () => {
      const cached = await getCachedListings(CACHE_KEY_PLACES);
      if (cached && cached.length) {
        setListings(cached);
        setLoading(false);
      }
      if (!didInit.current) {
        didInit.current = true;
        fetchPlaces();
      }
    })();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const calls = [
        listingsApi.getListings({ postType: 'renthouse', postsPerPage: 20, page: 1 }),
        listingsApi.getListings({ postType: 'renthouse', postsPerPage: 20, page: 2 }),
        listingsApi.getListings({ postType: 'listing', listing_cat: 'accommodation', postsPerPage: 20, page: 1 }),
        listingsApi.getListings({ postType: 'listing', listing_cat: 'accommodation', postsPerPage: 20, page: 2 })
      ];
      const pages = await Promise.allSettled(calls);
      const merged = [];
      for (const p of pages) {
        if (p.status === 'fulfilled') {
          const mapped = mapListingsResponse(p.value).listings || [];
          merged.push(...mapped);
        }
      }
      const seen = new Set();
      const unique = merged.filter(it => {
        const key = String(it.id || '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      let first = [];
      for (const item of unique) {
        first.push(item);
        setListings([...first]);
        await new Promise(r => setTimeout(r, 0));
      }
      setCachedListings(CACHE_KEY_PLACES, unique);
    } catch (err) {
      setError('Failed to load places');
      setToastMessage('Poor or no network connection');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('PostDetail', { listingId: item.id, listing: item });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <ActivityIndicator size="large" color="#0b0c10" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading places...</Text>
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
        <TouchableOpacity onPress={() => fetchPlaces()} activeOpacity={0.8}>
          <View style={{ backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ListingsGrid title="Places" data={listings} onPressItem={handleItemPress} isAuthenticated={isAuthenticated} onNeedLogin={(action) => onNeedLogin && onNeedLogin(action)} />
      <ErrorToast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </View>
  );
}
