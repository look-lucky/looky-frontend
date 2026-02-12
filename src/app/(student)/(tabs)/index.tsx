import { useGetMyCoupons, useGetTodayCoupons } from '@/src/api/coupon';
import { useGetStudentInfo } from '@/src/api/my-page';
import { customFetch } from '@/src/api/mutator';
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
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NearDealLogo from '@/assets/images/logo/neardeal-logo.svg';

export default function HomePage() {
  const router = useRouter();

  const { data: studentInfoRes } = useGetStudentInfo();
  const studentInfo = (studentInfoRes as any)?.data?.data;

  const { data: myCouponsRes } = useGetMyCoupons();
  const rawCoupons = (myCouponsRes as any)?.data?.data;
  const couponCount = Array.isArray(rawCoupons) ? rawCoupons.length : 0;

  const { data: todayCouponsRes } = useGetTodayCoupons();
  const todayCoupons = ((todayCouponsRes as any)?.data?.data ?? []).map((c: any) => ({
    id: c.id,
    storeId: c.storeId,
    title: c.title ?? '',
    description: c.description,
    benefitType: c.benefitType,
    benefitValue: c.benefitValue ?? '',
    issueStartsAt: c.issueStartsAt,
  }));

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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <NearDealLogo width={rs(92)} height={rs(28)} />
        </View>

        {/* Welcome Banner */}
        <WelcomeBanner
          userName={studentInfo?.username ?? '학생'}
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
    paddingVertical: rs(12),
  },
  section: {
    marginTop: rs(16),
  },
  bottomSpacer: {
    height: rs(100),
  },
});
