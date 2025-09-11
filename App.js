import React from 'react';
import { View, BackHandler, Modal, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPreview from './src/screens/LoginPreview';
import HomeScreen from './src/screens/HomeScreen';
import BusinessesScreen from './src/screens/BusinessesScreen';
import EventsScreen from './src/screens/EventsScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import WebViewScreen from './src/screens/WebViewScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import AccountScreen from './src/screens/AccountScreen';
import AppLayout from './src/components/AppLayout';
import ErrorBoundary from './src/components/ErrorBoundary';
import SlideContainer from './src/components/SlideContainer';
import { loadSession } from './src/services/auth';
import { ThemeProvider } from './src/contexts/ThemeContext';
import CreateScreen from './src/screens/CreateScreen';
import PlacesScreen from './src/screens/PlacesScreen';

export default function App() {
  const [isSkipped, setIsSkipped] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [currentScreen, setCurrentScreen] = React.useState('main');
  const [screenParams, setScreenParams] = React.useState({});
  const [searchHandler, setSearchHandler] = React.useState(() => () => {});
  const [overlayRoute, setOverlayRoute] = React.useState(null); // { name: 'PostDetail'|'Comments', params }
  const [loginPrompt, setLoginPrompt] = React.useState(null); // { action: 'like'|'comment'|'account' }
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { token } = await loadSession();
      if (token) {
        setIsSkipped(true);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // Keep auth flag roughly in sync when returning from login/register
  React.useEffect(() => {
    (async () => {
      const { token } = await loadSession();
      setIsAuthenticated(!!token);
    })();
  }, [isSkipped]);

  // Android back handling
  React.useEffect(() => {
    const backAction = () => {
      if (overlayRoute) {
        setOverlayRoute(null);
        return true;
      }
      if (currentScreen === 'search') {
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
  }, [currentScreen, activeTab, overlayRoute]);

  const navigateToDetail = (params) => {
    setOverlayRoute({ name: 'PostDetail', params: params || {} });
  };

  const goBack = () => {
    if (overlayRoute) {
      setOverlayRoute(null);
    } else {
    setCurrentScreen('main');
    setScreenParams({});
    }
  };

  if (!isSkipped && currentScreen !== 'register' && currentScreen !== 'verify') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
          <View style={{ flex: 1 }}>
            <SlideContainer direction={'forward'}>
              <LoginPreview 
                onSkip={() => setIsSkipped(true)} 
                onNavigateRegister={() => setCurrentScreen('register')} 
              />
            </SlideContainer>
          </View>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!isSkipped && currentScreen === 'register') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
          <RegisterScreen 
            navigation={{ 
              goBack: () => setCurrentScreen('main'), 
              enterApp: () => setIsSkipped(true),
              navigate: (screen, params) => { setScreenParams(params || {}); setCurrentScreen(screen); }
            }}
          />
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  if (!isSkipped && currentScreen === 'verify') {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
          <VerifyScreen 
            route={{ params: screenParams }}
            navigation={{
              goBack: () => setCurrentScreen('register'),
              enterApp: () => setIsSkipped(true)
            }}
          />
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  // 'detail' branch removed; handled by overlay

  if (currentScreen === 'search') {
    const SearchScreen = require('./src/screens/SearchScreen').default;
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <ErrorBoundary>
          <View style={{ flex: 1 }}>
            <AppLayout
              activeTab={activeTab}
              onChangeTab={(tab) => { if (tab === 'create') { setActiveTab('create'); setCurrentScreen('main'); } else { setActiveTab(tab); setCurrentScreen('main'); } }}
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
            {!!overlayRoute && (
              <Modal visible transparent animationType="slide" onRequestClose={() => setOverlayRoute(null)}>
                <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                  <SlideContainer direction={'forward'}>
                    {overlayRoute.name === 'PostDetail' ? (
                      <PostDetailScreen
                        route={{ params: overlayRoute.params }}
                        navigation={{
                          goBack: () => setOverlayRoute(null),
                          navigate: (screen, params) => { if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} }); },
                          requireLogin: (action) => setLoginPrompt({ action })
                        }}
                      />
                    ) : null}
                    {overlayRoute.name === 'Comments' ? (
                      (() => { const CommentsScreen = require('./src/screens/CommentsScreen').default; return (
                <CommentsScreen 
                          route={{ params: overlayRoute.params }}
                          navigation={{ goBack: () => setOverlayRoute(null), navigate: (screen, params) => { if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} }); }, requireLogin: (action) => setLoginPrompt({ action }) }}
                />
                      ); })()
                    ) : null}
              </SlideContainer>
                </View>
              </Modal>
            )}
          </View>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  // 'Comments' branch removed; handled by overlay

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
        <View style={{ flex: 1 }}>
          <AppLayout
            activeTab={activeTab}
            onChangeTab={(tab) => { if (tab === 'create') { setActiveTab('create'); } else if (tab === 'webview') { setActiveTab('webview'); } else { setActiveTab(tab); } }}
            onSearch={(q) => {
              const qStr = (q ?? '').toString();
              setActiveTab('home');
              setCurrentScreen('search');
              setScreenParams({ query: qStr });
            }}
            hideTopBar={activeTab === 'webview'}
          >
            <SlideContainer direction={'forward'}>
              {activeTab === 'home' && (
                <HomeScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') {
                        setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      } else if (screen === 'Comments') {
                        setOverlayRoute({ name: 'Comments', params: params || {} });
                      } else {
                        setScreenParams(params || {});
                        setCurrentScreen(screen);
                      }
                    }
                  }}
                  onSearch={setSearchHandler}
                  requireLogin={(action) => setLoginPrompt({ action })}
                  isAuthenticated={isAuthenticated}
                />
              )}
              {activeTab === 'businesses' && (
                <BusinessesScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      else if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} });
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                  isAuthenticated={isAuthenticated}
                  onNeedLogin={(action) => setLoginPrompt({ action })}
                />
              )}
              {activeTab === 'events' && (
                <EventsScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      else if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} });
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                  isAuthenticated={isAuthenticated}
                  onNeedLogin={(action) => setLoginPrompt({ action })}
                />
              )}
              {activeTab === 'places' && (
                <PlacesScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      else if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} });
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                  isAuthenticated={isAuthenticated}
                  onNeedLogin={(action) => setLoginPrompt({ action })}
                />
              )}
              {activeTab === 'create' && (
                <CreateScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'WebView') setActiveTab('webview');
                    },
                    goBack
                  }}
                />
              )}
              {activeTab === 'webview' && (
                <WebViewScreen route={{ params: { url: 'https://noticeboard.co.zw', title: 'Noticeboard' } }} navigation={{ goBack: () => setActiveTab('create') }} />
              )}
              {activeTab === 'restaurants' && (
                <RestaurantsScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      else if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} });
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    }
                  }}
                  isAuthenticated={isAuthenticated}
                  onNeedLogin={(action) => setLoginPrompt({ action })}
                />
              )}
              {activeTab === 'account' && (
                <AccountScreen 
                  navigation={{ 
                    navigate: (screen, params) => {
                      if (screen === 'PostDetail') setOverlayRoute({ name: 'PostDetail', params: params || {} });
                      else if (screen === 'Comments') setOverlayRoute({ name: 'Comments', params: params || {} });
                      else if (screen === 'HelpSupport') setOverlayRoute({ name: 'HelpSupport', params: params || {} });
                      else if (screen === 'Terms') setOverlayRoute({ name: 'Terms', params: params || {} });
                      else if (screen === 'Privacy') setOverlayRoute({ name: 'Privacy', params: params || {} });
                      else if (screen === 'EditProfile') setOverlayRoute({ name: 'EditProfile', params: params || {} });
                      else if (screen === 'WebView') setOverlayRoute({ name: 'WebView', params: params || {} });
                      else { setScreenParams(params || {}); setCurrentScreen(screen); }
                    },
                    requireLogin: (action) => setLoginPrompt({ action })
                  }}
                />
              )}
            </SlideContainer>
          </AppLayout>

          {/* Login required modal */}
          {loginPrompt && (
            <Modal visible transparent animationType="fade" onRequestClose={() => setLoginPrompt(null)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#0b0c10', marginBottom: 8 }}>Login required</Text>
                  <Text style={{ color: '#6b7280', marginBottom: 16 }}>Please login to {loginPrompt.action === 'like' ? 'like this post' : loginPrompt.action === 'comment' ? 'comment' : 'access your account'}.</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setLoginPrompt(null)} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                      <Text style={{ color: '#6b7280' }}>Not now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setLoginPrompt(null); setIsSkipped(false); }} style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#0b0c10', borderRadius: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: '600' }}>Proceed</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

          {/* Overlay route: keeps underlying screens mounted */}
          {!!overlayRoute && (
            <Modal visible transparent animationType="slide" onRequestClose={() => setOverlayRoute(null)}>
              <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <SlideContainer direction={'forward'}>
                  {overlayRoute.name === 'PostDetail' ? (
                    <PostDetailScreen
                      route={{ params: overlayRoute.params }}
                      navigation={{
                        goBack: () => setOverlayRoute(null),
                        navigate: (screen, params) => {
                          if (screen === 'Comments') {
                            setOverlayRoute({ name: 'Comments', params: params || {} });
                          }
                        },
                        requireLogin: (action) => setLoginPrompt({ action })
                      }}
                    />
                  ) : null}
                  {overlayRoute.name === 'Comments' ? (
                    (() => { const CommentsScreen = require('./src/screens/CommentsScreen').default; return (
                      <CommentsScreen
                        route={{ params: overlayRoute.params }}
                        navigation={{
                          goBack: () => setOverlayRoute(null),
                          navigate: (screen, params) => {
                            if (screen === 'PostDetail') {
                              setOverlayRoute({ name: 'PostDetail', params: params || {} });
                            }
                          },
                          requireLogin: (action) => setLoginPrompt({ action })
                        }}
                      />
                    ); })()
                  ) : null}
                </SlideContainer>
              </View>
            </Modal>
          )}
        </View>
        </ErrorBoundary>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}