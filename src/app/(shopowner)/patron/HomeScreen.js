import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function PatronHomeScreen() {
  // 카테고리 데이터
  const categories = [
    { id: 'all', name: '전체', icon: { uri: 'https://placehold.co/60x60/png?text=All' } },
    { id: 'food', name: '식당', icon: { uri: 'https://placehold.co/60x60/png?text=Food' } },
    { id: 'pub', name: '주점', icon: { uri: 'https://placehold.co/60x60/png?text=Pub' } },
    { id: 'cafe', name: '카페', icon: { uri: 'https://placehold.co/60x60/png?text=Cafe' } },
    { id: 'play', name: '놀거리', icon: { uri: 'https://placehold.co/60x60/png?text=Play' } },
    { id: 'beauty', name: '뷰티·헬스', icon: { uri: 'https://placehold.co/60x60/png?text=Beauty' } },
    { id: 'event', name: '이벤트', icon: { uri: 'https://placehold.co/60x60/png?text=Event' } },
    { id: 'etc', name: 'ETC', icon: { uri: 'https://placehold.co/60x60/png?text=ETC' } },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <Image 
            source={require('@/assets/images/shopowner/logo2.png')} 
            style={styles.logo} 
            resizeMode="contain" 
        />
        <View style={styles.headerRight}>
            <View style={styles.notificationIconWrapper}>
                <Ionicons name="notifications-outline" size={rs(24)} color="#595959" />
                <View style={styles.notificationBadge} />
            </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. 상단 배너 */}
        <View style={styles.bannerContainer}>
            <LinearGradient
                colors={['#33B369', 'rgba(47, 183, 134, 0.80)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.bannerGradient}
            >
                <View style={styles.bannerTextContent}>
                    <Text style={styles.greetingTitle}>안녕하세요 선지원님 !</Text>
                    <Text style={styles.greetingSub}>전북대학교 공과대학 IT시스템 공학과</Text>
                    <Text style={styles.greetingDesc}>학교 앞에서 바로 쓸 수 있는 혜택이 있어요</Text>
                    
                    <View style={styles.badgeRow}>
                        <View style={styles.infoBadge}>
                            <View style={{width: 12, height: 12, backgroundColor: '#FFD700', borderRadius: 6, marginRight: 4}} /> 
                            <Text style={styles.infoBadgeText}>쿠폰 3장</Text>
                        </View>
                        <View style={styles.infoBadge}>
                            <View style={{width: 12, height: 12, backgroundColor: '#FFA500', borderRadius: 6, marginRight: 4}} />
                            <Text style={styles.infoBadgeText}>이벤트 3개</Text>
                        </View>
                    </View>
                </View>
                <Image 
                    source={{ uri: 'https://placehold.co/94x94/transparent/white?text=🍀' }} 
                    style={styles.cloverImage} 
                />
            </LinearGradient>
        </View>

        {/* 2. 진행중인 이벤트 */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>지금 바로 진행중인 이벤트!</Text>
            <TouchableOpacity style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>더 보기</Text>
                <Ionicons name="chevron-forward" size={rs(12)} color="#828282" />
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* 이벤트 1 */}
            <View style={styles.eventCard}>
                <View style={[styles.eventTopBox, { backgroundColor: '#EFF9FE' }]}>
                    <View style={[styles.ddayBadge, { backgroundColor: '#61ADE3' }]}>
                        <Text style={styles.ddayText}>D-DAY</Text>
                    </View>
                    <Text style={styles.eventTitle}>진수당 앞!{'\n'}한화생명 채용설명회</Text>
                    <Text style={styles.eventDesc}>
                        참여하고 <Text style={{color:'#2086BA', fontWeight:'700'}}>커피 받아가세요!</Text>
                    </Text>
                    <Image source={{ uri: 'https://placehold.co/67x55' }} style={styles.eventImage} />
                </View>
                <View style={styles.eventBottomBox}>
                    <Text style={styles.eventDate}>2026.01.28 오전 10시 ~ 오후 5시</Text>
                </View>
            </View>

            {/* 이벤트 2 */}
            <View style={styles.eventCard}>
                <View style={[styles.eventTopBox, { backgroundColor: '#FEF1F0' }]}>
                    <View style={[styles.ddayBadge, { backgroundColor: '#FA726B' }]}>
                        <Text style={styles.ddayText}>D-1</Text>
                    </View>
                    <Text style={styles.eventTitle}>알림의 거리{'\n'}총학생회 개강행사</Text>
                    <Text style={styles.eventDesc}>
                        참여하고 <Text style={{color:'#FA5F54', fontWeight:'700'}}>햄버거 받아가세요!</Text>
                    </Text>
                    <Image source={{ uri: 'https://placehold.co/62x52' }} style={styles.eventImage} />
                </View>
                <View style={styles.eventBottomBox}>
                    <Text style={styles.eventDate}>2026.01.29. 오전 10시 ~ 오후 3시</Text>
                </View>
            </View>
        </ScrollView>
        
        <View style={styles.indicatorRow}>
            <View style={[styles.indicatorDot, { width: 12, backgroundColor: '#4E8D81' }]} />
            <View style={styles.indicatorDot} />
            <View style={styles.indicatorDot} />
        </View>


        {/* 3. 카테고리 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                    <View style={styles.categoryIconBox}>
                         <Image source={cat.icon} style={styles.categoryIcon} resizeMode="contain" /> 
                    </View>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>


        {/* 4. 오늘 발급된 따끈한 쿠폰 (수정됨) */}
        <View style={[styles.sectionHeader, { marginTop: rs(30) }]}>
            <View style={{flexDirection:'row', alignItems:'center', gap:rs(6)}}>
                <Ionicons name="flash" size={rs(16)} color="#34B269" />
                <Text style={styles.sectionTitle}>오늘 발급된 따끈한 쿠폰</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>더 보기</Text>
                <Ionicons name="chevron-forward" size={rs(12)} color="#828282" />
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* 쿠폰 1 */}
            <View style={styles.couponCard}>
                <View style={[styles.couponTop, { backgroundColor: '#FFDDDE' }]}>
                    {/* [수정] 텍스트 제거하고 이미지만 남김 */}
                    <Image source={{ uri: 'https://placehold.co/35x35' }} style={styles.couponImage} />
                </View>
                <View style={styles.couponBottom}>
                    {/* [수정] 시계 아이콘 + 시간 (가게명 위로 이동) */}
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={rs(10)} color="#DC2626" />
                        <Text style={styles.timeText}>1시간 전</Text>
                    </View>
                    <Text style={styles.storeName}>파리바게트</Text>
                    <Text style={styles.couponName}>마감 빵 세트</Text>
                    <Text style={[styles.couponValue, { color: '#EF6239' }]}>20% 할인</Text>
                </View>
            </View>

            {/* 쿠폰 2 */}
            <View style={styles.couponCard}>
                <View style={[styles.couponTop, { backgroundColor: '#BEFFD1' }]}>
                    <Image source={{ uri: 'https://placehold.co/35x35' }} style={styles.couponImage} />
                </View>
                <View style={styles.couponBottom}>
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={rs(10)} color="#DC2626" />
                        <Text style={styles.timeText}>3시간 전</Text>
                    </View>
                    <Text style={styles.storeName}>카페 디딤</Text>
                    <Text style={styles.couponName}>아메리카노 할인</Text>
                    <Text style={[styles.couponValue, { color: '#EF6239' }]}>1,500원 쿠폰</Text>
                </View>
            </View>

            {/* 쿠폰 3 */}
            <View style={styles.couponCard}>
                <View style={[styles.couponTop, { backgroundColor: '#FFF4E6' }]}>
                    <Image source={{ uri: 'https://placehold.co/35x35' }} style={styles.couponImage} />
                </View>
                <View style={styles.couponBottom}>
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={rs(10)} color="#DC2626" />
                        <Text style={styles.timeText}>5시간 전</Text>
                    </View>
                    <Text style={styles.storeName}>롯데리아</Text>
                    <Text style={styles.couponName}>치즈볼 3구</Text>
                    <Text style={[styles.couponValue, { color: '#EF6239' }]}>치즈볼 증정 쿠폰</Text>
                </View>
            </View>
        </ScrollView>


        {/* 5. 지금 인기있는 곳 */}
        <View style={[styles.sectionHeader, { marginTop: rs(30) }]}>
            <View style={{flexDirection:'row', alignItems:'center', gap:rs(6)}}>
                <Text style={{fontSize:rs(18)}}>🔥</Text>
                <View>
                    <Text style={styles.sectionTitle}>지금 인기있는 곳</Text>
                    <Text style={styles.subTitle}>이번 주에 가장 인기 있는 매장</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
                <Text style={styles.moreBtnText}>더 보기</Text>
                <Ionicons name="chevron-forward" size={rs(12)} color="#828282" />
            </TouchableOpacity>
        </View>

        <View style={styles.rankingList}>
            {/* 랭킹 1 */}
            <View style={styles.rankingItem}>
                <View style={styles.rankBadgeGradient}><Text style={styles.rankText}>1</Text></View>
                <View style={styles.rankInfo}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:rs(4)}}>
                        <Text style={styles.rankStoreName}>000 돈까스</Text>
                        <Text style={styles.rankCategory}>식당</Text>
                    </View>
                    <Text style={[styles.rankBenefit, {color:'#4BBB6D'}]}>1,000원 할인</Text>
                </View>
                <View style={styles.trendUp}>
                    <Ionicons name="caret-up" size={rs(10)} color="#34B262" />
                    <Text style={styles.trendText}>+33명</Text>
                </View>
            </View>
            {/* 랭킹 2 */}
            <View style={styles.rankingItem}>
                <View style={styles.rankBadgeGradient}><Text style={styles.rankText}>2</Text></View>
                <View style={styles.rankInfo}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:rs(4)}}>
                        <Text style={styles.rankStoreName}>카페 00</Text>
                        <Text style={styles.rankCategory}>카페</Text>
                    </View>
                    <Text style={[styles.rankBenefit, {color:'#4BBB6D'}]}>음료 1+1</Text>
                </View>
                <View style={styles.trendUp}>
                    <Ionicons name="caret-up" size={rs(10)} color="#34B262" />
                    <Text style={styles.trendText}>+20명</Text>
                </View>
            </View>
            {/* 랭킹 3 */}
            <View style={styles.rankingItem}>
                <View style={styles.rankBadgeGradient}><Text style={styles.rankText}>3</Text></View>
                <View style={styles.rankInfo}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:rs(4)}}>
                        <Text style={styles.rankStoreName}>00 헬스</Text>
                        <Text style={styles.rankCategory}>뷰티·헬스</Text>
                    </View>
                    <Text style={[styles.rankBenefit, {color:'#4BBB6D'}]}>할인할인</Text>
                </View>
                <View style={styles.trendUp}>
                    <Ionicons name="caret-up" size={rs(10)} color="#34B262" />
                    <Text style={styles.trendText}>+15명</Text>
                </View>
            </View>
        </View>

        <View style={{ height: rs(100) }} />
      </ScrollView>

      {/* 하단 탭 바 */}
      <View style={styles.bottomTab}>
          <TouchableOpacity style={styles.tabItem}><Ionicons name="home" size={rs(24)} color="#34B262" /></TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}><Ionicons name="location-outline" size={rs(24)} color="#444444" /></TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}><Ionicons name="gift-outline" size={rs(24)} color="#444444" /></TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}><Ionicons name="person-outline" size={rs(24)} color="#444444" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: rs(20), paddingTop: rs(10), paddingBottom: rs(10) },
  logo: { width: rs(92), height: rs(28) },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notificationIconWrapper: { position: 'relative', width: rs(30), height: rs(30), justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: rs(15) },
  notificationBadge: { position: 'absolute', top: rs(5), right: rs(5), width: rs(7), height: rs(7), borderRadius: rs(3.5), backgroundColor: '#FF3E41' },
  scrollContent: { paddingHorizontal: rs(20), paddingBottom: rs(20) },
  bannerContainer: { marginTop: rs(10), marginBottom: rs(20) },
  bannerGradient: { height: rs(140), borderRadius: rs(12), padding: rs(20), position: 'relative', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bannerTextContent: { zIndex: 2, flex: 1 },
  greetingTitle: { fontSize: rs(20), fontWeight: '700', color: 'white', marginBottom: rs(5), fontFamily: 'Pretendard' },
  greetingSub: { fontSize: rs(12), color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: rs(10), fontFamily: 'Pretendard' },
  greetingDesc: { fontSize: rs(10), color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: rs(15), fontFamily: 'Pretendard' },
  badgeRow: { flexDirection: 'row', gap: rs(8) },
  infoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: rs(20), paddingHorizontal: rs(10), paddingVertical: rs(6) },
  infoBadgeText: { color: 'rgba(255,255,255,0.8)', fontSize: rs(10), fontWeight: '400', fontFamily: 'Inter' },
  cloverImage: { position: 'absolute', right: rs(10), top: rs(10), width: rs(94), height: rs(94), opacity: 0.6, zIndex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(12) },
  sectionTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  subTitle: { fontSize: rs(10), color: '#828282', fontWeight: '400', fontFamily: 'Inter' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
  moreBtnText: { fontSize: rs(10), color: '#828282', fontWeight: '500', fontFamily: 'Inter' },
  horizontalScroll: { gap: rs(12), paddingRight: rs(20) },
  eventCard: { width: rs(172), backgroundColor: 'transparent', borderRadius: rs(8), overflow: 'hidden' },
  eventTopBox: { width: '100%', height: rs(100), padding: rs(12), position: 'relative' },
  ddayBadge: { position: 'absolute', top: rs(12), left: rs(12), paddingHorizontal: rs(8), paddingVertical: rs(4), borderRadius: rs(12) },
  ddayText: { color: 'white', fontSize: rs(10), fontWeight: '700', fontFamily: 'Arial' },
  eventTitle: { marginTop: rs(24), fontSize: rs(12), fontWeight: '600', color: 'black', lineHeight: rs(16), fontFamily: 'Pretendard', marginBottom: rs(4) },
  eventDesc: { fontSize: rs(10), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  eventImage: { position: 'absolute', right: rs(8), bottom: rs(8), width: rs(60), height: rs(50), resizeMode: 'contain' },
  eventBottomBox: { width: '100%', height: rs(40), backgroundColor: 'white', justifyContent: 'center', paddingHorizontal: rs(12) },
  eventDate: { fontSize: rs(9), color: '#828282', fontFamily: 'Pretendard' },
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', gap: rs(4), marginTop: rs(15), marginBottom: rs(20) },
  indicatorDot: { width: rs(4), height: rs(4), borderRadius: rs(2), backgroundColor: '#E6EBED' },
  categoryScroll: { gap: rs(10), paddingRight: rs(20), paddingBottom: rs(10) },
  categoryItem: { width: rs(65), height: rs(65), borderRadius: rs(20), backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  categoryIconBox: { width: rs(40), height: rs(40), justifyContent: 'center', alignItems: 'center', marginBottom: rs(2) },
  categoryIcon: { width: '100%', height: '100%' },
  categoryText: { fontSize: rs(11), fontWeight: '400', color: 'black', fontFamily: 'Inter' },
  
  // [수정된 쿠폰 스타일]
  couponCard: { width: rs(120), height: rs(151), backgroundColor: 'white', borderRadius: rs(8), overflow: 'hidden' },
  couponTop: { height: rs(70), padding: rs(8), position: 'relative' },
  // couponTimeBadge 삭제됨
  couponImage: { position: 'absolute', right: rs(8), top: rs(25), width: rs(35), height: rs(35) }, // 이미지 위치 약간 조정
  couponBottom: { padding: rs(10) },
  // [추가] 시간 행 스타일
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: rs(2), marginBottom: rs(4) },
  timeText: { fontSize: rs(10), fontWeight: '600', color: '#DC2626', fontFamily: 'Inter' },
  storeName: { fontSize: rs(10), color: '#828282', fontWeight: '400', fontFamily: 'Inter', marginBottom: rs(2) },
  couponName: { fontSize: rs(11), color: 'black', fontWeight: '700', fontFamily: 'Inter', marginBottom: rs(2) },
  couponValue: { fontSize: rs(11), fontWeight: '700', fontFamily: 'Inter' },

  rankingList: { gap: rs(10) },
  rankingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: rs(20), padding: rs(12), shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  rankBadgeGradient: { width: rs(30), height: rs(30), borderRadius: rs(15), backgroundColor: '#49BA6F', justifyContent: 'center', alignItems: 'center', marginRight: rs(10) },
  rankText: { color: 'white', fontSize: rs(15), fontWeight: '600', fontFamily: 'Inter' },
  rankInfo: { flex: 1 },
  rankStoreName: { fontSize: rs(14), fontWeight: '500', color: 'black', fontFamily: 'Inter' },
  rankCategory: { fontSize: rs(10), fontWeight: '500', color: '#828282', fontFamily: 'Inter' },
  rankBenefit: { fontSize: rs(9), fontWeight: '500', fontFamily: 'Inter', marginTop: rs(2) },
  trendUp: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
  trendText: { fontSize: rs(10), color: '#34B262', fontWeight: '400', fontFamily: 'Inter' },
  bottomTab: { position: 'absolute', bottom: 0, left: 0, right: 0, height: rs(78), backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', paddingTop: rs(12), borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20), shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  tabItem: { alignItems: 'center', paddingHorizontal: rs(20) },
});