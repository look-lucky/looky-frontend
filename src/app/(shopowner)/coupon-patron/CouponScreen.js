import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

export default function CouponScreen({ navigation }) {
  // 탭 상태 관리 ('coupon' | 'patron')
  const [activeTab, setActiveTab] = useState('coupon'); 

  // [더미 데이터] 진행 중인 쿠폰
  const activeCoupons = [
    { id: 1, title: '첫 방문 10% 할인', date: '2026.02.28까지', used: 15, total: 50, type: 'discount', todayUsed: 3 },
    { id: 2, title: '음료 무료 쿠폰', date: '2026.02.15까지', used: 35, total: 50, type: 'gift', todayUsed: 5 },
    { id: 3, title: '재방문 5% 할인', date: '2026.03.01까지', used: 10, total: 100, type: 'discount', todayUsed: 1 },
  ];

  // [더미 데이터] 종료된 쿠폰
  const expiredCoupons = [
    { id: 4, title: '신메뉴 20% 할인 쿠폰', used: 45, total: 50 },
    { id: 5, title: '세트메뉴 할인', used: 30, total: 30 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#E0EDE4' }} />

      <View style={styles.backgroundTop} />

      {/* 1. 헤더 */}
      <View style={styles.header}>
        <Image source={require('@/assets/images/shopowner/logo2.png')} style={styles.logo} resizeMode="contain" />
      </View>

      {/* 2. 상단 탭 (쿠폰/단골) */}
      <View style={styles.fixedTabContainer}>
          <View style={styles.tabWrapper}>
              <View style={styles.tabContainer}>
                  
                  {/* [1] 쿠폰 관리 탭 */}
                  <TouchableOpacity 
                      style={[styles.tabButton, activeTab === 'coupon' ? styles.activeTab : styles.inactiveTab]}
                      onPress={() => setActiveTab('coupon')}
                      activeOpacity={0.8}
                  >
                      <View style={styles.tabContent}>
                          <Ionicons name="ticket" size={rs(16)} color={activeTab === 'coupon' ? "black" : "#828282"} />
                          <Text style={[styles.tabText, activeTab === 'coupon' ? styles.activeText : styles.inactiveText]}>
                              쿠폰 관리
                          </Text>
                      </View>
                  </TouchableOpacity>

                  {/* [2] 단골 관리 탭 */}
                  <TouchableOpacity 
                      style={[styles.tabButton, activeTab === 'patron' ? styles.activeTab : styles.inactiveTab]}
                      onPress={() => setActiveTab('patron')}
                      activeOpacity={0.8}
                  >
                      <View style={styles.tabContent}>
                          <View style={styles.iconWrapper}>
                              <Ionicons name="people" size={rs(16)} color={activeTab === 'patron' ? "black" : "#828282"} />
                              <Ionicons 
                                  name="heart" 
                                  size={rs(8)} 
                                  color="#FF3E41" 
                                  style={styles.redHeartIcon}
                              />
                          </View>
                          <Text style={[styles.tabText, activeTab === 'patron' ? styles.activeText : styles.inactiveText]}>
                              단골 관리
                          </Text>
                      </View>
                  </TouchableOpacity>

              </View>
          </View>
      </View>

      {/* 3. 스크롤 가능한 컨텐츠 영역 */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 탭 컨텐츠 */}
        {activeTab === 'coupon' ? (
            // [쿠폰 관리 화면]
            <View style={{ paddingBottom: rs(100) }}>
                
                {/* 진행 중인 쿠폰 */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="gift-outline" size={rs(16)} color="#34B262" />
                        <Text style={styles.sectionTitleGreen}>진행 중인 쿠폰</Text>
                    </View>
                    <TouchableOpacity style={styles.moreBtn} onPress={() => navigation.navigate('CouponList', { initialTab: 'active' })}>
                        <Text style={styles.moreBtnTextGreen}>전체보기</Text>
                        <Ionicons name="chevron-forward" size={rs(12)} color="#34B262" />
                    </TouchableOpacity>
                </View>

                {activeCoupons.map((coupon) => (
                    <View key={coupon.id} style={styles.couponCard}>
                        <View style={styles.couponHeader}>
                            {/* 아이콘 */}
                            <View style={styles.couponIconBox}>
                                {coupon.type === 'discount' ? (
                                    <Text style={styles.percentIcon}>%</Text>
                                ) : (
                                    <Ionicons name="gift-outline" size={rs(18)} color="#34B262" />
                                )}
                            </View>
                            
                            {/* 정보 */}
                            <View style={styles.couponInfo}>
                                <Text style={styles.couponTitle}>{coupon.title}</Text>
                                <Text style={styles.couponDate}>{coupon.date}</Text>
                            </View>

                            {/* 오늘 사용량 */}
                            <Text style={styles.todayUsed}>오늘 {coupon.todayUsed}장 사용</Text>
                        </View>

                        {/* 사용 수량 (Progress Bar) */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressLabel}>사용 수량</Text>
                                <Text style={styles.progressValue}>{coupon.used} / {coupon.total}장</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View 
                                    style={[
                                        styles.progressBarFill, 
                                        { width: `${(coupon.used / coupon.total) * 100}%` }
                                    ]} 
                                />
                            </View>
                        </View>
                    </View>
                ))}


                {/* 종료된 쿠폰 */}
                <View style={[styles.sectionHeader, { marginTop: rs(20) }]}>
                    <Text style={styles.sectionTitleGray}>종료된 쿠폰</Text>
                    <TouchableOpacity style={styles.moreBtn} onPress={() => navigation.navigate('CouponList', { initialTab: 'expired' })}>
                        <Text style={styles.moreBtnTextGray}>전체보기</Text>
                        <Ionicons name="chevron-forward" size={rs(12)} color="#828282" />
                    </TouchableOpacity>
                </View>

                {expiredCoupons.map((coupon) => (
                    <View key={coupon.id} style={styles.expiredCard}>
                        <Text style={styles.expiredTitle}>{coupon.title}</Text>
                        <Text style={styles.expiredValue}>{coupon.used} / {coupon.total}장 사용</Text>
                    </View>
                ))}


                {/* 쿠폰 사용완료 처리 */}
                <TouchableOpacity style={styles.completeBtn}>
                    <View style={styles.completeBtnLeft}>
                        <Ionicons name="checkbox-outline" size={rs(18)} color="#34B262" />
                        <Text style={styles.completeBtnText}>쿠폰 사용완료 처리</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={rs(16)} color="#34B262" />
                </TouchableOpacity>

            </View>

        ) : (
            // [단골 관리 화면]
            <View style={styles.cardContainer}>
                <View style={styles.iconBox}>
                    <Ionicons name="people" size={rs(40)} color="#34B262" />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>우리 가게를 찜한 고객</Text>
                    <Text style={styles.infoCount}>156명</Text>
                    <View style={styles.trendContainer}>
                        <Ionicons name="trending-up" size={rs(12)} color="#34B262" />
                        <Text style={styles.trendText}>이번 주 +12명</Text>
                    </View>
                </View>
            </View>
        )}

      </ScrollView>

      {/* [쿠폰 탭] 하단 고정 버튼: 새 쿠폰 만들기 */}
      {activeTab === 'coupon' && (
          <View style={styles.bottomFixedBtnContainer}>
              <TouchableOpacity style={styles.newCouponBtn}>
                  <Ionicons name="add" size={rs(18)} color="white" />
                  <Text style={styles.newCouponBtnText}>새 쿠폰 만들기</Text>
              </TouchableOpacity>
          </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0EDE4' },
  
  header: {  paddingTop: rs(10), paddingHorizontal: rs(20),},
  logo: {  width: rs(120),  height: rs(30),  marginBottom: rs(20)},
  fixedTabContainer: { paddingHorizontal: rs(20), backgroundColor: '#E0EDE4', zIndex: 1, },
  scrollContent: {  paddingHorizontal: rs(20), paddingTop: rs(10), },

  // 탭 스타일
  tabWrapper: { alignItems: 'center', marginBottom: rs(10) },
  tabContainer: { width: '100%', height: rs(48), backgroundColor: 'rgba(218, 218, 218, 0.40)', borderRadius: rs(10), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(4) },
  tabButton: { flex: 1, height: rs(40), justifyContent: 'center', alignItems: 'center', borderRadius: rs(8) },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  activeTab: { backgroundColor: 'white', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  inactiveTab: { backgroundColor: 'transparent' },
  tabText: { fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard' },
  activeText: { color: 'black' },
  inactiveText: { color: '#828282' },
  iconWrapper: { position: 'relative' },
  redHeartIcon: { position: 'absolute', top: -3, right: -4 },

  // 배경 디자인
  backgroundTop: { position: 'absolute', top: 0, left: 0, right: 0, height: rs(300), backgroundColor: '#E0EDE4', borderBottomLeftRadius: rs(20), borderBottomRightRadius: rs(20) },

  // [쿠폰 관리] 섹션 헤더
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(10) },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
  sectionTitleGreen: { fontSize: rs(14), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
  sectionTitleGray: { fontSize: rs(14), fontWeight: '600', color: '#828282', fontFamily: 'Pretendard' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
  moreBtnTextGreen: { fontSize: rs(10), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
  moreBtnTextGray: { fontSize: rs(10), fontWeight: '600', color: '#828282', fontFamily: 'Pretendard' },

  // 진행 중인 쿠폰 카드
  couponCard: { backgroundColor: 'white', borderRadius: rs(12), padding: rs(16), marginBottom: rs(12), elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
  couponHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(15) },
  couponIconBox: { width: rs(36), height: rs(36), backgroundColor: '#EAF6EE', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center', marginRight: rs(10) },
  percentIcon: { fontSize: rs(16), fontWeight: '700', color: '#34B262', fontFamily: 'Pretendard' },
  couponInfo: { flex: 1 },
  couponTitle: { fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(2) },
  couponDate: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },
  todayUsed: { fontSize: rs(10), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
  
  // Progress Bar
  progressContainer: {},
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(6) },
  progressLabel: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },
  progressValue: { fontSize: rs(10), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  progressBarBg: { height: rs(6), backgroundColor: '#F0F0F0', borderRadius: rs(3), overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#34B262', borderRadius: rs(3) },

  // 종료된 쿠폰 카드
  expiredCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: rs(12), borderRadius: rs(10), marginBottom: rs(8), elevation: 1 },
  expiredTitle: { fontSize: rs(12), color: '#828282', fontFamily: 'Pretendard' },
  expiredValue: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },

  // 쿠폰 사용완료 처리 버튼
  completeBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(10), paddingVertical: rs(10) },
  completeBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
  completeBtnText: { fontSize: rs(14), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },

  // 하단 고정 버튼 컨테이너
  bottomFixedBtnContainer: { position: 'absolute', bottom: rs(20), left: 0, right: 0, paddingHorizontal: rs(20), },

  newCouponBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#34B262', paddingVertical: rs(12), borderRadius: rs(12), gap: rs(6), elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 },
  newCouponBtnText: { fontSize: rs(16), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },

  // [단골 관리] 카드 스타일
  cardContainer: { width: '100%', backgroundColor: 'white', borderRadius: rs(16), paddingVertical: rs(40), alignItems: 'center', shadowColor: "rgba(0, 0, 0, 0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  iconBox: { width: rs(80), height: rs(80), backgroundColor: '#E0EDE4', borderRadius: rs(25), justifyContent: 'center', alignItems: 'center', marginBottom: rs(16) },
  infoContainer: { alignItems: 'center', gap: rs(8) },
  infoLabel: { fontSize: rs(12), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard' },
  infoCount: { fontSize: rs(32), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard', marginBottom: rs(4) },
  trendContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  trendText: { fontSize: rs(12), fontWeight: '500', color: '#34B262', fontFamily: 'Pretendard' },
});