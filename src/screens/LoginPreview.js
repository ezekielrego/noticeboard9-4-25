import React from 'react';
import { View } from 'react-native';
import FormFirstLogin from '../../legacy/app/components/dumbs/FormFirstLogin';

export default function LoginPreview({ onSkip }) {
  return (
    <View style={{ flex: 1 }}>
      <FormFirstLogin
        navigation={{ navigate: () => {} }}
        onLogin={() => {}}
        onForgotPassword={() => {}}
        onNavigateRegister={() => {}}
        onSkip={onSkip}
        onClickGetOtp={() => {}}
        colorPrimary="#ff4d4f"
        translations={{
          username: 'Email or Username',
          password: 'Password',
          login: 'Log in',
          register: 'Register',
          lostPassword: 'Lost password?',
          getOtp: 'Get OTP',
          pleseInputUserName: 'Please input username',
        }}
        settings={{ isAllowRegistering: 'no' }}
        isLoginLoading={false}
        renderBottom={() => null}
      />
    </View>
  );
}


