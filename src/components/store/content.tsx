import type {
  Announcement,
  MenuCategory,
  NewsItem,
  RecommendStore,
  ReviewItem,
  ReviewRating,
} from '@/src/types/store';
import { rs } from '@/src/theme/scale';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnnouncementCarousel } from './announcement-carousel';
import { RecommendSection } from './recommend-section';
import { ReportSection } from './report-section';
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
  announcements: Announcement[];
  recommendStores: RecommendStore[];
  reviewRating: ReviewRating;
  reviews: ReviewItem[];
  onWriteReview?: () => void;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onReportReview?: (reviewId: string) => void;
}

export function StoreContent({
  storeId,
  activeTab,
  onTabChange,
  news,
  menu,
  announcements,
  recommendStores,
  reviewRating,
  reviews,
  onWriteReview,
  onEditReview,
  onDeleteReview,
  onReportReview,
}: StoreContentProps) {
  return (
    <View style={styles.container}>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === 'news' && <NewsSection news={news} storeId={storeId} />}
      {activeTab === 'menu' && <MenuSection categories={menu} />}
      {activeTab === 'review' && (
        <ReviewSection
          rating={reviewRating}
          reviews={reviews}
          onWriteReview={onWriteReview}
          onEditReview={onEditReview}
          onDeleteReview={onDeleteReview}
          onReportReview={onReportReview}
        />
      )}

      {activeTab === 'news' && (
        <>
          <AnnouncementCarousel announcements={announcements} />
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
