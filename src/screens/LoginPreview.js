import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import ErrorToast from '../components/ErrorToast';
import FormFirstLogin from '../../legacy/app/components/dumbs/FormFirstLogin';
import { loginWithPassword, requestPasswordReset, resetPasswordWithCode } from '../services/auth';

export default function LoginPreview({ onSkip, onNavigateRegister }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resetVisible, setResetVisible] = React.useState(false);
  const [resetSaving, setResetSaving] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [isResetMode, setIsResetMode] = React.useState(false);

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

  const handleOpenReset = () => {
    setResetVisible(true);
    setIsResetMode(false);
    setResetCode('');
    setNewPassword('');
  };

  const handleRequestReset = async () => {
    const emailLower = String(resetEmail || '').toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLower || !emailRegex.test(emailLower)) {
      setError('Please enter a valid email to receive a code');
      return;
    }
    setResetSaving(true);
    try {
      const res = await requestPasswordReset(emailLower);
      if (res.status === 'success') {
        setIsResetMode(true);
      } else {
        setError(res.message || 'Failed to send reset code');
      }
    } catch (_) {
      setError('Network error. Please try again.');
    } finally {
      setResetSaving(false);
    }
  };

  const handleSubmitReset = async () => {
    if (!resetCode.trim() || !newPassword.trim()) { setError('Enter code and new password'); return; }
    setResetSaving(true);
    try {
      const res = await resetPasswordWithCode({ email: resetEmail, code: resetCode.trim(), newPassword });
      if (res.status === 'success') {
        setResetVisible(false);
        setIsResetMode(false);
        setResetCode('');
        setNewPassword('');
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (_) {
      setError('Network error. Please try again.');
    } finally {
      setResetSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ErrorToast visible={!!error} message={error || ''} type="error" onHide={() => setError('')} />
      <FormFirstLogin
        navigation={{ navigate: () => {} }}
        onLogin={handleLogin}
        onForgotPassword={handleOpenReset}
        onNavigateRegister={handleRegisterNavigate}
        onNavigateLostPassword={handleOpenReset}
        onSkip={onSkip}
        onClickGetOtp={undefined}
        colorPrimary="transparent"
        translations={{
          username: 'Email or Username',
          password: 'Password',
          login: loading ? 'Please wait…' : 'Log in',
          register: 'Register',
          lostPassword: 'Forgot password?',
          getOtp: '',
          pleseInputUserName: 'Please input username',
        }}
        settings={{ isAllowRegistering: 'no' }}
        isLoginLoading={loading}
        renderBottom={() => (
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              
              <Text style={{ color: '#fff', marginHorizontal: 6 }}>Or |</Text>
              <TouchableOpacity onPress={handleRegisterNavigate}>
                <Text style={{ color: '#fff' }}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={resetVisible} transparent animationType="slide" onRequestClose={() => setResetVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            {!isResetMode ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0b0c10', marginBottom: 8 }}>Reset your password</Text>
                <Text style={{ color: '#6b7280', marginBottom: 10 }}>Enter your account email and we'll send you a reset code.</Text>
                <TextInput value={resetEmail} onChangeText={setResetEmail} placeholder="you@example.com" placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
                <TouchableOpacity onPress={handleRequestReset} disabled={resetSaving} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0b0c10', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
                  {resetSaving ? <ActivityIndicator color="#0b0c10" /> : <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Send code</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setResetVisible(false)} style={{ alignSelf: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: '#6b7280' }}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0b0c10', marginBottom: 8 }}>Enter code and new password</Text>
                <TextInput value={resetCode} onChangeText={setResetCode} placeholder="123456" placeholderTextColor="#9ca3af" keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
                <TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry placeholderTextColor="#9ca3af" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
                <TouchableOpacity onPress={handleSubmitReset} disabled={resetSaving || !resetCode.trim() || !newPassword.trim()} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0b0c10', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, opacity: resetSaving || !resetCode.trim() || !newPassword.trim() ? 0.6 : 1 }}>
                  {resetSaving ? <ActivityIndicator color="#0b0c10" /> : <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Reset password</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setResetVisible(false)} style={{ alignSelf: 'center', paddingVertical: 10 }}>
                  <Text style={{ color: '#6b7280' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


