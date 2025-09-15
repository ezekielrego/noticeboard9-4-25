import { socialApi } from './api';
import { ensureGuestIdentity } from './auth';

// Likes functionality
export const likeListing = async (listingId, action = 'like') => {
  try {
    if (!listingId) throw new Error('Missing listingId');
    await ensureGuestIdentity();
    const { data } = await socialApi.post(`/listings/${listingId}/like`, { action });
    if (data.status !== 'success') throw new Error(data.message);
    return { liked: data.liked, likesCount: data.likesCount };
  } catch (error) {
    console.error('Error liking listing:', error);
    throw error;
  }
};

export const getLikesCount = async (listingId) => {
  try {
    if (!listingId) throw new Error('Missing listingId');
    await ensureGuestIdentity();
    const { data } = await socialApi.get(`/listings/${listingId}/likes/count`);
    if (data.status !== 'success') throw new Error(data.message);
    return data.likesCount;
  } catch (error) {
    console.error('Error getting likes count:', error);
    throw error;
  }
};

// Comments functionality
export const addComment = async (listingId, text) => {
  try {
    await ensureGuestIdentity();
    const { data } = await socialApi.post(`/listings/${listingId}/comments`, { text });
    if (data.status !== 'success') throw new Error(data.message);
    return data.comment;
  } catch (error) {
    const serverMsg = error?.response?.data?.detail || error?.response?.data?.message;
    const err = new Error(serverMsg || error.message || 'Failed to add comment');
    console.error('Error adding comment:', err);
    throw err;
  }
};

export const getComments = async (listingId, cursor = null, limit = 20) => {
  try {
    await ensureGuestIdentity();
    const params = { limit };
    if (cursor) params.cursor = cursor;
    
    const { data } = await socialApi.get(`/listings/${listingId}/comments`, { params });
    if (data.status !== 'success') throw new Error(data.message);
    return { comments: data.comments, nextCursor: data.nextCursor };
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Ratings
export const getRating = async (listingId) => {
  await ensureGuestIdentity();
  const { data } = await socialApi.get(`/listings/${listingId}/rating`);
  if (data.status !== 'success') throw new Error(data.message);
  return { average: data.average, userRating: data.userRating };
};

export const submitRating = async (listingId, value) => {
  await ensureGuestIdentity();
  const { data } = await socialApi.post(`/listings/${listingId}/rating`, { value });
  if (data.status !== 'success') throw new Error(data.message);
  return { average: data.average, userRating: data.userRating };
};

// Ads
export const getActiveAds = async () => {
  await ensureGuestIdentity();
  const { data } = await socialApi.get('/ads/active');
  if (data.status !== 'success') throw new Error(data.message);
  return data; // { enabled, items, config }
};

// Check if user has liked a listing
export const checkUserLike = async (listingId) => {
  try {
    const { data } = await socialApi.get(`/listings/${listingId}/likes/me`);
    return Boolean(data?.liked);
  } catch (error) {
    console.error('Error checking user like:', error);
    return false;
  }
};
