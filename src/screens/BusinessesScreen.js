import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
import { listingsApi, getCachedListings, setCachedListings, CACHE_KEY_BUSINESS } from '../services/api';
import { getLikesCount } from '../services/social';
import { mapListingsResponse } from '../utils/dataMapper';
import ErrorToast from '../components/ErrorToast';

import { loadSession } from '../services/auth';

export default function BusinessesScreen({ navigation, isAuthenticated, onNeedLogin }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const didInit = useRef(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [hasShownNetworkToast, setHasShownNetworkToast] = useState(false);

  useEffect(() => {
    (async () => {
      const cached = await getCachedListings(CACHE_KEY_BUSINESS);
      if (cached && cached.length) {
        setListings(cached);
        setLoading(false);
      }
      if (!didInit.current) {
        didInit.current = true;
        // background refresh but only if we don't already have fresh items
        fetchBusinesses();
      }
    })();
  }, []);

  const fetchBusinesses = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      }
      
      const response = await listingsApi.getListings({ 
        postType: 'listing', 
        postsPerPage: 20,
        page: pageNum
      });
      const data = mapListingsResponse(response);

      if (pageNum > 1) {
        for (const item of data.listings) {
          setListings(prev => {
            const combined = [...prev, item];
            const seen = new Set();
            return combined.filter(it => {
              const key = String(it?.id ?? '');
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
          await new Promise(r => setTimeout(r, 0));
        }
        try {
          const ids = (data.listings || []).map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      } else {
        let first = [];
        for (const item of data.listings) {
          first.push(item);
          // de-dupe as we stream the initial set as well
          const seen = new Set();
          const unique = first.filter(it => {
            const key = String(it?.id ?? '');
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setListings([...unique]);
          await new Promise(r => setTimeout(r, 0));
        }
        setCachedListings(CACHE_KEY_BUSINESS, data.listings);
        try {
          const ids = (data.listings || []).map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      }
      setHasMore(data.hasMore);
      setPage(data.nextPage || pageNum + 1);
      
    } catch (err) {
      // keep cached items and show toast
      setError('Failed to load businesses');
      if (!hasShownNetworkToast) {
        setToastMessage('Poor or no network connection');
        setToastType('error');
        setToastVisible(true);
        setHasShownNetworkToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchBusinesses(page);
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
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Loading businesses...</Text>
      </View>
    );
  }

  // Only show the error screen if we have no cached data to display
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
        <TouchableOpacity onPress={() => fetchBusinesses(1)} activeOpacity={0.8}>
          <View style={{ backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ListingsGrid 
        title="Businesses" 
        data={listings} 
        onPressItem={handleItemPress}
        onLikePress={handleLikePress}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        isAuthenticated={isAuthenticated}
        onNeedLogin={(action) => onNeedLogin && onNeedLogin(action)}
      />
      <ErrorToast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </View>
  );
}


