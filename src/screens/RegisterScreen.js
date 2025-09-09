import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import FormFirstLogin from '../../legacy/app/components/dumbs/FormFirstLogin';
import { signupWithPassword } from '../services/auth';

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async ({ username, password }) => {
    if (!username || !password) return;
    try {
      setLoading(true);
      setError('');
      const res = await signupWithPassword({ email: username, password });
      if (res.status === 'success') {
        navigation.navigate && navigation.navigate('verify', { email: username });
      } else {
        setError(res.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!!error && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(239,68,68,0.9)', zIndex: 10 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
      <FormFirstLogin
        navigation={{ navigate: () => {} }}
        onLogin={handleRegister}
        onForgotPassword={() => {}}
        onNavigateLostPassword={() => navigation.goBack && navigation.goBack()}
        onNavigateRegister={() => {}}
        onSkip={() => navigation.enterApp && navigation.enterApp()}
        onClickGetOtp={undefined}
        colorPrimary="#ff4d4f"
        translations={{
          username: 'Email',
          password: 'Password',
          login: 'Create account',
          register: 'Register',
          lostPassword: 'Back',
          getOtp: '',
          pleseInputUserName: 'Please input email',
        }}
        settings={{ isAllowRegistering: 'no' }}
        isLoginLoading={loading}
        renderBottom={() => (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 8 }}>By continuing you agree to the Terms & Privacy.</Text>
        )}
      />

      {/* Verification moved to standalone screen */}
    </View>
  );
}


