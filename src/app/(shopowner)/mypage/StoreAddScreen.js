import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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

import { getOwnerInfo } from '@/src/api/my-page';
import { createStore, updateStore } from '@/src/api/store';
import { verifyBizRegNo } from '@/src/api/store-claim';
import { ErrorPopup } from '@/src/shared/common/error-popup';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function StoreAddScreen({ navigation, route }) {
  const { mode, storeData } = route.params || { mode: 'add', storeData: null };
  const isEditMode = mode === 'edit';

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // 사업자 확인 로딩

  const [form, setForm] = useState({
    name: '',
    branch: '',
    phone: '',
    owner: '',
    openingDate: '',
    bizNum: '',
  });

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [isBizNumVerified, setIsBizNumVerified] = useState(false);
  const [isBizNumFailed, setIsBizNumFailed] = useState(false);
  const [bizLicenseImage, setBizLicenseImage] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // 팝업 상태 관리
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEditMode && storeData) {
      setForm({
        name: storeData.name || '',
        branch: storeData.branch || '',
        phone: storeData.phone || '',
        owner: storeData.representativeName || '',
        openingDate: storeData.openingDate || '',
        bizNum: storeData.businessNumber || '',
      });
      // 수정 모드일 땐 이미 인증된 것으로 간주
      setIsBizNumVerified(true);
      // 이미지는 id나 url이 있을 수 있음 (여기서는 첨부 여부만 체크)
      setBizLicenseImage(storeData.imageUrl || true);
    } else if (!isEditMode) {
      // [추가 모드] 계정 대표자명 미리 가져오기
      const fetchDefaultOwner = async () => {
        try {
          const response = await getOwnerInfo();
          const data = response.data?.data || response.data;
          if (data && data.name) {
            setForm(prev => ({ ...prev, owner: data.name }));
          }
        } catch (error) {
          console.error('대표자 정보 가져오기 실패:', error);
        }
      };
      fetchDefaultOwner();
    }
  }, [isEditMode, storeData]);

  // 유효성 검사
  useEffect(() => {
    const { name, phone, owner, bizNum } = form;
    const isPhoneValid = validatePhone(phone);
    const isValid =
      name.trim().length > 0 &&
      isPhoneValid &&
      owner.trim().length > 0 &&
      form.openingDate.trim().length > 0 &&
      bizNum.trim().length > 0 &&
      isBizNumVerified &&
      bizLicenseImage !== null;

    setIsFormValid(isValid);
    if (phone.length > 0 && !isPhoneValid) {
      setPhoneError('올바른 전화번호를 입력해주세요');
    } else {
      setPhoneError('');
    }
  }, [form, isBizNumVerified, bizLicenseImage]);

  const validatePhone = (num) => {
    const cleaned = num.replace(/-/g, '');
    return (cleaned.length >= 8 && cleaned.length <= 11);
  };

  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(''));
  };

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

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleChange = (key, text) => {
    let formattedText = text;
    if (key === 'phone') {
      formattedText = formatPhoneNumber(text);
    } else if (key === 'bizNum') {
      formattedText = formatBizNumber(text);
      if (isBizNumVerified) setIsBizNumVerified(false);
      if (isBizNumFailed) setIsBizNumFailed(false);
    } else if (key === 'branch' || key === 'name') {
      if (text.length > 50) {
        const label = key === 'name' ? '가게명' : '가게 지점명';
        showToast(`${label}은 50자 이하로 입력해주세요`);
        return;
      }
    } else if (key === 'owner') {
      if (text.length > 20) return;
    }
    setForm({ ...form, [key]: formattedText });
  };

  const handleDateConfirm = (date) => {
    setForm({ ...form, openingDate: formatDate(date) });
    setDatePickerVisible(false);
  };

  // --- [API 연결] 사업자 번호 실제 검증 ---
  const handleBizNumCheck = async () => {
    const pureBizNum = form.bizNum.replace(/-/g, '');

    if (pureBizNum.length !== 10) {
      Alert.alert('알림', '사업자등록번호 10자리를 올바르게 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    setIsBizNumFailed(false);

    try {
      // API 명세에 맞춰 데이터 구성 (p_nm, start_dt 포함)
      await verifyBizRegNo({
        bizs: [{
          b_no: pureBizNum,
          p_nm: form.owner,
          start_dt: form.openingDate.replace(/-/g, ''),
        }]
      });
      setIsBizNumVerified(true);
    } catch (error) {
      console.error("사업자 인증 실패:", error);
      setIsBizNumVerified(false);
      setIsBizNumFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImageAttach = () => {
    Alert.alert(
      '첨부 방식 선택',
      '사업자등록증을 가져올 방식을 선택해주세요.',
      [
        {
          text: '앨범에서 선택',
          onPress: pickFromGallery,
        },
        {
          text: '파일에서 선택',
          onPress: pickFromFiles,
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ]
    );
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('알림', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      processSelectedFile(result.assets[0], 'image');
    }
  };

  const pickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        processSelectedFile(result.assets[0], 'file');
      }
    } catch (error) {
      console.error('File pick error:', error);
      Alert.alert('오류', '파일을 선택하는 중 오류가 발생했습니다.');
    }
  };

  const processSelectedFile = (asset, source) => {
    const fileSize = source === 'file' ? asset.size : asset.fileSize;

    // 파일 크기 체크 (10MB)
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      Alert.alert('오류', '10MB 이하 파일만 업로드 가능합니다.');
      return;
    }

    // 형식 체크
    const fileName = asset.name || asset.uri.split('/').pop();
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
      Alert.alert('오류', 'JPG, PNG, PDF 형식만 가능합니다.');
      return;
    }

    setBizLicenseImage({
      uri: asset.uri,
      name: fileName,
      type: asset.mimeType || (extension === 'pdf' ? 'application/pdf' : 'image/jpeg')
    });
  };

  const handleGoBack = () => {
    setPopupType('warning');
    setPopupVisible(true);
  };

  // --- [API 연결] 가게 제출 ---
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setIsErrorPopupVisible(false); // 시도 시작 시 팝업 닫기

    // 데이터 정리
    const requestPayload = {
      name: form.name,
      branch: form.branch || null,
      storePhone: form.phone.replace(/-/g, ''),
      representativeName: form.owner,
      openingDate: form.openingDate,
      bizRegNo: form.bizNum.replace(/-/g, ''),
      roadAddress: isEditMode ? (storeData.roadAddress || '') : '', // 기존 로직 유지용 (필수값일 경우 대비)
      storeCategories: isEditMode ? (storeData.storeCategories || []) : [],
    };

    // FormData 구성 (파일 포함)
    const formData = {
      request: JSON.stringify(requestPayload),
      images: bizLicenseImage && bizLicenseImage.uri && typeof bizLicenseImage.uri === 'string' ? [bizLicenseImage] : []
    };

    try {
      if (isEditMode) {
        // updateStore(id, {request, images}) 형식에 맞춤
        await updateStore(storeData.id, formData);
        setPopupType('success_edit');
      } else {
        await createStore(formData);
        setPopupType('success_add');
      }
      setPopupVisible(true);
    } catch (error) {
      console.error("가게 저장 실패:", error);
      setIsErrorPopupVisible(true);
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
        <TouchableOpacity onPress={handleGoBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
          <InputGroup label="가게명" value={form.name} onChangeText={(t) => handleChange('name', t)} placeholder="가게명을 입력하세요" />
          <InputGroup label="지점명" value={form.branch} onChangeText={(t) => handleChange('branch', t)} placeholder="지점명을 입력하세요(선택)" />
          <View>
            <InputGroup label="가게 전화번호" value={form.phone} onChangeText={(t) => handleChange('phone', t)} placeholder="가게 전화번호를 입력해주세요" keyboardType="number-pad" />
            {phoneError ? <Text style={styles.phoneErrorText}>{phoneError}</Text> : null}
          </View>
          <InputGroup label="대표자명" value={form.owner} onChangeText={(t) => handleChange('owner', t)} placeholder="대표자명을 입력해주세요" />

          {/* 개업일자 입력 필드 */}
          <TouchableOpacity onPress={() => !isBizNumVerified && setDatePickerVisible(true)} activeOpacity={0.7}>
            <View pointerEvents="none">
              <InputGroup
                label="개업일자"
                value={form.openingDate}
                placeholder="YYYY-MM-DD"
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {/* 사업자 번호 입력 필드 */}
          <View>
            <Text style={styles.inputLabel}>사업자등록번호</Text>
            <View style={styles.bizInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }, isBizNumVerified && styles.inputDisabled]}
                value={form.bizNum}
                onChangeText={(t) => handleChange('bizNum', t)}
                placeholder="000-00-00000"
                keyboardType="number-pad"
                editable={!isBizNumVerified}
              />

              <TouchableOpacity
                style={[styles.bizCheckBtnNew, isBizNumVerified ? styles.bizCheckBtnDisabled : styles.bizCheckBtnActive]}
                onPress={handleBizNumCheck}
                disabled={isBizNumVerified || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.bizCheckText}>사업자 확인</Text>
                )}
              </TouchableOpacity>
            </View>

            {isBizNumVerified && <Text style={styles.verifiedText}>사업자 확인이 완료되었습니다</Text>}
            {isBizNumFailed && <Text style={styles.failedText}>사업자 정보를 찾을 수 없습니다</Text>}
          </View>
        </View>

        <View style={styles.attachContainer}>
          <Text style={styles.attachTitle}>사업자 등록증 첨부</Text>
          <View style={styles.attachBox}>
            <Text style={styles.attachFileName}>{bizLicenseImage ? (bizLicenseImage.name || '사업자등록증.png') : '파일을 첨부해주세요'}</Text>
            <TouchableOpacity onPress={handleImageAttach}>
              <View style={[styles.imagePlaceholder, bizLicenseImage && styles.imageAttached]}>
                <Ionicons name={bizLicenseImage ? "checkmark-circle" : "image"} size={rs(24)} color={bizLicenseImage ? "#34B262" : "rgba(130, 130, 130, 0.70)"} />
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

      {/* 에러 팝업 */}
      <ErrorPopup
        visible={isErrorPopupVisible}
        type="NETWORK"
        onRefresh={() => {
          setIsErrorPopupVisible(false);
          handleSubmit();
        }}
        onClose={() => setIsErrorPopupVisible(false)}
      />

      {/* 토스트 메시지 */}
      {toastMessage ? (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]} pointerEvents="none">
          <View style={styles.toastBox}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      ) : null}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        locale="ko"
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
  bizCheckBtnNew: { borderRadius: rs(8), paddingHorizontal: rs(12), height: rs(40), alignItems: 'center', justifyContent: 'center', minWidth: rs(80) },
  bizCheckBtnActive: { backgroundColor: '#34B262' },
  bizCheckBtnDisabled: { backgroundColor: '#D5D5D5' },
  bizCheckText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
  bizInputRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  verifiedText: { fontSize: rs(11), color: '#34B262', fontFamily: 'Pretendard', marginTop: rs(4), marginLeft: rs(5), fontWeight: '600' },
  failedText: { fontSize: rs(11), color: '#FF4D4D', fontFamily: 'Pretendard', marginTop: rs(4), marginLeft: rs(5), fontWeight: '600' },
  phoneErrorText: { fontSize: rs(11), color: '#FF4D4D', fontFamily: 'Pretendard', marginTop: rs(2), marginLeft: rs(5) },
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
  toastContainer: { position: 'absolute', top: rs(100), left: 0, right: 0, alignItems: 'center', zIndex: 9999 },
  toastBox: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: rs(20), paddingVertical: rs(10), borderRadius: rs(20) },
  toastText: { color: 'white', fontSize: rs(12), fontFamily: 'Pretendard' },
});
