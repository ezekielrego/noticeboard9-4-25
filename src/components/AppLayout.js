import React, { useState } from 'react';
import { View } from 'react-native';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';

export default function AppLayout({ activeTab, onChangeTab, children, onSearch, hideTopBar, onOpenNotifications, notificationsCount }) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  
  const handleCancelSearch = () => {
    setIsSearching(false);
    setQuery('');
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      {!hideTopBar && (
        <TopBar
          onPressSearch={() => setIsSearching(true)}
          isSearching={isSearching}
          query={query}
          onChangeQuery={setQuery}
          onSubmitQuery={() => { onSearch && onSearch(query); setIsSearching(false); }}
          onCancelSearch={handleCancelSearch}
          onPressNotifications={onOpenNotifications}
          notificationsCount={notificationsCount}
        />
      )}
      <View style={{ flex: 1 }}>
        {children}
      </View>
      <BottomTabs current={activeTab} onChange={onChangeTab} />
    </View>
  );
}


