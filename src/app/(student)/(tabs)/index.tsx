import { useGetMyCoupons, useGetTodayCoupons } from '@/src/api/coupon';
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
import { useEvents } from '@/src/shared/hooks/use-events';
import { rs } from '@/src/shared/theme/scale';
import { Gray } from '@/src/shared/theme/theme';
import { useScrollToTop } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { Alert, BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LookyLogo from '@/assets/images/logo/looky-logo.svg';

export default function HomePage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        Alert.alert("앱 종료", "앱을 종료하시겠습니까?", [
          { text: "취소", style: "cancel" },
          { text: "종료", style: "destructive", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  const { data: studentInfoRes } = useGetStudentInfo();
  const studentInfo = (studentInfoRes as any)?.data?.data;
  const universityId = studentInfo?.universityId;

  const { data: myCouponsRes } = useGetMyCoupons();
  const rawCoupons = (myCouponsRes as any)?.data?.data;
  const couponCount = Array.isArray(rawCoupons) ? rawCoupons.length : 0;

  // 오늘의 신규 쿠폰 조회 (백엔드 통합 API 사용)
  const { data: todayCouponsRes } = useGetTodayCoupons({
    query: {
      enabled: !!universityId,
      staleTime: 0,
    },
  });

  // 3. 데이터 정규화 및 필터링 (24시간)
  const todayCoupons = useMemo(() => {
    const isWithin24HoursRaw = (dateString?: string) => {
      if (!dateString) return false;
      let dateToParse = dateString;
      if (!dateString.includes('Z') && !dateString.includes('+')) {
        dateToParse = dateString.replace(' ', 'T') + 'Z';
      }
      const created = new Date(dateToParse);
      const now = new Date();
      const diffMs = now.getTime() - created.getTime();
      const adjustedDiffMs = Math.abs(diffMs - 32400000) < 600000 ? 0 : diffMs;
      return adjustedDiffMs >= 0 && adjustedDiffMs <= 24 * 60 * 60 * 1000;
    };

    const baseCouponsRaw = (todayCouponsRes as any)?.data?.data ?? [];
    if (Array.isArray(baseCouponsRaw) && baseCouponsRaw.length > 0) {
      console.log(`[쿠폰디버그 v5] API에서 ${baseCouponsRaw.length}개의 쿠폰 수신`);
    }

    const result = (Array.isArray(baseCouponsRaw) ? baseCouponsRaw : [])
      .map((item: any) => {
        const c = item.data || item;
        return {
          ...c,
          id: c.id || item.id || c.couponId || item.couponId,
          storeName: c.storeName || item.storeName || c.store?.name || item.store?.name || '',
          title: c.title ?? item.title ?? '',
          description: c.description ?? item.description,
          benefitType: c.benefitType ?? item.benefitType ?? 'SERVICE_GIFT',
          benefitValue: c.benefitValue ?? item.benefitValue ?? '',
          issueStartsAt: c.issueStartsAt ?? item.issueStartsAt,
        };
      })
      .filter(c => isWithin24HoursRaw(c.issueStartsAt))
      .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    return result;
  }, [todayCouponsRes]);

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

  const { events: allEvents } = useEvents({ myLocation: null, selectedDistance: '0' });
  const events = allEvents.slice(0, 10).map((e) => ({
    id: Number(e.id),
    title: e.title,
    description: e.description,
    eventTypes: e.eventTypes,
    startDateTime: e.startDateTime.toISOString(),
    endDateTime: e.endDateTime.toISOString(),
    status: e.status === 'live' ? 'LIVE' as const : e.status === 'upcoming' ? 'UPCOMING' as const : 'ENDED' as const,
    imageUrls: e.imageUrls,
  }));
  const eventCount = allEvents.length;

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
