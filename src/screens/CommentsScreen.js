import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getComments, addComment } from '../services/social';

export default function CommentsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { listingId, listingTitle } = route.params || {};
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: false });
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const loadComments = async (cursor = null) => {
    if (!listingId || loading) return;
    setLoading(true);
    try {
      const { comments: newComments, nextCursor: newNextCursor } = await getComments(listingId, cursor, 20);
      setComments(cursor ? [...comments, ...newComments] : newComments);
      setNextCursor(newNextCursor);
      setHasMore(!!newNextCursor);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting || !listingId) return;
    setSubmitting(true);
    try {
      const comment = await addComment(listingId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    } catch (_) {
      // noop
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{item.user?.displayName?.[0]?.toUpperCase() || 'U'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontWeight: '600', color: '#111827', marginRight: 8 }}>{item.user?.displayName || 'Anonymous'}</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</Text>
        </View>
        <Text style={{ color: '#374151' }}>{item.text}</Text>
      </View>
    </View>
  );

  const TAB_HEIGHT = 56; // matches BottomTabs minHeight
  const HEADER_HEIGHT = 56; // our local header approx height
  const keyboardVisible = keyboardHeight > 0;
  // Lift slightly less so it hugs the keyboard/top of tabs instead of floating too high
  const baseLift = keyboardHeight - insets.bottom - TAB_HEIGHT - 114; // extra 24px damping
  const liftBy = Math.max(0, baseLift);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 48}>
      <View style={{ paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#0b0c10" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0b0c10' }}>Comments</Text>
          {!!listingTitle && <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>{listingTitle}</Text>}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: keyboardVisible ? Math.max(12, insets.bottom + 8) : insets.bottom + TAB_HEIGHT + 12 }}
        data={comments}
        keyExtractor={(it, idx) => `${it.id ?? 'c'}-${idx}`}
        renderItem={renderItem}
        onEndReached={() => hasMore && !loading && loadComments(nextCursor)}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={loading ? <View style={{ paddingVertical: 16, alignItems: 'center' }}><ActivityIndicator size="small" color="#6b7280" /></View> : null}
      />

      <View style={{ paddingBottom: Math.max(insets.bottom, 6), paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff', marginBottom: Math.max(0, liftBy - 8) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#e5e7eb' }}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor="#9ca3af"
            style={{ flex: 1, fontSize: 15, color: '#111827', maxHeight: 80, paddingVertical: 6 }}
            editable={!submitting}
            multiline
          />
          <TouchableOpacity onPress={handleSubmitComment} disabled={!newComment.trim() || submitting} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: !newComment.trim() || submitting ? '#d1d5db' : '#3b82f6', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
            {submitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="send" size={16} color="#ffffff" />}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


