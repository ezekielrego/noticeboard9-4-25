import React from 'react';
import { View } from 'react-native';
import LoginPreview from './src/screens/LoginPreview';
import HomeScreen from './src/screens/HomeScreen';
import BusinessesScreen from './src/screens/BusinessesScreen';
import EventsScreen from './src/screens/EventsScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
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
            {activeTab === 'businesses' && <BusinessesScreen />}
            {activeTab === 'events' && <EventsScreen />}
            {activeTab === 'restaurants' && <RestaurantsScreen />}
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
