import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import BannerCoupon from '@/assets/images/icons/home/banner-coupon.svg';
import BannerEvent from '@/assets/images/icons/home/banner-event.svg';

interface WelcomeBannerProps {
  userName: string;
  university: string;
  department: string;
  couponCount: number;
  eventCount: number;
}

export function WelcomeBanner({
  userName,
  university,
  department,
  couponCount,
  eventCount,
}: WelcomeBannerProps) {
  const router = useRouter();

  const handleCouponPress = () => {
    router.push('/(student)/(tabs)/map');
  };

  const handleEventPress = () => {
    // TODO: 이벤트 필터링된 지도로 이동
    router.push('/map?category=EVENT');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.textContainer}>
          <ThemedText type="subtitle" lightColor={Gray.white}>
            안녕하세요 {userName}님!
          </ThemedText>
          <ThemedText type="caption" lightColor={Gray.white}>
            {university} {department}
          </ThemedText>
          <ThemedText type="caption" lightColor={Gray.white} style={{ marginTop: rs(8) }}>
            학교 앞에서 바로 쓸 수 있는 혜택이 있어요.
          </ThemedText>
        </View>
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={handleCouponPress}>
            <BannerCoupon width={rs(20)} height={rs(20)} />
            <ThemedText style={styles.statText}>쿠폰 {couponCount}장</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={handleEventPress}>
            <BannerEvent width={rs(20)} height={rs(20)} />
            <ThemedText style={styles.statText}>이벤트 {eventCount}개</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={require('@/assets/images/icons/home/clover-home.png')}
        style={styles.cloverImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Owner.primary,
    borderRadius: rs(12),
    padding: rs(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    gap: rs(12),
  },
  textContainer: {},
  cloverImage: {
    width: rs(96),
    height: rs(96),
  },
  statsContainer: {
    flexDirection: 'row',
    gap: rs(12),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: rs(8),
    paddingHorizontal: rs(12),
    borderRadius: rs(20),
  },
  statText: {
    fontSize: rs(12),
    fontWeight: '600',
    color: Gray.white,
  },
});
