import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
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

export default function ChangeIdScreen({ navigation }) {
  const INITIAL_ID = 'oneieo'; // 기존 아이디

  // 상태 관리
  const [userId, setUserId] = useState(INITIAL_ID); 
  const [isChecked, setIsChecked] = useState(false); 
  const [checkMessage, setCheckMessage] = useState(''); 
  const [isError, setIsError] = useState(false); 

  // 팝업 상태
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // 아이디 변경 여부 확인 (기존과 다르고 비어있지 않음)
  const isIdChanged = userId !== INITIAL_ID && userId.length > 0;

  // [기능 1] 아이디 입력 핸들러 (영문/숫자만 허용)
  const handleIdChange = (text) => {
    const filteredText = text.replace(/[^A-Za-z0-9]/g, '');
    setUserId(filteredText);
    
    setIsChecked(false);
    setCheckMessage('');
    setIsError(false);
  };

  // [기능 2] 중복 확인 핸들러 (길이 제한 체크 포함)
  const handleCheckDuplicate = () => {
    if (userId.trim().length === 0) {
        Alert.alert('알림', '아이디를 입력해주세요.');
        return;
    }

    // 최소 길이 체크
    if (userId.length < 6) {
        setIsError(true);
        setCheckMessage('아이디는 최소 6자 이상이어야 합니다.');
        setIsChecked(false);
        return;
    }

    // 중복 체크 (Mock Logic)
    if (userId === 'oneieo') {
      setIsError(true);
      setCheckMessage('이미 사용중인 아이디입니다.');
      setIsChecked(false); 
    } else {
      setIsError(false);
      setCheckMessage('사용이 가능한 아이디입니다.');
      setIsChecked(true); 
    }
  };

  // 변경하기 버튼 클릭
  const handleSubmit = () => {
    if (!isChecked) return;

    // (테스트용) 50% 확률로 성공/실패 시뮬레이션
    const isSuccess = Math.random() > 0.5;

    if (isSuccess) {
        setSuccessVisible(true);
    } else {
        setErrorVisible(true);
    }
  };

  // 성공 팝업 -> 확인
  const handleSuccessConfirm = () => {
      setSuccessVisible(false);
      navigation.goBack();
  };

  // 실패 팝업 -> 새로고침
  const handleRetry = () => {
      if (isRetrying) return;
      setIsRetrying(true);

      // 2초 후 재시도 성공으로 가정
      setTimeout(() => {
          setIsRetrying(false);
          setErrorVisible(false); 
      }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
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
                    placeholder="영어, 숫자를 포함한 6~16자 이내로 입력해주세요"
                    placeholderTextColor="#BDBDBD"
                    autoCapitalize="none"
                    maxLength={16} // [기능 2] 최대 16자 제한
                />
                
                {/* 중복 확인 버튼 */}
                <TouchableOpacity 
                    style={[styles.checkButton, isIdChanged ? styles.checkButtonActive : styles.checkButtonDisabled]} 
                    onPress={handleCheckDuplicate}
                    disabled={!isIdChanged} 
                >
                    <Text style={styles.checkButtonText}>중복 확인</Text>
                </TouchableOpacity>
            </View>

            {checkMessage !== '' && (
                <Text style={[styles.messageText, isError ? styles.errorText : styles.successText]}>
                    {checkMessage}
                </Text>
            )}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
            style={[styles.submitBtn, isChecked ? styles.submitBtnActive : styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={!isChecked}
        >
            <Text style={styles.submitBtnText}>변경하기</Text>
        </TouchableOpacity>
      </View>

      {/* --- 성공 팝업 --- */}
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

      {/* --- 실패 팝업 --- */}
      <Modal transparent animationType="fade" visible={errorVisible} onRequestClose={() => setErrorVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={styles.errorPopupBox}>
                <TouchableOpacity style={styles.closeIcon} onPress={() => setErrorVisible(false)}>
                    <Ionicons name="close" size={rs(20)} color="#333" />
                </TouchableOpacity>

                {/* 이미지 영역 */}
                <View style={styles.errorImagePlaceholder}>
                    <Image source={require('@/assets/images/shopowner/error2.png')} style={{width: rs(94), height: rs(100)}} resizeMode="contain" />
                </View>

                <View style={styles.errorTextContainer}>
                    <Text style={styles.popupTitle}>알 수 없는 오류가 발생했어요</Text>
                    <Text style={styles.popupSubtitle}>문제가 계속되면 잠시 후 다시 시도해주세요</Text>
                </View>

                {/* 새로고침 버튼 */}
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

    </SafeAreaView>
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
  
  messageText: { fontSize: rs(10), fontFamily: 'Pretendard', fontWeight: '400', marginTop: rs(2), marginLeft: rs(5) },
  successText: { color: '#828282' },
  errorText: { color: '#FF6200' },
  
  // 하단 버튼 위치
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20), backgroundColor: 'transparent' },
  submitBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#34B262' },
  submitBtnDisabled: { backgroundColor: '#D5D5D5' },
  submitBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },

  // --- 팝업 스타일 ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center', marginBottom: rs(5) },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  buttonTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },

  successPopupBox: { width: rs(335), paddingVertical: rs(40), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', elevation: 10 },
  popupTextContainer: { marginBottom: rs(10), alignItems: 'center' },
  successConfirmBtn: { width: rs(300), height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', marginTop: rs(20) },

  errorPopupBox: { width: rs(335), paddingVertical: rs(20), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', elevation: 10 },
  closeIcon: { position: 'absolute', top: rs(10), right: rs(10), padding: rs(5), zIndex: 1 },
  errorImagePlaceholder: { marginBottom: rs(15), marginTop: rs(10), alignItems: 'center', justifyContent: 'center' },
  errorTextContainer: { marginBottom: rs(20), alignItems: 'center' },
  retryButton: { width: rs(150), height: rs(40), backgroundColor: 'black', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
});