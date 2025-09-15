import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ErrorToast from '../components/ErrorToast';
import { listNotifications, markNotificationsViewed, getTrendingNotifications, listingsApi } from '../services/api';
import { getComments, getLikesCount } from '../services/social';

export default function NotificationsScreen({ navigation, onViewedAll }) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [titleCache, setTitleCache] = useState({}); // { [listingId]: title }
  const [countsCache, setCountsCache] = useState({}); // { [listingId]: { comments, likes, ratings } }

  const extractTitle = (detail, fallback = '') => {
    try {
      return (
        detail?.header?.post_title ||
        detail?.postTitle ||
        detail?.title ||
        fallback || ''
      );
    } catch (_) { return fallback || ''; }
  };

  const resolveListingTitles = async (ids) => {
    const unique = Array.from(new Set(ids.filter(id => id != null)));
    const limited = unique.slice(0, 15);
    if (limited.length === 0) return {};
    try {
      const results = await Promise.allSettled(limited.map(async (id) => {
        try {
          const res = await listingsApi.getListingDetail(Number(id));
          const detail = res?.oResults || res;
          const title = extractTitle(detail, '');
          return { id, title };
        } catch (e) {
          return { id, title: '' };
        }
      }));
      const map = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          const { id, title } = r.value;
          if (title) map[id] = title;
        }
      });
      if (Object.keys(map).length) setTitleCache(prev => ({ ...prev, ...map }));
      console.debug('NotificationsScreen resolved titles:', { count: Object.keys(map).length, sample: Object.entries(map).slice(0, 5) });
      return map;
    } catch (e) {
      console.debug('NotificationsScreen resolve titles failed:', e?.message || e);
      return {};
    }
  };

  const resolveCounts = async (itemsList) => {
    const ids = Array.from(new Set(itemsList.map(n => n.listingId).filter(Boolean)));
    const toFetch = ids.filter(id => !countsCache[id]);
    if (!toFetch.length) return;
    try {
      const results = await Promise.allSettled(toFetch.map(async (id) => {
        const out = { id, comments: 0, likes: 0 };
        try {
          const { comments } = await getComments(Number(id), null, 1);
          out.comments = Array.isArray(comments) ? comments.length : 0;
        } catch (_) {}
        try {
          const likes = await getLikesCount(Number(id));
          out.likes = Number(likes) || 0;
        } catch (_) {}
        return out;
      }));
      const map = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          map[r.value.id] = { comments: r.value.comments, likes: r.value.likes };
        }
      });
      if (Object.keys(map).length) setCountsCache(prev => ({ ...prev, ...map }));
    } catch (e) {}
  };

  const formatPlus = (n) => `${Number(n)}+`;

  const load = async () => {
    try {
      const [res, trending] = await Promise.all([listNotifications(), getTrendingNotifications().catch((e) => { console.debug('getTrendingNotifications error:', e?.message || e); return null; })]);
      console.debug('NotificationsScreen load() raw:', { res, trending });

      let base = [];
      if (res.status === 'success') base = res.data || [];
      const trendRows = Array.isArray(trending?.data) ? trending.data : [];
      console.debug('NotificationsScreen processed:', { baseCount: base.length, trendCount: trendRows.length, baseSample: base.slice(0, 3), trendSample: trendRows.slice(0, 3) });

      const trendAsNotifs = trendRows.map(r => ({
        id: `t-${r.listingId}`,
        type: 'listing_trending',
        title: 'Trending listing',
        body: '',
        listingId: r.listingId,
        viewed: false,
        time: new Date().toISOString(),
        listingTitle: r.title || '',
        likes: r.likes || 0,
        ratings: r.ratings || 0,
        comments: r.comments || 0,
      }));

      // Do not deduplicate; show all notifications in order with trending first, then backend notifications (already ordered by newest first)
      const combined = [...trendAsNotifs, ...base];
      console.debug('NotificationsScreen combined:', { combinedCount: combined.length, combinedSample: combined.slice(0, 5) });
      setItems(combined);

      // Resolve listing titles for items that have a listingId (best-effort, cached)
      const idsNeedingTitle = combined
        .filter(n => n.listingId != null && !titleCache[String(n.listingId)] && !titleCache[Number(n.listingId)])
        .map(n => n.listingId);
      const newlyResolved = await resolveListingTitles(idsNeedingTitle);
      if (Object.keys(newlyResolved).length) {
        setItems(prev => prev.map(n => {
          const lid = n.listingId != null ? Number(n.listingId) : null;
          const t = lid != null ? (newlyResolved[lid] || titleCache[lid] || titleCache[String(lid)]) : '';
          return t ? { ...n, listingTitle: t } : n;
        }));
      }

      // Resolve counts for discussions and likes fallback
      await resolveCounts(combined);

      // Auto-mark backend notifications as viewed upon opening (exclude synthetic trending with id starting with 't-')
      const idsToMark = base.filter(n => !n.viewed && (typeof n.id === 'number' || (typeof n.id === 'string' && !String(n.id).startsWith('t-')))).map(n => n.id).filter(Boolean);
      console.debug('NotificationsScreen mark on open:', { idsCount: idsToMark.length, idsSample: idsToMark.slice(0, 10) });
      if (idsToMark.length) {
        try {
          await markNotificationsViewed(idsToMark);
          console.debug('NotificationsScreen mark on open: success');
          onViewedAll && onViewedAll();
        } catch (e) { console.debug('NotificationsScreen mark on open: failed', e?.message || e); }
      }
    } catch (e) {
      console.debug('NotificationsScreen load() failed:', e?.message || e);
      setError('Failed to load notifications');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = async (item) => {
    try {
      // Individually mark if this is a backend notification and not yet viewed
      const isBackend = item && item.id && (typeof item.id === 'number' || (typeof item.id === 'string' && !String(item.id).startsWith('t-')));
      console.debug('NotificationsScreen open item:', { id: item?.id, type: item?.type, listingId: item?.listingId, isBackend, viewed: item?.viewed });
      if (isBackend && !item.viewed) {
        await markNotificationsViewed([item.id]);
        console.debug('NotificationsScreen mark on open item: success', item.id);
      }
    } catch (e) { console.debug('NotificationsScreen mark on open item: failed', e?.message || e); }
    if (item.listingId != null) {
      const lid = Number(item.listingId);
      if (!Number.isNaN(lid)) {
        navigation.navigate('PostDetail', { listingId: lid });
      }
    }
  };

  const markAllViewed = async () => {
    try {
      const ids = items
        .filter(n => !n.viewed && (typeof n.id === 'number' || (typeof n.id === 'string' && !String(n.id).startsWith('t-'))))
        .map(n => n.id)
        .filter(Boolean);
      console.debug('NotificationsScreen markAllViewed:', { idsCount: ids.length, idsSample: ids.slice(0, 10) });
      if (ids.length) await markNotificationsViewed(ids);
      onViewedAll && onViewedAll();
      await load();
    } catch (e) { console.debug('NotificationsScreen markAllViewed failed:', e?.message || e); }
  };

  const getTypeBadge = (type) => {
    if (type === 'listing_trending') return { text: 'Trending', color: '#b91c1c', bg: '#fee2e2' };
    if (type === 'listing_discussion') return { text: 'Discussion', color: '#1d4ed8', bg: '#dbeafe' };
    if (type === 'new_listing') return { text: 'New', color: '#065f46', bg: '#d1fae5' };
    return { text: 'Notification', color: '#6b7280', bg: '#f3f4f6' };
  };

  const renderItem = ({ item }) => {
    const mainTitle = item.listingTitle || item.title || 'Notification';
    const badge = getTypeBadge(item.type);
    const lid = item.listingId;
    const fallbackLikes = countsCache[lid]?.likes || 0;
    const fallbackComments = countsCache[lid]?.comments || 0;
    const likesVal = (item.likes || 0) > 0 ? item.likes : fallbackLikes;
    const commentsVal = (item.comments || 0) > 0 ? item.comments : fallbackComments;
    const subParts = [];
    if (item.type === 'listing_discussion') {
      if (commentsVal > 0) subParts.push(`${formatPlus(commentsVal)} comments`);
      if (likesVal > 0) subParts.push(`${formatPlus(likesVal)} likes`);
    }
    if (item.type === 'listing_trending') {
      if (likesVal > 0) subParts.push(`${formatPlus(likesVal)} likes`);
      if ((item.ratings || 0) > 0) subParts.push(`${formatPlus(item.ratings)} ratings`);
      if (commentsVal > 0) subParts.push(`${formatPlus(commentsVal)} comments`);
    }
    const subText = subParts.length ? subParts.join(' · ') : (item.listingTitle ? (item.title ? (item.body ? `${item.title} · ${item.body}` : item.title) : item.body) : item.body);
    const unread = !item.viewed;
    const rowBg = unread ? '#f8fafc' : '#ffffff';
    const titleColor = unread ? '#0b0c10' : '#111827';
    const iconColor = unread ? '#0b0c10' : '#64748b';

    return (
      <TouchableOpacity onPress={() => handleOpen(item)} style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: rowBg, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name={item.type === 'listing_trending' ? 'flame-outline' : 'chatbubbles-outline'} size={18} color={iconColor} />
            <Text numberOfLines={1} style={{ marginLeft: 8, color: titleColor, fontWeight: unread ? '700' : '500', flex: 1 }}>{mainTitle}</Text>
          </View>
          <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: badge.color, fontSize: 12, fontWeight: '700' }}>{badge.text}</Text>
          </View>
        </View>
        {!!subText && <Text style={{ color: '#334155', marginTop: 4 }}>{subText}</Text>}
        {!!item.time && <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{item.time}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={24} color="#0b0c10" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>Notifications</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0b0c10" />
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eef2f7' }}>
            <TouchableOpacity onPress={markAllViewed}>
              <Text style={{ color: '#1f2937', fontWeight: '600' }}>Mark all as viewed</Text>
            </TouchableOpacity>
          </View>
          <FlatList data={items} keyExtractor={(it, idx) => `${it.id ?? 'n'}-${idx}`} renderItem={renderItem} />
        </>
      )}
      <ErrorToast visible={!!error} message={error} type="error" onHide={() => setError('')} />
    </View>
  );
}


