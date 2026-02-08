import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import { createStore, updateStore } from '@/src/api/store';
import { verifyBizRegNo } from '@/src/api/store-claim';

export default function StoreAddScreen({ navigation, route }) {
  const { mode, storeData } = route.params || { mode: 'add', storeData: null };
  const isEditMode = mode === 'edit';

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // 사업자 확인 로딩

  // 입력 폼 상태
  const [form, setForm] = useState({
    name: '',
    phone: '',
    owner: '',
    mobile: '',
    bizNum: '',
  });

  const [isBizNumVerified, setIsBizNumVerified] = useState(false);
  const [hasBizLicenseImage, setHasBizLicenseImage] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // 팝업 상태 관리
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState(null); 

  // [수정 모드] 초기 데이터 세팅
  useEffect(() => {
    if (isEditMode && storeData) {
      setForm({
        name: storeData.name || '',
        phone: storeData.phone || '', 
        owner: storeData.ownerName || '',        
        mobile: storeData.mobile || '', 
        bizNum: storeData.businessNumber || '',  
      });
      // 수정 모드일 땐 이미 인증된 것으로 간주
      setIsBizNumVerified(true);
      setHasBizLicenseImage(true); 
    }
  }, [isEditMode, storeData]);

  // 유효성 검사
  useEffect(() => {
    const { name, phone, owner, mobile, bizNum } = form;
    const isValid = 
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      owner.trim().length > 0 &&
      mobile.trim().length > 0 &&
      bizNum.trim().length > 0 &&
      isBizNumVerified &&
      hasBizLicenseImage;

    setIsFormValid(isValid);
  }, [form, isBizNumVerified, hasBizLicenseImage]);

  // --- 포맷팅 함수 ---
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('02')) {
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      if (cleaned.length <= 9) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`; 
    } else {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
  };

  const formatBizNumber = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`;
  };

  const handleChange = (key, text) => {
    let formattedText = text;
    if (['phone', 'mobile'].includes(key)) {
      formattedText = formatPhoneNumber(text);
    } else if (key === 'bizNum') {
      formattedText = formatBizNumber(text);
      if (isBizNumVerified) setIsBizNumVerified(false); // 수정하면 인증 초기화
    }
    setForm({ ...form, [key]: formattedText });
  };

  // --- [API 연결] 사업자 번호 실제 검증 ---
  const handleBizNumCheck = async () => {
    const pureBizNum = form.bizNum.replace(/-/g, '');
    
    if (pureBizNum.length !== 10) {
        Alert.alert('알림', '사업자등록번호 10자리를 올바르게 입력해주세요.');
        return;
    }

    setIsVerifying(true);

    try {
        // [API 호출] 실제 서버에 사업자 번호 확인 요청
        // 요청 바디 형식: { businessNumber: "..." }
        await verifyBizRegNo({ businessNumber: pureBizNum });
        
        // 에러가 안 나면 성공
        setIsBizNumVerified(true);
        Alert.alert('성공', '사업자 정보가 확인되었습니다.');

    } catch (error) {
        console.error("사업자 인증 실패:", error);
        // 서버가 400, 404 등을 보내면 여기서 잡힘
        setIsBizNumVerified(false);
        Alert.alert('실패', '유효하지 않은 사업자 번호이거나\n등록할 수 없는 번호입니다.');
    } finally {
        setIsVerifying(false);
    }
  };

  const handleImageAttach = () => {
    setHasBizLicenseImage(true);
    Alert.alert('알림', '이미지가 첨부되었습니다.');
  };

  const handleGoBack = () => {
    setPopupType('warning');
    setPopupVisible(true);
  };

  // --- [API 연결] 가게 제출 ---
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    // 데이터 정리 (하이픈 제거)
    const payload = {
        name: form.name,
        phone: form.phone, 
        ownerName: form.owner,
        mobile: form.mobile,
        businessNumber: form.bizNum.replace(/-/g, ''), 
    };

    try {
        if (isEditMode) {
            await updateStore(storeData.id, payload);
            setPopupType('success_edit');
        } else {
            await createStore(payload);
            setPopupType('success_add');
        }
        setPopupVisible(true);
    } catch (error) {
        console.error("가게 저장 실패:", error);
        const msg = error?.data?.message || "가게 저장 중 오류가 발생했습니다.";
        Alert.alert("오류", msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePopupAction = (action) => {
    setPopupVisible(false);
    
    if (action === 'confirm_success') {
      navigation.goBack(); 
    } else if (action === 'cancel_warning') {
      navigation.goBack(); 
    } else if (action === 'retry_warning') {
      // 머무르기
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>{isEditMode ? '가게 정보 수정' : '가게 추가하기'}</Text>
          <Text style={styles.pageSubtitle}>
            {isEditMode ? '등록된 가게 정보를 수정해주세요' : '새로 등록하려는 가게의 정보를 기입해주세요'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <InputGroup label="가게 이름" value={form.name} onChangeText={(t) => handleChange('name', t)} placeholder="가게 이름을 입력하세요" />
          <InputGroup label="가게 전화번호" value={form.phone} onChangeText={(t) => handleChange('phone', t)} placeholder="000-0000-0000" keyboardType="number-pad" />
          <InputGroup label="대표자명" value={form.owner} onChangeText={(t) => handleChange('owner', t)} placeholder="대표자 이름을 입력하세요" />
          <InputGroup label="휴대폰번호" value={form.mobile} onChangeText={(t) => handleChange('mobile', t)} placeholder="010-0000-0000" keyboardType="number-pad" />
          
          {/* 사업자 번호 입력 필드 */}
          <View>
            <Text style={styles.inputLabel}>사업자등록번호</Text>
            <TextInput 
                style={[styles.textInput, isBizNumVerified && styles.inputDisabled]} 
                value={form.bizNum} 
                onChangeText={(t) => handleChange('bizNum', t)} 
                placeholder="000-00-00000"
                keyboardType="number-pad"
                editable={!isBizNumVerified} 
            />
            
            {/* 사업자 확인 버튼 (로딩 중일 때 인디케이터 표시) */}
            <TouchableOpacity 
                style={[styles.bizCheckBtn, isBizNumVerified ? styles.bizCheckBtnDisabled : styles.bizCheckBtnActive]}
                onPress={handleBizNumCheck}
                disabled={isBizNumVerified || isVerifying}
            >
                {isVerifying ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={styles.bizCheckText}>사업자 확인</Text>
                )}
            </TouchableOpacity>
            
            {isBizNumVerified && <Text style={styles.verifiedText}>사업자 확인이 완료되었습니다</Text>}
          </View>
        </View>

        <View style={styles.attachContainer}>
            <Text style={styles.attachTitle}>사업자 등록증 첨부</Text>
            <View style={styles.attachBox}>
                <Text style={styles.attachFileName}>{hasBizLicenseImage ? '사업자등록증.png' : '파일을 첨부해주세요'}</Text>
                <TouchableOpacity onPress={handleImageAttach}>
                    <View style={[styles.imagePlaceholder, hasBizLicenseImage && styles.imageAttached]}>
                        <Ionicons name={hasBizLicenseImage ? "checkmark-circle" : "image"} size={rs(24)} color={hasBizLicenseImage ? "#34B262" : "rgba(130, 130, 130, 0.70)"} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
            style={[styles.submitBtn, isFormValid ? styles.submitBtnActive : styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading} 
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.submitBtnText}>{isEditMode ? '수정 완료' : '가게 추가하기'}</Text>
            )}
        </TouchableOpacity>
      </View>

      {/* 팝업 모달 */}
      <CustomPopup 
        visible={popupVisible} 
        type={popupType} 
        onClose={() => setPopupVisible(false)}
        onAction={handlePopupAction}
      />

    </SafeAreaView>
  );
}

// [서브 컴포넌트] 커스텀 팝업
const CustomPopup = ({ visible, type, onClose, onAction }) => {
  if (!visible) return null;

  let title = "";
  let subtitle = "";
  let showTwoButtons = false;

  if (type === 'success_add') {
    title = "가게가 추가되었어요!";
    subtitle = "매장 정보를 업데이트 해주세요";
  } else if (type === 'success_edit') {
    title = "가게 정보가 수정되었어요!";
    subtitle = "매장 정보까지 업데이트 해주세요";
  } else if (type === 'warning') {
    title = "가게 정보가 등록되지 않았어요";
    subtitle = "다시 시도해주세요";
    showTwoButtons = true;
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.popupBox}>
          <View style={styles.popupTextContainer}>
            <Text style={styles.popupTitle}>{title}</Text>
            <Text style={styles.popupSubtitle}>{subtitle}</Text>
          </View>

          {showTwoButtons ? (
            <View style={styles.twoButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => onAction('cancel_warning')}>
                <Text style={styles.buttonTextWhite}>나가기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retryButton} onPress={() => onAction('retry_warning')}>
                <Text style={styles.buttonTextWhite}>계속 머무르기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.confirmButton} onPress={() => onAction('confirm_success')}>
              <Text style={styles.buttonTextWhite}>확인</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const InputGroup = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput style={styles.textInput} value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} />
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingHorizontal: rs(20), paddingBottom: rs(100) },
  titleContainer: { marginVertical: rs(10), gap: rs(5) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard' },
  formContainer: { marginTop: rs(20), gap: rs(15) },
  inputGroup: {},
  inputLabel: { fontSize: rs(12), color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5), marginLeft: rs(5) },
  textInput: { height: rs(40), backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: rs(8), paddingHorizontal: rs(16), fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '500', color: 'black' },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#828282' },
  bizCheckBtn: { position: 'absolute', right: 0, top: rs(25), borderRadius: rs(8), paddingHorizontal: rs(10), paddingVertical: rs(5), marginRight: rs(5), marginTop: rs(3), minWidth: rs(70), alignItems:'center', justifyContent:'center' },
  bizCheckBtnActive: { backgroundColor: '#34B262' },
  bizCheckBtnDisabled: { backgroundColor: '#D5D5D5' },
  bizCheckText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
  verifiedText: { fontSize: rs(11), color: '#828282', fontFamily: 'Pretendard', marginTop: rs(4), marginLeft: rs(5) },
  attachContainer: { marginTop: rs(30), gap: rs(10) },
  attachTitle: { fontSize: rs(16), fontWeight: '700', color: '#272828', fontFamily: 'Pretendard' },
  attachBox: { gap: rs(5) },
  attachFileName: { fontSize: rs(11), color: '#828282', fontFamily: 'Pretendard' },
  imagePlaceholder: { width: rs(100), height: rs(100), backgroundColor: 'rgba(217, 217, 217, 0.50)', borderRadius: rs(8), borderWidth: 1, borderColor: 'rgba(130, 130, 130, 0.30)', justifyContent: 'center', alignItems: 'center' },
  imageAttached: { borderColor: '#34B262', backgroundColor: '#E8F5E9' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: rs(20), backgroundColor: '#FAFAFA' },
  submitBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#34B262' },
  submitBtnDisabled: { backgroundColor: '#D5D5D5' },
  submitBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { width: rs(335), paddingVertical: rs(30), paddingHorizontal: rs(20), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  popupTextContainer: { marginTop: rs(10), marginBottom: rs(25), alignItems: 'center', gap: rs(5) },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center' },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  confirmButton: { width: '100%', height: rs(30), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  twoButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: rs(10) },
  cancelButton: { flex: 1, height: rs(30), backgroundColor: '#D5D5D5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  retryButton: { flex: 1, height: rs(30), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  buttonTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});