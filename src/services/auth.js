import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { socialApi, setSocialAuthToken } from './api';

const TOKEN_KEY = 'nb_auth_token';
const USER_KEY = 'nb_auth_user';

export async function setAuthHeader(token) {
  // Do not attach auth to Wilcity public API; leave unauthenticated
  delete api.defaults.headers.common['Authorization'];
}

export async function saveSession(token, user) {
  await AsyncStorage.setItem(TOKEN_KEY, token || '');
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  await setAuthHeader(null);
  setSocialAuthToken(token);
}

export async function loadSession() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  const user = userRaw ? JSON.parse(userRaw) : null;
  // Do not set Authorization on Wilcity API
  await setAuthHeader(null);
  // Set token for social API if available
  setSocialAuthToken(token);
  return { token, user };
}

export async function clearSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await setAuthHeader(null);
  setSocialAuthToken(null);
}

export async function loginWithPassword({ username, password }) {
  const { data } = await socialApi.post('/auth/login', { username, password });
  if (data.status === 'success' && data.token) {
    const user = data.user || null;
    await saveSession(data.token, user);
  }
  return data;
}

export async function signupWithPassword({ username, email, password }) {
  const { data } = await socialApi.post('/auth/register', {
    email: email || username,
    password,
    displayName: (email || username || '').split('@')[0]
  });
  return data;
}

export async function verifySignupCode({ email, code }) {
  const { data } = await socialApi.post('/auth/verify', { email, code });
  if (data.status === 'success' && data.token) {
    const user = data.user || null;
    await saveSession(data.token, user);
  }
  return data;
}


