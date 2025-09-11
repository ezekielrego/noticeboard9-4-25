import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={24} color="#0b0c10" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: '#374151', lineHeight: 20 }}>
          Welcome to Help & Support. This comprehensive guide provides answers and steps to resolve common issues.
          {'\n\n'}
          Getting Started
          {'\n'}1. Creating an account and logging in.
          {'\n'}2. Browsing listings and searching effectively.
          {'\n'}3. Saving favorites and interacting with posts.
          {'\n\n'}
          Troubleshooting Connectivity
          {'\n'}- Verify your internet connection.
          {'\n'}- Update the app to the latest version.
          {'\n'}- Clear cache or reinstall if issues persist.
          {'\n\n'}
          Posting and Content
          {'\n'}- How to become an author and create listings.
          {'\n'}- Guidelines for images and descriptions.
          {'\n'}- Reporting inappropriate content.
          {'\n\n'}
          Account Management
          {'\n'}- Resetting password and updating profile details.
          {'\n'}- Managing notifications and privacy preferences.
          {'\n'}- Deleting your account.
          {'\n\n'}
          Contact Support
          {'\n'}- Email: support@noticeboard.co.zw
          {'\n'}- Response time: within 2 business days.
          {'\n\n'}
          FAQs
          {'\n'}Q: Why can’t I like a post? A: Ensure you’re logged in.
          {'\n'}Q: How do I edit my listing? A: Use the profile editor and listing tools.
          {'\n'}Q: How do I report a bug? A: Contact support with screenshots.
          {'\n\n'}
          Advanced Tips
          {'\n'}- Use filters to narrow down results.
          {'\n'}- Enable notifications for updates.
          {'\n'}- Keep your profile information current.
          {'\n\n'}
          Thank you for using Noticeboard.
          {'\n'}This help content continues for extended reference, including platform-specific nuances and additional examples.
          {'\n\n'}
          More Guidance
          {'\n'}- Android battery optimizations can affect notifications.
          {'\n'}- On iOS, allow notifications in system settings.
          {'\n'}- WebView content may require stable connectivity.
          {'\n\n'}
          Community Guidelines
          {'\n'}- Be respectful and avoid spam.
          {'\n'}- Accurate information improves trust.
          {'\n'}- Protect your personal data.
          {'\n\n'}
          Data Safety
          {'\n'}- We process minimal personal data to run the service.
          {'\n'}- You can request data deletion at any time.
          {'\n'}- See Privacy Policy for details.
          {'\n\n'}
          More FAQs and step-by-step walkthroughs are available on our website. This page intentionally includes extended text to simulate multi-page content for testing long scroll behavior within the app.
        </Text>
      </ScrollView>
    </View>
  );
}


