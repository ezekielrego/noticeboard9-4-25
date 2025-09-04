import React from 'react';
import { View } from 'react-native';
import LoginPreview from './src/screens/LoginPreview';
import HomeScreen from './src/screens/HomeScreen';
import AppLayout from './src/components/AppLayout';
import SlideContainer from './src/components/SlideContainer';

export default function App() {
  const [isSkipped, setIsSkipped] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  return (
    <View style={{ flex: 1 }}>
      {isSkipped ? (
        <AppLayout activeTab={activeTab} onChangeTab={(tab) => { setActiveTab(tab); }}>
          <SlideContainer direction={'forward'}>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'businesses' && <View />}
            {activeTab === 'events' && <View />}
            {activeTab === 'restaurants' && <View />}
            {activeTab === 'account' && <View />}
          </SlideContainer>
        </AppLayout>
      ) : (
        <SlideContainer direction={'forward'}>
          <LoginPreview onSkip={() => setIsSkipped(true)} />
        </SlideContainer>
      )}
    </View>
  );
}
