import React from 'react';
import { View, Text } from 'react-native';
import ListingCard from './ListingCard';

const chunkIntoRows = (items, columns = 2) => {
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
};

export default function ListingsGrid({ title, data, onPressItem }) {
  const rows = chunkIntoRows(data, 2);
  return (
    <View style={{ marginTop: 12 }}>
      {!!title && (
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 12, marginBottom: 8 }}>{title}</Text>
      )}
      <View style={{ paddingHorizontal: 8 }}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', marginBottom: 12 }}>
            {row.map((item, colIndex) => (
              <View key={`${item.id || item.title}-${colIndex}`} style={{ flex: 1, paddingHorizontal: 4 }}>
                <ListingCard item={item} onPress={onPressItem} />
              </View>
            ))}
            {row.length === 1 && <View style={{ flex: 1, paddingHorizontal: 4 }} />}
          </View>
        ))}
      </View>
    </View>
  );
}


