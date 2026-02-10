import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { withdraw } from '@/src/api/auth';

const REASONS = [
  "서비스를 잘 이용하지 않아요",
  "매력적인 혜택이 부족해요",
  "앱/서비스 이용이 너무 불편해요",
  "잦은 알림과 광고가 부담스러워요",
  "더 이상 필요한 상품/서비스가 없어요",
  "기타"
];

import { useAuth } from '@/src/shared/lib/auth'; // Import useAuth

export default function WithdrawScreen({ navigation }) {
  // 복수 선택
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [detailReason, setDetailReason] = useState('');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 탈퇴 확인 팝업 상태
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const { handleLogout } = useAuth(); // Use useAuth hook

  // 사유 토글 핸들러
  const toggleReason = (reason) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(prev => prev.filter(r => r !== reason));
    } else {
      setSelectedReasons(prev => [...prev, reason]);
    }
  };

  // 유효성 검사 로직
  const hasAnySelection = selectedReasons.length > 0;
  const isOtherSelected = selectedReasons.includes("기타");
  const isTextValid = detailReason.trim().length >= 5;

  let canSubmit = false;
  if (isOtherSelected) {
    canSubmit = isTextValid;
  } else {
    canSubmit = hasAnySelection;
  }

  // 탈퇴 버튼 클릭 시 팝업 오픈
  const handleWithdrawBtnPress = () => {
    if (!canSubmit) return;
    setWithdrawModalVisible(true);
  };

  // 팝업 내 '확인' 버튼 클릭 (최종 탈퇴 API 호출)
  const handleFinalWithdraw = async () => {
    // API 명세서에 맞게 데이터 변환
    const REASON_MAP = {
      "서비스를 잘 이용하지 않아요": "UNUSED",
      "매력적인 혜택이 부족해요": "INSUFFICIENT_BENEFITS",
      "앱/서비스 이용이 너무 불편해요": "INCONVENIENT",
      "잦은 알림과 광고가 부담스러워요": "TOO_MANY_ADS",
      "더 이상 필요한 상품/서비스가 없어요": "NOT_NEEDED",
      "기타": "OTHER"
    };

    const mappedReasons = selectedReasons.map(r => REASON_MAP[r] || "OTHER");

    // 최종 전송할 데이터
    const requestData = {
      reasons: mappedReasons,
      detailReason: detailReason || undefined
    };

    setIsLoading(true);

    try {
      // 회원 탈퇴
      await withdraw(requestData);

      setWithdrawModalVisible(false);

      // 로그아웃 처리 (토큰 삭제 및 상태 초기화)
      await handleLogout();

      // 알림 표시 후 로그인 화면으로 이동 (handleLogout에 의해 RootLayout이 반응하여 로그인 화면으로 전환됨)
      Alert.alert("완료", "회원탈퇴가 완료되었습니다.");

    } catch (error) {
      console.error("회원탈퇴 실패:", error);
      Alert.alert("오류", "회원탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setWithdrawModalVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>회원탈퇴</Text>
        </View>

        {/* 안내 문구 박스 */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            서비스를 아껴주신 시간에 감사드립니다.{'\n'}
            고객님이 느끼셨던 불편한 점들을{'\n'}
            루키가 더 성장할 수 있게 피드백을 남겨주세요!
          </Text>
        </View>
        <View style={styles.divider} />

        {/* 사유 선택 */}
        <View style={styles.reasonList}>
          {REASONS.map((reason, index) => {
            const isSelected = selectedReasons.includes(reason);
            return (
              <TouchableOpacity
                key={index}
                style={styles.reasonRow}
                onPress={() => toggleReason(reason)}
                activeOpacity={0.8}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  <View style={[styles.radioInner, isSelected && styles.radioInnerSelected]} />
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* 상세 내용 */}
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>상세 내용</Text>

          <View style={[styles.textAreaWrapper, !hasAnySelection && styles.textAreaDisabled]}>
            <TextInput
              style={styles.textArea}
              value={detailReason}
              onChangeText={setDetailReason}
              placeholder={
                isOtherSelected
                  ? "탈퇴 사유를 작성해주세요 (최소 5자 ~ 최대 100자)"
                  : (hasAnySelection ? "자유롭게 의견을 남겨주세요 (선택)" : "탈퇴 사유를 선택하면 작성할 수 있어요")
              }
              placeholderTextColor="#828282"
              multiline
              textAlignVertical="top"
              editable={hasAnySelection}
              maxLength={100}
            />
          </View>

          {isOtherSelected && detailReason.length > 0 && detailReason.length < 5 && (
            <Text style={styles.errorText}>최소 5자 이상 입력해주세요.</Text>
          )}
        </View>

        <View style={styles.divider} />

      </ScrollView>

      {/* 하단 탈퇴하기 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.withdrawBtn, canSubmit ? styles.withdrawBtnActive : styles.withdrawBtnDisabled]}
          onPress={handleWithdrawBtnPress}
          disabled={!canSubmit}
        >
          <Text style={styles.withdrawBtnText}>탈퇴하기</Text>
        </TouchableOpacity>
      </View>

      {/* 탈퇴 재확인 팝업 (Modal) */}
      <Modal
        transparent
        animationType="fade"
        visible={withdrawModalVisible}
        onRequestClose={() => !isLoading && setWithdrawModalVisible(false)} // 로딩 중 닫기 방지
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>

            {/* 1. 이미지 영역 */}
            <Image
              source={require("@/assets/images/shopowner/dropclover3.png")}
              style={styles.popupImgBack}
            />

            {/* 2. 텍스트 영역 */}
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>탈퇴하시겠습니까?</Text>
              <Text style={styles.popupSubtitle}>
                탈퇴하시면 루키와 함께 찾은{'\n'}
                소중한 행운들이 모두 사라지게 됩니다.{'\n'}
                이대로 떠나시기엔 아쉬운 혜택들이 남아있어요.
              </Text>
            </View>

            {/* 3. 버튼 영역 */}
            <View style={styles.popupBtnGroup}>
              {/* 취소 (회색) */}
              <TouchableOpacity
                style={styles.popupCancelBtn}
                onPress={() => setWithdrawModalVisible(false)}
                disabled={isLoading}
              >
                <Text style={styles.popupBtnTextWhite}>취소</Text>
              </TouchableOpacity>

              {/* 확인 (주황색) */}
              <TouchableOpacity
                style={styles.popupConfirmBtn}
                onPress={handleFinalWithdraw}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.popupBtnTextWhite}>확인</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingBottom: rs(100) },

  // 기존 스타일 유지
  titleContainer: { alignItems: 'center', marginVertical: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  infoBox: { paddingVertical: rs(15), paddingHorizontal: rs(20), alignItems: 'center' },
  infoText: { fontSize: rs(14), fontWeight: '400', color: 'black', fontFamily: 'Pretendard', textAlign: 'center', lineHeight: rs(20) },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  reasonList: { paddingHorizontal: rs(20), paddingVertical: rs(20), gap: rs(20) },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  reasonText: { fontSize: rs(14), fontWeight: '400', color: '#272828', fontFamily: 'Pretendard' },
  radioOuter: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: '#E9E9E9', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { backgroundColor: '#FFBE95' },
  radioInner: { width: rs(12), height: rs(12), borderRadius: rs(6), backgroundColor: '#ACACAC' },
  radioInnerSelected: { backgroundColor: '#FF6200' },
  detailContainer: { paddingHorizontal: rs(20), paddingVertical: rs(20), gap: rs(10) },
  detailTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  textAreaWrapper: { height: rs(95), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', padding: rs(10) },
  textAreaDisabled: { backgroundColor: '#F5F5F5' },
  textArea: { flex: 1, fontSize: rs(12), fontFamily: 'Pretendard', color: 'black' },
  errorText: { fontSize: rs(10), color: '#FF6200', fontFamily: 'Pretendard', marginLeft: rs(5) },
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20), backgroundColor: 'transparent' },
  withdrawBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  withdrawBtnActive: { backgroundColor: '#FF6200' },
  withdrawBtnDisabled: { backgroundColor: '#D5D5D5' },
  withdrawBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },

  // --- [팝업 스타일] ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  popupBox: {
    width: rs(335),
    height: rs(302),
    backgroundColor: 'white',
    borderRadius: rs(10),
    // 그림자
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    position: 'relative',
  },

  // 이미지 배치 (Absolute)
  popupImgBack: {
    position: 'absolute',
    width: rs(100),
    height: rs(100),
    top: rs(13),
    left: rs(114),
  },

  // 텍스트 영역
  popupTextContainer: {
    position: 'absolute',
    top: rs(118),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: rs(10),
    gap: rs(10),
  },
  popupTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(28),
    textAlign: 'center',
  },
  popupSubtitle: {
    fontSize: rs(14),
    fontWeight: '500',
    color: '#828282',
    fontFamily: 'Pretendard',
    lineHeight: rs(19.6),
    textAlign: 'center',
  },

  // 버튼 그룹
  popupBtnGroup: {
    position: 'absolute',
    top: rs(249),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rs(7),
  },
  popupCancelBtn: {
    width: rs(150),
    height: rs(40),
    backgroundColor: '#D5D5D5',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupConfirmBtn: {
    width: rs(150),
    height: rs(40),
    backgroundColor: '#FF6200',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBtnTextWhite: {
    color: 'white',
    fontSize: rs(14),
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
});