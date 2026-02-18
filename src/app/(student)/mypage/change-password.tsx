import { changePassword } from '@/src/api/my-page';
import { useAuth } from '@/src/shared/lib/auth';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwErrorMsg, setPwErrorMsg] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const ALLOWED_CHARS = /^[A-Za-z0-9@$!%*^#?&]*$/;

  const handleNewPwChange = (text: string) => {
    if (!ALLOWED_CHARS.test(text)) return;
    setNewPw(text);

    const hasLetter = /[A-Za-z]/.test(text);
    const hasNum = /[0-9]/.test(text);
    const hasSpecial = /[@$!%*^#?&]/.test(text);
    const isComplexEnough = hasLetter && hasNum && hasSpecial;

    if (text.length > 0) {
      if (text.length < 8) {
        setPwErrorMsg('비밀번호는 최소 8자 이상이어야 합니다.');
      } else if (!isComplexEnough) {
        setPwErrorMsg('영문, 숫자, 특수문자를 모두 포함해야 합니다.');
      } else {
        setPwErrorMsg('');
      }
    } else {
      setPwErrorMsg('');
    }

    const isValid = text.length >= 8 && isComplexEnough;
    if (confirmPw.length > 0) {
      setIsMatch(text === confirmPw && isValid);
    }
  };

  const handleConfirmPwChange = (text: string) => {
    setConfirmPw(text);
    const hasLetter = /[A-Za-z]/.test(newPw);
    const hasNum = /[0-9]/.test(newPw);
    const hasSpecial = /[@$!%*^#?&]/.test(newPw);
    const isNewPwValid = newPw.length >= 8 && hasLetter && hasNum && hasSpecial;
    setIsMatch(newPw === text && isNewPwValid);
  };

  const handleSubmit = async () => {
    if (currentPw.trim() === '') return;
    setIsLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setSuccessVisible(true);
    } catch {
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = async () => {
    setSuccessVisible(false);
    await handleLogout();
  };

  const handleRetry = () => {
    if (isRetrying) return;
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setErrorVisible(false);
    }, 500);
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
          <Text style={styles.pageTitle}>비밀번호 변경</Text>
        </View>

        <View style={styles.formContainer}>
          <View>
            <Text style={styles.inputLabel}>현재 비밀번호</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={currentPw}
                onChangeText={setCurrentPw}
                placeholder="현재 비밀번호"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showCurrentPw}
                maxLength={20}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPw(!showCurrentPw)}>
                <Ionicons name={showCurrentPw ? 'eye' : 'eye-off'} size={rs(20)} color="#D5D5D5" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginTop: rs(10) }}>
            <Text style={styles.inputLabel}>새 비밀번호</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={newPw}
                onChangeText={handleNewPwChange}
                placeholder="새 비밀번호 입력"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showNewPw}
                maxLength={20}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPw(!showNewPw)}>
                <Ionicons name={showNewPw ? 'eye' : 'eye-off'} size={rs(20)} color="#D5D5D5" />
              </TouchableOpacity>
            </View>
            {pwErrorMsg !== '' && (
              <Text style={styles.errorText}>{pwErrorMsg}</Text>
            )}
          </View>

          <View style={{ marginTop: rs(10) }}>
            <View style={[styles.inputWrapper, newPw.length === 0 && styles.inputDisabled]}>
              <TextInput
                style={styles.textInput}
                value={confirmPw}
                onChangeText={handleConfirmPwChange}
                placeholder="새 비밀번호 확인"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showConfirmPw}
                maxLength={20}
                editable={newPw.length > 0}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPw(!showConfirmPw)} disabled={newPw.length === 0}>
                <Ionicons name={showConfirmPw ? 'eye' : 'eye-off'} size={rs(20)} color="#D5D5D5" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>비밀번호는 영어, 숫자, 특수문자를 포함한 8자~20자 이내로 입력해주세요</Text>
            <Text style={styles.guideText}>특수문자는 <Text style={{ fontWeight: '700' }}>@$!%*^#?&</Text> 중에서 선택하여 입력해주세요</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, isMatch ? styles.submitBtnActive : styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isMatch || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitBtnText}>변경하기</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 성공 팝업 */}
      <Modal transparent animationType="fade" visible={successVisible} onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>비밀번호가 변경되었어요</Text>
              <Text style={styles.popupSubtitle}>새 비밀번호로 다시 로그인해주세요</Text>
            </View>
            <TouchableOpacity style={styles.popupSuccessBtn} onPress={handleSuccessConfirm}>
              <Text style={styles.popupBtnTextWhite}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 실패 팝업 */}
      <Modal transparent animationType="fade" visible={errorVisible} onRequestClose={() => setErrorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.popupBox}>
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>비밀번호 변경에 실패했어요</Text>
              <Text style={styles.popupSubtitle}>다시 시도해주세요</Text>
            </View>
            <View style={styles.popupBtnGroup}>
              <TouchableOpacity style={styles.popupCancelBtn} onPress={() => setErrorVisible(false)}>
                <Text style={styles.popupBtnTextWhite}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupRetryBtn} onPress={handleRetry} disabled={isRetrying}>
                {isRetrying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.popupBtnTextWhite}>다시 시도하기</Text>
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
  content: { paddingHorizontal: rs(20), paddingBottom: rs(100) },
  titleContainer: { marginVertical: rs(10), marginBottom: rs(30) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  formContainer: { gap: rs(5) },
  inputLabel: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5), marginLeft: rs(5) },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: rs(8), height: rs(40), paddingHorizontal: rs(10) },
  inputDisabled: { backgroundColor: '#F5F5F5' },
  textInput: { flex: 1, height: '100%', fontSize: rs(14), fontFamily: 'Pretendard', color: 'black', paddingVertical: 0 },
  eyeIcon: { padding: rs(5) },
  errorText: { fontSize: rs(10), color: '#FF6200', fontFamily: 'Pretendard', marginTop: rs(5), marginLeft: rs(5) },
  guideContainer: { marginTop: rs(5), gap: rs(2) },
  guideText: { fontSize: rs(10), color: '#BDBDBD', fontFamily: 'Pretendard', marginLeft: rs(5), lineHeight: rs(14) },
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20) },
  submitBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#34B262' },
  submitBtnDisabled: { backgroundColor: '#D5D5D5' },
  submitBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { width: rs(335), height: rs(165), backgroundColor: 'white', borderRadius: rs(10), paddingVertical: rs(40), alignItems: 'center', justifyContent: 'space-between', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  popupTextContainer: { alignItems: 'center', gap: rs(5) },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center' },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  popupSuccessBtn: { width: rs(300), height: rs(30), paddingVertical: rs(5), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: rs(20) },
  popupBtnGroup: { flexDirection: 'row', width: rs(335), justifyContent: 'center', gap: rs(7), position: 'absolute', bottom: rs(20) },
  popupCancelBtn: { width: rs(150), paddingVertical: rs(8), backgroundColor: '#D5D5D5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  popupRetryBtn: { width: rs(150), paddingVertical: rs(8), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  popupBtnTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});
