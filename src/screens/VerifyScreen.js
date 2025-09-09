import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, ImageBackground } from 'react-native';
import { verifySignupCode } from '../services/auth';

export default function VerifyScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onVerify = async () => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await verifySignupCode({ email, code: code.trim() });
      if (res.status === 'success') {
        navigation.enterApp && navigation.enterApp();
      } else {
        setError(res.message || 'Invalid code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/splash-icon.png')} resizeMode="cover" style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 16, paddingTop: 48 }}>
        {!!error && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(239,68,68,0.9)', zIndex: 10 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>{error}</Text>
          </View>
        )}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image source={require('../../assets/icon.png')} style={{ width: 72, height: 72, borderRadius: 16 }} />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 12 }}>Verify Email</Text>
          <Text style={{ color: '#ddd', marginTop: 6, textAlign: 'center' }}>We sent a 6‑digit code to {email}</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ color: '#ddd', marginBottom: 6 }}>Verification code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor="#bbb"
            keyboardType="number-pad"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8 }}
          />
        </View>

        <TouchableOpacity onPress={onVerify} disabled={loading || !code.trim()} style={{ backgroundColor: loading || !code.trim() ? 'rgba(255,255,255,0.2)' : '#ff4d4f', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Verify</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack && navigation.goBack()} style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ color: '#ddd' }}>Back</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
