import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import FormFirstLogin from '../../legacy/app/components/dumbs/FormFirstLogin';
import ErrorToast from '../components/ErrorToast';
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(username).toLowerCase())) {
        setError('Please enter a valid email address');
        return;
      }
      const res = await signupWithPassword({ email: username, password });
      if (res.status === 'success') {
        navigation.navigate && navigation.navigate('verify', { email: username });
      } else {
        const msg = res.message || res.msg || '';
        if (/exist/i.test(msg)) setError('This email is already registered');
        else if (/weak/i.test(msg) || /password/i.test(msg)) setError('Please choose a stronger password');
        else if (!msg) setError('Registration failed. Please try again.');
        else setError(msg);
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ErrorToast visible={!!error} message={error || ''} type="error" onHide={() => setError('')} />
      <FormFirstLogin
        navigation={{ navigate: () => {} }}
        onLogin={handleRegister}
        onForgotPassword={() => {}}
        onNavigateLostPassword={() => navigation.goBack && navigation.goBack()}
        onNavigateRegister={() => {}}
        onSkip={() => navigation.enterApp && navigation.enterApp()}
        onClickGetOtp={undefined}
        colorPrimary="transparent"
        translations={{
          username: 'Email',
          password: 'Password',
          login: loading ? 'Please wait…' : 'Create account',
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


