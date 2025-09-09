import { socialApi } from './api';

// Likes functionality
export const likeListing = async (listingId, action = 'like') => {
  try {
    if (!listingId) throw new Error('Missing listingId');
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
    const { data } = await socialApi.post(`/listings/${listingId}/comments`, { text });
    if (data.status !== 'success') throw new Error(data.message);
    return data.comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (listingId, cursor = null, limit = 20) => {
  try {
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

// Check if user has liked a listing
export const checkUserLike = async (listingId) => {
  try {
    // For now, return false since the check endpoint doesn't exist
    // This will be implemented when the API supports it
    return false;
  } catch (error) {
    console.error('Error checking user like:', error);
    return false;
  }
};
