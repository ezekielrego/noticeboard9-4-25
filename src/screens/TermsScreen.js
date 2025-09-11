import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={24} color="#0b0c10" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>Terms of Service</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: '#374151', lineHeight: 20 }}>
          Terms of Service
          {'\n\n'}
          1. Acceptance of Terms
          {'\n'}By accessing or using Noticeboard, you agree to be bound by these Terms.
          {'\n\n'}
          2. Eligibility
          {'\n'}You must be able to form a binding contract to use the service.
          {'\n\n'}
          3. User Accounts
          {'\n'}You are responsible for maintaining the confidentiality of your credentials.
          {'\n\n'}
          4. User Content
          {'\n'}You retain ownership of your content. You grant us a license to host and display it.
          {'\n\n'}
          5. Acceptable Use
          {'\n'}You agree not to misuse the service, including spam, abuse, or infringement.
          {'\n\n'}
          6. Intellectual Property
          {'\n'}All trademarks and service marks are the property of their respective owners.
          {'\n\n'}
          7. Disclaimers
          {'\n'}The service is provided "as is". We disclaim all warranties to the extent permitted by law.
          {'\n\n'}
          8. Limitation of Liability
          {'\n'}We are not liable for indirect or consequential damages.
          {'\n\n'}
          9. Termination
          {'\n'}We may suspend or terminate access if Terms are violated.
          {'\n\n'}
          10. Changes to Terms
          {'\n'}We may modify these Terms; continued use constitutes acceptance.
          {'\n\n'}
          11. Governing Law
          {'\n'}These Terms are governed by applicable laws.
          {'\n\n'}
          This consolidated text is intentionally extended to simulate multi-page content for testing long scrolling behavior and readability at a small font size within the app.
        </Text>
      </ScrollView>
    </View>
  );
}


