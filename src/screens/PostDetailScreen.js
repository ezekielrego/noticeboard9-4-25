import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking, StyleSheet, Alert, Modal, Dimensions, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { listingsApi } from '../services/api';
import { getLikesCount, likeListing, checkUserLike, getRating, submitRating } from '../services/social';
import CommentsModal from '../components/CommentsModal';

export default function PostDetailScreen({ route, navigation }) {
  // const insets = useSafeAreaInsets();
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
  const [photosExtra, setPhotosExtra] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentTab, setCurrentTab] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [htmlDescription, setHtmlDescription] = useState('');
  const [webviewHeight, setWebviewHeight] = useState(Math.min(600, Math.max(360, Math.floor(Dimensions.get('window').height * 0.6))));
  const [heroAspectRatio, setHeroAspectRatio] = useState(0.75);
  const [ratingAverage, setRatingAverage] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const injectedAutoHeightScript = `
    (function() {
      function postHeight() {
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', height: height }));
      }
      window.addEventListener('load', postHeight);
      var ro = new ResizeObserver(postHeight);
      ro.observe(document.body);
      setTimeout(postHeight, 50);
      setTimeout(postHeight, 250);
      setTimeout(postHeight, 1000);
    })();
    true;
  `;
  const getVideoThumb = (src) => {
    if (!src || typeof src !== 'string') return null;
    if (src.includes('youtube')) {
      const parts = src.split('v=');
      const id = parts[1] ? parts[1].split('&')[0] : '';
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    return null;
  };
  const fullDescription = useMemo(() => {
    const tryFields = [
      detailData?.header?.post_content,
      detailData?.header?.post_excerpt,
      detailData?.post_content,
      detailData?.post_excerpt,
      detailData?.excerpt,
      detailData?.description,
      detailData?.content,
      listing?.subtitle,
      listing?.originalData?.post_excerpt,
      listing?.originalData?.excerpt,
      ...(Array.isArray(detailData?.bodyCard) ? detailData.bodyCard.map(block => 
        block?.type === 'content' || block?.key === 'content' ? block.value : null
      ).filter(Boolean) : []),
      ...(Array.isArray(detailData?.footerCard) ? detailData.footerCard.map(block => 
        block?.type === 'content' || block?.key === 'content' ? block.value : null
      ).filter(Boolean) : []),
      detailData?.oContent,
      detailData?.oDescription,
      detailData?.oExcerpt,
      detailData?.oPostContent,
      detailData?.oPostExcerpt,
      detailData?.header?.content,
      detailData?.header?.description,
      detailData?.header?.excerpt,
    ];
    const rawHtml = tryFields.find(v => typeof v === 'string' && /<[^>]+>/.test(v));
    if (rawHtml && !htmlDescription) {
      setHtmlDescription(rawHtml);
    }
    const raw = tryFields.find(v => typeof v === 'string' && v.trim().length > 0) || '';
    const cleaned = raw.replace(/<[^>]+>/g, '').trim();
    return cleaned;
  }, [detailData, listing, htmlDescription]);

  useEffect(() => {
    fetchListingDetail();
    loadLikeData();
  }, [listingId]);

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
    if (!effectiveId) return;
    (async () => {
      try {
        const r = await getRating(Number(effectiveId));
        setRatingAverage(Number(r.average) || 0);
        setUserRating(r.userRating ?? null);
      } catch (_) {}
    })();
  }, [effectiveId]);

  const fetchListingDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsApi.getListingDetail(listingId);
      if (response.status === 'success') {
        const detailData = response.oResults || response;
        setDetailData(detailData);
        const footer = detailData.footerCard || detailData.footer || [];
        let imgs = [];
        if (Array.isArray(detailData.bodyCard)) {
          for (const block of detailData.bodyCard) {
            if ((block.type === 'gallery' || block.key === 'gallery') && Array.isArray(block.value)) {
              imgs.push(...block.value.map(g => g.full || g.src || g.preview).filter(Boolean));
            }
          }
        }
        const hero = (
          detailData?.header?.featured_image ||
          detailData?.header?.featuredImage ||
          detailData?.featuredImage ||
          detailData?.oFeaturedImg?.large ||
          listing?.image || null
        );
        if (hero) {
          imgs.unshift(hero);
          try {
            Image.getSize(hero, (width, height) => {
              if (width && height) {
                setHeroAspectRatio(width / height);
              }
            });
          } catch (_) {}
        }
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
      setError('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiking) return;
      setIsLiking(true);
      const id = effectiveId;
      if (!id) return;
      const action = isLiked ? 'unlike' : 'like';
      const result = await likeListing(Number(id), action);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const onPressStar = async (value) => {
    if (!effectiveId || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      const r = await submitRating(Number(effectiveId), value);
      setRatingAverage(Number(r.average) || 0);
      setUserRating(Number(r.userRating) || value);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleCall = () => {
    const phone = detailData?.header?.phone || detailData?.phone || contacts.find(c => c.label === 'Phone')?.value;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
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

  const { header, oAuthor, oAddress } = detailData || {};
  const heroImage = (
    header?.featured_image ||
    header?.featuredImage ||
    detailData?.featuredImage ||
    detailData?.oFeaturedImg?.large ||
    listing?.image || null
  );

  const renderStars = (value, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const name = i <= Math.round(value) ? 'star' : 'star-outline';
      const color = '#f59e0b';
      const size = 18;
      stars.push(
        <TouchableOpacity key={i} disabled={!interactive} onPress={() => onPressStar(i)} style={{ paddingHorizontal: 2 }}>
          <Ionicons name={name} size={size} color={color} />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b0c10" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </View>
    );
  }

  if (error || !detailData) {
    return (
      <View style={styles.container}>
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

  return (
    <View style={styles.container}>
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

      <View style={styles.tabsBar}>
        {['overview','photos','videos'].map(key => (
          <TouchableOpacity key={key} onPress={() => setCurrentTab(key)} style={[styles.tabBtn, currentTab === key && styles.tabBtnActive]}>
            <Text style={[styles.tabText, currentTab === key && styles.tabTextActive]}>
              {key === 'overview' ? 'Overview' : key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentTab === 'overview' && (
        <>
        {heroImage && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => openImage(0)}>
            <View style={{ width: '100%', aspectRatio: heroAspectRatio || 1.6, backgroundColor: '#e5e7eb', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' }}>
              <Image source={{ uri: heroImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.content, { marginTop: 10 }]}> 
          {/* Ratings */}
          <View style={[styles.infoRow, { justifyContent: 'space-between' }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderStars(ratingAverage || 0, false)}
              <Text style={{ marginLeft: 6, color: '#6b7280' }}>{Number(ratingAverage).toFixed(1)} / 5</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ marginRight: 6, color: '#6b7280' }}>Your rating:</Text>
              {renderStars(userRating || 0, true)}
            </View>
          </View>
        </View>

        {/* Videos */}
        {videos && videos.length > 0 && (
          <View style={[styles.content, { marginTop: 10 }]}> 
            <Text style={styles.sectionTitle}>Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {videos.map((src, idx) => (
                <TouchableOpacity key={idx} onPress={() => Linking.openURL(src)} activeOpacity={0.85} style={{ marginRight: 12 }}>
                  <Image source={{ uri: getVideoThumb(src) || heroImage }} style={{ width: 140, height: 90, borderRadius: 8, backgroundColor: '#e5e7eb' }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Gallery Grid (3 columns) */}
        {Array.from(new Set([...gallery, ...photosExtra])).length > 0 && (
          <View style={{ padding: 12, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              {Array.from(new Set([...gallery, ...photosExtra])).slice(0, 6).map((src, idx, arr) => {
                const isLast = idx === 5 && arr.length > 6;
                return (
                  <TouchableOpacity key={idx} onPress={() => openImage(idx)} style={{ width: '33.333%', padding: 6 }} activeOpacity={0.9}>
                    <View style={{ borderRadius: 10, overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                      <Image source={{ uri: src }} style={{ width: '100%', height: 110 }} />
                      {isLast && (
                        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontWeight: '700' }}>+{arr.length - 6} more</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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

          {/* Description (WYSIWYG if available) */}
          {htmlDescription ? (
            <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', marginBottom: 16 }}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: `<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1'>
                  <style>
                    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #111827; padding: 12px; }
                    img { max-width: 100%; height: auto; border-radius: 8px; }
                    iframe, video { max-width: 100%; }
                    a { color: #2563eb; }
                    h1,h2,h3 { color: #0b0c10; }
                    body { overflow-y: auto; }
                  </style>
                </head><body>${htmlDescription}</body></html>` }}
                style={{ width: '100%', height: webviewHeight }}
                automaticallyAdjustContentInsets={false}
                setSupportMultipleWindows={false}
                scrollEnabled={false}
                injectedJavaScript={injectedAutoHeightScript}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data && data.type === 'height') {
                      const next = Math.max(200, Math.min(2000, Number(data.height) || 0));
                      if (next && Math.abs(next - webviewHeight) > 10) {
                        setWebviewHeight(next);
                      }
                    }
                  } catch (e) {}
                }}
              />
            </View>
          ) : fullDescription ? (
            <Text style={styles.description}>{fullDescription}</Text>
          ) : (
            <Text style={[styles.description, { color: '#9ca3af', fontStyle: 'italic' }]}>No description available</Text>
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
            
            {/* Phone - check multiple sources */}
            {(header?.phone || detailData?.phone || contacts.find(c => c.label === 'Phone')?.value) && (
              <TouchableOpacity onPress={handleCall} style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call-outline" size={20} color="#0b0c10" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>
                    {header?.phone || detailData?.phone || contacts.find(c => c.label === 'Phone')?.value}
                  </Text>
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

            {contacts && contacts.map((c, i) => (
              <TouchableOpacity key={i} onPress={() => c.link && Linking.openURL(c.link)} style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name={c.label === 'Phone' ? 'call-outline' : c.label === 'Email' ? 'mail-outline' : 'link-outline'} size={20} color="#0b0c10" />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>{c.value}</Text>
                </View>
                {!!c.link && <Ionicons name="chevron-forward" size={16} color="#9ca3af" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Author Info removed per request */}

          {/* Reviews (if provided) */}
          {detailData?.oReviews && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={{ color: '#6b7280' }}>Reviews data available</Text>
            </View>
          )}

          {/* Socials */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Social</Text>
            {Array.isArray(detailData?.bodyCard) && detailData.bodyCard.map((b, i) => {
              const lower = (b?.key || b?.type || '').toLowerCase();
              const url = b?.value?.url || b?.value;
              if (['facebook', 'instagram', 'website', 'twitter', 'tiktok', 'youtube'].some(k => lower.includes(k)) && url) {
                return (
                  <TouchableOpacity key={`bodysocial-${i}`} onPress={() => handleOpenSocial(url)} style={styles.contactRow}>
                    <View style={styles.contactIcon}><Ionicons name="link-outline" size={20} color="#0b0c10" /></View>
                    <View style={styles.contactContent}><Text style={styles.contactLabel}>{lower}</Text><Text style={styles.contactValue} numberOfLines={1}>{url}</Text></View>
                    <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                  </TouchableOpacity>
                );
              }
              return null;
            })}
            {socialLinks.length > 0 && (
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {socialLinks.map((s, idx) => (
                  <TouchableOpacity key={`socialicon-${idx}`} onPress={() => Linking.openURL(s.url)} style={{ marginRight: 12, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 10 }}>
                    <Ionicons name={s.icon} size={20} color="#0b0c10" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

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
            <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Business hours</Text>
            {hours && Array.isArray(hours.schedule) && hours.schedule.length ? (
              hours.schedule.map((h, idx) => (
                <View key={idx} style={styles.infoRow}>
                  <Text style={[styles.infoText, { flex: 0.5 }]}>{h?.day || ''}</Text>
                  <Text style={[styles.infoText, { textAlign: 'right' }]}>{h?.hours || ''}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#6b7280' }}>Always open</Text>
            )}
                </View>

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
        </>
        )}

        {currentTab === 'photos' && (
          <View style={[styles.content, { paddingTop: 12 }]}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
              {Array.from(new Set([...gallery, ...photosExtra])).map((src, idx) => (
                <TouchableOpacity key={idx} onPress={() => openImage(idx)} style={{ width: '33.333%', padding: 6 }}>
                  <Image source={{ uri: src }} style={{ width: '100%', height: 110, borderRadius: 8, backgroundColor: '#e5e7eb' }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {currentTab === 'videos' && (
          <View style={[styles.content, { paddingTop: 12 }]}>
            <Text style={styles.sectionTitle}>Videos</Text>
            {videos.length === 0 ? (
              <Text style={{ color: '#6b7280' }}>No videos available</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
                {videos.map((src, idx) => (
                  <TouchableOpacity key={idx} onPress={() => Linking.openURL(src)} style={{ width: '50%', padding: 6 }}>
                    <Image source={{ uri: getVideoThumb(src) || heroImage }} style={{ width: '100%', height: 120, borderRadius: 8, backgroundColor: '#e5e7eb' }} />
                    <Text numberOfLines={1} style={{ marginTop: 6, fontSize: 12, color: '#374151' }}>{src}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={imageViewerVisible} transparent onRequestClose={() => setImageViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>
          <TouchableOpacity onPress={() => setImageViewerVisible(false)} style={{ position: 'absolute', top: 48, right: 24, zIndex: 2 }}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
              setImageViewerIndex(idx);
            }}
            contentOffset={{ x: imageViewerIndex * Dimensions.get('window').width, y: 0 }}
            showsHorizontalScrollIndicator={false}
          >
            {Array.from(new Set([...gallery, ...photosExtra])).map((src, idx) => (
              <View key={idx} style={{ width: Dimensions.get('window').width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: src }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').width * 0.75 }} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
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
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0b0c10',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#0b0c10',
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


