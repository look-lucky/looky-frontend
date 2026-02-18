import { withdraw } from '@/src/api/auth';
import { WithdrawRequestReasonsItem } from '@/src/api/generated.schemas';
import { useAuth } from '@/src/shared/lib/auth';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REASONS: { label: string; value: WithdrawRequestReasonsItem }[] = [
  { label: '서비스를 잘 이용하지 않아요', value: WithdrawRequestReasonsItem.UNUSED },
  { label: '매력적인 혜택이 부족해요', value: WithdrawRequestReasonsItem.INSUFFICIENT_BENEFITS },
  { label: '앱/서비스 이용이 너무 불편해요', value: WithdrawRequestReasonsItem.INCONVENIENT },
  { label: '잦은 알림과 광고가 부담스러워요', value: WithdrawRequestReasonsItem.TOO_MANY_ADS },
  { label: '더 이상 필요한 상품/서비스가 없어요', value: WithdrawRequestReasonsItem.NOT_NEEDED },
  { label: '기타', value: WithdrawRequestReasonsItem.OTHER },
];

export default function WithdrawScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();

  const [selectedReasons, setSelectedReasons] = useState<WithdrawRequestReasonsItem[]>([]);
  const [detailReason, setDetailReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const toggleReason = (reason: WithdrawRequestReasonsItem) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const hasAnySelection = selectedReasons.length > 0;
  const isOtherSelected = selectedReasons.includes(WithdrawRequestReasonsItem.OTHER);
  const isTextValid = detailReason.trim().length >= 5;
  const canSubmit = isOtherSelected ? isTextValid : hasAnySelection;

  const handleWithdrawBtnPress = () => {
    if (!canSubmit) return;
    setWithdrawModalVisible(true);
  };

  const handleFinalWithdraw = async () => {
    setIsLoading(true);
    try {
      await withdraw({ reasons: selectedReasons, detailReason: detailReason || undefined });
      setWithdrawModalVisible(false);
      await handleLogout();
      Alert.alert('완료', '회원탈퇴가 완료되었습니다.');
    } catch {
      Alert.alert('오류', '회원탈퇴 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setWithdrawModalVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>회원탈퇴</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            서비스를 아껴주신 시간에 감사드립니다.{'\n'}
            고객님이 느끼셨던 불편한 점들을{'\n'}
            루키가 더 성장할 수 있게 피드백을 남겨주세요!
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.reasonList}>
          {REASONS.map(({ label, value }) => {
            const isSelected = selectedReasons.includes(value);
            return (
              <TouchableOpacity key={value} style={styles.reasonRow} onPress={() => toggleReason(value)} activeOpacity={0.8}>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  <View style={[styles.radioInner, isSelected && styles.radioInnerSelected]} />
                </View>
                <Text style={styles.reasonText}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>상세 내용</Text>
          <View style={[styles.textAreaWrapper, !hasAnySelection && styles.textAreaDisabled]}>
            <TextInput
              style={styles.textArea}
              value={detailReason}
              onChangeText={setDetailReason}
              placeholder={
                isOtherSelected
                  ? '탈퇴 사유를 작성해주세요 (최소 5자 ~ 최대 100자)'
                  : hasAnySelection
                  ? '자유롭게 의견을 남겨주세요 (선택)'
                  : '탈퇴 사유를 선택하면 작성할 수 있어요'
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

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.withdrawBtn, canSubmit ? styles.withdrawBtnActive : styles.withdrawBtnDisabled]}
          onPress={handleWithdrawBtnPress}
          disabled={!canSubmit}
        >
          <Text style={styles.withdrawBtnText}>탈퇴하기</Text>
        </TouchableOpacity>
      </View>

      {/* 탈퇴 재확인 팝업 */}
      <Modal transparent animationType="fade" visible={withdrawModalVisible} onRequestClose={() => !isLoading && setWithdrawModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>탈퇴하시겠습니까?</Text>
              <Text style={styles.popupSubtitle}>
                탈퇴하시면 루키와 함께 찾은{'\n'}
                소중한 행운들이 모두 사라지게 됩니다.{'\n'}
                이대로 떠나시기엔 아쉬운 혜택들이 남아있어요.
              </Text>
            </View>
            <View style={styles.popupBtnGroup}>
              <TouchableOpacity style={styles.popupCancelBtn} onPress={() => setWithdrawModalVisible(false)} disabled={isLoading}>
                <Text style={styles.popupBtnTextWhite}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupConfirmBtn} onPress={handleFinalWithdraw} disabled={isLoading}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingBottom: rs(100) },
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
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20) },
  withdrawBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  withdrawBtnActive: { backgroundColor: '#FF6200' },
  withdrawBtnDisabled: { backgroundColor: '#D5D5D5' },
  withdrawBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { width: rs(335), backgroundColor: 'white', borderRadius: rs(10), paddingVertical: rs(40), paddingHorizontal: rs(20), alignItems: 'center', gap: rs(24), elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  popupTextContainer: { alignItems: 'center', gap: rs(10) },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center' },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(20), textAlign: 'center' },
  popupBtnGroup: { flexDirection: 'row', gap: rs(7) },
  popupCancelBtn: { width: rs(130), height: rs(40), backgroundColor: '#D5D5D5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  popupConfirmBtn: { width: rs(130), height: rs(40), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  popupBtnTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});
