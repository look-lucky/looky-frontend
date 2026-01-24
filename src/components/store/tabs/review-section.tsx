import FavoriteIcon from '@/assets/images/icons/store/favorite.svg';
import SpeechBubbleIcon from '@/assets/images/icons/store/speech-bubble.svg';
import StarIcon from '@/assets/images/icons/store/star.svg';
import { ThemedText } from '@/src/components/common/themed-text';
import { rs } from '@/src/theme/scale';
import type { ReviewItem, ReviewRating } from '@/src/types/store';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
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
}

// ============================================
// ReviewRatingBlock
// ============================================

function ReviewRatingBlock({ rating }: { rating: ReviewRating }) {
  const maxCount = Math.max(...Object.values(rating.distribution), 1);

  return (
    <View style={styles.ratingBlock}>
      <View style={styles.ratingLeft}>
        <ThemedText style={styles.ratingLabel}>
          {rating.totalCount}개 리뷰 별점 평균
        </ThemedText>
        <View style={styles.ratingScoreRow}>
          <StarIcon width={rs(16)} height={rs(16)} color="#FFCC00" />
          <ThemedText style={styles.ratingScore}>
            {rating.averageRating.toFixed(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.ratingRight}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.distributionRow}>
            <ThemedText style={styles.distributionLabel}>{star}점</ThemedText>
            <View style={styles.distributionBarBg}>
              <View
                style={[
                  styles.distributionBarFill,
                  {
                    width: `${(rating.distribution[star as keyof typeof rating.distribution] / maxCount) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
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
          >
            베스트순
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.writeButton} onPress={onWriteReview}>
        <ThemedText style={styles.writeButtonText}>✏️ 리뷰 쓰기</ThemedText>
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
  isLast,
}: {
  review: ReviewItem;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isLast?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.reviewCard, !isLast && styles.reviewCardWithDivider]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          <View style={styles.profileImage}>
            {review.profileImage ? (
              <Image
                source={{ uri: review.profileImage }}
                style={styles.profileImageInner}
              />
            ) : (
              <View style={styles.profileImagePlaceholder} />
            )}
          </View>
          <ThemedText style={styles.nickname}>{review.nickname}</ThemedText>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <ThemedText style={styles.menuDots}>⋯</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewMeta}>
        <StarIcon width={rs(12)} height={rs(12)} color="#FFCC00" />
        <ThemedText style={styles.ratingText}>{review.rating}</ThemedText>
        <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
      </View>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <View style={styles.imageContainer}>
          {review.images.map((image, index) => (
            <View key={index} style={styles.reviewImageWrapper}>
              <Image source={{ uri: image }} style={styles.reviewImage} />
            </View>
          ))}
        </View>
      )}

      <View>
        <ThemedText
          style={styles.reviewContent}
          numberOfLines={expanded ? undefined : 4}
        >
          {review.content}
        </ThemedText>
        {!expanded && review.content.length > 150 && (
          <TouchableOpacity onPress={() => setExpanded(true)}>
            <ThemedText style={styles.moreButton}>더보기</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.reviewActions}>
        <View style={styles.actionItem}>
          <FavoriteIcon width={rs(20)} height={rs(20)} color="#999" />
          <ThemedText style={styles.actionCount}>{review.likeCount}</ThemedText>
        </View>
        <View style={styles.actionItem}>
          <SpeechBubbleIcon width={rs(20)} height={rs(20)} color="#999" />
          <ThemedText style={styles.actionCount}>{review.commentCount}</ThemedText>
        </View>
      </View>

      {/* Bottom Sheet Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            {review.isOwner ? (
              <>
                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onEdit?.();
                  }}
                >
                  <ThemedText style={styles.bottomSheetItemText}>수정</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomSheetItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onDelete?.();
                  }}
                >
                  <ThemedText style={[styles.bottomSheetItemText, styles.deleteText]}>
                    삭제
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.bottomSheetItem}
                onPress={() => {
                  setMenuVisible(false);
                  onReport?.();
                }}
              >
                <ThemedText style={styles.bottomSheetItemText}>신고</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ============================================
// ReviewSection
// ============================================

export function ReviewSection({
  rating,
  reviews,
  onWriteReview,
  onEditReview,
  onDeleteReview,
  onReportReview,
}: ReviewSectionProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (activeFilter === 'best') {
      return b.likeCount - a.likeCount;
    }
    // recent: 날짜 내림차순
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <View style={styles.container}>
      <ReviewRatingBlock rating={rating} />

      <ReviewFilter
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onWriteReview={onWriteReview}
      />

      <View style={styles.reviewList}>
        {sortedReviews.map((review, index) => (
          <ReviewItemCard
            key={review.id}
            review={review}
            isLast={index === sortedReviews.length - 1}
            onEdit={() => onEditReview?.(review.id)}
            onDelete={() => onDeleteReview?.(review.id)}
            onReport={() => onReportReview?.(review.id)}
          />
        ))}
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: rs(16),
  },

  // Rating Block
  ratingBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: rs(16),
    gap: rs(24),
  },
  ratingLeft: {
    gap: rs(8),
  },
  ratingLabel: {
    fontSize: rs(12),
    color: '#666',
  },
  ratingScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  ratingScore: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1d1b20',
  },
  ratingRight: {
    flex: 1,
    gap: rs(4),
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  distributionLabel: {
    fontSize: rs(12),
    color: '#666',
    width: rs(24),
  },
  distributionBarBg: {
    flex: 1,
    height: rs(3),
    backgroundColor: '#E0E0E0',
    borderRadius: rs(2),
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: rs(2),
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
    borderColor: '#34A853',
    backgroundColor: '#9CFF8D',
  },
  filterButtonText: {
    fontSize: rs(12),
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#1d1b20',
    fontWeight: '500',
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

  // Review List
  reviewList: {},

  // Review Card
  reviewCard: {
    paddingVertical: rs(16),
    gap: rs(12),
  },
  reviewCardWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  profileImage: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    overflow: 'hidden',
  },
  profileImageInner: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  nickname: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1d1b20',
  },
  menuButton: {
    padding: rs(4),
  },
  menuDots: {
    fontSize: rs(20),
    color: '#999',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  ratingText: {
    fontSize: rs(12),
    color: '#1d1b20',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: rs(12),
    color: '#999',
    marginLeft: rs(8),
  },

  // Review Images
  imageContainer: {
    flexDirection: 'row',
    gap: rs(8),
  },
  reviewImageWrapper: {
    width: rs(100),
    height: rs(100),
    borderRadius: rs(8),
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },

  reviewContent: {
    fontSize: rs(12),
    color: '#1d1b20',
    lineHeight: rs(18),
  },
  moreButton: {
    fontSize: rs(12),
    color: '#828282',
    marginTop: rs(4),
  },
  reviewActions: {
    flexDirection: 'row',
    gap: rs(16),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },
  actionCount: {
    fontSize: rs(12),
    color: '#999',
  },

  // Bottom Sheet
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: rs(16),
    borderTopRightRadius: rs(16),
    paddingBottom: rs(34),
    paddingTop: rs(12),
  },
  bottomSheetHandle: {
    width: rs(40),
    height: rs(4),
    backgroundColor: '#E0E0E0',
    borderRadius: rs(2),
    alignSelf: 'center',
    marginBottom: rs(16),
  },
  bottomSheetItem: {
    paddingVertical: rs(16),
    paddingHorizontal: rs(20),
  },
  bottomSheetItemText: {
    fontSize: rs(16),
    color: '#1d1b20',
    textAlign: 'center',
  },
  deleteText: {
    color: '#FF4444',
  },
});
