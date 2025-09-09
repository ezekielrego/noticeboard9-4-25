import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking, StyleSheet, Alert, Modal, Dimensions, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { listingsApi } from '../services/api';
import { getLikesCount, likeListing, checkUserLike } from '../services/social';
import CommentsModal from '../components/CommentsModal';

export default function PostDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { listingId, listing } = route.params;
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [hours, setHours] = useState(null);
  const [reviewsMeta, setReviewsMeta] = useState(null);

  useEffect(() => {
    fetchListingDetail();
    loadLikeData();
    
    // Fallback: if we have listing data passed from previous screen, use it
    if (listing && !detailData) {
      setDetailData({
        header: {
          post_title: listing.title,
          post_excerpt: listing.subtitle,
          featured_image: listing.image,
          phone: listing.phone,
          website: listing.website,
          claimStatus: listing.verified ? 'claimed' : 'unclaimed'
        },
        oAuthor: listing.author,
        oAddress: {
          address: listing.location
        }
      });
    }
  }, [listingId, listing]);

  const effectiveId = useMemo(() => (
    listingId || listing?.id || listing?.ID || listing?.postID || detailData?.ID || detailData?.postID || null
  ), [listingId, listing, detailData]);

  const loadLikeData = async (idParam) => {
    try {
      const id = idParam ?? effectiveId;
      if (!id) return;
      const [liked, count] = await Promise.all([
        checkUserLike(Number(id)),
        getLikesCount(Number(id))
      ]);
      setIsLiked(Boolean(liked));
      setLikesCount(Number(count) || 0);
    } catch (error) {
      console.error('Error loading like data:', error);
    }
  };

  useEffect(() => {
    if (effectiveId) {
      loadLikeData(effectiveId);
    }
  }, [effectiveId]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await listingsApi.getListingDetail(listingId);
      
      if (response.status === 'success') {
        // The detail API might return the data directly or in oResults
        const detailData = response.oResults || response;
        setDetailData(detailData);
        if (detailData?.oReviews) {
          setReviewsMeta({
            average: detailData.oReviews.averageReview,
            count: detailData.oReviews.totalReviews || detailData.oReviews.total || 0,
          });
        }
        // Build a robust gallery list from multiple possible fields
        const footer = detailData.footerCard || detailData.footer || [];
        let imgs = [];
        // Footer gallery
        for (const block of footer) {
          if ((block.type === 'gallery' || block.key === 'gallery') && Array.isArray(block.value)) {
            imgs.push(...block.value.map(g => g.full || g.src || g.preview).filter(Boolean));
          }
          if (block.type === 'taxonomy' && block.value?.taxonomy === 'listing_cat') {
            const v = block.value;
            setCategories(prev => {
              const next = [...prev, { id: v.ID, name: v.name, link: v.link }];
              const seen = new Set();
              return next.filter(c => (c.id ? (seen.has(c.id) ? false : (seen.add(c.id), true)) : true));
            });
          }
          if (block.type === 'business-hours' && block.value) {
            setHours(block.value);
          }
        }
        // Body gallery blocks (if any)
        if (Array.isArray(detailData.bodyCard)) {
          for (const block of detailData.bodyCard) {
            if ((block.type === 'gallery' || block.key === 'gallery') && Array.isArray(block.value)) {
              imgs.push(...block.value.map(g => g.full || g.src || g.preview).filter(Boolean));
            }
          }
        }
        // Other known gallery shapes
        if (Array.isArray(detailData.gallery)) {
          imgs.push(...detailData.gallery.map(g => g.full || g.src || g.preview).filter(Boolean));
        }
        if (Array.isArray(detailData.oGallery)) {
          imgs.push(...detailData.oGallery.map(g => (typeof g === 'string' ? g : (g.full || g.src || g.preview))).filter(Boolean));
        }
        if (Array.isArray(detailData.oGalleryImgs)) {
          imgs.push(...detailData.oGalleryImgs.map(g => g.full || g.src || g.preview).filter(Boolean));
        }
        // Include hero image as first image if not already present
        const hero = (
          detailData?.header?.featured_image ||
          detailData?.header?.featuredImage ||
          detailData?.featuredImage ||
          detailData?.oFeaturedImg?.large ||
          listing?.image || null
        );
        if (hero) imgs.unshift(hero);
        // De-duplicate and finalize
        const seenSrc = new Set();
        const finalImgs = imgs.filter(src => {
          if (!src) return false;
          if (seenSrc.has(src)) return false;
          seenSrc.add(src);
          return true;
        });
        setGallery(finalImgs);
      } else {
        setError('Failed to load listing details');
      }
    } catch (err) {
      console.error('Error fetching listing detail:', err);
      setError('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const id = effectiveId;
      if (!id) return;
      const action = isLiked ? 'unlike' : 'like';
      const result = await likeListing(Number(id), action);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCall = () => {
    if (detailData?.header?.phone) {
      Linking.openURL(`tel:${detailData.header.phone}`);
    }
  };

  const handleWebsite = () => {
    if (detailData?.header?.website) {
      Linking.openURL(detailData.header.website);
    }
  };

  const handleShare = async () => {
    try {
      const url = detailData?.header?.permalink || listing?.permalink || '';
      const title = detailData?.header?.post_title || listing?.title || 'Listing';
      await Share.share({ message: `${title} - ${url}`.trim() });
    } catch (e) {}
  };

  const handleOpenMap = () => {
    const g = detailData?.oAddress?.addressOnGGMap || detailData?.header?.addressOnGGMap;
    if (g) Linking.openURL(g);
  };

  const handleOpenSocial = (url) => {
    if (url) Linking.openURL(url);
  };

  const openImage = (index) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b0c10" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (error || !detailData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { header, oAuthor, oAddress } = detailData;
  const heroImage = (
    header?.featured_image ||
    header?.featuredImage ||
    detailData?.featuredImage ||
    detailData?.oFeaturedImg?.large ||
    listing?.image ||
    null
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <View style={{ padding: 4, borderRadius: 6, overflow: 'hidden' }}>
          {listing?.logo || header?.logo ? (
            <Image source={{ uri: listing?.logo || header?.logo }} style={{ width: 32, height: 32, borderRadius: 6 }} />
          ) : (
            <Ionicons name="business-outline" size={24} color="#0b0c10" />
          )}
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {header?.post_title || listing?.title || 'Listing Details'}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#0b0c10" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Image */}
        {heroImage && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openImage(0)}>
            <Image source={{ uri: heroImage }} style={styles.mainImage} resizeMode="cover" />
          </TouchableOpacity>
        )}

        {/* Horizontal Gallery */}
        {gallery && gallery.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10, backgroundColor: '#fff' }} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {gallery.map((src, idx) => (
              <TouchableOpacity key={idx} onPress={() => openImage(idx)} activeOpacity={0.9} style={{ marginRight: 10 }}>
                <Image source={{ uri: src }} style={{ width: 120, height: 90, borderRadius: 8, backgroundColor: '#e5e7eb' }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Verified Badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {header?.post_title || listing?.title}
            </Text>
            {header?.claimStatus && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {header?.post_excerpt && (
            <Text style={styles.description}>
              {header.post_excerpt}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={handleLike} 
              style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              disabled={isLiking}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#ffffff" : "#6b7280"} 
              />
              <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
                {likesCount > 0 ? `${likesCount} Like${likesCount !== 1 ? 's' : ''}` : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                const id = effectiveId;
                if (id) {
                  navigation.navigate('Comments', { listingId: Number(id), listingTitle: header?.post_title || listing?.title });
                }
              }} 
              style={styles.actionButton}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6b7280" />
              <Text style={styles.actionButtonText}>Comments</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={20} color="#6b7280" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          {oAddress?.address && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <TouchableOpacity onPress={handleOpenMap}>
                  <Text style={[styles.infoText, { textDecorationLine: 'underline' }]}>
                    {oAddress.address}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {header?.phone && (
              <TouchableOpacity onPress={handleCall} style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call-outline" size={20} color="#0b0c10" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{header.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
            
            {header?.website && (
              <TouchableOpacity onPress={handleWebsite} style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name="globe-outline" size={20} color="#0b0c10" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue}>Visit Website</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Author Info removed per request */}

          {/* Reviews (if provided) */}
          {detailData?.oReviews && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={{ color: '#6b7280' }}>Reviews data available</Text>
            </View>
          )}

          {/* Socials if available on header/body */}
          {Array.isArray(detailData?.bodyCard) && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Social</Text>
              {detailData.bodyCard.map((b, i) => {
                const lower = (b?.key || b?.type || '').toLowerCase();
                const url = b?.value?.url || b?.value;
                if (['facebook', 'instagram', 'website', 'twitter', 'tiktok', 'youtube'].some(k => lower.includes(k)) && url) {
                  return (
                    <TouchableOpacity key={i} onPress={() => handleOpenSocial(url)} style={styles.contactRow}>
                      <View style={styles.contactIcon}><Ionicons name="link-outline" size={20} color="#0b0c10" /></View>
                      <View style={styles.contactContent}><Text style={styles.contactLabel}>{lower}</Text><Text style={styles.contactValue} numberOfLines={1}>{url}</Text></View>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  );
                }
                return null;
              })}
            </View>
          )}

          {/* Categories chips */}
          {categories && categories.length > 0 && (
            <View style={[styles.infoSection, { paddingTop: 0 }]}> 
              <Text style={styles.sectionTitle}>Categories</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((c, i) => (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(c.link)} style={styles.chip}>
                    <Text style={styles.chipText}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Business hours */}
          {hours && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Business hours</Text>
              {hours.mode === 'no_hours_available' ? (
                <Text style={{ color: '#6b7280' }}>No hours available</Text>
              ) : Array.isArray(hours.schedule) ? (
                hours.schedule.map((h, idx) => (
                  <View key={idx} style={styles.infoRow}>
                    <Text style={[styles.infoText, { flex: 0.5 }]}>{h?.day || ''}</Text>
                    <Text style={[styles.infoText, { textAlign: 'right' }]}>{h?.hours || ''}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#6b7280' }}>See listing for details</Text>
              )}
            </View>
          )}

          {/* Reviews summary */}
          {reviewsMeta && reviewsMeta.average > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Ratings</Text>
              <View style={[styles.infoRow, { justifyContent: 'space-between' }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0b0c10' }}>{reviewsMeta.average.toFixed(1)} / 5</Text>
                <Text style={{ color: '#6b7280' }}>{reviewsMeta.count} review{reviewsMeta.count === 1 ? '' : 's'}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fullscreen Image Viewer */}
      <Modal visible={imageViewerVisible} transparent onRequestClose={() => setImageViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setImageViewerVisible(false)} style={{ position: 'absolute', top: 48, right: 24, zIndex: 2 }}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {gallery[imageViewerIndex] && (
            <Image source={{ uri: gallery[imageViewerIndex] }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').width * 0.75 }} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Comments handled by a dedicated screen now */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#0b0c10',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b0c10',
    flex: 1,
    marginHorizontal: 12,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  mainImage: {
    width: '100%',
    height: 320,
  },
  content: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0b0c10',
    flex: 1,
    lineHeight: 34,
  },
  verifiedBadge: {
    backgroundColor: '#3ecf8e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  verifiedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  actionButtonTextActive: {
    color: '#ffffff',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0b0c10',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0b0c10',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  authorContent: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b0c10',
    marginBottom: 2,
  },
  authorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
