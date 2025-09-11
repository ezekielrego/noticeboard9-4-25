import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function WebViewScreen({ route, navigation }) {
	const { url, html, title } = route?.params || {};
	const [showTip, setShowTip] = React.useState(true);
	return (
		<View style={{ flex: 1, backgroundColor: '#ffffff' }}>
			<View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
				<TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={{ padding: 6 }}>
					<Ionicons name="chevron-back" size={24} color="#0b0c10" />
				</TouchableOpacity>
				<Text numberOfLines={1} style={{ marginLeft: 6, fontSize: 16, fontWeight: '700', color: '#0b0c10', flex: 1 }}>{title || (url ? 'Web' : 'Content')}</Text>
			</View>
			{showTip && (
				<View style={{ backgroundColor: '#e6f0ff', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#dbeafe', flexDirection: 'row', alignItems: 'center' }}>
					<View style={{ flex: 1 }}>
						<Text style={{ color: '#1e40af', fontSize: 12, fontWeight: '600' }}>To Become an author</Text>
						<Text style={{ color: '#1e3a8a', fontSize: 11, marginTop: 2 }}>Click the blue next to the green "Create account" icon on the top header to create a listing.</Text>
					</View>
					<TouchableOpacity onPress={() => setShowTip(false)} style={{ padding: 6 }}>
						<Text style={{ color: '#1e40af', fontWeight: '700' }}>Ok Thanks</Text>
					</TouchableOpacity>
				</View>
			)}
			<WebView
				originWhitelist={["*"]}
				source={html ? { html } : { uri: url }}
				startInLoadingState
				setSupportMultipleWindows={false}
				style={{ flex: 1 }}
			/>
		</View>
	);
}
