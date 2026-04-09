import { useGetStudentInfo } from '@/src/api/my-page';
import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { useAuth } from '@/src/shared/lib/auth/auth-context';
import { getToken } from '@/src/shared/lib/auth/token';
import { useEvents } from '@/src/shared/hooks/use-events';
import { useGetHotStores } from '@/src/api/store';
import { useGetMyCoupons, useGetTodayCoupons } from '@/src/api/coupon';
import { rs } from '@/src/shared/theme/scale';
import { Brand, Fonts, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

export default function DebugInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, userType, universityId, collegeId, collegeName, username, loginProvider } = useAuth();
  const [tokenExpiry, setTokenExpiry] = useState<string>('조회 중...');

  const { data: studentInfoRes } = useGetStudentInfo();
  const studentInfo = (studentInfoRes as any)?.data?.data;

  const { data: hotStoresRes } = useGetHotStores({});
  const hotStoreCount = ((hotStoresRes as any)?.data?.data ?? []).length;

  const { data: myCouponsRes } = useGetMyCoupons();
  const myCouponCount = Array.isArray((myCouponsRes as any)?.data?.data)
    ? (myCouponsRes as any).data.data.length
    : 0;

  const { data: todayCouponsRes } = useGetTodayCoupons({
    query: { enabled: !!universityId },
  });
  const todayCouponCount = Array.isArray((todayCouponsRes as any)?.data?.data)
    ? (todayCouponsRes as any).data.data.length
    : 0;

  const { events } = useEvents({ myLocation: null, selectedDistance: '0' });

  useEffect(() => {
    getToken().then((token) => {
      if (!token) {
        setTokenExpiry('없음');
        return;
      }
      const expDate = new Date(token.expiresAt);
      const diffMin = Math.round((token.expiresAt - Date.now()) / 1000 / 60);
      setTokenExpiry(`${expDate.toLocaleTimeString('ko-KR')} (${diffMin > 0 ? `${diffMin}분 후 만료` : '만료됨'})`);
    });
  }, []);

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '(미설정)';

  const buildReport = () => {
    const now = new Date().toLocaleString('ko-KR');
    return [
      `[Looky 앱 진단 리포트]`,
      `시각: ${now}`,
      `앱 버전: ${Constants.expoConfig?.version ?? 'N/A'}`,
      ``,
      `[인증]`,
      `로그인 여부: ${isAuthenticated ? '예' : '아니오'}`,
      `userType: ${userType ?? 'null'}`,
      `loginProvider: ${loginProvider ?? 'null'}`,
      `username: ${username ?? 'null'}`,
      `토큰 만료: ${tokenExpiry}`,
      ``,
      `[대학 정보]`,
      `universityId: ${universityId ?? 'null'}`,
      `collegeId: ${collegeId ?? 'null'}`,
      `collegeName: ${collegeName ?? 'null'}`,
      `서버 universityId: ${studentInfo?.universityId ?? 'null'}`,
      `닉네임: ${studentInfo?.nickname ?? 'null'}`,
      `대학명: ${studentInfo?.universityName ?? 'null'}`,
      `학과: ${studentInfo?.departmentName ?? 'null'}`,
      ``,
      `[데이터 현황]`,
      `이벤트 수: ${events.length}개`,
      `내 쿠폰: ${myCouponCount}개`,
      `오늘의 쿠폰 (서버): ${todayCouponCount}개`,
      `핫플레이스 매장: ${hotStoreCount}개`,
      ``,
      `[환경]`,
      `API URL: ${apiBaseUrl}`,
    ].join('\n');
  };

  const handleCopy = async () => {
    const report = buildReport();
    await Clipboard.setStringAsync(report);
    Alert.alert('복사 완료', '진단 내용이 클립보드에 복사됐어요.\n슬랙에 붙여넣기 해주세요.');
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );

  const Section = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
        <ThemedText style={styles.pageTitle}>앱 진단</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="인증" />
        <Row label="로그인" value={isAuthenticated ? '예' : '아니오'} />
        <Row label="userType" value={userType ?? 'null'} />
        <Row label="loginProvider" value={loginProvider ?? 'null'} />
        <Row label="username" value={username ?? 'null'} />
        <Row label="토큰 만료" value={tokenExpiry} />

        <Section title="대학 정보" />
        <Row label="universityId (로컬)" value={String(universityId ?? 'null')} />
        <Row label="collegeId" value={String(collegeId ?? 'null')} />
        <Row label="collegeName" value={collegeName ?? 'null'} />
        <Row label="universityId (서버)" value={String(studentInfo?.universityId ?? 'null')} />
        <Row label="닉네임" value={studentInfo?.nickname ?? 'null'} />
        <Row label="대학명" value={studentInfo?.universityName ?? 'null'} />
        <Row label="학과" value={studentInfo?.departmentName ?? 'null'} />

        <Section title="데이터 현황" />
        <Row label="이벤트" value={`${events.length}개`} />
        <Row label="내 쿠폰" value={`${myCouponCount}개`} />
        <Row label="오늘의 쿠폰 (서버)" value={`${todayCouponCount}개`} />
        <Row label="핫플레이스 매장" value={`${hotStoreCount}개`} />

        <Section title="환경" />
        <Row label="앱 버전" value={Constants.expoConfig?.version ?? 'N/A'} />
        <Row label="API URL" value={apiBaseUrl} />

        <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.8}>
          <ThemedText style={styles.copyButtonText}>📋 전체 복사 (슬랙 전달용)</ThemedText>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Gray.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    gap: rs(12),
  },
  headerRight: { width: rs(24) },
  pageTitle: {
    flex: 1,
    fontSize: rs(18),
    fontFamily: Fonts.bold,
    color: TextColor.primary,
  },
  content: { paddingBottom: rs(50) },
  sectionHeader: {
    paddingHorizontal: rs(20),
    paddingTop: rs(20),
    paddingBottom: rs(8),
  },
  sectionTitle: {
    fontSize: rs(12),
    fontFamily: Fonts.regular,
    color: TextColor.tertiary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    borderBottomColor: Gray.gray3,
  },
  label: {
    fontSize: rs(14),
    fontFamily: Fonts.regular,
    color: TextColor.secondary,
  },
  value: {
    fontSize: rs(14),
    fontFamily: Fonts.medium,
    color: TextColor.primary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  copyButton: {
    marginHorizontal: rs(20),
    marginTop: rs(28),
    paddingVertical: rs(16),
    borderRadius: rs(12),
    backgroundColor: Brand.primary,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: rs(15),
    fontFamily: Fonts.semiBold,
    color: Gray.white,
  },
  bottomSpacer: { height: rs(40) },
});
