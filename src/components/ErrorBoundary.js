import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error, info) {
    // Log if needed
    console.warn('ErrorBoundary caught:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingHorizontal: 20 }}>
          <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Oops!</Text>
          <Text style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>An unexpected error occurred. You can continue using the app.</Text>
          <TouchableOpacity onPress={this.handleRetry} style={{ backgroundColor: '#0b0c10', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}


