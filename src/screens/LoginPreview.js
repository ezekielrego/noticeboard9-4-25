import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      const res = await loginWithPassword({ username, password });
      if (res.status === 'success') {
        onSkip && onSkip();
      } else {
        setError(res.message || res.msg || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNavigate = async () => {
    onNavigateRegister && onNavigateRegister();
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
        onLogin={handleLogin}
        onForgotPassword={() => {}}
        onNavigateRegister={handleRegisterNavigate}
        onSkip={onSkip}
        onClickGetOtp={undefined}
        colorPrimary="#ff4d4f"
        translations={{
          username: 'Email or Username',
          password: 'Password',
          login: 'Log in',
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


