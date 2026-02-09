import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
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

// [API] 함수 임포트
import { getCouponsByStore } from '@/src/api/coupon';
import { getMyStores } from '@/src/api/store';

const { width } = Dimensions.get('window');

const FILTERS = ['전체', '금액 할인', '퍼센트 할인', '서비스 증정'];

// 날짜 포맷 함수
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일 ${date.getHours()}시까지`;
};

// 쿠폰 타입에 따른 스타일 매핑 함수
const getCouponStyleInfo = (type) => {
    // API 타입(예상): 'PERCENT', 'AMOUNT', 'GIFT'
    // 혹은 소문자 'percent', 'amount', 'gift'
    const lowerType = type?.toLowerCase();

    if (lowerType === 'percent' || lowerType === 'discount') { // 퍼센트
        return {
            typeLabel: 'percent',
            bgColor: '#FFDDDE',
            image: require('@/assets/images/shopowner/coupon-percent.png')
        };
    } else if (lowerType === 'amount') { // 금액
        return {
            typeLabel: 'amount',
            bgColor: '#BEFFD1',
            image: require('@/assets/images/shopowner/coupon-price.png')
        };
    } else { // 증정 (gift)
        return {
            typeLabel: 'gift',
            bgColor: '#FFEABC',
            image: require('@/assets/images/shopowner/coupon-present.png')
        };
    }
};

export default function CouponListScreen({ navigation, route }) {
    const initialTab = route.params?.initialTab || 'active';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedFilter, setSelectedFilter] = useState('전체');

    // [데이터 상태]
    const [allCoupons, setAllCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // [API] 데이터 로딩
    const fetchData = async () => {
        try {
            setIsLoading(true);

            // 1. 가게 ID 가져오기
            const storeRes = await getMyStores();
            const myStores = storeRes.data?.data || [];

            if (!myStores || myStores.length === 0) {
                setAllCoupons([]);
                setIsLoading(false);
                return;
            }
            const storeId = myStores[0]?.id;
            if (!storeId) {
                setIsLoading(false);
                return;
            }

            // 2. 쿠폰 목록 가져오기
            const response = await getCouponsByStore(storeId);
            const list = response.data?.data || [];

            // 데이터 매핑
            const mappedList = list.map(coupon => {
                let type = 'gift';
                if (coupon.benefitType === 'PERCENTAGE_DISCOUNT') type = 'percent';
                else if (coupon.benefitType === 'FIXED_DISCOUNT') type = 'amount';

                return {
                    id: coupon.id,
                    name: coupon.title || coupon.name,
                    description: coupon.description,
                    expiredAt: coupon.issueEndsAt || coupon.expiredAt,
                    type: type,
                    discountValue: coupon.benefitValue,
                    limitCount: coupon.totalQuantity,
                    usedCount: coupon.usedCount || 0, // 사용량 추가
                };
            });

            setAllCoupons(mappedList);

        } catch (error) {
            console.error("쿠폰 리스트 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 화면 포커스 시 새로고침
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    // [로직] 데이터 필터링 (탭 + 상단 필터)
    const getFilteredCoupons = () => {
        const now = new Date();

        // 1차 필터: 탭 (진행중 vs 종료)
        let filtered = allCoupons.filter(coupon => {
            const expireDate = new Date(coupon.expiredAt);
            if (activeTab === 'active') {
                return expireDate >= now;
            } else {
                return expireDate < now;
            }
        });

        // 2차 필터: 카테고리 (전체/금액/퍼센트/증정)
        if (selectedFilter !== '전체') {
            filtered = filtered.filter(coupon => {
                const type = coupon.type?.toLowerCase(); // API Enum 확인 필요
                if (selectedFilter === '금액 할인') return type === 'amount';
                if (selectedFilter === '퍼센트 할인') return type === 'percent' || type === 'discount';
                if (selectedFilter === '서비스 증정') return type === 'gift';
                return true;
            });
        }

        return filtered;
    };

    const currentData = getFilteredCoupons();

    // 탭 변경 핸들러 (필터 초기화 포함)
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedFilter('전체'); // 탭 바꾸면 필터 초기화가 자연스러움
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#34B262" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#F7F7F7' }} />

            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
                            onPress={() => handleTabChange('active')}
                        >
                            <Text style={[styles.tabText, activeTab === 'active' ? styles.tabTextActive : styles.tabTextInactive]}>진행중</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.tabButton}
                            onPress={() => handleTabChange('expired')}
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
                    {currentData.length === 0 ? (
                        <View style={{ padding: rs(40), alignItems: 'center' }}>
                            <Text style={{ color: '#828282', fontSize: rs(14) }}>
                                {activeTab === 'active' ? '진행 중인 쿠폰이 없습니다.' : '종료된 쿠폰이 없습니다.'}
                            </Text>
                        </View>
                    ) : (
                        currentData.map((item) => {
                            const styleInfo = getCouponStyleInfo(item.type);

                            return (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.couponCard,
                                        activeTab === 'expired' && styles.expiredCard
                                    ]}
                                >
                                    {/* 왼쪽 아이콘 박스 */}
                                    <View style={[
                                        styles.cardIconBox,
                                        { backgroundColor: styleInfo.bgColor },
                                        activeTab === 'expired' && { opacity: 0.5 }
                                    ]}>
                                        <Image source={styleInfo.image} style={{ width: rs(24), height: rs(24) }} resizeMode="contain" />
                                    </View>

                                    {/* 가운데 정보 */}
                                    <View style={styles.cardInfo}>
                                        <Text style={[styles.cardTitle, activeTab === 'expired' && { color: '#A3A3A3' }]}>
                                            {item.name}
                                        </Text>
                                        <Text style={[styles.cardDesc, activeTab === 'expired' && { color: '#D4D4D4' }]}>
                                            {item.description || '설명 없음'}
                                        </Text>

                                        <View style={styles.cardBottomRow}>
                                            <Text style={[styles.cardDate, activeTab === 'expired' && { color: '#D4D4D4' }]}>
                                                {formatDateTime(item.expiredAt)}
                                            </Text>
                                            <Text style={[styles.cardValue, activeTab === 'expired' && { color: '#A3A3A3' }]}>
                                                {/* 값 표시 로직 (API 데이터 구조에 따라 수정 필요) */}
                                                {item.discountValue ? (item.type === 'PERCENT' ? `${item.discountValue}%` : `${item.discountValue}원`) : '서비스 증정'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* 오른쪽 뱃지 (장수) */}
                                    <View style={[styles.countBadge, activeTab === 'expired' && { backgroundColor: '#E5E7EB' }]}>
                                        <Text style={[styles.countText, activeTab === 'expired' && { color: '#9CA3AF' }]}>
                                            {/* 남은 수량 or 전체 수량 */}
                                            {item.limitCount === -1
                                                ? `${item.usedCount}장 사용됨`
                                                : `${item.usedCount}/${item.limitCount}장`}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
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
    bannerGradient: { height: rs(110), borderRadius: rs(12), padding: rs(20), position: 'relative', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, },
    bannerTextContent: { zIndex: 2 },
    bannerTitle: { fontSize: rs(20), fontWeight: '700', color: 'white', marginBottom: rs(8), fontFamily: 'Pretendard' },
    bannerDesc: { fontSize: rs(12), color: 'white', lineHeight: rs(18), fontFamily: 'Pretendard', fontWeight: '600' },
    bannerImage: { position: 'absolute', right: rs(10), top: rs(10), width: rs(94), height: rs(94), opacity: 0.6, zIndex: 1, },

    // 탭
    tabContainer: { width: '100%', alignItems: 'center', marginBottom: rs(15) },
    tabButtonRow: { flexDirection: 'row', width: rs(200), justifyContent: 'space-between', marginBottom: rs(10) },
    tabButton: { flex: 1, alignItems: 'center', paddingVertical: rs(5) },
    tabText: { fontSize: rs(14), fontFamily: 'Pretendard' },
    tabTextActive: { fontWeight: '700', color: 'black' },
    tabTextInactive: { fontWeight: '400', color: '#828282' },

    indicatorContainer: { width: '100%', height: rs(2), backgroundColor: '#EFEFEF', position: 'relative' },
    indicatorBg: { width: '100%', height: '100%' },
    indicatorActive: { position: 'absolute', top: 0, width: rs(100), height: '100%', backgroundColor: 'black', },

    // 필터
    filterContainer: { marginBottom: rs(15) },
    filterScroll: { paddingHorizontal: rs(20), gap: rs(8) },
    filterChip: { paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: rs(20), borderWidth: 1, justifyContent: 'center', alignItems: 'center', height: rs(28), },
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