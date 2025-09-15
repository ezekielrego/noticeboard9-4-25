import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getActiveAds } from '../services/social';

export default function AdsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState([]);
  const [config, setConfig] = useState({ switchSeconds: 8, exitDelaySeconds: 3, ctaDefaultText: 'Learn more' });
  const [index, setIndex] = useState(0);
  const [exitTimer, setExitTimer] = useState(0);
  const switchRef = useRef(null);
  const exitRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveAds();
        setEnabled(Boolean(data.enabled));
        setItems(Array.isArray(data.items) ? data.items : []);
        setConfig({
          switchSeconds: Number(data?.config?.switchSeconds) || 8,
          exitDelaySeconds: Number(data?.config?.exitDelaySeconds) || 3,
          ctaDefaultText: data?.config?.ctaDefaultText || 'Learn more',
        });
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!enabled || items.length === 0) return;
    // Setup exit delay timer for current ad
    setExitTimer(config.exitDelaySeconds);
    clearInterval(exitRef.current);
    exitRef.current = setInterval(() => {
      setExitTimer(prev => {
        if (prev <= 1) { clearInterval(exitRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    // Setup auto switch timer
    clearInterval(switchRef.current);
    switchRef.current = setInterval(() => {
      setIndex(prev => (prev + 1) % items.length);
    }, Math.max(2, config.switchSeconds) * 1000);
    return () => { clearInterval(switchRef.current); clearInterval(exitRef.current); };
  }, [enabled, items, index, config.switchSeconds, config.exitDelaySeconds]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!enabled || items.length === 0) {
    // Nothing to show
    navigation?.goBack?.();
    return null;
  }

  const ad = items[index] || {};

  const handleOpenCta = () => {
    const url = ad?.ctaUrl;
    if (url) {
      navigation?.navigate?.('WebView', { url, title: ad?.title || 'Ad' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Media */}
      {ad.mediaType === 'video' ? (
        <WebView source={{ uri: ad.mediaUrl }} style={{ flex: 1 }} allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} />
      ) : (
        <Image source={{ uri: ad.mediaUrl }} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover" />
      )}

      {/* Exit timer */}
      <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{exitTimer > 0 ? `Skip in ${exitTimer}s` : 'Skip'}</Text>
      </View>

      {/* CTA button */}
      <TouchableOpacity onPress={handleOpenCta} activeOpacity={0.85} style={{ position: 'absolute', bottom: 24, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="open-outline" size={18} color="#0b0c10" />
        <Text style={{ color: '#0b0c10', fontWeight: '700', marginLeft: 6 }}>{ad?.ctaText || config.ctaDefaultText}</Text>
      </TouchableOpacity>

      {/* Skip tap area */}
      <TouchableOpacity
        disabled={exitTimer > 0}
        onPress={() => navigation?.goBack?.()}
        style={{ position: 'absolute', top: 12, right: 12, width: 120, height: 40 }}
      />
    </View>
  );
}
