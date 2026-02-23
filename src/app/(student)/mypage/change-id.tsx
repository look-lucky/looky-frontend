import { checkUsernameAvailability } from '@/src/api/auth';
import { changeUsername } from '@/src/api/my-page';
import { useAuth } from '@/src/shared/lib/auth';
import { getUsername, saveUsername } from '@/src/shared/lib/auth/token';
import { isNetworkError, useNetworkError } from '@/src/shared/contexts/network-error-context';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const isIdFormatValid = (id: string) => /^(?=.*[a-z])(?=.*[0-9])[a-z0-9]{6,16}$/.test(id);
const startsWithLowercase = (id: string) => /^[a-z]/.test(id);

export default function ChangeIdScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleLogout } = useAuth();
  const { showNetworkError } = useNetworkError();

  const [initialId, setInitialId] = useState('');
  const [userId, setUserId] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // 토스트
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setToastMessage('')
      );
    }, 2000);
  };

  useEffect(() => {
    const loadCurrentUsername = async () => {
      const currentUsername = await getUsername();
      if (currentUsername) {
        setInitialId(currentUsername);
        setUserId(currentUsername);
      }
    };
    loadCurrentUsername();
  }, []);

  const isIdChanged = userId !== initialId && userId.length > 0;

  const handleIdChange = (text: string) => {
    const filteredText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUserId(filteredText);
    setIsChecked(false);
    setCheckMessage('');
    setIsError(false);
  };

  const handleCheckDuplicate = async () => {
    if (userId.trim().length === 0) return;

    if (userId.length < 6 || userId.length > 16) {
      showToast('6-16자 영문+숫자로 입력해주세요');
      return;
    }
    if (!startsWithLowercase(userId)) {
      showToast('영문 소문자로 시작해야 합니다');
      return;
    }
    if (!isIdFormatValid(userId)) {
      showToast('6-16자 영문+숫자로 입력해주세요');
      return;
    }

    setIsChecking(true);

    try {
      const response = await checkUsernameAvailability({ username: userId });
      const isAvailable = (response.data as any)?.data;

      if (isAvailable) {
        setIsError(false);
        setCheckMessage('사용이 가능한 아이디입니다.');
        setIsChecked(true);
      } else {
        setIsError(true);
        setCheckMessage('이미 사용 중인 아이디입니다.');
        setIsChecked(false);
      }
    } catch {
      setIsError(true);
      setCheckMessage('이미 사용 중이거나 사용할 수 없는 아이디입니다.');
      setIsChecked(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!isChecked) return;

    try {
      await changeUsername({ newUsername: userId });
      await saveUsername(userId);
      setSuccessVisible(true);
    } catch (error: any) {
      if (isNetworkError(error)) {
        showNetworkError();
      } else if (error?.status === 409) {
        setIsChecked(false);
        setIsError(true);
        setCheckMessage('이미 사용 중인 아이디입니다.');
      } else if (error?.status === 400) {
        setIsChecked(false);
        setIsError(true);
        setCheckMessage('유효하지 않은 아이디 형식입니다.');
      } else {
        setErrorVisible(true);
      }
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
      handleSubmit();
    }, 1000);
  };

  const isCheckButtonActive = isIdChanged && !isChecking && userId.length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>아이디 변경</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputLabelContainer}>
            <Text style={styles.inputLabel}>아이디</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={userId.length > 0 ? styles.textInput : styles.textinfoInput}
              value={userId}
              onChangeText={handleIdChange}
              placeholder="영문 소문자, 숫자를 포함한 6~16자 이내로 입력해주세요"
              placeholderTextColor="#BDBDBD"
              autoCapitalize="none"
              maxLength={16}
            />
            <TouchableOpacity
              style={[styles.checkButton, isCheckButtonActive ? styles.checkButtonActive : styles.checkButtonDisabled]}
              onPress={handleCheckDuplicate}
              disabled={!isIdChanged || isChecking || userId.length === 0}
            >
              {isChecking ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.checkButtonText}>중복 확인</Text>
              )}
            </TouchableOpacity>
          </View>

          {checkMessage !== '' && (
            <Text style={[styles.messageText, isError ? styles.errorText : styles.successText]}>
              {checkMessage}
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, isChecked ? styles.submitBtnActive : styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isChecked}
        >
          <Text style={styles.submitBtnText}>변경하기</Text>
        </TouchableOpacity>
      </View>

      {/* 토스트 */}
      {toastMessage !== '' && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]} pointerEvents="none">
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* 성공 팝업 */}
      <Modal transparent animationType="fade" visible={successVisible} onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={styles.successPopupBox}>
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>아이디가 변경되었어요</Text>
              <Text style={styles.popupSubtitle}>새 아이디로 다시 로그인해주세요</Text>
            </View>
            <TouchableOpacity style={styles.successConfirmBtn} onPress={handleSuccessConfirm}>
              <Text style={styles.buttonTextWhite}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 실패 팝업 */}
      <Modal transparent animationType="fade" visible={errorVisible} onRequestClose={() => setErrorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorPopupBox}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setErrorVisible(false)}>
              <Ionicons name="close" size={rs(20)} color="#333" />
            </TouchableOpacity>
            <View style={styles.errorTextContainer}>
              <Text style={styles.popupTitle}>알 수 없는 오류가 발생했어요</Text>
              <Text style={styles.popupSubtitle}>문제가 계속되면 잠시 후 다시 시도해주세요</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry} disabled={isRetrying}>
              {isRetrying ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonTextWhite}>새로고침</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingHorizontal: rs(20), paddingBottom: rs(100) },
  titleContainer: { marginVertical: rs(10), marginBottom: rs(30) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  formContainer: { gap: rs(8) },
  inputLabelContainer: { paddingVertical: rs(5) },
  inputLabel: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  inputWrapper: { justifyContent: 'center' },
  textInput: { height: rs(40), backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: rs(8), paddingLeft: rs(16), paddingRight: rs(80), fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '500', color: 'black' },
  textinfoInput: { height: rs(40), backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: rs(8), paddingLeft: rs(16), paddingRight: rs(80), fontSize: rs(12), fontFamily: 'Pretendard', fontWeight: '500', color: 'black' },
  checkButton: { position: 'absolute', right: rs(10), borderRadius: rs(8), paddingHorizontal: rs(10), paddingVertical: rs(5) },
  checkButtonActive: { backgroundColor: '#34B262' },
  checkButtonDisabled: { backgroundColor: '#D5D5D5' },
  checkButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
  messageText: { fontSize: rs(10), fontFamily: 'Pretendard', fontWeight: '400', marginTop: rs(5), marginLeft: rs(5) },
  successText: { color: '#828282' },
  errorText: { color: '#FF6200', fontSize: rs(10), fontFamily: 'Pretendard', fontWeight: '400', marginTop: rs(5), marginLeft: rs(5) },
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20) },
  submitBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#34B262' },
  submitBtnDisabled: { backgroundColor: '#D5D5D5' },
  submitBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center', marginBottom: rs(5) },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  buttonTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  successPopupBox: { width: rs(335), paddingVertical: rs(40), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', elevation: 10 },
  popupTextContainer: { marginBottom: rs(10), alignItems: 'center' },
  successConfirmBtn: { width: rs(300), height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', marginTop: rs(20) },
  errorPopupBox: { width: rs(335), paddingVertical: rs(20), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', elevation: 10 },
  closeIcon: { position: 'absolute', top: rs(10), right: rs(10), padding: rs(5), zIndex: 1 },
  errorTextContainer: { marginBottom: rs(20), alignItems: 'center', marginTop: rs(10) },
  retryButton: { width: rs(150), height: rs(40), backgroundColor: 'black', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  toastContainer: { position: 'absolute', bottom: rs(120), left: 0, right: 0, alignItems: 'center' },
  toastBox: { paddingHorizontal: rs(20), paddingVertical: rs(10), borderRadius: rs(20), backgroundColor: 'rgba(0,0,0,0.7)' },
  toastText: { fontSize: rs(13), color: 'white', fontFamily: 'Pretendard' },
});
