import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export default function CouponScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('coupon'); 
  
  // ==========================================
  // [상태 관리] 모달 및 쿠폰 로직
  // ==========================================
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  
  // 상태: 'idle'(입력전), 'valid'(확인됨), 'expired'(만료됨), 'invalid'(잘못됨)
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [isCouponUsed, setIsCouponUsed] = useState(false);

  // 더미 데이터: 진행 중인 쿠폰 리스트
  const activeCoupons = [
    { id: 1, title: '첫 방문 10% 할인', date: '2026.02.28까지', used: 15, total: 50, type: 'discount', todayUsed: 3 },
    { id: 2, title: '음료 무료 쿠폰', date: '2026.02.15까지', used: 35, total: 50, type: 'gift', todayUsed: 5 },
    { id: 3, title: '재방문 5% 할인', date: '2026.03.01까지', used: 10, total: 100, type: 'discount', todayUsed: 1 },
  ];

  const expiredCoupons = [
    { id: 4, title: '신메뉴 20% 할인 쿠폰', used: 45, total: 50 },
    { id: 5, title: '세트메뉴 할인', used: 30, total: 30 },
  ];

  // [로직] 쿠폰 번호 확인 함수
  const handleVerifyCoupon = () => {
      setIsCouponUsed(false); // 초기화
      
      if (couponInput === '1682') {
          setVerificationStatus('valid');
      } else if (couponInput === '0000') {
          setVerificationStatus('expired');
      } else {
          setVerificationStatus('invalid');
      }
  };

  // [로직] 사용 완료 처리 함수
  const handleUseCoupon = () => {
      setIsCouponUsed(true);
  };

  // [로직] 모달 닫기 및 초기화
  const closeModal = () => {
      setUsageModalVisible(false);
      setCouponInput('');
      setVerificationStatus('idle');
      setIsCouponUsed(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#E0EDE4' }} />
      <View style={styles.backgroundTop} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Image 
            source={require('@/assets/images/shopowner/logo2.png')} 
            style={styles.logo} 
            resizeMode="contain"
        />
      </View>

      {/* 탭 (쿠폰/단골) */}
      <View style={styles.fixedTabContainer}>
          <View style={styles.tabWrapper}>
              <View style={styles.tabContainer}>
                  <TouchableOpacity 
                      style={[styles.tabButton, activeTab === 'coupon' ? styles.activeTab : styles.inactiveTab]}
                      onPress={() => setActiveTab('coupon')}
                      activeOpacity={0.8}
                  >
                      <View style={styles.tabContent}>
                          <Ionicons name="ticket" size={rs(16)} color={activeTab === 'coupon' ? "black" : "#828282"} />
                          <Text style={[styles.tabText, activeTab === 'coupon' ? styles.activeText : styles.inactiveText]}>쿠폰 관리</Text>
                      </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                      style={[styles.tabButton, activeTab === 'patron' ? styles.activeTab : styles.inactiveTab]}
                      onPress={() => setActiveTab('patron')}
                      activeOpacity={0.8}
                  >
                      <View style={styles.tabContent}>
                          <View style={styles.iconWrapper}>
                              <Ionicons name="people" size={rs(16)} color={activeTab === 'patron' ? "black" : "#828282"} />
                              <Ionicons name="heart" size={rs(10)} color="#FF3E41" style={styles.redHeartIcon} />
                          </View>
                          <Text style={[styles.tabText, activeTab === 'patron' ? styles.activeText : styles.inactiveText]}>단골 관리</Text>
                      </View>
                  </TouchableOpacity>
              </View>
          </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'coupon' ? (
            <View style={{ paddingBottom: rs(100) }}>
                
                {/* 진행 중인 쿠폰 */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="gift-outline" size={rs(16)} color="#34B262" />
                        <Text style={styles.sectionTitleGreen}>진행 중인 쿠폰</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.moreBtn}
                        onPress={() => navigation.navigate('CouponList', { initialTab: 'active' })}
                    >
                        <Text style={styles.moreBtnTextGreen}>전체보기</Text>
                        <Ionicons name="chevron-forward" size={rs(12)} color="#34B262" />
                    </TouchableOpacity>
                </View>

                {activeCoupons.map((coupon) => (
                    <View key={coupon.id} style={styles.couponCard}>
                        <View style={styles.couponHeader}>
                            <View style={styles.couponIconBox}>
                                {coupon.type === 'discount' ? <Text style={styles.percentIcon}>%</Text> : <Ionicons name="gift-outline" size={rs(18)} color="#34B262" />}
                            </View>
                            <View style={styles.couponInfo}>
                                <Text style={styles.couponTitle}>{coupon.title}</Text>
                                <Text style={styles.couponDate}>{coupon.date}</Text>
                            </View>
                            <Text style={styles.todayUsed}>오늘 {coupon.todayUsed}장 사용</Text>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressLabel}>사용 수량</Text>
                                <Text style={styles.progressValue}>{coupon.used} / {coupon.total}장</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${(coupon.used / coupon.total) * 100}%` }]} />
                            </View>
                        </View>
                    </View>
                ))}

                {/* 종료된 쿠폰 */}
                <View style={[styles.sectionHeader, { marginTop: rs(20) }]}>
                    <Text style={styles.sectionTitleGray}>종료된 쿠폰</Text>
                    <TouchableOpacity 
                        style={styles.moreBtn}
                        onPress={() => navigation.navigate('CouponList', { initialTab: 'expired' })}
                    >
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

                {/* [수정] 쿠폰 사용완료 처리 버튼 -> 모달 오픈 */}
                <TouchableOpacity 
                    style={styles.completeBtn}
                    onPress={() => setUsageModalVisible(true)}
                >
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

      {activeTab === 'coupon' && (
          <View style={styles.bottomFixedBtnContainer}>
              <TouchableOpacity style={styles.newCouponBtn}>
                  <Ionicons name="add" size={rs(18)} color="white" />
                  <Text style={styles.newCouponBtnText}>새 쿠폰 만들기</Text>
              </TouchableOpacity>
          </View>
      )}

      {/* =======================================================
          [모달] 쿠폰 사용완료 처리 
      ======================================================= */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={usageModalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        // 키보드가 올라올 때 화면이 잘리지 않도록 위치 조정
                    >
                        <View style={[styles.usageModalContainer, verificationStatus === 'valid' && { height: rs(400) }]}>
                            {/* 닫기 버튼 */}
                            <TouchableOpacity 
                                style={styles.modalCloseBtn}
                                onPress={closeModal}
                                hitSlop={{top:10, bottom:10, left:10, right:10}}
                            >
                                <Ionicons name="close" size={rs(20)} color="#828282" />
                            </TouchableOpacity>

                            {/* 타이틀 */}
                            <View style={styles.modalTitleRow}>
                                <View style={styles.modalTitleIconBox}>
                                    <Ionicons name="ticket" size={rs(16)} color="white" style={{transform: [{rotate: '-45deg'}]}} />
                                </View>
                                <Text style={styles.usageModalTitle}>쿠폰 번호 확인</Text>
                            </View>

                            <Text style={styles.usageModalSubtitle}>손님의 쿠폰 번호를 입력하고, 혜택을 제공해주세요</Text>

                            {/* 입력창 & 확인 버튼 */}
                            <View style={styles.usageInputRow}>
                                <View style={styles.usageInputBox}>
                                    <TextInput 
                                        style={styles.usageInput}
                                        placeholder="쿠폰 번호 입력"
                                        placeholderTextColor="#828282"
                                        value={couponInput}
                                        onChangeText={setCouponInput}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={[styles.usageConfirmBtn, {backgroundColor: couponInput.length === 4 ? '#34B262' : '#D5D5D5'}]}
                                    onPress={handleVerifyCoupon}
                                    disabled={couponInput.length !== 4}
                                >
                                    <Text style={styles.usageConfirmText}>확인</Text>
                                </TouchableOpacity>
                            </View>

                            {/* [에러 메시지 영역] */}
                            {verificationStatus === 'expired' && (
                                <Text style={styles.errorText}>만료된 쿠폰입니다</Text>
                            )}
                            {verificationStatus === 'invalid' && (
                                <Text style={styles.errorText}>잘못된 쿠폰 번호입니다.</Text>
                            )}

                            {/* [성공 시 쿠폰 카드 표시 영역] */}
                            {verificationStatus === 'valid' && (
                                <View style={{width: '100%', alignItems: 'center', marginTop: rs(0)}}>
                                    <Text style={styles.successText}>쿠폰이 확인되었습니다</Text>
                                    
                                    {/* 쿠폰 티켓 UI */}
                                    <View style={[styles.ticketContainer, isCouponUsed && { opacity: 0.5 }]}>
                                        {/* 티켓 상단 (내용) */}
                                        <View style={styles.ticketTop}>
                                            <Text style={styles.ticketTitle}>아메리카노 10% 할인</Text>
                                            <Text style={styles.ticketDesc}>새해 이벤트로 커피 할인해드려용</Text>
                                            
                                            <View style={styles.ticketInfoRow}>
                                                <Text style={styles.ticketLabel}>사용처</Text>
                                                <Text style={styles.ticketValue}>평화와 평화 구내매점</Text>
                                            </View>
                                            <View style={styles.ticketInfoRow}>
                                                <Text style={styles.ticketLabel}>혜택</Text>
                                                <Text style={styles.ticketValue}>10% 할인</Text>
                                            </View>
                                            <View style={styles.ticketInfoRow}>
                                                <Text style={styles.ticketLabel}>만료기한</Text>
                                                <Text style={styles.ticketValue}>~ 2026.01.10. 17:00</Text>
                                            </View>
                                        </View>

                                        {/* 티켓 절취선 (점선) */}
                                        <View style={styles.ticketDivider}>
                                            <View style={styles.notchLeft} />
                                            <View style={styles.dashedLine} />
                                            <View style={styles.notchRight} />
                                        </View>

                                        {/* 티켓 하단 (번호) */}
                                        <View style={styles.ticketBottom}>
                                            <Text style={styles.ticketNumber}>1   6   8   2</Text>
                                        </View>

                                        {/* [사용완료 도장] */}
                                        {isCouponUsed && (
                                            <View style={styles.stampContainer}>
                                                <View style={styles.stampCircle}>
                                                    <Text style={styles.stampText}>사용{'\n'}완료</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* 하단 버튼 (사용완료 처리) */}
                                    <TouchableOpacity 
                                        style={[styles.finalUseBtn, isCouponUsed && {backgroundColor: '#D5D5D5'}]}
                                        onPress={handleUseCoupon}
                                        disabled={isCouponUsed}
                                    >
                                        <Text style={styles.finalUseBtnText}>쿠폰 사용완료 처리</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
      </Modal>

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

  // ============================
  // [모달 스타일]
  // ============================
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  usageModalContainer: {
      width: rs(331),
      backgroundColor: 'white',
      borderRadius: rs(10),
      paddingTop: rs(17),
      paddingBottom: rs(20),
      paddingHorizontal: rs(22),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
  },
  modalCloseBtn: {
      position: 'absolute',
      top: rs(15),
      right: rs(15),
      zIndex: 1,
  },
  modalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(7),
      marginBottom: rs(6),
  },
  modalTitleIconBox: {
      width: rs(23),
      height: rs(23),
      backgroundColor: '#34B262',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: rs(4),
  },
  usageModalTitle: {
      fontSize: rs(16),
      fontWeight: '600',
      fontFamily: 'Pretendard',
      color: 'black',
  },
  usageModalSubtitle: {
      fontSize: rs(11),
      fontWeight: '500',
      fontFamily: 'Pretendard',
      color: '#668776',
      marginBottom: rs(20),
  },
  usageInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: rs(10),
  },
  usageInputBox: {
      flex: 1,
      height: rs(36),
      backgroundColor: 'white',
      borderRadius: rs(8),
      borderWidth: 1,
      borderColor: '#E0E0E0',
      justifyContent: 'center',
      paddingHorizontal: rs(16),
  },
  usageInput: {
      fontSize: rs(14),
      fontFamily: 'Pretendard',
      fontWeight: '500',
      color: 'black',
      padding: 0,
  },
  usageConfirmBtn: {
      width: rs(80),
      height: rs(36),
      borderRadius: rs(8),
      justifyContent: 'center',
      alignItems: 'center',
  },
  usageConfirmText: {
      fontSize: rs(14),
      fontFamily: 'Pretendard',
      fontWeight: '700',
      color: 'white',
  },
  errorText: {
      fontSize: rs(10),
      color: '#FF6200',
      fontFamily: 'Pretendard',
      fontWeight: '500',
      marginTop: rs(6),
  },
  successText: {
      width: '100%',
      fontSize: rs(10),
      color: '#828282',
      fontFamily: 'Pretendard',
      fontWeight: '500',
      marginTop: rs(5),
      marginBottom: rs(10),
  },
  
  // 쿠폰 티켓 스타일
  ticketContainer: {
      width: '100%',
      backgroundColor: '#F2F2F2',
      borderRadius: rs(0),
      borderWidth: 1,
      borderColor: 'transparent',
      marginBottom: rs(15),
      overflow: 'hidden',
      position: 'relative',
  },
  ticketTop: {
      paddingVertical: rs(15),
      paddingHorizontal: rs(20),
      alignItems: 'center',
  },
  ticketTitle: {
      fontSize: rs(18),
      fontWeight: '700',
      color: '#34B262',
      fontFamily: 'Pretendard',
      marginBottom: rs(4),
  },
  ticketDesc: {
      fontSize: rs(12),
      fontWeight: '500',
      color: 'black',
      fontFamily: 'Pretendard',
      marginBottom: rs(15),
  },
  ticketInfoRow: {
      width: '100%',
      flexDirection: 'row',
      marginBottom: rs(4),
  },
  ticketLabel: {
      width: rs(50),
      fontSize: rs(10),
      fontWeight: '600',
      color: '#444444',
      fontFamily: 'Pretendard',
  },
  ticketValue: {
      fontSize: rs(10),
      fontWeight: '500',
      color: '#828282',
      fontFamily: 'Pretendard',
  },
  
  // 티켓 절취선 영역
  ticketDivider: {
      height: rs(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      backgroundColor: '#F2F2F2',
  },
  dashedLine: {
      flex: 1,
      height: 1,
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderStyle: 'dashed',
      marginHorizontal: rs(10),
  },
  notchLeft: {
      width: rs(20),
      height: rs(20),
      borderRadius: rs(10),
      backgroundColor: 'white',
      marginLeft: rs(-10), // 왼쪽으로 반쯤 숨김
  },
  notchRight: {
      width: rs(20),
      height: rs(20),
      borderRadius: rs(10),
      backgroundColor: 'white',
      marginRight: rs(-10), // 오른쪽으로 반쯤 숨김
  },

  ticketBottom: {
      paddingVertical: rs(10),
      alignItems: 'center',
      justifyContent: 'center',
  },
  ticketNumber: {
      fontSize: rs(18),
      fontWeight: '700',
      color: 'black',
      fontFamily: 'Pretendard',
      letterSpacing: rs(8),
  },

  // 최종 사용 버튼
  finalUseBtn: {
      width: '100%',
      height: rs(40),
      backgroundColor: '#34B262',
      borderRadius: rs(8),
      justifyContent: 'center',
      alignItems: 'center',
  },
  finalUseBtnText: {
      fontSize: rs(14),
      fontWeight: '700',
      color: 'white',
      fontFamily: 'Pretendard',
  },

  // 도장 스타일
  stampContainer: {
      position: 'absolute',
      top: 0, bottom: 0, left: 100, right: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
  },
  stampCircle: {
      width: rs(64),
      height: rs(64),
      borderRadius: rs(32),
      borderWidth: 2,
      borderColor: '#34B262',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      transform: [{rotate: '-20deg'}], // 회전
      marginLeft: rs(100), // 위치 조정 (오른쪽 쏠림)
      marginTop: rs(20),
  },
  stampText: {
      fontSize: rs(16),
      fontWeight: '700',
      color: '#34B262',
      textAlign: 'center',
      fontFamily: 'Pretendard',
      lineHeight: rs(18),
  },
});