import FavoriteIcon from '@/assets/images/icons/store/favorite.svg';
import HeartIcon from '@/assets/images/icons/store/heart.svg';
import SpeechBubbleIcon from '@/assets/images/icons/store/speech-bubble.svg';
import StarIcon from '@/assets/images/icons/store/star.svg';

// Profile Images
import ProfileBlue from '@/assets/images/icons/mypage/profile-blue.png';
import ProfileGreen from '@/assets/images/icons/mypage/profile-green.png';
import ProfileOrange from '@/assets/images/icons/mypage/profile-orange.png';
import ProfileRed from '@/assets/images/icons/mypage/profile-red.png';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Fonts } from '@/src/shared/theme/theme';
import type { ReviewItem, ReviewRating } from '@/src/shared/types/store';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Re-export types for convenience
export type { ReviewItem, ReviewRating };

interface ReviewSectionProps {
  rating: ReviewRating;
  reviews: ReviewItem[];
  onWriteReview?: () => void;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReportReview?: (reviewId: string) => void;
  onLikeReview?: (reviewId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

// ============================================
// ReviewRatingBlock
// ============================================

function ReviewRatingBlock({ rating }: { rating: ReviewRating }) {
  const maxCount = Math.max(...Object.values(rating.distribution), 1);

  return (
    <View style={styles.ratingBlock}>
      <View style={styles.ratingLeft}>
        <ThemedText style={styles.ratingLabel} lightColor="#000" darkColor="#000">
          {rating.totalCount}개 리뷰 별점 평균
        </ThemedText>
        <View style={styles.ratingScoreBox}>
          <StarIcon width={rs(20)} height={rs(20)} color="#FFCC00" />
          <ThemedText style={styles.ratingScore} lightColor="#000" darkColor="#000">
            {rating.averageRating.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.ratingRight}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = rating.distribution[star as keyof typeof rating.distribution] || 0;
          return (
            <View key={star} style={styles.distributionRow}>
              <ThemedText style={styles.distributionLabel} lightColor="#000" darkColor="#000">
                {star}점
              </ThemedText>
              <View style={styles.distributionBarContainer}>
                <View style={styles.distributionBarBg} />
                {count > 0 && (
                  <View
                    style={[
                      styles.distributionBarFill,
                      {
                        width: `${(count / maxCount) * 100}%`,
                      },
                    ]}
                  />
                )}
              </View>
              <ThemedText style={styles.distributionCount} lightColor="#BDBDBD" darkColor="#BDBDBD">
                {count}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ============================================
// ReviewFilter
// ============================================

type FilterType = 'recent' | 'best';

function ReviewFilter({
  activeFilter,
  onFilterChange,
  onWriteReview,
}: {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onWriteReview?: () => void;
}) {
  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'recent' && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange('recent')}
        >
          <ThemedText
            style={[
              styles.filterButtonText,
              activeFilter === 'recent' && styles.filterButtonTextActive,
            ]}
            lightColor={activeFilter === 'recent' ? '#1d1b20' : '#666'}
            darkColor={activeFilter === 'recent' ? '#1d1b20' : '#666'}
          >
            최근순
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'best' && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange('best')}
        >
          <ThemedText
            style={[
              styles.filterButtonText,
              activeFilter === 'best' && styles.filterButtonTextActive,
            ]}
            lightColor={activeFilter === 'best' ? '#1d1b20' : '#666'}
            darkColor={activeFilter === 'best' ? '#1d1b20' : '#666'}
          >
            베스트순
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.writeButton} onPress={onWriteReview}>
        <ThemedText style={styles.writeButtonText} lightColor="#1d1b20" darkColor="#1d1b20">✏️ 리뷰 쓰기</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// ReviewItemCard
// ============================================

function ReviewItemCard({
  review,
  onEdit,
  onDelete,
  onReport,
  onLike,
  isLast,
  menuOpen,
  onMenuToggle,
  onMenuClose,
}: {
  review: ReviewItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onLike?: () => void;
  isLast?: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Get profile image based on nickname or random if not provided
  const getProfileImage = () => {
    if (review.profileImage) return { uri: review.profileImage };

    // Simple hash-based mapping for consistent colors per nickname
    const profiles = [ProfileBlue, ProfileGreen, ProfileOrange, ProfileRed];
    const index = Math.abs(review.nickname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % profiles.length;
    return profiles[index];
  };

  return (
    <View style={styles.reviewCard}>
      {/* 1. Header (Nickname + Profile) */}
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <Image source={getProfileImage()} style={styles.profileImage} />
          <ThemedText style={styles.nickname} lightColor="#000">{review.nickname}</ThemedText>
        </View>
      </View>

      {/* 2. Meta (Rating + Date) */}
      <View style={styles.reviewMetaRow}>
        <View style={styles.ratingBox}>
          <StarIcon width={rs(14)} height={rs(14)} color="#FFCC00" />
          <ThemedText style={styles.ratingValue} lightColor="#000">{review.rating}</ThemedText>
        </View>
        <ThemedText style={styles.reviewDate} lightColor="#828282">{review.date}</ThemedText>
      </View>

      {/* 3. Images (150x150) */}
      {review.images && review.images.length > 0 && (
        <View style={styles.imageGallery}>
          {review.images.map((image, index) => (
            <TouchableOpacity key={index} style={styles.imageThumbnail}>
              <Image source={{ uri: image }} style={styles.reviewImage} renderIndicator={() => <ActivityIndicator />} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 4. Content (Expandable 4 lines) */}
      <View style={styles.contentSection}>
        <ThemedText
          style={styles.reviewContent}
          numberOfLines={expanded ? undefined : 4}
          lightColor="#000"
        >
          {review.content}
        </ThemedText>
        {!expanded && review.content.length > 100 && (
          <TouchableOpacity
            style={styles.moreButtonContainer}
            onPress={() => setExpanded(true)}
          >
            <ThemedText style={styles.moreButtonText}>더보기</ThemedText>
            {/* SVG placeholder or simple Down arrow if no icon available */}
            <ThemedText style={styles.moreIcon}>⌵</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. Actions (Likes, Comments, Menu) */}
      <View style={styles.actionSection}>
        <View style={styles.socialStats}>
          <TouchableOpacity style={styles.socialItem} onPress={onLike}>
            {review.isLiked ? (
              <HeartIcon width={rs(20)} height={rs(20)} />
            ) : (
              <FavoriteIcon width={rs(20)} height={rs(20)} color="#999" />
            )}
            <ThemedText style={styles.socialCount} lightColor="#000">{review.likeCount}</ThemedText>
          </TouchableOpacity>
          <View style={styles.socialItem}>
            <SpeechBubbleIcon width={rs(20)} height={rs(20)} color="#999" />
            <ThemedText style={styles.socialCount} lightColor="#000">{review.commentCount}</ThemedText>
          </View>
        </View>

        <View style={styles.menuWrapper}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedText style={styles.menuDots} lightColor="#000">⋯</ThemedText>
          </TouchableOpacity>
          {menuOpen && (
            <View style={styles.menuPopup}>
              {review.isOwner ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onMenuClose();
                      onEdit?.();
                    }}
                  >
                    <ThemedText style={styles.menuItemText}>수정</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onMenuClose();
                      onDelete?.();
                    }}
                  >
                    <ThemedText style={styles.menuItemText}>삭제</ThemedText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onMenuClose();
                    onReport?.();
                  }}
                >
                  <ThemedText style={styles.menuItemText}>신고</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 6. Owner Reply (Mocked if hasReply) */}
      {review.hasReply && (
        <View style={styles.ownerReplySection}>
          <View style={styles.ownerHeader}>
            <View style={styles.ownerInfo}>
              {review.ownerProfileImage ? (
                <Image source={{ uri: review.ownerProfileImage }} style={styles.ownerProfile} />
              ) : (
                <View style={[styles.ownerProfile, { backgroundColor: '#309821', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="storefront-outline" size={rs(16)} color="#fff" />
                </View>
              )}
              <ThemedText style={styles.ownerName} lightColor="#000">사장님</ThemedText>
            </View>
            <ThemedText style={styles.replyDate} lightColor="#828282">{review.replyDate || '-'}</ThemedText>
          </View>
          <ThemedText style={styles.replyContent} lightColor="#000">
            {review.replyContent || '답글 내용을 불러올 수 없습니다.'}
          </ThemedText>
        </View>
      )}

      {/* Review Divider */}
      <View style={styles.reviewDivider} />
    </View>
  );
}

// ============================================
// ReviewSection
// ============================================

// 무한 스크롤 트리거 컴포넌트
function LoadMoreTrigger({
  onTrigger,
  isLoading,
}: {
  onTrigger: () => void;
  isLoading?: boolean;
}) {
  const handleLayout = useCallback(() => {
    if (!isLoading) {
      onTrigger();
    }
  }, [onTrigger, isLoading]);

  return (
    <View onLayout={handleLayout} style={styles.loadMoreTrigger}>
      {isLoading && <ActivityIndicator size="small" color="#34b262" />}
    </View>
  );
}

export function ReviewSection({
  rating,
  reviews,
  onWriteReview,
  onEditReview,
  onDeleteReview,
  onReportReview,
  onLikeReview,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ReviewSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  // 낙관적 좋아요 상태: reviewId → liked 여부
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({});

  const sortedReviews = [...reviews].sort((a, b) => {
    if (activeFilter === 'best') {
      return b.likeCount - a.likeCount;
    }
    // recent: 날짜 내림차순
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleLike = useCallback((reviewId: string, currentLiked: boolean) => {
    setOptimisticLikes((prev) => ({ ...prev, [reviewId]: !currentLiked }));
    onLikeReview?.(reviewId);
  }, [onLikeReview]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
      <View style={styles.container}>
        <ReviewRatingBlock rating={rating} />
        <View style={styles.filterWrapper}>
          <View style={styles.filterDivider} />
          <ReviewFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onWriteReview={onWriteReview}
          />
          <View style={styles.filterDivider} />
        </View>

        <View style={styles.reviewList}>
          {sortedReviews.length === 0 ? (
            <View style={styles.emptyReview}>
              <ThemedText style={styles.emptyReviewText} lightColor="#999" darkColor="#999">
                아직 리뷰가 없습니다.
              </ThemedText>
            </View>
          ) : (
            sortedReviews.map((review, index) => {
              const isLiked = optimisticLikes[review.id] !== undefined
                ? optimisticLikes[review.id]
                : review.isLiked;
              return (
                <ReviewItemCard
                  key={review.id}
                  review={{ ...review, isLiked }}
                  isLast={index === sortedReviews.length - 1 && !hasMore}
                  onEdit={() => onEditReview?.(review.id)}
                  onDelete={() => onDeleteReview?.(review.id)}
                  onReport={() => onReportReview?.(review.id)}
                  onLike={() => handleLike(review.id, isLiked)}
                  menuOpen={activeMenuId === review.id}
                  onMenuToggle={() =>
                    setActiveMenuId((prev) => (prev === review.id ? null : review.id))
                  }
                  onMenuClose={() => setActiveMenuId(null)}
                />
              );
            })
          )}

          {/* 무한 스크롤 트리거 */}
          {hasMore && (
            <LoadMoreTrigger onTrigger={handleLoadMore} isLoading={isLoadingMore} />
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: rs(16),
  },
  filterWrapper: {
    gap: rs(10),
    marginVertical: -rs(2),
  },
  filterDivider: {
    height: 2,
    backgroundColor: '#F5F5F5',
    marginHorizontal: -rs(20),
  },

  // Review List
  reviewList: {},
  emptyReview: {
    paddingVertical: rs(40),
    alignItems: 'center',
  },
  emptyReviewText: {
    fontSize: rs(14),
    color: '#999',
  },

  // Load More Trigger
  loadMoreTrigger: {
    paddingVertical: rs(20),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: rs(60),
  },

  // Rating Block
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(16),
    gap: rs(32),
  },
  ratingLeft: {
    alignItems: 'center',
    gap: rs(8),
  },
  ratingLabel: {
    fontSize: rs(12),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  ratingScoreBox: {
    alignItems: 'center',
    gap: rs(4),
  },
  ratingScore: {
    fontSize: rs(24),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    color: '#000',
    lineHeight: rs(33.6),
  },
  ratingRight: {
    gap: rs(6),
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  distributionLabel: {
    fontSize: rs(12),
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#000',
    width: rs(24),
    textAlign: 'right',
  },
  distributionBarContainer: {
    width: rs(130),
    height: rs(4),
    position: 'relative',
    justifyContent: 'center',
  },
  distributionBarBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E6E6E6',
    borderRadius: rs(5),
  },
  distributionBarFill: {
    position: 'absolute',
    left: 0,
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: rs(5),
  },
  distributionCount: {
    fontSize: rs(10),
    fontFamily: 'Pretendard',
    fontWeight: '500',
    color: '#BDBDBD',
    width: rs(20),
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: rs(8),
  },
  filterButton: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: '#C4C4C4',
    backgroundColor: '#FFF',
  },
  filterButtonActive: {
    borderColor: '#309821',
    backgroundColor: '#FFF',
  },
  filterButtonText: {
    fontSize: rs(12),
    color: '#666',
  },
  filterButtonTextActive: {
    fontFamily: Fonts.bold,
    color: '#309821',
  },
  writeButton: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(5),
    borderWidth: 1,
    borderColor: '#C4C4C4',
    backgroundColor: '#FFF',
  },
  writeButtonText: {
    fontSize: rs(12),
    color: '#1d1b20',
  },

  // Review Card Redesign
  reviewCard: {
    paddingTop: rs(16),
  },
  reviewHeader: {
    height: rs(60),
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  profileImage: {
    width: rs(33),
    height: rs(33),
    borderRadius: rs(33 / 2),
  },
  nickname: {
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '700',
    lineHeight: rs(19.6),
  },
  reviewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    width: rs(40),
  },
  ratingValue: {
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: rs(10),
    fontFamily: 'Pretendard',
    fontWeight: '500',
    textAlign: 'right',
  },
  imageGallery: {
    flexDirection: 'row',
    paddingVertical: rs(10),
    gap: rs(5),
  },
  imageThumbnail: {
    width: rs(150),
    height: rs(150),
    backgroundColor: '#D9D9D9',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    gap: rs(9),
    alignItems: 'flex-end',
  },
  reviewContent: {
    width: '100%',
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '400',
    lineHeight: rs(19.6),
  },
  moreButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: rs(12),
    fontFamily: 'Pretendard',
    fontWeight: '500',
    color: '#828282',
  },
  moreIcon: {
    fontSize: rs(14),
    color: '#828282',
    marginLeft: rs(4),
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: rs(10),
  },
  socialStats: {
    flexDirection: 'row',
    gap: rs(20),
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
  },
  socialCount: {
    fontSize: rs(12),
    fontFamily: 'Pretendard',
    fontWeight: '500',
  },
  menuWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  menuButton: {
    padding: rs(4),
  },
  menuDots: {
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '700',
  },
  menuPopup: {
    position: 'absolute',
    top: rs(24),
    right: 0,
    width: rs(78),
    backgroundColor: '#fff',
    borderRadius: rs(5),
    paddingVertical: rs(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    paddingVertical: rs(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: rs(12),
    fontWeight: '400',
    color: '#545454',
  },
  ownerReplySection: {
    paddingTop: rs(10),
    paddingBottom: rs(10),
    gap: rs(9),
  },
  ownerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: rs(50),
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  ownerProfile: {
    width: rs(33),
    height: rs(33),
    backgroundColor: '#309821',
    borderRadius: rs(33 / 2),
  },
  ownerName: {
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '700',
  },
  replyDate: {
    fontSize: rs(10),
    fontFamily: 'Pretendard',
    fontWeight: '500',
    textAlign: 'right',
  },
  replyContent: {
    flex: 1,
    marginLeft: rs(42),
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    fontWeight: '400',
    lineHeight: rs(19.6),
  },
  reviewDivider: {
    height: 2,
    backgroundColor: '#F5F5F5',
    marginHorizontal: -rs(20),
    marginTop: rs(10),
  },

});
