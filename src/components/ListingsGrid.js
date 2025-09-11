import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ListingCard from './ListingCard';

const chunkIntoRows = (items, columns = 2) => {
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
};

const ListingsGrid = memo(({ title, data, onPressItem, onLikePress, onLoadMore, hasMore, loading, isAuthenticated, onNeedLogin }) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setDisplayedItems(Array.isArray(data) ? data.filter(Boolean) : []);
  }, [data]);

  const handleEndReached = async () => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      try { await onLoadMore(); } finally { setIsLoadingMore(false); }
    }
  };

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: '50%', paddingHorizontal: 4, marginBottom: 12 }}>
      <ListingCard 
        item={item} 
        onPress={onPressItem} 
        onLikePress={onLikePress}
        isAuthenticated={isAuthenticated}
        onNeedLogin={onNeedLogin}
      />
    </View>
  ), [onPressItem, onLikePress, isAuthenticated, onNeedLogin]);

  const keyExtractor = useCallback((item, index) => `${item?.id ?? 'i'}-${index}`, []);

  // Convert to 2-column layout via numColumns
  return (
    <View style={{ marginTop: 0 }}>
      {!!title && (
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 12, marginBottom: 8 }}>{title}</Text>
      )}
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: Math.max(48, 28 + insets.bottom + 12) }}
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        onEndReachedThreshold={0.4}
        onEndReached={handleEndReached}
        ListFooterComponent={(
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            {hasMore && (isLoadingMore || loading) ? (
              <ActivityIndicator size="small" color="#0b0c10" />
            ) : null}
          </View>
        )}
      />
    </View>
  );
});

export default ListingsGrid;
