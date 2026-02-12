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

// 숫자 포맷 함수 (천단위 콤마)
const formatNumber = (val) => {
    if (!val && val !== 0) return '';
    const num = val.toString().replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 날짜 포맷 함수 (YYYY.MM.DD 오전/오후 HH:MM)
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours();
    const ampm = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 || 12;
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${y}.${m}.${d} ${ampm} ${h12}:${min}`;
};

// 쿠폰 타입에 따른 스타일 매핑 함수
const getCouponStyleInfo = (type) => {
    const lowerType = type?.toLowerCase();

    if (lowerType === 'percent' || lowerType === 'percentage') { // 퍼센트
        return {
            typeLabel: 'percent',
            bgColor: '#FFDDDE',
            image: require('@/assets/images/shopowner/coupon-percent.png')
        };
    } else if (lowerType === 'amount' || lowerType === 'fixed') { // 금액
        return {
            typeLabel: 'amount',
            bgColor: '#EAF6EE', // CouponScreen과 통일
            image: require('@/assets/images/shopowner/coupon-price.png')
        };
    } else { // 증정 (gift)
        return {
            typeLabel: 'gift',
            bgColor: '#FFF4D6', // CouponScreen과 통일
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
                    expiredAt: coupon.issueEndsAt || coupon.expiredAt,
                    type: type,
                    discountValue: coupon.benefitValue,
                    minOrderAmount: coupon.minOrderAmount || 0,
                    totalQuantity: coupon.totalQuantity,
                    issuedCount: coupon.issuedCount || 0,
                    usedCount: coupon.usedCount || 0,
                    validDays: coupon.validDays,
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
                                        <Image source={styleInfo.image} style={styles.cardIconImage} resizeMode="contain" />
                                    </View>

                                    {/* 가운데 정보 */}
                                    <View style={styles.cardInfo}>
                                        <View style={styles.cardTitleRow}>
                                            <Text style={[styles.cardBenefitTitle, activeTab === 'expired' && { color: '#A3A3A3' }]}>
                                                {item.type === 'amount' ? `${formatNumber(item.discountValue)}원 할인` :
                                                    item.type === 'percent' ? `${item.discountValue}% 할인` :
                                                        `${item.discountValue || '서비스'} 증정`}
                                            </Text>
                                        </View>

                                        <Text style={[styles.cardCouponName, activeTab === 'expired' && { color: '#A3A3A3' }]} numberOfLines={1}>
                                            {item.name}
                                        </Text>

                                        <View style={styles.cardMetaRow}>
                                            <Text style={[styles.cardMetaText, activeTab === 'expired' && { color: '#D4D4D4' }]}>최소 주문 {formatNumber(item.minOrderAmount)}원</Text>
                                            <Text style={[styles.cardMetaText, activeTab === 'expired' && { color: '#D4D4D4' }]}>
                                                {formatDateTime(item.expiredAt)}까지 {activeTab === 'active' ? '발급 가능' : '발급 종료'}
                                            </Text>
                                        </View>

                                        <View style={styles.cardBadgeRow}>
                                            <View style={[styles.cardBadge, styles.badgeValidity, activeTab === 'expired' && styles.expiredBadge]}>
                                                <Text style={[styles.cardBadgeText, styles.textValidity, activeTab === 'expired' && styles.expiredBadgeText]}>
                                                    {item.validDays === 0 ? '발급 종료 시간까지 사용 가능' : `발급일로부터 ${item.validDays}일간 사용 가능`}
                                                </Text>
                                            </View>

                                            {item.totalQuantity === null ? (
                                                <View style={[styles.cardBadge, styles.badgeUnlimited, activeTab === 'expired' && styles.expiredBadge]}>
                                                    <Text style={[styles.cardBadgeText, styles.textUnlimited, activeTab === 'expired' && styles.expiredBadgeText]}>무제한 발급</Text>
                                                </View>
                                            ) : (
                                                <View style={[styles.cardBadge, styles.badgeIssued, activeTab === 'expired' && styles.expiredBadge]}>
                                                    <Text style={[styles.cardBadgeText, styles.textIssued, activeTab === 'expired' && styles.expiredBadgeText]}>
                                                        {item.issuedCount}/{item.limitCount}장 발급
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={[styles.cardBadge, styles.badgeUsed, activeTab === 'expired' && styles.expiredBadge]}>
                                                <Text style={[styles.cardBadgeText, styles.textUsed, activeTab === 'expired' && styles.expiredBadgeText]}>
                                                    {item.usedCount}장 사용
                                                </Text>
                                            </View>
                                        </View>
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
    couponCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBFBFB', borderRadius: rs(15), paddingLeft: rs(15), paddingRight: rs(10), shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, height: rs(100), },
    // [종료 탭]
    expiredCard: { backgroundColor: '#FAFAFA', opacity: 0.7, },

    cardIconBox: { width: rs(65), height: rs(65), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center', marginRight: rs(15), },
    cardIconImage: { width: rs(42), height: rs(42) },
    cardInfo: { flex: 1, paddingVertical: rs(5), justifyContent: 'center', alignItems: 'flex-start', gap: rs(3) },
    cardTitleRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: rs(3) },
    cardBenefitTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
    cardCouponName: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Pretendard', marginVertical: rs(1) },
    cardMetaRow: { alignSelf: 'stretch', gap: rs(1) },
    cardMetaText: { fontSize: rs(10), fontWeight: '400', color: '#757575', fontFamily: 'Pretendard' },
    cardBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    cardBadge: { paddingHorizontal: rs(6), paddingVertical: rs(2), borderRadius: rs(2), justifyContent: 'center', alignItems: 'center' },
    cardBadgeText: { fontSize: rs(8), fontWeight: '600', fontFamily: 'Pretendard' },

    badgeUnlimited: { backgroundColor: '#FFE5F1' },
    textUnlimited: { color: '#FF2F90' },

    badgeIssued: { backgroundColor: '#D9EDFF' },
    textIssued: { color: '#256EFF' },

    badgeUsed: { backgroundColor: '#CAFFD0' },
    textUsed: { color: '#009B38' },

    expiredBadge: { backgroundColor: '#EFEFEF' },
    expiredBadgeText: { color: '#A3A3A3' },
    badgeValidity: { backgroundColor: '#FFE4E5' },
    textValidity: { color: '#F15051' },
});