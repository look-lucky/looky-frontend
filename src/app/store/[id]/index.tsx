import { ThemedText } from '@/src/components/themed-text';
import { StoreBenefits } from '@/src/components/store/benefits';
import { BottomFixedBar } from '@/src/components/store/bottom-bar';
import { StoreContent } from '@/src/components/store/content';
import { StoreHeader } from '@/src/components/store/header';
import { DUMMY_STORE_DETAILS } from '@/src/data/mock/store';
import { rs } from '@/src/theme/scale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('news');
  const [isLiked, setIsLiked] = useState(false);

  // TODO: API 연동 시 fetch로 교체
  const store = DUMMY_STORE_DETAILS.find((s) => s.id === id);

  if (!store) {
    return (
      <View style={styles.container}>
        <ThemedText>가게를 찾을 수 없습니다.</ThemedText>
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCouponPress = () => {
    // 쿠폰 받기 로직
  };

  const handleWriteReview = () => {
    router.push(`/store/${id}/review/write`);
  };

  const handleEditReview = (reviewId: string) => {
    router.push(`/store/${id}/review/write?reviewId=${reviewId}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: rs(80) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StoreHeader
          image={store.image}
          cloverGrowth={store.cloverGrowth}
          isLiked={isLiked}
          name={store.name}
          rating={store.rating}
          category={store.category}
          reviewCount={store.reviewCount}
          address={store.address}
          openHours={store.openHours}
          university={store.university}
          isPartner={store.isPartner}
          onBack={handleBack}
          onLike={handleLike}
        />

        <View style={styles.content}>
          <StoreBenefits
            benefits={store.benefits}
            coupons={store.coupons}
          />

          <StoreContent
            storeId={String(id)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            news={store.news}
            menu={store.menu}
            announcements={store.announcements}
            recommendStores={store.recommendStores}
            reviewRating={store.reviewRating}
            reviews={store.reviews}
            onWriteReview={handleWriteReview}
            onEditReview={handleEditReview}
          />
        </View>
      </ScrollView>

      <BottomFixedBar
        likeCount={store.likeCount}
        isLiked={isLiked}
        onLikePress={handleLike}
        onCouponPress={handleCouponPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: rs(20),
    gap: rs(16),
  },
});
