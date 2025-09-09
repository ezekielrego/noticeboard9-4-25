import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
// Comments moved to a dedicated screen
import ErrorToast from '../components/ErrorToast';
import { listingsApi, socialApi, getCachedListings, setCachedListings, CACHE_KEY_HOME } from '../services/api';
import { getLikesCount } from '../services/social';
import { mapListingsResponse } from '../utils/dataMapper';

export default function HomeScreen({ navigation, onSearch }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Comments navigation now via screen
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');


  useEffect(() => {
    (async () => {
      const cached = await getCachedListings(CACHE_KEY_HOME);
      if (cached && cached.length) {
        setItems(cached);
        setLoading(false);
      }
      fetchListings();
    })();
  }, []);

  const fetchListings = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        // Only show spinner if we don't already have cached content
        if (items.length === 0) setLoading(true);
        setError(null);
      }
      
      let maxIdSeen = 0;
      // Mixed feed: pull latest business and restaurant, merge and sort by id desc
      const [businessResponse, restaurantResponse] = await Promise.all([
        listingsApi.getListings({ postType: 'listing', postsPerPage: 10, page: pageNum }),
        listingsApi.getListings({ postType: 'restaurant', postsPerPage: 10, page: pageNum })
      ]);
      const businessData = mapListingsResponse(businessResponse);
      const restaurantData = mapListingsResponse(restaurantResponse);
      const mixed = [...businessData.listings, ...restaurantData.listings]
        .filter(Boolean)
        .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))
        .slice(0, 10);

      // Incremental add for first page; append for next pages
      if (pageNum > 1) {
        for (const it of mixed) {
          setItems(prev => [...prev, it]);
          await new Promise(r => setTimeout(r, 0));
        }
        // Fire-and-forget: ensure listings exist in NoticeAPI for likes/comments
        try {
          const ids = mixed.map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      } else {
        let first = [];
        for (const it of mixed) {
          first.push(it);
          setItems([...first]);
          await new Promise(r => setTimeout(r, 0));
        }
        // cache first page payload for fast relaunch
        setCachedListings(CACHE_KEY_HOME, mixed);
        // Fire-and-forget: ensure listings exist in NoticeAPI for likes/comments
        try {
          const ids = mixed.map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      }
      setHasMore(!!(businessData.hasMore || restaurantData.hasMore));
      setPage((businessData.nextPage && restaurantData.nextPage) ? Math.min(businessData.nextPage, restaurantData.nextPage) : pageNum + 1);
      if (mixed.length) {
        maxIdSeen = Math.max(...mixed.map(it => Number(it.id) || 0));
      }
      
      // Signal our API to sync new listings based on the newest ID we just saw
      // Removed failing non-existent sync call

    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
      showToast('Poor network connection. Please check your internet and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isSearching) fetchListings(page);
  };

  const handleItemPress = (item) => {
    navigation.navigate('PostDetail', { listingId: item.id, listing: item });
  };

  const handleLikePress = (listingId, action) => {
    if (action === 'comment') {
      const listing = [...items, ...searchResults].find(item => item.id === listingId);
      if (listing) {
        navigation.navigate('Comments', { listingId: listing.id, listingTitle: listing.title });
      }
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      const response = await listingsApi.searchListings(query);
      const data = mapListingsResponse(response);
      setSearchResults(data.listings || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
      setSearchResults([]);
      showToast('Search failed. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Wire up search to parent
  useEffect(() => {
    if (onSearch && typeof onSearch === 'function') {
      onSearch(handleSearch);
    }
  }, [onSearch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
        <ActivityIndicator size="large" color="#0b0c10" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>
          {isSearching ? 'Searching...' : 'Loading listings...'}
        </Text>
      </View>
    );
  }

  if (error && (!items || items.length === 0) && !isSearching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 56, marginBottom: 12 }}>📡</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 }}>
          No internet connection
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
          Please check your network and try again.
        </Text>
        <TouchableOpacity onPress={() => fetchListings(1)} activeOpacity={0.8}>
          <View style={{ backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const displayData = isSearching ? searchResults : items;
  const showNoResults = isSearching && searchResults.length === 0 && !loading;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {showNoResults ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            No results found
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            Try searching with different keywords or check your spelling
          </Text>
        </View>
      ) : (
        <ListingsGrid
          title={isSearching ? `Search results for "${searchQuery}"` : null}
          data={displayData}
          onPressItem={handleItemPress}
          onLikePress={handleLikePress}
          onLoadMore={isSearching ? null : loadMore}
          hasMore={isSearching ? false : hasMore}
          loading={loading}
        />
      )}

      <ErrorToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}



