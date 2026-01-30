import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// [더미 데이터] 진행 중인 쿠폰
const ACTIVE_COUPONS = [
    { 
        id: 1, 
        title: '마감 빵 세트', 
        desc: '새해 이벤트로 빵세트 할인해드려용', 
        date: '2026년 01월 10일 17시까지', 
        value: '20%', 
        count: 23, 
        type: 'percent',
        bgColor: '#FFDDDE', 
        Image: require('@/assets/images/shopowner/coupon-percent.png')
    },
    { 
        id: 2, 
        title: '아메리카노 할인쿠폰', 
        desc: '새해 이벤트로 커피 할인해드려용', 
        date: '2026년 01월 11일 18시까지', 
        value: '1,500원', 
        count: 23, 
        type: 'amount', 
        bgColor: '#BEFFD1',
        Image: require('@/assets/images/shopowner/coupon-price.png')
    },
    { 
        id: 3, 
        title: '치즈볼 3구 증정', 
        desc: '새해 이벤트로 치즈볼 드려용', 
        date: '2026년 01월 13일 14시까지', 
        value: '서비스 증정', 
        count: 1, 
        type: 'gift', 
        bgColor: '#FFEABC',
        Image: require('@/assets/images/shopowner/coupon-present.png')
    },
];

// [더미 데이터] 종료된 쿠폰
const EXPIRED_COUPONS = [
    { 
        id: 4, 
        title: '마감 빵 세트', 
        desc: '새해 이벤트로 빵세트 할인해드려용', 
        date: '2026년 01월 10일 17시까지', 
        value: '20%', 
        count: 0, 
        type: 'percent', 
        bgColor: '#FFDDDE',
    },
    { 
        id: 5, 
        title: '아메리카노 할인쿠폰', 
        desc: '새해 이벤트로 커피 할인해드려용', 
        date: '2026년 01월 11일 18시까지', 
        value: '1,500원', 
        count: 7, 
        type: 'amount', 
        bgColor: '#BEFFD1',
    },
    { 
        id: 6, 
        title: '치즈볼 3구 증정', 
        desc: '새해 이벤트로 치즈볼 드려용', 
        date: '2026년 01월 13일 14시까지', 
        value: '서비스 증정', 
        count: 0, 
        type: 'gift', 
        bgColor: '#FFEABC',
    },
];

const FILTERS = ['전체', '금액 할인', '퍼센트 할인', '서비스 증정'];

export default function CouponListScreen({ navigation, route }) {
  const initialTab = route.params?.initialTab || 'active';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedFilter, setSelectedFilter] = useState('전체');

  const currentData = activeTab === 'active' ? ACTIVE_COUPONS : EXPIRED_COUPONS;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#F7F7F7' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 상단 배너 */}
        <View style={styles.bannerContainer}>
            <LinearGradient
                colors={['#33B369', 'rgba(47, 183, 134, 0.80)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.bannerGradient}
            >
                <View style={styles.bannerTextContent}>
                    <Text style={styles.bannerTitle}>쿠폰함</Text>
                    <Text style={styles.bannerDesc}>
                        특별한 혜택이 학생들을 기다리고 있어요.{'\n'}
                        쿠폰을 통해 매장에 활기를 더해보세요!
                    </Text>
                </View>
                <Image 
                    source={require('@/assets/images/shopowner/bgclover.png')} 
                    style={styles.bannerImage} 
                />
            </LinearGradient>
        </View>

        {/* 탭 (진행중 / 종료) */}
        <View style={styles.tabContainer}>
            <View style={styles.tabButtonRow}>
                <TouchableOpacity 
                    style={styles.tabButton} 
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' ? styles.tabTextActive : styles.tabTextInactive]}>진행중</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.tabButton} 
                    onPress={() => setActiveTab('expired')}
                >
                    <Text style={[styles.tabText, activeTab === 'expired' ? styles.tabTextActive : styles.tabTextInactive]}>종료</Text>
                </TouchableOpacity>
            </View>
            
            {/* 하단 인디케이터 라인 */}
            <View style={styles.indicatorContainer}>
                <View style={styles.indicatorBg} />
                <View style={[
                    styles.indicatorActive, 
                    activeTab === 'expired' ? { left: '50%' } : { left: '24%' }
                ]} />
            </View>
        </View>

        {/* 필터 태그 (가로 스크롤) */}
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {FILTERS.map((filter) => (
                    <TouchableOpacity 
                        key={filter}
                        style={[styles.filterChip, selectedFilter === filter ? styles.filterChipSelected : styles.filterChipUnselected]}
                        onPress={() => setSelectedFilter(filter)}
                    >
                        <Text style={[styles.filterText, selectedFilter === filter ? styles.filterTextSelected : styles.filterTextUnselected]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* 쿠폰 리스트 */}
        <View style={styles.listContainer}>
            {currentData.map((item) => (
                <View 
                    key={item.id} 
                    style={[
                        styles.couponCard, 
                        activeTab === 'expired' && styles.expiredCard 
                    ]}
                >
                    {/* 왼쪽 아이콘 박스 */}
                    <View style={[styles.cardIconBox, { backgroundColor: item.bgColor }, activeTab === 'expired' && { opacity: 0.5 }]}> 
                        {item.type === 'percent' && <Image source ={require('@/assets/images/shopowner/coupon-percent.png')}  />}
                        {item.type === 'amount' && <Image source ={require('@/assets/images/shopowner/coupon-price.png')} />}
                        {item.type === 'gift' && <Image source ={require('@/assets/images/shopowner/coupon-present.png')} />}
                    </View>

                    {/* 가운데 정보 */}
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, activeTab === 'expired' && { color: '#A3A3A3' }]}>{item.title}</Text>
                        <Text style={[styles.cardDesc, activeTab === 'expired' && { color: '#D4D4D4' }]}>{item.desc}</Text>
                        
                        <View style={styles.cardBottomRow}>
                            <Text style={[styles.cardDate, activeTab === 'expired' && { color: '#D4D4D4' }]}>{item.date}</Text>
                            <Text style={[styles.cardValue, activeTab === 'expired' && { color: '#A3A3A3' }]}>{item.value}</Text>
                        </View>
                    </View>

                    {/* 오른쪽 뱃지 (장수) */}
                    <View style={[styles.countBadge, activeTab === 'expired' && { backgroundColor: '#E5E7EB' }]}>
                        <Text style={[styles.countText, activeTab === 'expired' && { color: '#9CA3AF' }]}>{item.count}장</Text>
                    </View>
                </View>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10) },
  scrollContent: { paddingBottom: rs(50) },

  // 배너
  bannerContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(20) },
  bannerGradient: { height: rs(110),borderRadius: rs(12), padding: rs(20),position: 'relative', overflow: 'hidden', shadowColor: "#000",shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,},
  bannerTextContent: { zIndex: 2 },
  bannerTitle: { fontSize: rs(20), fontWeight: '700', color: 'white', marginBottom: rs(8), fontFamily: 'Pretendard' },
  bannerDesc: { fontSize: rs(12), color: 'white', lineHeight: rs(18), fontFamily: 'Pretendard', fontWeight: '600' },
  bannerImage: { position: 'absolute', right: rs(10), top: rs(10), width: rs(94), height: rs(94), opacity: 0.6, zIndex: 1,},

  // 탭
  tabContainer: { width: '100%', alignItems: 'center', marginBottom: rs(15) },
  tabButtonRow: { flexDirection: 'row', width: rs(200), justifyContent: 'space-between', marginBottom: rs(10) },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: rs(5) },
  tabText: { fontSize: rs(14), fontFamily: 'Pretendard' },
  tabTextActive: { fontWeight: '700', color: 'black' },
  tabTextInactive: { fontWeight: '400', color: '#828282' },
  
  indicatorContainer: { width: '100%', height: rs(2), backgroundColor: '#EFEFEF', position: 'relative' },
  indicatorBg: { width: '100%', height: '100%' },
  indicatorActive: { position: 'absolute', top: 0, width: rs(100), height: '100%', backgroundColor: 'black',},

  // 필터
  filterContainer: { marginBottom: rs(15) },
  filterScroll: { paddingHorizontal: rs(20), gap: rs(8) },
  filterChip: { paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(20),borderWidth: 1, justifyContent: 'center',alignItems: 'center',  height: rs(28), },
  filterChipSelected: { backgroundColor: 'black', borderColor: 'black' },
  filterChipUnselected: { backgroundColor: 'white', borderColor: 'transparent', shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  filterText: { fontSize: rs(12), fontFamily: 'Pretendard', fontWeight: '700' },
  filterTextSelected: { color: 'white' },
  filterTextUnselected: { color: 'black' },

  // 리스트
  listContainer: { paddingHorizontal: rs(20), gap: rs(10) },
  couponCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFB', borderRadius: rs(15), padding: rs(15), shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, height: rs(100), },
  // [종료 탭]
  expiredCard: { backgroundColor: '#FAFAFA', opacity: 0.7, },

  cardIconBox: { width: rs(65), height: rs(65), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center', marginRight: rs(15), },
  cardInfo: { flex: 1, height: '100%', justifyContent: 'space-between', paddingVertical: rs(2) },
  cardTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  cardDesc: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', marginTop: rs(2) },
  
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(10) },
  cardDate: { fontSize: rs(10), fontWeight: '500', color: '#757575', fontFamily: 'Pretendard' },
  cardValue: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },

  countBadge: { position: 'absolute', top: rs(15), right: rs(15), backgroundColor: '#34B262', borderRadius: rs(10), paddingHorizontal: rs(8), paddingVertical: rs(3), },
  countText: { fontSize: rs(10), fontWeight: '600', color: 'white', fontFamily: 'Pretendard' },
});