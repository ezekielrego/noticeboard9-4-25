import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://noticeboard.co.zw/wp-json/wiloke/v2';
const SOCIAL_BASE_URL = 'https://noticeapi.noticeboard.co.zw';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socialApi = axios.create({
  baseURL: SOCIAL_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setSocialAuthToken(token) {
  if (token) {
    socialApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete socialApi.defaults.headers.common['Authorization'];
  }
}

const CACHE_KEY_HOME = 'cache_home_listings_v1';
const CACHE_KEY_BUSINESS = 'cache_business_listings_v1';
const CACHE_KEY_RESTAURANT = 'cache_restaurant_listings_v1';
const CACHE_KEY_EVENTS = 'cache_event_listings_v1';

export async function getCachedListings(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export async function setCachedListings(key, items) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items || []));
  } catch (_) {}
}

export const listingsApi = {
  getListings: async (params = {}) => {
    const defaultParams = {
      page: 1,
      postsPerPage: 20,
      site: 'default',
      lang: 'en',
      sortBy: 'date', // Order by last added
      ...params,
    };
    const response = await api.get('/list/listings', { params: defaultParams });
    return response.data;
  },

  getListingDetail: async (id, params = {}) => {
    const defaultParams = {
      site: 'default',
      lang: 'en',
      ...params,
    };
    const response = await api.get(`/listings/${id}`, { params: defaultParams });
    return response.data;
  },

  searchListings: async (keyword, params = {}) => {
    const defaultParams = {
      keyword,
      page: 1,
      postsPerPage: 20,
      site: 'default',
      lang: 'en',
      ...params,
    };
    // Use dedicated search endpoint per API guide
    const response = await api.get('/listings/search', { params: defaultParams });
    return response.data;
  },
};

export { CACHE_KEY_HOME, CACHE_KEY_BUSINESS, CACHE_KEY_RESTAURANT, CACHE_KEY_EVENTS };

export default api;
