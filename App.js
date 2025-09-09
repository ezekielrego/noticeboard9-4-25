import React from 'react';
import { View, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPreview from './src/screens/LoginPreview';
import HomeScreen from './src/screens/HomeScreen';
import BusinessesScreen from './src/screens/BusinessesScreen';
import EventsScreen from './src/screens/EventsScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import AccountScreen from './src/screens/AccountScreen';
import AppLayout from './src/components/AppLayout';
import SlideContainer from './src/components/SlideContainer';
import { loadSession } from './src/services/auth';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  const [isSkipped, setIsSkipped] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [currentScreen, setCurrentScreen] = React.useState('main');
  const [screenParams, setScreenParams] = React.useState({});
  const [searchHandler, setSearchHandler] = React.useState(() => () => {});

  React.useEffect(() => {
    (async () => {
      const { token } = await loadSession();
      if (token) {
        setIsSkipped(true);
      }
    })();
  }, []);

  // Android back handling
  React.useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'detail' || currentScreen === 'search' || currentScreen === 'Comments') {
        goBack();
        return true;
      } else if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      } else {
        // Exit app
        BackHandler.exitApp();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen, activeTab]);

  const navigateToDetail = (params) => {
    setScreenParams(params);
    setCurrentScreen('detail');
  };

  const goBack = () => {
    setCurrentScreen('main');
    setScreenParams({});
  };

  if (!isSkipped && currentScreen !== 'register' && currentScreen !== 'verify') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <SlideContainer direction={'forward'}>
              <LoginPreview 
                onSkip={() => setIsSkipped(true)} 
                onNavigateRegister={() => setCurrentScreen('register')} 
              />
            </SlideContainer>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!isSkipped && currentScreen === 'register') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <RegisterScreen 
            navigation={{ 
              goBack: () => setCurrentScreen('main'), 
              enterApp: () => setIsSkipped(true),
              navigate: (screen, params) => { setScreenParams(params || {}); setCurrentScreen(screen); }
            }}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!isSkipped && currentScreen === 'verify') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <VerifyScreen 
            route={{ params: screenParams }}
            navigation={{
              goBack: () => setCurrentScreen('register'),
              enterApp: () => setIsSkipped(true)
            }}
          />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (currentScreen === 'detail') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <AppLayout
              activeTab={activeTab}
              onChangeTab={(tab) => { setActiveTab(tab); setCurrentScreen('main'); }}
              onSearch={(q) => {
                const qStr = (q ?? '').toString();
                setActiveTab('home');
                setCurrentScreen('search');
                setScreenParams({ query: qStr });
              }}
            >
              <SlideContainer direction={'forward'}>
                <PostDetailScreen 
                  route={{ params: screenParams }} 
                  navigation={{ 
                    goBack,
                    navigate: (screen, params) => { setScreenParams(params || {}); setCurrentScreen(screen); }
                  }} 
                />
              </SlideContainer>
            </AppLayout>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (currentScreen === 'search') {
    const SearchScreen = require('./src/screens/SearchScreen').default;
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <AppLayout
              activeTab={activeTab}
              onChangeTab={(tab) => { setActiveTab(tab); setCurrentScreen('main'); }}
              onSearch={(q) => {
                const qStr = (q ?? '').toString();
                setActiveTab('home');
                setCurrentScreen('search');
                setScreenParams({ query: qStr });
              }}
            >
              <SlideContainer direction={'forward'}>
                <SearchScreen 
                  route={{ params: screenParams }} 
                  navigation={{ navigate: navigateToDetail, goBack }} 
                />
              </SlideContainer>
            </AppLayout>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (currentScreen === 'Comments') {
    const CommentsScreen = require('./src/screens/CommentsScreen').default;
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }}>
            <AppLayout
              activeTab={activeTab}
              onChangeTab={(tab) => { setActiveTab(tab); setCurrentScreen('main'); }}
              onSearch={(q) => {
                const qStr = (q ?? '').toString();
                setActiveTab('home');
                setCurrentScreen('search');
                setScreenParams({ query: qStr });
              }}
            >
              <SlideContainer direction={'forward'}>
                <CommentsScreen 
                  route={{ params: screenParams }} 
                  navigation={{ navigate: navigateToDetail, goBack }} 
                />
              </SlideContainer>
            </AppLayout>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <AppLayout
            activeTab={activeTab}
            onChangeTab={(tab) => { setActiveTab(tab); }}
            onSearch={(q) => {
              const qStr = (q ?? '').toString();
              setActiveTab('home');
              setCurrentScreen('search');
              setScreenParams({ query: qStr });
            }}
          >
            <SlideContainer direction={'forward'}>
              {activeTab === 'home' && (
                <HomeScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') {
                        navigateToDetail(params);
                      } else if (screen === 'Comments') {
                        setScreenParams(params || {});
                        setCurrentScreen('Comments');
                      } else {
                        setScreenParams(params || {});
                        setCurrentScreen(screen);
                      }
                    }
                  }}
                  onSearch={setSearchHandler}
                />
              )}
              {activeTab === 'businesses' && (
                <BusinessesScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') navigateToDetail(params);
                      else if (screen === 'Comments') { setScreenParams(params || {}); setCurrentScreen('Comments'); }
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                />
              )}
              {activeTab === 'events' && (
                <EventsScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') navigateToDetail(params);
                      else if (screen === 'Comments') { setScreenParams(params || {}); setCurrentScreen('Comments'); }
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                />
              )}
              {activeTab === 'restaurants' && (
                <RestaurantsScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') navigateToDetail(params);
                      else if (screen === 'Comments') { setScreenParams(params || {}); setCurrentScreen('Comments'); }
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                />
              )}
              {activeTab === 'account' && (
                <AccountScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') navigateToDetail(params);
                      else if (screen === 'Comments') { setScreenParams(params || {}); setCurrentScreen('Comments'); }
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                />
              )}
            </SlideContainer>
          </AppLayout>
        </View>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}