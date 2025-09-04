import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';

export default function AppLayout({ activeTab, onChangeTab, children }) {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
        <TopBar onPressSearch={() => {}} />
        <View style={{ flex: 1 }}>
          {children}
        </View>
        <BottomTabs current={activeTab} onChange={onChangeTab} />
      </View>
    </SafeAreaProvider>
  );
}


