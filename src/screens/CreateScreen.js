import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';

export default function CreateScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const goNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const goPrev = () => setStep(prev => Math.max(prev - 1, 1));

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

      <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        {step === 1 && (
          <Text style={{ color: '#0b0c10', fontSize: 16, textAlign: 'center' }}>
            Step 1: Introduction. Add your flyer or instructions here.
          </Text>
        )}
        {step === 2 && (
          <Text style={{ color: '#0b0c10', fontSize: 16, textAlign: 'center' }}>
            Step 2: Tips. Add your flyer or instructions here.
          </Text>
        )}
        {step === 3 && (
          <Text style={{ color: '#0b0c10', fontSize: 16, textAlign: 'center' }}>
            Step 3: Requirements. Add your flyer or instructions here.
          </Text>
        )}
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
