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
import { loadSession, ensureGuestIdentity } from './src/services/auth';
import { ThemeProvider } from './src/contexts/ThemeContext';
import CreateScreen from './src/screens/CreateScreen';
import PlacesScreen from './src/screens/PlacesScreen';
import AdsScreen from './src/screens/AdsScreen';
import { getActiveAds } from './src/services/social';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { listNotifications, getUnreadNotificationsCount } from './src/services/api';
import { Linking, AppState } from 'react-native';

export default function App() {
  const [isSkipped, setIsSkipped] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [currentScreen, setCurrentScreen] = React.useState('main');
  const [screenParams, setScreenParams] = React.useState({});
  const [searchHandler, setSearchHandler] = React.useState(() => () => {});
  const [overlayRoute, setOverlayRoute] = React.useState(null); // { name: 'PostDetail'|'Comments'|'Ads'|'WebView', params }
  const [loginPrompt, setLoginPrompt] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [notificationsCount, setNotificationsCount] = React.useState(0);

  const refreshNotificationsCount = React.useCallback(async () => {
    try {
      // Ensure guest identity headers are present for unauthenticated users
      await ensureGuestIdentity();
      // Prefer server unread count
      try {
        const cntRes = await getUnreadNotificationsCount();
        if (cntRes?.status === 'success' && typeof cntRes.count === 'number') {
          setNotificationsCount(Number(cntRes.count) || 0);
        } else {
          // Soft fallback below
        }
      } catch (_) {}
      // Fallback to client fetch
      try {
        const res = await listNotifications();
        const items = Array.isArray(res?.data) ? res.data : [];
        const unViewed = items.filter(n => !n.viewed).length;
        setNotificationsCount(prev => {
          // Take the max between API unread-count and local list heuristic
          return Math.max(Number(prev) || 0, Number(unViewed) || 0);
        });
      } catch (_) {}
    } catch (_) {}
  }, []);

  // Global ads config/state
  const [adsEnabled, setAdsEnabled] = React.useState(false);
  const [adsConfig, setAdsConfig] = React.useState({ switchSeconds: 30 });
  const [lastAdShownAt, setLastAdShownAt] = React.useState(0);

  React.useEffect(() => {
    // Handle deep links like noticeboard://listing/123
    const onUrl = ({ url }) => {
      try {
        let segments = [];
        try {
          const u = new URL(url);
          const path = (u.pathname || '').replace(/^\/+/, '');
          segments = path.split('/');
        } catch (_) {
          // Fallback simple parser: noticeboard://listing/123
          const m = url.replace(/^.*?:\/\//, '').split('/');
          segments = m.slice(1);
        }
        if (segments[0] === 'listing' && segments[1]) {
          const lid = Number(segments[1]);
          if (!Number.isNaN(lid)) setOverlayRoute({ name: 'PostDetail', params: { listingId: lid } });
        }
      } catch (_) {}
    };
    const sub = Linking.addEventListener('url', onUrl);
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) onUrl({ url: initial });
    })();
    return () => { try { sub.remove(); } catch (_) {} };
  }, []);
  React.useEffect(() => {
    (async () => {
      const { token } = await loadSession();
      setIsAuthenticated(!!token);
      // Refresh count after session/guest is fully initialized
      await refreshNotificationsCount();
    })();
  }, [isSkipped]);

  // Refresh notifications count when app returns to foreground
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshNotificationsCount();
      }
    });
    return () => { try { sub.remove(); } catch (_) {} };
  }, [refreshNotificationsCount]);

  // Fetch ads config once and whenever app starts
  React.useEffect(() => {
    (async () => {
      try {
        const data = await getActiveAds();
        setAdsEnabled(Boolean(data?.enabled));
        if (data?.config?.switchSeconds) {
          setAdsConfig({ switchSeconds: Number(data.config.switchSeconds) || 30 });
        }
        if (data?.enabled && Array.isArray(data.items) && data.items.length > 0) {
          // Optionally show first ad on cold start
          setOverlayRoute((curr) => curr ? curr : { name: 'Ads' });
        }
      } catch (_) {}
    })();
    // Also attempt a delayed refresh on app start as a fallback
    setTimeout(() => { refreshNotificationsCount(); }, 1500);
  }, []);

  // Global scheduler: trigger ads anywhere after wait time if no overlay is currently shown
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!adsEnabled) return;
      if (overlayRoute) return; // do not interrupt modals
      const waitMs = Math.max(2, Number(adsConfig.switchSeconds) || 30) * 1000;
      if (Date.now() - lastAdShownAt >= waitMs) {
        setOverlayRoute({ name: 'Ads' });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [adsEnabled, adsConfig.switchSeconds, overlayRoute, lastAdShownAt]);

  // Poll unread notifications count every 30 seconds
  React.useEffect(() => {
    const poll = setInterval(() => {
      refreshNotificationsCount();
    }, 30000);
    return () => clearInterval(poll);
  }, [refreshNotificationsCount]);

  // Back handling
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

  const openNotifications = () => {
    setOverlayRoute({ name: 'Notifications' });
    // When opening, we will mark as viewed inside screen; refresh badge after a short delay
    setTimeout(() => { refreshNotificationsCount(); }, 1000);
  };

  const goBack = () => {
    if (overlayRoute) {
      // If closing ads, record last shown time
      if (overlayRoute.name === 'Ads') {
        setLastAdShownAt(Date.now());
      }
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
              onOpenNotifications={openNotifications}
              notificationsCount={notificationsCount}
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
            onOpenNotifications={openNotifications}
            notificationsCount={notificationsCount}
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
            <Modal visible transparent animationType="slide" onRequestClose={goBack}>
              <View style={{ flex: 1, backgroundColor: overlayRoute.name === 'Ads' ? '#000' : '#ffffff' }}>
                <SlideContainer direction={'forward'}>
                  {overlayRoute.name === 'PostDetail' ? (
                    <PostDetailScreen
                      route={{ params: overlayRoute.params }}
                      navigation={{
                        goBack,
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
                          goBack,
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
                  {overlayRoute.name === 'Notifications' ? (
                    <NotificationsScreen 
                      navigation={{ 
                        goBack, 
                        navigate: (screen, params) => { 
                          if (screen === 'PostDetail') {
                            setOverlayRoute({ name: 'PostDetail', params: params || {} });
                          }
                        }
                      }} 
                      onViewedAll={() => { refreshNotificationsCount(); }}
                    />
                  ) : null}
                  {overlayRoute.name === 'Ads' ? (
                    <AdsScreen navigation={{ goBack, navigate: (screen, params) => { if (screen === 'WebView') setOverlayRoute({ name: 'WebView', params }); } }} />
                  ) : null}
                  {overlayRoute.name === 'WebView' ? (
                    <WebViewScreen route={{ params: overlayRoute.params }} navigation={{ goBack }} />
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