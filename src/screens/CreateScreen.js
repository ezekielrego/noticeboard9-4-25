import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, Linking, ScrollView } from 'react-native';

export default function CreateScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const scrollRef = useRef(null);
  const screen = Dimensions.get('window');
  const availableHeight = Math.max(320, Math.floor(screen.height * 0.75));

  // Compute intrinsic aspect ratios for flyers so we can size responsively
  const flyer1 = Image.resolveAssetSource(require('../../assets/flyer1.png'));
  const flyer2 = Image.resolveAssetSource(require('../../assets/flyer2.png'));
  const flyer1AspectRatio = flyer1 && flyer1.width && flyer1.height ? flyer1.width / flyer1.height : 1.6;
  const flyer2AspectRatio = flyer2 && flyer2.width && flyer2.height ? flyer2.width / flyer2.height : 1.6;
  const goToStep = (nextStep) => {
    const clamped = Math.max(1, Math.min(totalSteps, nextStep));
    setStep(clamped);
    try {
      const width = Dimensions.get('window').width;
      scrollRef.current && scrollRef.current.scrollTo({ x: (clamped - 1) * width, animated: true });
    } catch (_) {}
  };
  const goNext = () => goToStep(step + 1);
  const goPrev = () => goToStep(step - 1);

  const openWeb = () => {
    navigation?.navigate?.('WebView', { url: 'https://noticeboard.co.zw' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {step > 1 ? (
            <TouchableOpacity onPress={goPrev} style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
              <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 48 }} />
          )}
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0b0c10' }}>Create</Text>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} style={{ paddingVertical: 8, paddingHorizontal: 8 }}>
            <Text style={{ color: '#6b7280', fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const width = Dimensions.get('window').width;
            const idx = Math.round(e.nativeEvent.contentOffset.x / width) + 1;
            setStep(idx);
          }}
          contentContainerStyle={{ alignItems: 'stretch' }}
        >
          <View style={{ width: Dimensions.get('window').width, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', maxHeight: availableHeight, aspectRatio: flyer1AspectRatio, backgroundColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <Image source={require('../../assets/flyer1.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </View>
          </View>
          <View style={{ width: Dimensions.get('window').width, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '100%', maxHeight: availableHeight, aspectRatio: flyer2AspectRatio, backgroundColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <Image source={require('../../assets/flyer2.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </View>
          </View>
          <View style={{ width: Dimensions.get('window').width, height: '100%' }}>
            <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <View
              style={{
                width: '100%',
                borderRadius: 16,
                padding: 16,
                backgroundColor: '#111827',
                borderWidth: 2,
                borderColor: '#f59e0b',
                shadowColor: '#f59e0b',
                shadowOpacity: 0.6,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 }
              }}
            >
              <Text style={{ color: '#f59e0b', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>Premium Package</Text>
              <Text style={{ color: '#fde68a', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>From as low as $15</Text>
              <View style={{ height: 1, backgroundColor: '#f59e0b', opacity: 0.4, marginBottom: 12 }} />
              <View style={{ marginBottom: 16 }}>
                <View style={{ gap: 6 }}>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Over 50,000 appearances across all platforms</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Sponsored boosts for maximum reach</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Priority placement across categories</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Content optimization by our team</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Verified badge for credibility</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '700', textAlign: 'center', fontSize: 13 }}>• Dedicated support</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('https://wa.me/263776680845')}
                  style={{ flex: 1, backgroundColor: '#065f46', paddingVertical: 10, borderRadius: 10, marginRight: 6, alignItems: 'center' }}
                >
                  <Text style={{ color: '#d1fae5', fontWeight: '800' }}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('mailto:info@noticeboard.co.zw,app@noticeboard.co.zw?subject=Premium%20Package&body=I%20am%20interested%20in%20the%20Premium%20Package')}
                  style={{ flex: 1, backgroundColor: '#1f2937', paddingVertical: 10, borderRadius: 10, marginHorizontal: 6, alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' }}
                >
                  <Text style={{ color: '#f59e0b', fontWeight: '800' }}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('tel:+263789910444')}
                  style={{ flex: 1, backgroundColor: '#92400e', paddingVertical: 10, borderRadius: 10, marginLeft: 6, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fef3c7', fontWeight: '800' }}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                borderRadius: 16,
                padding: 16,
                backgroundColor: '#f9fafb',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                marginTop: 16
              }}
            >
              <Text style={{ color: '#111827', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>Free Package</Text>
              <Text style={{ color: '#6b7280', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>Basic option with limitations</Text>
              <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 }} />
              <View style={{ gap: 6 }}>
                <Text style={{ color: '#374151', textAlign: 'center', fontSize: 13 }}>• Limited days visibility</Text>
                <Text style={{ color: '#374151', textAlign: 'center', fontSize: 13 }}>• Poor engagement expected</Text>
                <Text style={{ color: '#374151', textAlign: 'center', fontSize: 13 }}>• No sponsorship boost</Text>
                <Text style={{ color: '#374151', textAlign: 'center', fontSize: 13 }}>• No verified tags</Text>
                <Text style={{ color: '#374151', textAlign: 'center', fontSize: 13 }}>• Standard placement</Text>
              </View>
            </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          {[1,2,3].map(i => (
            <View key={i} style={{ width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, backgroundColor: step === i ? '#0b0c10' : '#e5e7eb' }} />
          ))}
        </View>
        {step < totalSteps ? (
          <TouchableOpacity onPress={goNext} activeOpacity={0.8}>
            <View style={{ backgroundColor: '#0b0c10', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Next</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={openWeb} activeOpacity={0.8}>
            <View style={{ backgroundColor: '#0b0c10', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Open Create</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
