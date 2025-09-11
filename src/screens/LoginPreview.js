import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ErrorToast from '../components/ErrorToast';
import FormFirstLogin from '../../legacy/app/components/dumbs/FormFirstLogin';
import { loginWithPassword } from '../services/auth';

export default function LoginPreview({ onSkip, onNavigateRegister }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async ({ username, password }) => {
    if (!username || !password) return;
    try {
      setLoading(true);
      setError('');
      // Basic email format check if input looks like an email
      const looksLikeEmail = /@/.test(String(username));
      if (looksLikeEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(username).toLowerCase())) {
          setError('Please enter a valid email address');
          return;
        }
      }
      const res = await loginWithPassword({ username, password });
      if (res.status === 'success') {
        onSkip && onSkip();
      } else {
        const msg = res.message || res.msg || '';
        if (/invalid/i.test(msg) || /credential/i.test(msg)) setError('Invalid email or password');
        else if (/not found/i.test(msg) || /user/i.test(msg)) setError('Account not found');
        else if (!msg) setError('Login failed. Please try again.');
        else setError(msg);
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNavigate = async () => {
    onNavigateRegister && onNavigateRegister();
  };

  return (
    <View style={{ flex: 1 }}>
      <ErrorToast visible={!!error} message={error || ''} type="error" onHide={() => setError('')} />
      <FormFirstLogin
        navigation={{ navigate: () => {} }}
        onLogin={handleLogin}
        onForgotPassword={() => {}}
        onNavigateRegister={handleRegisterNavigate}
        onSkip={onSkip}
        onClickGetOtp={undefined}
        colorPrimary="transparent"
        translations={{
          username: 'Email or Username',
          password: 'Password',
          login: loading ? 'Please wait…' : 'Log in',
          register: 'Register',
          lostPassword: '',
          getOtp: '',
          pleseInputUserName: 'Please input username',
        }}
        settings={{ isAllowRegistering: 'no' }}
        isLoginLoading={loading}
        renderBottom={() => (
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity onPress={() => {}}>
                <Text style={{ color: '#fff' }}>Lost password?</Text>
              </TouchableOpacity>
              <Text style={{ color: '#fff', marginHorizontal: 6 }}>|</Text>
              <TouchableOpacity onPress={handleRegisterNavigate}>
                <Text style={{ color: '#fff' }}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}


