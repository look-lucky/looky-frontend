import { useChangePassword, useChangeUsername } from '@/src/api/my-page';
import { useWithdraw } from '@/src/api/auth';
import { WithdrawRequestReasonsItem } from '@/src/api/generated.schemas';
import { useAuth } from '@/src/shared/lib/auth';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

const WITHDRAW_REASONS: { label: string; value: WithdrawRequestReasonsItem }[] = [
  { label: '사용하지 않아요', value: WithdrawRequestReasonsItem.UNUSED },
  { label: '혜택이 부족해요', value: WithdrawRequestReasonsItem.INSUFFICIENT_BENEFITS },
  { label: '사용이 불편해요', value: WithdrawRequestReasonsItem.INCONVENIENT },
  { label: '광고가 너무 많아요', value: WithdrawRequestReasonsItem.TOO_MANY_ADS },
  { label: '더 이상 필요 없어요', value: WithdrawRequestReasonsItem.NOT_NEEDED },
  { label: '기타', value: WithdrawRequestReasonsItem.OTHER },
];

type ModalType = 'username' | 'password' | 'withdraw' | null;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();

  const [modal, setModal] = useState<ModalType>(null);

  const [newUsername, setNewUsername] = useState('');
  const { mutate: changeUsername, isPending: isChangingUsername } = useChangeUsername();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [selectedReasons, setSelectedReasons] = useState<WithdrawRequestReasonsItem[]>([]);
  const [detailReason, setDetailReason] = useState('');
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();

  const closeModal = () => {
    setModal(null);
    setNewUsername('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSelectedReasons([]);
    setDetailReason('');
  };

  const handleChangeUsername = () => {
    if (!newUsername.trim()) {
      Alert.alert('오류', '새 아이디를 입력해주세요.');
      return;
    }
    changeUsername(
      { data: { newUsername: newUsername.trim() } },
      {
        onSuccess: () => {
          Alert.alert('완료', '아이디가 변경되었습니다.');
          closeModal();
        },
        onError: () => Alert.alert('오류', '아이디 변경에 실패했습니다.'),
      }
    );
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }
    changePassword(
      { data: { currentPassword, newPassword } },
      {
        onSuccess: () => {
          Alert.alert('완료', '비밀번호가 변경되었습니다.');
          closeModal();
        },
        onError: () => Alert.alert('오류', '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.'),
      }
    );
  };

  const toggleReason = (reason: WithdrawRequestReasonsItem) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleWithdraw = () => {
    if (selectedReasons.length === 0) {
      Alert.alert('오류', '탈퇴 사유를 하나 이상 선택해주세요.');
      return;
    }
    Alert.alert('회원탈퇴', '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: () => {
          withdraw(
            { data: { reasons: selectedReasons, detailReason: detailReason || undefined } },
            {
              onSuccess: async () => {
                closeModal();
                await handleLogout();
                router.replace('/landing');
              },
              onError: () => Alert.alert('오류', '회원탈퇴에 실패했습니다.'),
            }
          );
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.fixedTitleContainer}>
        <Text style={styles.pageTitle}>내 정보 수정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.menuRow} onPress={() => setModal('username')}>
          <Text style={styles.menuText}>아이디</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="#1B1D1F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => setModal('password')}>
          <Text style={styles.menuText}>비밀번호</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="#1B1D1F" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => setModal('withdraw')}>
          <Text style={styles.deleteAccountText}>회원탈퇴</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="#BDBDBD" />
        </TouchableOpacity>
      </ScrollView>

      {/* 아이디 변경 모달 */}
      <Modal visible={modal === 'username'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>아이디 변경</Text>
            <TextInput
              style={styles.input}
              placeholder="새 아이디 입력"
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleChangeUsername} disabled={isChangingUsername}>
                <Text style={styles.confirmText}>{isChangingUsername ? '변경 중...' : '변경'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 비밀번호 변경 모달 */}
      <Modal visible={modal === 'password'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleChangePassword} disabled={isChangingPassword}>
                <Text style={styles.confirmText}>{isChangingPassword ? '변경 중...' : '변경'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 회원탈퇴 모달 */}
      <Modal visible={modal === 'withdraw'} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modalBox, styles.withdrawBox]}>
            <Text style={styles.modalTitle}>회원탈퇴</Text>
            <Text style={styles.withdrawSubtitle}>탈퇴 사유를 선택해주세요 (복수 선택 가능)</Text>
            {WITHDRAW_REASONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={styles.reasonRow}
                onPress={() => toggleReason(value)}
              >
                <Ionicons
                  name={selectedReasons.includes(value) ? 'checkbox' : 'square-outline'}
                  size={rs(20)}
                  color={selectedReasons.includes(value) ? '#34B262' : '#BDBDBD'}
                />
                <Text style={styles.reasonText}>{label}</Text>
              </TouchableOpacity>
            ))}
            {selectedReasons.includes(WithdrawRequestReasonsItem.OTHER) && (
              <TextInput
                style={[styles.input, { marginTop: rs(8) }]}
                placeholder="기타 사유 입력"
                value={detailReason}
                onChangeText={setDetailReason}
                multiline
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.withdrawBtn]}
                onPress={handleWithdraw}
                disabled={isWithdrawing}
              >
                <Text style={styles.confirmText}>{isWithdrawing ? '처리 중...' : '탈퇴'}</Text>
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
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  fixedTitleContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(10) },
  pageTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  content: { paddingHorizontal: rs(20), paddingBottom: rs(50), paddingTop: rs(10) },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(18) },
  menuText: { fontSize: rs(15), fontWeight: '500', color: '#1B1D1F', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', marginVertical: rs(10) },
  deleteAccountText: { fontSize: rs(14), fontWeight: '500', color: '#BDBDBD', fontFamily: 'Pretendard' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: rs(20) },
  modalBox: { backgroundColor: 'white', borderRadius: rs(16), padding: rs(24), width: '100%' },
  withdrawBox: { maxHeight: '80%' },
  modalTitle: { fontSize: rs(18), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard', marginBottom: rs(16) },
  withdrawSubtitle: { fontSize: rs(13), color: '#828282', fontFamily: 'Pretendard', marginBottom: rs(12) },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: rs(8),
    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
    fontSize: rs(14),
    fontFamily: 'Pretendard',
    marginBottom: rs(8),
  },
  modalButtons: { flexDirection: 'row', gap: rs(8), marginTop: rs(8) },
  cancelBtn: { flex: 1, paddingVertical: rs(12), borderRadius: rs(8), backgroundColor: '#F0F0F0', alignItems: 'center' },
  cancelText: { fontSize: rs(14), fontWeight: '600', color: '#444', fontFamily: 'Pretendard' },
  confirmBtn: { flex: 1, paddingVertical: rs(12), borderRadius: rs(8), backgroundColor: '#34B262', alignItems: 'center' },
  withdrawBtn: { backgroundColor: '#FF4B4B' },
  confirmText: { fontSize: rs(14), fontWeight: '600', color: 'white', fontFamily: 'Pretendard' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(8), gap: rs(8) },
  reasonText: { fontSize: rs(14), color: '#1B1D1F', fontFamily: 'Pretendard' },
});
