import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { socialApi, setSocialAuthToken } from './api';

const TOKEN_KEY = 'nb_auth_token';
const USER_KEY = 'nb_auth_user';
const GUEST_ID_KEY = 'nb_guest_id_v1';
const GUEST_NAME_KEY = 'nb_guest_name_v1';

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
  // Ensure guest headers are present for unauthenticated usage
  await ensureGuestIdentity();
  return { token, user };
}

export async function clearSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await setAuthHeader(null);
  setSocialAuthToken(null);
}

export async function loginWithPassword({ username, password }) {
  try {
    const { data } = await socialApi.post('/auth/login', { username, password });
    if (data.status === 'success' && data.token) {
      const user = data.user || null;
      await saveSession(data.token, user);
    }
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Login failed';
    return { status: 'error', message: msg };
  }
}

export async function signupWithPassword({ username, email, password }) {
  try {
    const { data } = await socialApi.post('/auth/register', {
      email: email || username,
      password,
      displayName: (email || username || '').split('@')[0]
    });
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Registration failed';
    return { status: 'error', message: msg };
  }
}

export async function verifySignupCode({ email, code }) {
  try {
    const { data } = await socialApi.post('/auth/verify', { email, code });
    if (data.status === 'success' && data.token) {
      const user = data.user || null;
      await saveSession(data.token, user);
    }
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Verification failed';
    return { status: 'error', message: msg };
  }
}

// Profile updates
export async function updateProfile({ displayName, photoUrl }) {
  try {
    const payload = {};
    if (displayName) payload.displayName = displayName;
    if (photoUrl) payload.photoUrl = photoUrl;
    const { data } = await socialApi.patch('/me', payload);
    // If backend updates and returns user, refresh local cache
    if (data?.user && data?.token) {
      await saveSession(data.token, data.user);
    } else if (data?.user) {
      const { token, user } = await loadSession();
      const merged = { ...(user || {}), ...data.user };
      await saveSession(token, merged);
    }
    return data;
  } catch (e) {
    // If endpoint not found, fall back to local-only update so UI reflects change
    if (e?.response?.status === 404) {
      try {
        const { token, user } = await loadSession();
        const merged = { ...(user || {}), displayName };
        await saveSession(token, merged);
        return { status: 'success', message: 'Profile updated locally' };
      } catch (_) {}
    }
    const msg = e?.response?.data?.message || e?.message || 'Failed to update profile';
    return { status: 'error', message: msg };
  }
}

// Password reset/change via code
export async function requestPasswordReset(email) {
  try {
    const { data } = await socialApi.post('/auth/request-reset', { email });
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to send reset code';
    return { status: 'error', message: msg };
  }
}

export async function resetPasswordWithCode({ email, code, newPassword }) {
  try {
    const { data } = await socialApi.post('/auth/reset', { email, code, newPassword });
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Failed to reset password';
    return { status: 'error', message: msg };
  }
}

// Guest identity
export async function ensureGuestIdentity() {
  let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
  let guestName = await AsyncStorage.getItem(GUEST_NAME_KEY);
  if (!guestId) {
    // Simple robust ID generation
    const rand = Math.random().toString(36).slice(2, 10);
    guestId = `gid_${Date.now()}_${rand}`;
    await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
  }
  if (!guestName) {
    const suffix = guestId.slice(-4).toUpperCase();
    guestName = `Guest-${suffix}`;
    await AsyncStorage.setItem(GUEST_NAME_KEY, guestName);
  }
  // Attach to social API headers for every request
  socialApi.defaults.headers.common['X-Guest-Id'] = guestId;
  socialApi.defaults.headers.common['X-Guest-Name'] = guestName;
  return { guestId, guestName };
}


