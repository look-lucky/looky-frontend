import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Gray, Owner } from '@/src/shared/theme/theme';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

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
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.greeting}>
            안녕하세요 {userName}님 !
          </ThemedText>
          <ThemedText style={styles.affiliation}>
            {university} {department}
          </ThemedText>
          <ThemedText style={styles.description}>
            학교 앞에서 바로 쓸 수 있는 혜택이 있어요.
          </ThemedText>
        </View>
        <Image
          source={require('@/assets/images/icons/home/clover-home.png')}
          style={styles.cloverImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={handleCouponPress}>
          <View style={[styles.statIcon, styles.couponIcon]}>
            <ThemedText style={styles.statIconText}>🏪</ThemedText>
          </View>
          <ThemedText style={styles.statText}>쿠폰 {couponCount}장</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={handleEventPress}>
          <View style={[styles.statIcon, styles.eventIcon]}>
            <ThemedText style={styles.statIconText}>💰</ThemedText>
          </View>
          <ThemedText style={styles.statText}>이벤트 {eventCount}개</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Owner.primary,
    borderRadius: rs(16),
    padding: rs(20),
    gap: rs(16),
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    gap: rs(4),
  },
  greeting: {
    fontSize: rs(18),
    fontWeight: '700',
    color: Gray.white,
  },
  affiliation: {
    fontSize: rs(12),
    fontWeight: '500',
    color: Gray.white,
    opacity: 0.9,
  },
  description: {
    fontSize: rs(12),
    fontWeight: '400',
    color: Gray.white,
    opacity: 0.8,
    marginTop: rs(4),
  },
  cloverImage: {
    width: rs(80),
    height: rs(80),
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
  statIcon: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponIcon: {
    backgroundColor: '#FF6B6B',
  },
  eventIcon: {
    backgroundColor: '#FFD93D',
  },
  statIconText: {
    fontSize: rs(10),
  },
  statText: {
    fontSize: rs(12),
    fontWeight: '600',
    color: Gray.white,
  },
});
