import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import ListingsGrid from '../components/ListingsGrid';
import { listingsApi } from '../services/api';
import { mapListingsResponse } from '../utils/dataMapper';

export default function SearchScreen({ route, navigation }) {
  const initialQuery = (route?.params?.query ?? '').toString();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const runSearch = useCallback(async (q) => {
    const qStr = (q ?? '').toString();
    setQuery(qStr);
    if (!qStr.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Smart search:
      // 1) Normalize & remove stopwords for keyword
      const stopwords = new Set(['the','a','an','in','on','of','at','by','for','to','and','or','with','from']);
      const tokens = qStr
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .filter(w => !stopwords.has(w));
      const keyword = (tokens.join(' ') || qStr).trim();

      // 2) Detect category + location + descriptive intent
      const categoryAliases = {
        restaurant: 'restaurant', restaurants: 'restaurant', food: 'restaurant',
        business: 'listing', businesses: 'listing', company: 'listing', companies: 'listing',
        event: 'event', events: 'event'
      };
      const knownLocations = new Set([
        'harare','mutare','bulawayo','gweru','masvingo','kwekwe','chitungwiza','ruwa','epworth','bindura',
        'marondera','beatrice','chinhoyi','victoria','victoriafalls','falls','hwange','kadoma','gwanda','chipinge'
      ]);
      let postType = undefined;
      let location = undefined;
      const descTokens = [];
      for (const t of tokens) {
        if (!postType && categoryAliases[t]) { postType = categoryAliases[t]; continue; }
        if (!location && (knownLocations.has(t) || t.endsWith('zim'))) { location = t; continue; }
        descTokens.push(t);
      }
      const categoryOnly = postType && (!location && descTokens.length === 0);
      const probableLocation = location || (tokens.length === 1 ? tokens[0] : null);

      const params = { ...(postType ? { postType } : {}), postsPerPage: 50 };

      // Build attempts
      const attemptCalls = [];
      // Category-only: fetch recent of that type even without keyword
      if (categoryOnly) {
        attemptCalls.push(listingsApi.getListings({ postType, postsPerPage: 50, page: 1 }));
      }
      // Primary searches
      attemptCalls.push(listingsApi.searchListings(keyword, params));
      if (tokens.length) {
        attemptCalls.push(listingsApi.searchListings(qStr, params));
      }
      // Single-token forms: try singular/plural variants explicitly (case-insensitive)
      if (tokens.length === 1) {
        const term = tokens[0];
        const singular = term.endsWith('s') ? term.slice(0, -1) : term;
        const forms = Array.from(new Set([term, singular, `${singular}s`]));
        for (const f of forms) {
          attemptCalls.push(listingsApi.searchListings(f, params));
        }
      }
      // Location attempts
      if (probableLocation) {
        const locParam = probableLocation;
        const locCapitalized = locParam[0].toUpperCase() + locParam.slice(1);
        attemptCalls.push(listingsApi.getListings({ listing_location: locParam, postsPerPage: 50, page: 1 }));
        attemptCalls.push(listingsApi.getListings({ listing_location: locCapitalized, postsPerPage: 50, page: 1 }));
        // Combined category+location
        if (postType) {
          attemptCalls.push(listingsApi.getListings({ postType, listing_location: locParam, postsPerPage: 50, page: 1 }));
        }
      }
      // Descriptive-only broad search if we have descriptive tokens
      if (!categoryOnly && descTokens.length) {
        const descQuery = descTokens.join(' ');
        attemptCalls.push(listingsApi.searchListings(descQuery, params));
      }

      const pages = await Promise.allSettled(attemptCalls);
      let merged = [];
      for (const p of pages) {
        if (p.status === 'fulfilled') {
          const mapped = mapListingsResponse(p.value).listings || [];
          merged.push(...mapped);
        }
      }

      // Deduplicate by id
      const seen = new Set();
      let listings = merged.filter(it => {
        const key = String(it.id || '');
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Single-word precision boost: if the single term appears in title/location/subtitle,
      // rank it near 1.0. Handle simple plural/singular (lodge/lodges, restaurant/restaurants).
      if (tokens.length === 1) {
        const term = tokens[0];
        const singular = term.endsWith('s') ? term.slice(0, -1) : term;
        const forms = new Set([term, singular, `${singular}s`]);

        const wordIn = (text) => {
          const t = (text || '').toLowerCase();
          const parts = t.split(/[^a-z0-9]+/).filter(Boolean);
          const set = new Set(parts);
          for (const f of forms) if (set.has(f)) return true;
          return false;
        };

        const substrIn = (text) => (text || '').toLowerCase().includes(singular);

        const scored = listings
          .map(it => {
            const title = it.title || '';
            const sub = it.subtitle || '';
            const loc = it.location || '';
            let s = 0;
            if (wordIn(title)) s = Math.max(s, 0.98);
            if (wordIn(loc)) s = Math.max(s, 0.95);
            if (wordIn(sub)) s = Math.max(s, 0.9);
            if (s === 0) {
              if (substrIn(title)) s = Math.max(s, 0.9);
              if (substrIn(loc)) s = Math.max(s, 0.85);
              if (substrIn(sub)) s = Math.max(s, 0.8);
            }
            return { it, s };
          })
          .filter(x => x.s >= 0.5)
          .sort((a, b) => b.s - a.s)
          .map(x => x.it);

        if (scored.length) {
          listings = scored;
        }
      }

      // 4) If still empty, fetch recent across types and run local similarity
      if (listings.length === 0) {
        const types = ['listing', 'restaurant', 'event'];
        const pageCalls = [];
        for (const t of types) {
          for (let p = 1; p <= 5; p += 1) {
            pageCalls.push(listingsApi.getListings({ postType: t, postsPerPage: 50, page: p }));
          }
        }
        const pages2 = await Promise.all(pageCalls);
        const merged2 = [];
        for (const p of pages2) {
          const mapped = mapListingsResponse(p).listings || [];
          merged2.push(...mapped);
        }
        // Deduplicate by id
        const seen2 = new Set();
        const candidates = merged2.filter(it => {
          const key = String(it.id || '');
          if (!key || seen2.has(key)) return false;
          seen2.add(key);
          return true;
        });

        // Similarity scoring (token overlap + substring boost)
        const qTokens = tokens.length ? tokens : qStr.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        const scoreOf = (item) => {
          const hayRaw = `${item.title || ''} ${item.subtitle || ''} ${item.location || ''}`.toLowerCase();
          const hayTokens = hayRaw.split(/[^a-z0-9]+/).filter(Boolean);
          const haySet = new Set(hayTokens);
          let overlap = 0;
          for (const t of qTokens) { if (haySet.has(t)) overlap += 1; }
          let base = qTokens.length ? overlap / qTokens.length : 0;
          const substrBoost = hayRaw.includes(qStr.toLowerCase()) ? 0.3 : 0;
          const locBoost = location && haySet.has(location) ? 0.2 : 0;
          const catBoost = postType && ((postType === 'restaurant' && /restaurant|food|eatery/.test(hayRaw)) || (postType === 'event' && /event/.test(hayRaw))) ? 0.1 : 0;
          return Math.min(1, base + substrBoost + locBoost + catBoost);
        };

        const scored = candidates
          .map(it => ({ it, s: scoreOf(it) }))
          .filter(x => x.s >= 0.15) // allow more lenient threshold
          .sort((a, b) => b.s - a.s)
          .slice(0, 50)
          .map(x => x.it);

        listings = scored;
      }

      setResults(listings);
    } catch (e) {
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleItemPress = (item) => {
    navigation.navigate('PostDetail', { listingId: item.id, listing: item });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0b0c10" />
          <Text style={{ marginTop: 10, color: '#6b7280' }}>Searching...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ef4444' }}>{error}</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>No results found</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>Try a different keyword</Text>
        </View>
      ) : (
        <ListingsGrid
          title={`Results for "${query}"`}
          data={results}
          onPressItem={handleItemPress}
          onLikePress={() => {}}
          hasMore={false}
          loading={false}
        />
      )}
    </View>
  );
}


