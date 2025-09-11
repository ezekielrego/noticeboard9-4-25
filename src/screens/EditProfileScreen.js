import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { loadSession, updateProfile, requestPasswordReset, resetPasswordWithCode } from '../services/auth';
import ErrorToast from '../components/ErrorToast';

export default function EditProfileScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const [displayName, setDisplayName] = useState('');
	const [email, setEmail] = useState('');
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState('');
	const [isResetMode, setIsResetMode] = useState(false);
	const [resetCode, setResetCode] = useState('');
	const [newPassword, setNewPassword] = useState('');

	useEffect(() => {
		(async () => {
			const { user } = await loadSession();
			setDisplayName(user?.displayName || '');
			setEmail(user?.email || '');
		})();
	}, []);

	const onSave = async () => {
		if (!displayName.trim()) return;
		setSaving(true);
		try {
			const res = await updateProfile({ displayName });
			if (res.status === 'success') {
				setToast('Profile updated');
				setTimeout(() => navigation.goBack && navigation.goBack(), 600);
			} else {
				setToast(res.message || 'Failed to update profile');
			}
		} catch (e) {
			setToast('Failed to update');
		} finally {
			setSaving(false);
		}
	};

	const onRequestReset = async () => {
		setSaving(true);
		try {
			const emailLower = String(email || '').toLowerCase();
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailLower || !emailRegex.test(emailLower)) {
				setToast('Please use a valid email to receive a code');
				return;
			}
			const res = await requestPasswordReset(emailLower);
			if (res.status === 'success') {
				setToast('Reset code sent to your email');
				setIsResetMode(true);
			} else {
				setToast(res.message || 'Failed to send reset code');
			}
		} catch (_) {
			setToast('Network error. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const onSubmitReset = async () => {
		if (!resetCode.trim() || !newPassword.trim()) { setToast('Enter code and new password'); return; }
		setSaving(true);
		try {
			const res = await resetPasswordWithCode({ email, code: resetCode.trim(), newPassword });
			if (res.status === 'success') {
				setToast('Password reset successful');
				setIsResetMode(false);
				setResetCode('');
				setNewPassword('');
			} else {
				setToast(res.message || 'Failed to reset password');
			}
		} catch (_) {
			setToast('Network error. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
				<TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
					<Ionicons name="chevron-back" size={24} color="#0b0c10" />
				</TouchableOpacity>
				<Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>Edit Profile</Text>
			</View>

			<View style={{ padding: 16 }}>
				<ErrorToast visible={!!toast} message={toast} type="error" onHide={() => setToast('')} />
				<Text style={{ color: '#6b7280', marginBottom: 6 }}>Display name</Text>
				<TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your name" placeholderTextColor="#9ca3af" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
				<Text style={{ color: '#6b7280', marginBottom: 6 }}>Email</Text>
				<TextInput value={email} editable={false} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, backgroundColor: '#f9fafb', color: '#6b7280' }} />
				<TouchableOpacity onPress={onSave} disabled={saving || !displayName.trim()} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0b0c10', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, opacity: saving || !displayName.trim() ? 0.6 : 1 }}>
					{saving ? <ActivityIndicator color="#0b0c10" /> : <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Save</Text>}
				</TouchableOpacity>

				<View style={{ height: 24 }} />
				<Text style={{ color: '#6b7280', marginBottom: 6 }}>Change password</Text>
				{!isResetMode ? (
					<TouchableOpacity onPress={onRequestReset} disabled={saving} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0b0c10', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
						{saving ? <ActivityIndicator color="#0b0c10" /> : <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Send reset code</Text>}
					</TouchableOpacity>
				) : (
					<>
						<Text style={{ color: '#6b7280', marginBottom: 6, marginTop: 8 }}>Reset code</Text>
						<TextInput value={resetCode} onChangeText={setResetCode} placeholder="123456" placeholderTextColor="#9ca3af" keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
						<Text style={{ color: '#6b7280', marginBottom: 6 }}>New password</Text>
						<TextInput value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9ca3af" style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }} />
						<TouchableOpacity onPress={onSubmitReset} disabled={saving || !resetCode.trim() || !newPassword.trim()} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#0b0c10', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, opacity: saving || !resetCode.trim() || !newPassword.trim() ? 0.6 : 1 }}>
							{saving ? <ActivityIndicator color="#0b0c10" /> : <Text style={{ color: '#0b0c10', fontWeight: '700' }}>Reset password</Text>}
						</TouchableOpacity>
					</>
				)}
			</View>
		</View>
	);
}
