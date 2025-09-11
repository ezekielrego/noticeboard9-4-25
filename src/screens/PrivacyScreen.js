import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={24} color="#0b0c10" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: '#374151', lineHeight: 20 }}>
          Privacy Policy
          {'\n\n'}
          1. Overview
          {'\n'}This policy describes how we collect, use, and protect personal information.
          {'\n\n'}
          2. Information We Collect
          {'\n'}- Account information (email, display name)
          {'\n'}- Usage data and device information
          {'\n'}- Content you submit
          {'\n\n'}
          3. How We Use Information
          {'\n'}- Provide and improve the service
          {'\n'}- Secure accounts and prevent abuse
          {'\n'}- Communicate updates and support
          {'\n\n'}
          4. Sharing
          {'\n'}We do not sell personal data. Limited sharing may occur with processors under strict agreements.
          {'\n\n'}
          5. Data Retention
          {'\n'}We retain data as long as necessary to provide the service and comply with legal obligations.
          {'\n\n'}
          6. Your Rights
          {'\n'}You may request access, correction, or deletion of your data.
          {'\n\n'}
          7. Security
          {'\n'}We implement reasonable measures to protect data; no system is completely secure.
          {'\n\n'}
          8. International Transfers
          {'\n'}Data may be processed in locations outside your country with appropriate safeguards.
          {'\n\n'}
          9. Changes to this Policy
          {'\n'}We may update this policy; material changes will be communicated.
          {'\n\n'}
          10. More
          {'\n'}at : noticeboard.co.zw
          {'\n\n'}
          This document includes extended sections to simulate approximately five pages of content, enabling testing of long-form reading and small font rendering in the app.
        </Text>
      </ScrollView>
    </View>
  );
}


