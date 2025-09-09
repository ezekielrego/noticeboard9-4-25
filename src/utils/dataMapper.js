// Maps API response data to our component props
export const mapListingData = (apiListing) => {
  
  // Extract image from oFeaturedImg or coverImg
  const getImage = () => {
    if (apiListing.oFeaturedImg?.large) return apiListing.oFeaturedImg.large;
    if (apiListing.oFeaturedImg?.medium) return apiListing.oFeaturedImg.medium;
    if (apiListing.coverImg) return apiListing.coverImg;
    return null;
  };
  
  // Extract location from various possible fields
  const getLocation = () => {
    if (apiListing.oAddress?.address && apiListing.oAddress.address.trim()) {
      return apiListing.oAddress.address;
    }
    // Check if there are other location fields in the API response
    if (apiListing.address && apiListing.address.trim()) return apiListing.address;
    if (apiListing.location && apiListing.location.trim()) return apiListing.location;
    return 'Zimbabwe';
  };
  
  // Extract subtitle from tagLine or other fields
  const getSubtitle = () => {
    if (apiListing.tagLine && apiListing.tagLine.trim()) return apiListing.tagLine;
    if (apiListing.post_excerpt && apiListing.post_excerpt.trim()) return apiListing.post_excerpt;
    if (apiListing.excerpt && apiListing.excerpt.trim()) return apiListing.excerpt;
    return '';
  };
  
  const mapped = {
    id: apiListing.ID || apiListing.id,
    title: apiListing.postTitle || apiListing.title || apiListing.name || 'Untitled',
    subtitle: getSubtitle(),
    image: getImage(),
    logo: apiListing.logo || null,
    verified: apiListing.claimStatus === 'claimed' || apiListing.verified === true,
    location: getLocation(),
    postType: apiListing.postType || 'business',
    rating: apiListing.oReview?.average || apiListing.reviewAverage || 0,
    totalReviews: apiListing.oReview?.total || apiListing.totalReview || 0,
    totalViews: apiListing.totalView || 0,
    totalFavorites: apiListing.oFavorite?.totalFavorites || apiListing.totalFavorite || 0,
    businessStatus: apiListing.businessStatus,
    phone: apiListing.phone || '',
    email: apiListing.email || '',
    website: apiListing.website || '',
    author: apiListing.oAuthor || null,
    isMyFavorite: apiListing.oFavorite?.isMyFavorite === true || apiListing.isMyFavorite === 'yes',
    // Keep original data for detail screen
    originalData: apiListing,
  };
  
  return mapped;
};

export const mapListingsResponse = (apiResponse) => {
  if (!apiResponse) {
    return { listings: [], hasMore: false, total: 0 };
  }

  // Wilcity variations:
  // - { status:'success', oResults:[...] }
  // - { data:[...], total, page }
  // - sometimes directly array
  let raw = [];
  if (Array.isArray(apiResponse)) {
    raw = apiResponse;
  } else if (Array.isArray(apiResponse.oResults)) {
    raw = apiResponse.oResults;
  } else if (Array.isArray(apiResponse.data)) {
    raw = apiResponse.data;
  } else if (Array.isArray(apiResponse.results)) {
    raw = apiResponse.results;
  }

  const listings = raw.map(mapListingData);

  const hasMore = Boolean(apiResponse.next || (apiResponse.total && apiResponse.page && listings.length >= 1));
  const nextPage = apiResponse.next || (apiResponse.page ? apiResponse.page + 1 : undefined);
  const total = apiResponse.total || listings.length;

  return { listings, hasMore, nextPage, total };
};
