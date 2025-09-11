import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
// Comments moved to a dedicated screen
import ErrorToast from '../components/ErrorToast';
import { listingsApi, socialApi, getCachedListings, setCachedListings, CACHE_KEY_HOME } from '../services/api';
import { getLikesCount } from '../services/social';
import { mapListingsResponse, mapListingData } from '../utils/dataMapper';

import { loadSession } from '../services/auth';

export default function HomeScreen({ navigation, onSearch, requireLogin, isAuthenticated }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Comments navigation now via screen
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [hasShownNetworkToast, setHasShownNetworkToast] = useState(false);


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
      
      let allListings = [];
      let premiumIds = new Set();

      // First, try to fetch premium listings
      try {
        const premiumResponse = await socialApi.get('/premium');
        console.log('Premium API raw:', premiumResponse?.data);
        if (premiumResponse.data.status === 'success' && Array.isArray(premiumResponse.data.data)) {
          const premiumRaw = premiumResponse.data.data;

          // Build promises preserving order: fetch details for numeric IDs, placeholders for name-only
          const normalizeSingle = (listing) => {
            if (!listing) return null;
            try {
              // Direct object
              const direct = mapListingData(listing);
              if (direct && direct.id) return direct;
            } catch (_) {}
            try {
              // Wrapped under data
              if (listing.data) {
                const d = mapListingData(listing.data);
                if (d && d.id) return d;
              }
            } catch (_) {}
            try {
              // Wilcity detail often under 'post'
              if (listing.post) {
                const p = mapListingData(listing.post);
                if (p && p.id) return p;
              }
            } catch (_) {}
            try {
              // Sometimes oResults is array or object
              if (Array.isArray(listing.oResults) && listing.oResults[0]) {
                const a = mapListingData(listing.oResults[0]);
                if (a && a.id) return a;
              }
              if (listing.oResults && !Array.isArray(listing.oResults) && typeof listing.oResults === 'object') {
                const obj = mapListingData(listing.oResults);
                if (obj && obj.id) return obj;
              }
              if (Array.isArray(listing.results) && listing.results[0]) {
                const a = mapListingData(listing.results[0]);
                if (a && a.id) return a;
              }
              if (Array.isArray(listing.data) && listing.data[0]) {
                const a = mapListingData(listing.data[0]);
                if (a && a.id) return a;
              }
            } catch (_) {}
            return null;
          };

          const premiumPromises = premiumRaw.map(p => {
            const numericId = Number(p.id);
            if (Number.isFinite(numericId) && numericId > 0) {
              return listingsApi.getListingById(numericId)
                .then(listing => {
                  console.log('Premium fetch by id raw:', numericId, listing);
                  const mapped = normalizeSingle(listing);
                  console.log('Premium fetch by id mapped:', numericId, mapped);
                  return mapped;
                })
                .catch(() => null);
            }
            // Resolve by name: fetch search and pick exact case-insensitive match
            const title = (p.title || '').trim();
            if (!title) return Promise.resolve(null);
            return listingsApi.searchListings(title)
              .then(resp => {
                console.log('Premium fetch by title raw:', title, resp);
                const data = mapListingsResponse(resp);
                const exact = (data.listings || []).find(l => (l.title || '').trim().toLowerCase() === title.toLowerCase());
                console.log('Premium fetch by title mapped:', title, exact);
                return exact || null;
              })
              .catch(() => null);
          });

          const premiumResults = await Promise.allSettled(premiumPromises);
          const premiumItems = premiumResults
            .map(r => (r.status === 'fulfilled' ? r.value : null))
            .filter(it => it && (typeof it.id === 'string' || Number.isFinite(Number(it.id))))
            .map(it => ({ ...it, isPremium: true }));

          console.log('Premium resolved items:', premiumItems);

          // Track numeric premium IDs to avoid duplicates in regular feed
          premiumIds = new Set(
            premiumItems
              .map(it => Number(it.id))
              .filter(id => Number.isFinite(id) && id > 0)
          );

          allListings = premiumItems;
        }
      } catch (err) {
        console.log('Premium listings fetch failed:', err);
      }

      // Then fetch regular listings
      const response = await listingsApi.getListings({ 
        postType: 'listing', 
        postsPerPage: 20,
        page: pageNum
      });
      const data = mapListingsResponse(response);

      // Filter out premium listings from regular feed to avoid duplicates
      const regularListings = data.listings.filter(item => !premiumIds.has(Number(item.id)));
      
      // Combine premium + regular listings
      const combinedListings = [...allListings, ...regularListings];

      if (pageNum > 1) {
        // Append incrementally to keep UI responsive
        for (const item of combinedListings) {
        setItems(prev => {
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
          const ids = (combinedListings || []).map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      } else {
        // Initial set with caching
        let first = [];
        for (const item of combinedListings) {
          first.push(item);
          setItems([...first]);
          await new Promise(r => setTimeout(r, 0));
        }
        setCachedListings(CACHE_KEY_HOME, combinedListings);
        try {
          const ids = (combinedListings || []).map(x => Number(x.id)).filter(Boolean);
          await Promise.allSettled(ids.map(id => getLikesCount(id)));
        } catch (_) {}
      }
      setHasMore(data.hasMore);
      setPage(data.nextPage || pageNum + 1);

    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
      if (!hasShownNetworkToast) {
        showToast('Poor or no network connection', 'error');
        setHasShownNetworkToast(true);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || isSearching || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchListings(page);
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
          loading={loading || isLoadingMore}
          isAuthenticated={isAuthenticated}
          onNeedLogin={(action) => requireLogin && requireLogin(action)}
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



