import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert,
  Image,
  StyleSheet 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { loadSession, clearSession } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function AccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: userData } = await loadSession();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await clearSession();
            // Navigate back to login
            navigation.navigate('Login');
          }
        }
      ]
    );
  };


  const AccountItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity 
      style={[styles.accountItem, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.accountItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name={icon} size={20} color={colors.text} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.accountItemRight}>
        {rightComponent || (showArrow && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />)}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary, backgroundColor: colors.surfaceSecondary }]}>{title}</Text>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.avatar} 
              resizeMode="contain" 
            />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <AccountItem 
            icon="person-outline" 
            title="Profile" 
            subtitle="Edit your profile information"
            onPress={() => Alert.alert('Profile', 'Profile editing coming soon!')}
          />
          <AccountItem 
            icon="mail-outline" 
            title="Email" 
            subtitle={user?.email || 'user@example.com'}
            onPress={() => Alert.alert('Email', 'Email settings coming soon!')}
          />
          <AccountItem 
            icon="lock-closed-outline" 
            title="Password" 
            subtitle="Change your password"
            onPress={() => Alert.alert('Password', 'Password change coming soon!')}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <SectionHeader title="App Settings" />
          <AccountItem 
            icon="moon-outline" 
            title="Dark Mode" 
            subtitle="Switch between light and dark themes"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={isDarkMode ? '#ffffff' : '#f3f4f6'}
              />
            }
            showArrow={false}
          />
          <AccountItem 
            icon="notifications-outline" 
            title="Notifications" 
            subtitle="Manage your notification preferences"
            onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
          />
          <AccountItem 
            icon="language-outline" 
            title="Language" 
            subtitle="English"
            onPress={() => Alert.alert('Language', 'Language selection coming soon!')}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <AccountItem 
            icon="help-circle-outline" 
            title="Help & Support" 
            subtitle="Get help and contact support"
            onPress={() => Alert.alert('Help', 'Help center coming soon!')}
          />
          <AccountItem 
            icon="document-text-outline" 
            title="Terms of Service" 
            subtitle="Read our terms and conditions"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
          />
          <AccountItem 
            icon="shield-checkmark-outline" 
            title="Privacy Policy" 
            subtitle="Learn about our privacy practices"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <AccountItem 
            icon="information-circle-outline" 
            title="App Version" 
            subtitle="1.0.0"
            showArrow={false}
          />
          <AccountItem 
            icon="star-outline" 
            title="Rate App" 
            subtitle="Rate us on the app store"
            onPress={() => Alert.alert('Rate App', 'Rating coming soon!')}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
  },
  accountItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
