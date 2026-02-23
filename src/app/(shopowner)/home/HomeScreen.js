import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

// [API] 내 가게 조회 & 상점 통계 조회 임포트
import { verifyCoupon } from '@/src/api/coupon';
import { getItems } from '@/src/api/item';
import { getMyStores, getStore, getStoreStats } from '@/src/api/store';
import { getMyStoreClaims } from '@/src/api/store-claim';
import { ErrorPopup } from '@/src/shared/common/error-popup';

export default function HomeScreen({ navigation }) {
  const router = useRouter();
  // [상태 관리]
  const [modalVisible, setModalVisible] = useState(false); // 등급 안내 모달
  const [isLoading, setIsLoading] = useState(true);        // 로딩 상태
  const [refreshing, setRefreshing] = useState(false);     // 당겨서 새로고침
  const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false); // 에러 팝업 상태 (전체화면)
  const [isPopupRefreshing, setIsPopupRefreshing] = useState(false);    // 에러 팝업 내 새로고침 상태

  // [가게 선택 모달]
  const [isStoreModalVisible, setIsStoreModalVisible] = useState(false);
  const [storeList, setStoreList] = useState([]);

  // [새 쿠폰 - 사용 처리 모달]
  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, valid, expired, invalid
  const [isCouponUsed, setIsCouponUsed] = useState(false);
  const [verifiedCouponData, setVerifiedCouponData] = useState(null); // 검증된 쿠폰 정보

  // 화면 데이터 상태
  const [homeData, setHomeData] = useState({
    storeId: null,
    storeName: "등록된 가게 없음",
    ownerName: "사장님",
    isStoreInfoComplete: false, // 매장 정보 등록 완료 여부
    approvalStatus: 'APPROVED', // 승인 상태 (PENDING, APPROVED, REJECTED)
    menuCount: 0,                // 등록된 메뉴 개수
    stats: {
      regulars: 0,
      issuedCoupons: 0,
      newReviews: 0,    // '총 리뷰'로 사용
      usedCoupons: 0,
    }
  });

  // 서버 데이터 가져오기
  const fetchData = async () => {
    try {
      // 1. 내 가게 목록 조회
      const myStoresResponse = await getMyStores();
      const myStores = myStoresResponse?.data?.data || [];
      setStoreList(myStores);

      if (!myStores || myStores.length === 0) {
        setHomeData(prev => ({ ...prev, storeName: "가게를 등록해주세요" }));
        setIsLoading(false);
        return;
      }

      // 2. 현재 선택된 가게 ID 가져오기 (AsyncStorage)
      const savedStoreId = await AsyncStorage.getItem('SELECTED_STORE_ID');
      let storeId = savedStoreId ? parseInt(savedStoreId, 10) : null;

      // 3. 저장된 ID가 없거나 실제 목록에 없으면 첫 번째 가게 선택
      let currentStore = myStores.find(s => s.id === storeId);
      if (!currentStore) {
        currentStore = myStores[0];
        storeId = currentStore.id;
        await AsyncStorage.setItem('SELECTED_STORE_ID', storeId.toString());
      }

      if (!storeId) {
        console.error("가게 ID를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      // 4. 상점 통계 조회 API 호출
      console.log(`[API] 통계 조회 시작: storeId=${storeId}`);
      const statsResponse = await getStoreStats(storeId);

      // [추가] 5. 상점 상세 정보 조회 (등록 상태 확인용)
      const storeDetailResponse = await getStore(storeId);
      const storeDetail = storeDetailResponse?.data?.data || {};

      // 매장 정보가 모두 입력되었는지 확인 (소개, 전화번호, 주소, 이미지 중 하나라도 있어야 함 - 여기서는 최소한의 조건으로 체크)
      const isStoreInfoComplete = !!(
        storeDetail.introduction &&
        storeDetail.phone &&
        storeDetail.roadAddress &&
        (storeDetail.imageUrls && storeDetail.imageUrls.length > 0)
      );

      // [추가] 6. 메뉴 목록 조회 (등록 상태 확인용)
      const itemsResponse = await getItems(storeId);
      const itemsData = itemsResponse?.data?.data || itemsResponse?.data || [];
      const itemsList = Array.isArray(itemsData) ? itemsData : (itemsData.content || []);
      const menuCount = itemsList.length;

      // [추가] 7. 내 상점 요청 목록 조회 (승인 대기 상태 확인용)
      let approvalStatus = 'APPROVED';
      try {
        const claimsResponse = await getMyStoreClaims();
        const claimsList = claimsResponse?.data?.data || [];
        const currentClaim = claimsList.find(c => c.storeId === storeId);
        if (currentClaim) {
          approvalStatus = currentClaim.status;
        }
      } catch (e) {
        console.error("상점 요청 목록 조회 실패:", e);
      }

      // 통계 데이터 언랩핑
      const statsData = statsResponse?.data?.data || {};

      console.log("📊 [통계 데이터 수신]:", statsData);
      console.log("🏪 [매장 상세 확인]:", isStoreInfoComplete ? "완료" : "미완료");
      console.log("🥘 [메뉴 개수 확인]:", menuCount);

      setHomeData({
        storeId: storeId,
        storeName: currentStore.name,
        ownerName: currentStore.ownerName || "사장님",
        isStoreInfoComplete,
        approvalStatus,
        menuCount,
        stats: {
          regulars: statsData.totalRegulars || 0,
          issuedCoupons: statsData.totalIssuedCoupons || 0,
          newReviews: statsData.totalReviews || 0,
          usedCoupons: statsData.totalUsedCoupons || 0,
        }
      });
      setIsErrorPopupVisible(false); // 데이터 로딩 성공 시 에러 팝업 닫기
      setIsPopupRefreshing(false);   // 팝업 내 로딩 상태 해제

    } catch (error) {
      console.error("홈 데이터 로딩 실패:", error);
      setIsErrorPopupVisible(true); // 에러 발생 시 팝업 띄우기
      setIsPopupRefreshing(false);  // 에러 발생 시 (재시도 실패 시) 로딩 상태 해제
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // [로직] 가게 변경 핸들러
  const handleStoreSelect = async (newStoreId) => {
    try {
      await AsyncStorage.setItem('SELECTED_STORE_ID', newStoreId.toString());
      setIsStoreModalVisible(false);
      setIsLoading(true);
      fetchData();
    } catch (error) {
      console.error("가게 선택 변경 실패:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // [로직] 에러 팝업 새로고침
  const handleErrorRefresh = () => {
    setIsPopupRefreshing(true); // 팝업 버튼 내 로딩 표시 시작
    fetchData();                // 데이터 다시 불러오기
  };

  // 날짜 포맷 헬퍼
  const formatDate = (dateString) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}까지`;
  };

  // [헬퍼] 숫자 콤마 포맷팅
  const formatNumber = (val) => {
    if (!val && val !== 0) return '0';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // [로직] 쿠폰 번호 검증 (API 연결)
  const handleVerifyCoupon = async () => {
    if (!homeData.storeId) return;

    try {
      const response = await verifyCoupon(homeData.storeId, { code: couponInput });
      setVerificationStatus('valid');
      setVerifiedCouponData(response.data);
    } catch (error) {
      console.error("쿠폰 검증 실패:", error);
      const status = error.status;
      if (status === 404) {
        setVerificationStatus('invalid');
      } else if (status === 409 || status === 400) {
        setVerificationStatus('expired');
      } else {
        setVerificationStatus('invalid');
      }
    }
  };

  // [로직] 사용 완료 처리
  const handleUseCoupon = () => {
    setIsCouponUsed(true);
    setTimeout(() => {
      closeUsageModal();
      fetchData(); // 데이터 갱신
    }, 1500);
  };

  // [로직] 모달 닫기
  const closeUsageModal = () => {
    setUsageModalVisible(false);
    setCouponInput('');
    setVerificationStatus('idle');
    setIsCouponUsed(false);
    setVerifiedCouponData(null);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 로고 */}
        <Image
          source={require("@/assets/images/shopowner/logo2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* --- 1. 상단 프로필 카드 --- */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => setIsStoreModalVisible(true)}
        >
          <View style={styles.iconBox}>
            <Ionicons name="storefront-outline" size={rs(32)} color="#34B262" />
          </View>
          <View style={styles.textContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
              <Text style={styles.storeName}>{homeData.storeName}</Text>
              {homeData.approvalStatus === 'PENDING' && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>승인 대기중</Text>
                </View>
              )}
            </View>
            <Text style={styles.greeting}>사장님, 반가워요!</Text>
          </View>
          <Ionicons name="chevron-down" size={rs(20)} color="#828282" />
        </TouchableOpacity>

        {/* --- 2. 등급 현황 카드 --- */}
        <View style={styles.levelCardShadow}>
          <LinearGradient
            colors={["#36AB66", "#349D73"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.levelCard}
          >
            <View style={styles.decoCircleTop} />
            <View style={styles.decoCircleBottom} />

            <View style={styles.levelHeader}>
              <View style={styles.levelIconContainer}>
                <Image
                  source={
                    (homeData.isStoreInfoComplete && homeData.menuCount > 0)
                      ? require("@/assets/images/shopowner/3clover.png")
                      : require("@/assets/images/shopowner/2clover.png")
                  }
                  style={styles.levelImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>현재 등급</Text>
                <Text style={styles.levelValue}>
                  {(homeData.isStoreInfoComplete && homeData.menuCount > 0) ? "세잎클로버" : "새싹"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.infoIcon}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={rs(18)}
                  color="#628473"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Ionicons name="sparkles" size={rs(12)} color="#A5F3C3" style={{ marginRight: 4 }} />
                <Text style={styles.progressLabel}>
                  {(homeData.isStoreInfoComplete && homeData.menuCount > 0)
                    ? "훌륭해요! 행운이 가득한 매장이군요"
                    : "루키의 파트너 매장이 되셨군요!"}
                </Text>
              </View>
              <Text style={[styles.progressLabel2, { marginTop: rs(2) }]}>
                {(homeData.isStoreInfoComplete && homeData.menuCount > 0)
                  ? "학생들에게 행운을 나눠주세요!"
                  : (!homeData.isStoreInfoComplete && homeData.menuCount === 0)
                    ? "다음 등급을 위해 매장과 메뉴 정보를 업데이트 해주세요!"
                    : (homeData.menuCount === 0)
                      ? "다음 등급을 위해 메뉴 정보도 업데이트 해주세요!"
                      : "다음 등급을 위해 매장 정보도 업데이트 해주세요!"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* --- 3. 성과 섹션 헤더 --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📊</Text>
            <Text style={styles.sectionTitleText}>{homeData.storeName}의 성과</Text>
          </View>
        </View>

        {/* --- 4. 성과 통계 그리드 --- */}
        <View style={styles.statsContainer}>
          <View style={styles.gridRow}>

            {/* 카드 1: 단골 손님 (찜) */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'patron' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="people" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={statStyles.statTitle}>단골 손님</Text>
                <Text style={styles.statNumber}>{formatNumber(homeData.stats.regulars)}</Text>
                <Text style={styles.statSubText}>명이 찜했어요</Text>
              </View>
            </TouchableOpacity>

            {/* 카드 2: 발행한 쿠폰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'coupon' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="ticket" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={statStyles.statTitle}>발행한 쿠폰</Text>
                <Text style={styles.statNumber}>{formatNumber(homeData.stats.issuedCoupons)}</Text>
                <Text style={styles.statSubText}>장을 발행했어요</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>

            {/* 카드 3: 총 리뷰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Review')}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="chatbox-ellipses" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={statStyles.statTitle}>총 리뷰</Text>
                <Text style={styles.statNumber}>{formatNumber(homeData.stats.newReviews)}</Text>
                <Text style={styles.statSubText}>명이 남겼어요</Text>
              </View>
            </TouchableOpacity>

            {/* 카드 4: 사용된 쿠폰 */}
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Coupon', { initialTab: 'coupon' })}
            >
              <View style={styles.statIconBox}>
                <Ionicons name="qr-code" size={rs(18)} color="#34B262" />
              </View>
              <View style={styles.statInfoBox}>
                <Text style={statStyles.statTitle}>사용된 쿠폰</Text>
                <Text style={styles.statNumber}>{formatNumber(homeData.stats.usedCoupons)}</Text>
                <Text style={styles.statSubText}>장 사용되었어요</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 5. 쿠폰 사용완료 처리 버튼 --- */}
        <TouchableOpacity
          style={styles.couponProcessBtn}
          activeOpacity={0.8}
          onPress={() => setUsageModalVisible(true)}
        >
          <Ionicons name="scan-circle-outline" size={rs(20)} color="#34B262" style={{ marginRight: rs(8) }} />
          <Text style={styles.couponProcessText}>쿠폰 사용완료 처리</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={{ height: rs(50) }} />

      </ScrollView>

      {/* --- [모달] 등급 안내 팝업 --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <Image
                  source={require("@/assets/images/shopowner/leaf.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>클로버 등급 시스템</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
              >
                <Ionicons name="close" size={rs(24)} color="#828282" />
              </TouchableOpacity>
            </View>

            {/* 등급 리스트 */}
            <View style={styles.gradeList}>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/1clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>씨앗</Text>
                  <Text style={styles.gradeItemDesc}>{"아직 루키에 정식 등록되지 않은 상태예요.\n(입점 신청 필요)"}</Text>
                </View>
              </View>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/2clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>새싹</Text>
                  <Text style={styles.gradeItemDesc}>{"루키의 파트너가 되셨군요!\n환영합니다."}</Text>
                </View>
              </View>
              <View style={styles.gradeItemBox}>
                <Image
                  source={require("@/assets/images/shopowner/3clover.png")}
                  style={styles.gradeImage}
                  resizeMode="contain"
                />
                <View style={styles.gradeTextBox}>
                  <Text style={styles.gradeItemTitle}>세잎</Text>
                  <Text style={styles.gradeItemDesc}>{"가게 정보를 모두 등록하여 손님 맞을 준비 완료!\n학생들에게 행운을 나눠주세요!"}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- [모달] 쿠폰 사용완료 처리 --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={usageModalVisible}
        onRequestClose={closeUsageModal}
      >
        <TouchableWithoutFeedback onPress={closeUsageModal}>
          <View style={styles.usageModalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View style={[styles.usageModalContainer, verificationStatus === 'valid' && { height: rs(400) }]}>
                  {/* 닫기 버튼 */}
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={closeUsageModal}
                    hitSlop={{ top: rs(10), bottom: rs(10), left: rs(10), right: rs(10) }}
                  >
                    <Ionicons name="close" size={rs(20)} color="#828282" />
                  </TouchableOpacity>

                  {/* 타이틀 */}
                  <View style={styles.modalTitleRow}>
                    <View style={styles.modalTitleIconBox}>
                      <Ionicons name="ticket" size={rs(16)} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
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
                      style={[styles.usageConfirmBtn, { backgroundColor: couponInput.length === 4 ? '#34B262' : '#D5D5D5' }]}
                      onPress={handleVerifyCoupon}
                      disabled={couponInput.length !== 4}
                    >
                      <Text style={styles.usageConfirmText}>확인</Text>
                    </TouchableOpacity>
                  </View>

                  {/* [에러 메시지 영역] */}
                  {verificationStatus === 'expired' && (
                    <Text style={styles.errorText}>이미 사용되었거나 만료된 쿠폰입니다</Text>
                  )}
                  {verificationStatus === 'invalid' && (
                    <Text style={styles.errorText}>잘못된 쿠폰 번호입니다.</Text>
                  )}

                  {/* [성공 시 쿠폰 카드 표시 영역] */}
                  {verificationStatus === 'valid' && (
                    <View style={{ width: '100%', alignItems: 'center', marginTop: rs(0) }}>
                      <Text style={styles.successText}>쿠폰이 확인되었습니다</Text>

                      {/* 쿠폰 티켓 UI */}
                      <View style={[styles.ticketContainer, isCouponUsed && { opacity: 0.5 }]}>
                        {/* 티켓 상단 (내용) */}
                        <View style={styles.ticketTop}>
                          <Text style={styles.ticketTitle}>{verifiedCouponData?.name || '쿠폰'}</Text>
                          <Text style={styles.ticketDesc}>{verifiedCouponData?.description || '혜택을 확인해주세요'}</Text>

                          <View style={styles.ticketInfoRow}>
                            <Text style={styles.ticketLabel}>혜택</Text>
                            <Text style={styles.ticketValue}>사용 확인 후 제공해주세요</Text>
                          </View>
                          <View style={styles.ticketInfoRow}>
                            <Text style={styles.ticketLabel}>만료기한</Text>
                            <Text style={styles.ticketValue}>{formatDate(verifiedCouponData?.expiredAt)}</Text>
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
                          <Text style={styles.ticketNumber}>{couponInput.split('').join('  ')}</Text>
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
                        style={[styles.finalUseBtn, isCouponUsed && { backgroundColor: '#D5D5D5' }]}
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

      {/* --- [모달] 가게 선택 --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isStoreModalVisible}
        onRequestClose={() => setIsStoreModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsStoreModalVisible(false)}>
          <View style={styles.storeModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.storeModalContainer}>
                <View style={styles.storeModalHeader}>
                  <View style={styles.storeHeaderLeft}>
                    <Ionicons name="storefront-outline" size={rs(20)} color="#35A26F" style={{ marginRight: rs(7) }} />
                    <Text style={styles.storeModalTitle}>다른 가게 선택하기</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    setIsStoreModalVisible(false);
                    navigation.navigate('StoreManagement');
                  }}>
                    <Text style={styles.addStoreText}>+ 가게 추가</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.storeListScroll} showsVerticalScrollIndicator={false}>
                  {storeList.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      style={[
                        styles.storeCard,
                        homeData.storeId === store.id && { borderColor: '#34B262', borderWidth: 1 }
                      ]}
                      onPress={() => handleStoreSelect(store.id)}
                    >
                      <View style={styles.storeIconBox}>
                        <Ionicons name="storefront-outline" size={rs(24)} color="#34B262" />
                      </View>
                      <View style={styles.storeInfoText}>
                        <Text style={styles.storeCardName}>{store.name}</Text>
                        <View style={styles.statusRow}>
                          <Ionicons name="cog-outline" size={rs(14)} color="#B7B7B7" style={{ marginRight: rs(3) }} />
                          <Text style={styles.statusText}>매장 정보를 업데이트 해주세요!</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- [모달] 에러 발생 팝업 --- */}
      <ErrorPopup
        visible={isErrorPopupVisible}
        isRefreshing={isPopupRefreshing}
        type="NETWORK"
        onRefresh={handleErrorRefresh}
        onClose={() => setIsErrorPopupVisible(false)}
      />
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },
  logo: { width: rs(120), height: rs(30), marginBottom: rs(10), marginLeft: 0 },

  // 프로필 카드 스타일
  profileCard: {
    width: "100%", height: rs(80), backgroundColor: "white", borderRadius: rs(12),
    flexDirection: "row", alignItems: "center", paddingHorizontal: rs(16), marginBottom: rs(20),
    shadowColor: "rgba(0,0,0,0.05)", shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(8), elevation: 4,
  },
  iconBox: {
    width: rs(50), height: rs(50), backgroundColor: "#EAF6EE", borderWidth: 1, borderColor: "#EAF6EE",
    borderRadius: rs(12), justifyContent: "center", alignItems: "center", marginRight: rs(14),
  },
  textContainer: { flex: 1, justifyContent: "center" },
  storeName: { fontSize: rs(16), fontWeight: "700", color: "black", marginBottom: rs(5) },
  greeting: { fontSize: rs(13), fontWeight: "400", color: "#828282" },

  // 등급 카드 스타일
  levelCardShadow: {
    width: "100%", minHeight: rs(150), shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: rs(2), height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 3,
    borderRadius: rs(12), marginBottom: rs(25),
  },
  levelCard: { borderRadius: rs(12), overflow: "hidden", padding: rs(20), position: "relative", minHeight: rs(150), justifyContent: 'space-between' },
  decoCircleTop: { position: "absolute", width: rs(120), height: rs(120), borderRadius: rs(60), backgroundColor: "rgba(255,255,255,0.1)", top: rs(-40), right: rs(-30) },
  decoCircleBottom: { position: "absolute", width: rs(100), height: rs(100), borderRadius: rs(50), backgroundColor: "rgba(255,255,255,0.05)", bottom: rs(-40), left: rs(-20) },
  levelHeader: { flexDirection: "row", alignItems: "center", marginBottom: rs(10) },
  levelIconContainer: { width: rs(50), height: rs(50), marginRight: rs(10), justifyContent: "center", alignItems: "center" },
  levelImage: { width: "100%", height: "100%" },
  levelInfo: { flex: 1 },
  levelLabel: { color: "rgba(255,255,255,0.8)", fontSize: rs(11), fontWeight: "500", marginBottom: rs(2) },
  levelValue: { color: "white", fontSize: rs(20), fontWeight: "700" },
  infoIcon: { padding: rs(5), backgroundColor: "#FFFFFFCC", borderRadius: rs(20) },
  progressContainer: { backgroundColor: "#54B77E", borderRadius: rs(8), paddingVertical: rs(12), paddingHorizontal: rs(15) },
  progressTextRow: { flexDirection: "row", alignItems: "center", marginBottom: rs(2) },
  progressLabel: { color: "white", fontSize: rs(12), fontWeight: "500" },
  progressLabel2: { color: "#FFFFFFCC", fontSize: rs(12), fontWeight: "500" },

  // 섹션 헤더 스타일
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(12) },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionEmoji: { fontSize: rs(16), marginRight: rs(6) },
  sectionTitleText: { fontSize: rs(17), fontWeight: "700", color: "#668776" },

  // 통계 카드(그리드) 스타일
  statsContainer: { width: "100%", gap: rs(5), marginBottom: rs(20) },
  gridRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: rs(5) },
  statCard: {
    width: "49%", backgroundColor: "white", borderRadius: rs(12), padding: rs(16),
    flexDirection: 'row', alignItems: 'flex-start', shadowColor: "rgba(0,0,0,0.03)",
    shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 2,
  },
  statIconBox: { width: rs(40), height: rs(36), backgroundColor: "#EAF6EE", borderRadius: rs(10), justifyContent: "center", alignItems: "center", marginRight: rs(10), marginTop: rs(7) },
  statInfoBox: { flex: 1, justifyContent: 'center' },
  statNumber: { fontSize: rs(18), fontWeight: "700", color: "black", marginBottom: rs(2) },
  statSubText: { fontSize: rs(10), color: "#828282", fontWeight: "400" },

  // 쿠폰 처리 버튼 스타일
  couponProcessBtn: {
    width: '100%', height: rs(52), backgroundColor: "white", borderRadius: rs(12),
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA',
    shadowColor: "rgba(0,0,0,0.03)", shadowOffset: { width: 0, height: rs(2) }, shadowOpacity: 1, shadowRadius: rs(4), elevation: 2,
  },
  couponProcessText: { fontSize: rs(15), fontWeight: '700', color: '#34B262' },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: rs(335), backgroundColor: "white", borderRadius: rs(12), padding: rs(24), alignItems: "center" },
  modalHeader: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(20) },

  // 쿠폰 사용완료 처리 모달 스타일
  usageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', },
  usageModalContainer: { width: rs(331), backgroundColor: 'white', borderRadius: rs(10), paddingTop: rs(17), paddingBottom: rs(20), paddingHorizontal: rs(22), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, },
  modalCloseBtn: { position: 'absolute', top: rs(15), right: rs(15), zIndex: 1, },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(7), marginBottom: rs(6), },
  modalTitleIconBox: { width: rs(23), height: rs(23), backgroundColor: '#34B262', justifyContent: 'center', alignItems: 'center', borderRadius: rs(4), },
  usageModalTitle: { fontSize: rs(16), fontWeight: '600', fontFamily: 'Pretendard', color: 'black', },
  usageModalSubtitle: { fontSize: rs(11), fontWeight: '500', fontFamily: 'Pretendard', color: '#668776', marginBottom: rs(20), },
  usageInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: rs(10), },
  usageInputBox: { flex: 1, height: rs(36), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', paddingHorizontal: rs(16), },
  usageInput: { fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '500', color: 'black', padding: 0, },
  usageConfirmBtn: { width: rs(80), height: rs(36), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', },
  usageConfirmText: { fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '700', color: 'white', },
  errorText: { fontSize: rs(10), color: '#FF6200', fontFamily: 'Pretendard', fontWeight: '500', marginTop: rs(6), },
  successText: { width: '100%', fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard', fontWeight: '500', marginTop: rs(5), marginBottom: rs(10), },
  ticketContainer: { width: '100%', backgroundColor: '#F2F2F2', borderRadius: rs(0), borderWidth: 1, borderColor: 'transparent', marginBottom: rs(15), overflow: 'hidden', position: 'relative', },
  ticketTop: { paddingVertical: rs(15), paddingHorizontal: rs(20), alignItems: 'center', },
  ticketTitle: { fontSize: rs(18), fontWeight: '700', color: '#34B262', fontFamily: 'Pretendard', marginBottom: rs(4), },
  ticketDesc: { fontSize: rs(12), fontWeight: '500', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(15), },
  ticketInfoRow: { width: '100%', flexDirection: 'row', marginBottom: rs(4), },
  ticketLabel: { width: rs(50), fontSize: rs(10), fontWeight: '600', color: '#444444', fontFamily: 'Pretendard', },
  ticketValue: { fontSize: rs(10), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', },
  ticketDivider: { height: rs(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', backgroundColor: '#F2F2F2', },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#D5D5D5', borderStyle: 'dashed', marginHorizontal: rs(10), },
  notchLeft: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: 'white', marginLeft: rs(-10), },
  notchRight: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: 'white', marginRight: rs(-10), },
  ticketBottom: { paddingVertical: rs(10), alignItems: 'center', justifyContent: 'center', },
  ticketNumber: { fontSize: rs(18), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', letterSpacing: rs(8), },
  finalUseBtn: { width: '100%', height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', },
  finalUseBtnText: { fontSize: rs(14), fontWeight: '700', color: 'white', fontFamily: 'Pretendard', },
  stampContainer: { position: 'absolute', top: 0, bottom: 0, left: 100, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, },
  stampCircle: { width: rs(64), height: rs(64), borderRadius: rs(32), borderWidth: 2, borderColor: '#34B262', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', transform: [{ rotate: '-20deg' }], marginLeft: rs(100), marginTop: rs(20), },
  stampText: { fontSize: rs(16), fontWeight: '700', color: '#34B262', textAlign: 'center', fontFamily: 'Pretendard', lineHeight: rs(18), },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerImage: { width: rs(24), height: rs(24), marginRight: rs(6) },
  headerTitle: { fontSize: rs(18), fontWeight: "700", color: "black" },
  gradeList: { width: "100%", gap: rs(12) },
  gradeItemBox: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: "#F9F9F9", borderRadius: rs(10), padding: rs(12) },
  gradeImage: { width: rs(40), height: rs(40), marginRight: rs(12) },
  gradeTextBox: { flex: 1 },
  gradeItemTitle: { fontSize: rs(15), fontWeight: "700", color: "black", marginBottom: rs(2) },
  gradeItemDesc: { fontSize: rs(11), color: "#666", lineHeight: rs(16) },

  // 가게 선택 모달 스타일
  storeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeModalContainer: {
    width: rs(331),
    maxHeight: rs(450),
    backgroundColor: 'white',
    borderRadius: rs(10),
    paddingTop: rs(27),
    paddingBottom: rs(20),
    paddingHorizontal: rs(22),
  },
  storeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(25),
  },
  storeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeModalTitle: {
    fontSize: rs(16),
    fontWeight: '600',
    color: 'black',
  },
  addStoreText: {
    fontSize: rs(10),
    color: '#838383',
    fontWeight: '400',
  },
  storeListScroll: {
    flexGrow: 0,
  },
  storeCard: {
    width: '100%',
    height: rs(68),
    backgroundColor: 'rgba(217, 217, 217, 0.30)',
    borderRadius: rs(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(10),
    marginBottom: rs(16),
  },
  storeIconBox: {
    width: rs(50),
    height: rs(50),
    backgroundColor: '#EAF6EE',
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: rs(7),
  },
  storeInfoText: {
    flex: 1,
    justifyContent: 'center',
  },
  storeCardName: {
    fontSize: rs(13),
    fontWeight: '600',
    color: 'black',
    marginBottom: rs(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: rs(11),
    color: '#828282',
    fontWeight: '500',
  },
  // 승인 대기 뱃지
  pendingBadge: {
    backgroundColor: '#FF9B26',
    paddingHorizontal: rs(6),
    paddingVertical: rs(2),
    borderRadius: rs(4),
  },
  pendingBadgeText: {
    fontSize: rs(10),
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Pretendard',
  },
});

const statStyles = StyleSheet.create({
  statTitle: { fontSize: rs(10), color: "#828282", fontWeight: "500", marginBottom: rs(4) },
});