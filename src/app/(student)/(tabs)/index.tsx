import { useGetMyCoupons, useGetTodayCoupons } from '@/src/api/coupon';
import { customFetch } from '@/src/api/mutator';
import { useGetStudentInfo } from '@/src/api/my-page';
import { useGetHotStores } from '@/src/api/store';
import { CategorySection } from '@/src/app/(student)/components/home/category-section';
import { CouponSection } from '@/src/app/(student)/components/home/coupon-section';
import { EventSection } from '@/src/app/(student)/components/home/event-section';
import {
  HotPlaceItem,
  HotPlaceSection,
} from '@/src/app/(student)/components/home/hot-place-section';
import { WelcomeBanner } from '@/src/app/(student)/components/home/welcome-banner';
import { rs } from '@/src/shared/theme/scale';
import { Gray } from '@/src/shared/theme/theme';
import { useScrollToTop } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LookyLogo from '@/assets/images/logo/looky-logo.svg';

export default function HomePage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("앱 종료", "앱을 종료하시겠습니까?", [
        { text: "취소", style: "cancel" },
        { text: "종료", style: "destructive", onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });
    return () => subscription.remove();
  }, []);

  const { data: studentInfoRes } = useGetStudentInfo();
  const studentInfo = (studentInfoRes as any)?.data?.data;

  const { data: myCouponsRes } = useGetMyCoupons();
  const rawCoupons = (myCouponsRes as any)?.data?.data;
  const couponCount = Array.isArray(rawCoupons) ? rawCoupons.length : 0;

  const { data: todayCouponsRes } = useGetTodayCoupons();
  const todayCoupons = ((todayCouponsRes as any)?.data?.data ?? []).map((item: any) => {
    // API 응답 구조가 [{ data: { id, storeName, ... } }] 형태일 가능성 대비
    const c = item.data || item;
    return {
      id: c.id || item.id,
      storeId: c.storeId || item.storeId,
      // 가능한 모든 필드명을 확인하여 매핑 (storeName, name, store_name, brandName, shopName 등)
      storeName: c.storeName || item.storeName || c.store?.name || item.store?.name || c.name || item.name || c.store_name || item.store_name || c.brandName || item.brandName || c.shopName || item.shopName || '',
      title: c.title ?? item.title ?? '',
      description: c.description ?? item.description,
      benefitType: c.benefitType ?? item.benefitType,
      benefitValue: c.benefitValue ?? item.benefitValue ?? '',
      issueStartsAt: c.issueStartsAt ?? item.issueStartsAt,
    };
  });

  const { data: hotStoresRes } = useGetHotStores({ query: { staleTime: 5 * 60 * 1000 } });
  const hotPlaces: HotPlaceItem[] = ((hotStoresRes as any)?.data?.data ?? []).map(
    (s: any, index: number) => ({
      id: s.storeId,
      rank: index + 1,
      name: s.name,
      category: s.categories?.[0] ?? '',
      organization: s.benefitContent ?? '',
      weeklyFavoriteCount: s.favoriteGain ?? 0,
    }),
  );

  const { data: eventsRes } = useQuery({
    queryKey: ['home-events'],
    queryFn: () =>
      customFetch<{ data: { data: { content: any[] } }; status: number; headers: Headers }>(
        '/api/events?status=UPCOMING&status=LIVE&size=10',
        { method: 'GET' },
      ),
    staleTime: 3 * 60 * 1000,
  });
  const events = eventsRes?.data?.data?.content ?? [];
  const eventCount = events.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LookyLogo width={rs(120)} height={rs(37)} />
        </View>

        {/* Welcome Banner */}
        <WelcomeBanner
          userName={studentInfo?.nickname ?? studentInfo?.username ?? '학생'}
          university={studentInfo?.universityName ?? '대학교'}
          department={`${studentInfo?.collegeName ?? ''} ${studentInfo?.departmentName ?? ''}`.trim()}
          couponCount={couponCount}
          eventCount={eventCount}
        />

        {/* Event Section */}
        <View style={styles.section}>
          <EventSection events={events} />
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <CategorySection />
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <CouponSection coupons={todayCoupons} />
        </View>

        {/* Hot Place Section */}
        <View style={styles.section}>
          <HotPlaceSection places={hotPlaces} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.gray1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: rs(12),
    paddingBottom: rs(4),
    marginLeft: rs(-5),
  },
  section: {
    marginTop: rs(16),
  },
  bottomSpacer: {
    height: rs(140),
  },
});
