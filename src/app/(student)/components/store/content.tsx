import { rs } from '@/src/shared/theme/scale';
import type {
  Announcement,
  MenuCategory,
  NewsItem,
  RecommendStore,
  ReviewItem,
  ReviewRating,
} from '@/src/shared/types/store';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RecommendSection } from './recommend-section';
import { ReportSection } from './report-section';
import { InfoSection, type StoreInfo } from './tabs/info-section';
import { MenuSection } from './tabs/menu-section';
import { NewsSection } from './tabs/news-section';
import { ReviewSection } from './tabs/review-section';
import { TabNavigation } from './tabs/tab-navigation';

// Re-export types for convenience
export type { Announcement, RecommendStore };

interface StoreContentProps {
  storeId: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  news: NewsItem[];
  menu: MenuCategory[];
  menuImageUrls?: string[];
  announcements: Announcement[];
  recommendStores: RecommendStore[];
  reviewRating: ReviewRating;
  reviews: ReviewItem[];
  onWriteReview?: () => void;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReportReview?: (reviewId: string) => void;
  onLikeReview?: (reviewId: string) => void;
  storeInfo?: StoreInfo;
  scrollViewRef?: React.RefObject<ScrollView | null>;
  scrollOffsetY?: React.RefObject<number>;
  onLoadMoreReviews?: () => void;
  hasMoreReviews?: boolean;
  isLoadingMoreReviews?: boolean;
}

export function StoreContent({
  storeId,
  activeTab,
  onTabChange,
  news,
  menu,
  menuImageUrls,
  announcements,
  recommendStores,
  reviewRating,
  reviews,
  onWriteReview,
  onEditReview,
  onDeleteReview,
  onReportReview,
  onLikeReview,
  storeInfo,
  scrollViewRef,
  scrollOffsetY,
  onLoadMoreReviews,
  hasMoreReviews,
  isLoadingMoreReviews,
}: StoreContentProps) {
  return (
    <View style={styles.container}>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === 'news' && <NewsSection news={news} storeId={storeId} />}
      {activeTab === 'menu' && (
        <MenuSection
          categories={menu}
          menuImageUrls={menuImageUrls}
          scrollViewRef={scrollViewRef}
          scrollOffsetY={scrollOffsetY}
        />
      )}
      {activeTab === 'review' && (
        <ReviewSection
          rating={reviewRating}
          reviews={reviews}
          onWriteReview={onWriteReview}
          onEditReview={onEditReview}
          onDeleteReview={onDeleteReview}
          onReportReview={onReportReview}
          onLikeReview={onLikeReview}
          onLoadMore={onLoadMoreReviews}
          hasMore={hasMoreReviews}
          isLoadingMore={isLoadingMoreReviews}
        />
      )}

      {activeTab === 'info' && storeInfo && (
        <InfoSection {...storeInfo} scrollViewRef={scrollViewRef} scrollOffsetY={scrollOffsetY} />
      )}

      {activeTab === 'news' && (
        <>
          <RecommendSection stores={recommendStores} />
          <ReportSection storeId={storeId} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: rs(16),
  },
});
