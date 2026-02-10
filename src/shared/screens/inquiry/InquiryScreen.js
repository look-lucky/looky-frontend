import { useCreateInquiry, useGetInquiries } from '@/src/api/customer-support';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// enum -> 한글 매핑
const INQUIRY_TYPE_MAP = {
    COUPON_BENEFIT: "쿠폰·혜택 사용",
    MAP_LOCATION: "지도·위치 문의",
    STORE_INFO_ERROR: "매장 정보 오류",
    EVENT_PARTICIPATION: "이벤트 참여",
    ALERT_ACCOUNT: "알림·계정",
    PROPOSAL_OTHER: "행운 제안·기타"
};

const INQUIRY_TYPES = Object.entries(INQUIRY_TYPE_MAP).map(([key, label]) => ({
    key,
    label,
}));

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
};

export default function InquiryScreen({ navigation, route }) {
  const initialTab = route.params?.initialTab || 'form';
  const [activeTab, setActiveTab] = useState(initialTab);

  // 탭 변경 감지
  useEffect(() => {
      if (route.params?.initialTab) {
          setActiveTab(route.params.initialTab);
      }
  }, [route.params]);

  // ================= [Form 관련 상태 & 로직] =================
  const [inquiryTypeKey, setInquiryTypeKey] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  const isTypeSelected = inquiryTypeKey !== '';
  const isTitleValid = title.trim().length >= 1 && title.trim().length <= 14;
  const isContentValid = content.trim().length >= 1 && content.trim().length <= 500;
  const canSubmit = isTypeSelected && isTitleValid && isContentValid;

  const { mutate: submitInquiry, isPending: isSubmitting } = useCreateInquiry();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('알림', '사진 접근 권한이 필요합니다.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
          Alert.alert('알림', '첨부파일은 10MB 이내로 업로드해주세요.');
          return;
      }
      setAttachedFile(asset);
    }
  };

  const removeFile = () => setAttachedFile(null);

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;

    const images = [];
    if (attachedFile) {
      images.push({
        uri: attachedFile.uri,
        type: attachedFile.mimeType || 'image/jpeg',
        name: attachedFile.fileName || 'image.jpg',
      });
    }

    submitInquiry(
      {
        data: {
          request: {
            type: inquiryTypeKey,
            title: title.trim(),
            content: content.trim(),
          },
          ...(images.length > 0 ? { images } : {}),
        },
      },
      {
        onSuccess: () => {
          navigation.navigate('InquiryComplete');
        },
        onError: () => {
          Alert.alert('오류', '문의 등록에 실패했습니다. 다시 시도해주세요.');
        },
      }
    );
  };

  // ================= [History 관련 상태 & 로직] =================
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  const { data: inquiriesData, isLoading: isHistoryLoading } = useGetInquiries(
    { page: 0, size: 20 },
    { query: { enabled: activeTab === 'history' } }
  );

  const historyList = inquiriesData?.data?.data?.content ?? [];

  // 1. 문의하기 폼
  const renderFormView = () => (
    <View style={styles.formContainer}>
        {/* 문의 유형 */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>문의 유형</Text>
            <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => setTypeModalVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={[styles.inputText, !isTypeSelected && styles.placeholderText]}>
                    {isTypeSelected ? INQUIRY_TYPE_MAP[inquiryTypeKey] : "유형을 선택해주세요"}
                </Text>
                <Ionicons name="chevron-down" size={rs(16)} color="#828282" />
            </TouchableOpacity>
        </View>

        {/* 제목 */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>제목</Text>
            <View style={styles.textInputBox}>
                <TextInput
                    style={styles.inputText}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="제목을 입력해주세요"
                    placeholderTextColor="#BDBDBD"
                    maxLength={14}
                />
            </View>
        </View>

        {/* 상세 내용 */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>상세 내용</Text>
            <View style={styles.textAreaBox}>
                <TextInput
                    style={[styles.inputText, { height: '100%' }]}
                    value={content}
                    onChangeText={setContent}
                    placeholder={`우리 동네 행운을 이용하시며 겪으신 불편함을 자세히 들려주세요. 상담원이 꼼꼼히 확인 후, 최대한 빠르게 기분 좋은 소식을 들고 돌아오겠습니다!`}
                    placeholderTextColor="#BDBDBD"
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                />
            </View>
            <Text style={styles.charCount}>{content.length}/500</Text>
        </View>

        {/* 첨부파일 */}
        <View style={styles.inputGroup}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={styles.label}>첨부파일 (선택)</Text>
                <Text style={styles.subLabel}>최대 10MB</Text>
            </View>

            {attachedFile ? (
                <View style={styles.fileBox}>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {attachedFile.fileName || "image.jpg"}
                    </Text>
                    <TouchableOpacity onPress={removeFile}>
                        <Ionicons name="close-circle" size={rs(20)} color="#828282" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                    <Ionicons name="camera-outline" size={rs(20)} color="#828282" />
                    <Text style={styles.uploadBtnText}>사진 추가하기</Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
  );

  // 2. 문의 내역 리스트 렌더링
  const renderHistoryView = () => {
    if (isHistoryLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#828282" />
        </View>
      );
    }

    if (historyList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>문의 내역이 없습니다.</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
          {historyList.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                  <View key={item.id}>
                      <TouchableOpacity
                          style={styles.historyItem}
                          activeOpacity={0.8}
                          onPress={() => toggleExpand(item.id)}
                      >
                          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                              {item.title}
                          </Text>
                          <View style={styles.rightGroup}>
                              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                              <View style={[styles.badge, styles.badgeGray]}>
                                  <Text style={styles.badgeText}>
                                      {INQUIRY_TYPE_MAP[item.type] ?? item.type}
                                  </Text>
                              </View>
                              <Ionicons
                                  name={isExpanded ? "chevron-up" : "chevron-down"}
                                  size={rs(16)}
                                  color="#828282"
                              />
                          </View>
                      </TouchableOpacity>

                      {isExpanded && (
                          <View style={styles.accordionBody}>
                              <View style={styles.qBox}>
                                  <Text style={styles.qText}>{item.content}</Text>
                              </View>
                          </View>
                      )}
                      <View style={styles.divider} />
                  </View>
              );
          })}
      </View>
    );
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

      {/* 상단 고정 영역 */}
      <View style={styles.topSection}>
          <Text style={styles.pageTitle}>고객센터</Text>
          <Text style={styles.pageSubtitle}>
              찾으시는 행운에 문제가 생겼나요?{'\n'}
              루키가 해결해 드릴게요!
          </Text>

          {/* 탭 버튼 */}
          <View style={styles.tabContainer}>
              <TouchableOpacity
                  style={activeTab === 'form' ? styles.tabActive : styles.tabInactive}
                  onPress={() => setActiveTab('form')}
                  activeOpacity={0.8}
              >
                  <Text style={activeTab === 'form' ? styles.tabTextActive : styles.tabTextInactive}>문의하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={activeTab === 'history' ? styles.tabActive : styles.tabInactive}
                  onPress={() => setActiveTab('history')}
                  activeOpacity={0.8}
              >
                  <Text style={activeTab === 'history' ? styles.tabTextActive : styles.tabTextInactive}>문의내역</Text>
              </TouchableOpacity>
          </View>
      </View>

      {/* 컨텐츠 영역 (키보드 회피 적용) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
            contentContainerStyle={styles.content}
            refreshControl={
                activeTab === 'history' ? (
                    <RefreshControl refreshing={isLoadingHistory} onRefresh={fetchHistory} />
                ) : null
            }
        >
            {activeTab === 'form' ? renderFormView() : renderHistoryView()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 버튼 (문의하기 탭일 때만) */}
      {activeTab === 'form' && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
                style={[styles.submitBtn, canSubmit ? styles.submitBtnActive : styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <Text style={styles.submitBtnText}>문의하기</Text>
                )}
            </TouchableOpacity>
          </View>
      )}

      {/* 문의 유형 선택 모달 */}
      <Modal transparent visible={typeModalVisible} animationType="slide" onRequestClose={() => setTypeModalVisible(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTypeModalVisible(false)}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>문의 유형 선택</Text>
                  {INQUIRY_TYPES.map((type) => (
                      <TouchableOpacity
                          key={type.key}
                          style={styles.modalItem}
                          onPress={() => {
                              setInquiryTypeKey(type.key);
                              setTypeModalVisible(false);
                          }}
                      >
                          <Text style={[styles.modalItemText, inquiryTypeKey === type.key && styles.modalItemTextActive]}>
                              {type.label}
                          </Text>
                          {inquiryTypeKey === type.key && <Ionicons name="checkmark" size={rs(18)} color="#34B262" />}
                      </TouchableOpacity>
                  ))}
              </View>
          </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingBottom: rs(100) },

  // 상단 타이틀 & 탭
  topSection: { paddingHorizontal: rs(20), marginTop: rs(10), backgroundColor: '#FAFAFA' },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5) },
  pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard', lineHeight: rs(20) },

  tabContainer: { flexDirection: 'row', gap: rs(8), marginTop: rs(20), marginBottom: rs(10) },
  tabActive: {
      paddingHorizontal: rs(12), paddingVertical: rs(6),
      backgroundColor: 'black', borderRadius: rs(20),
      justifyContent: 'center', alignItems: 'center'
  },
  tabInactive: {
      paddingHorizontal: rs(12), paddingVertical: rs(6),
      backgroundColor: 'white', borderRadius: rs(20),
      borderWidth: 1, borderColor: '#E0E0E0',
      justifyContent: 'center', alignItems: 'center'
  },
  tabTextActive: { color: 'white', fontSize: rs(12), fontWeight: '700', fontFamily: 'Pretendard' },
  tabTextInactive: { color: 'black', fontSize: rs(12), fontWeight: '700', fontFamily: 'Pretendard' },

  // === [Form Styles] ===
  formContainer: { paddingHorizontal: rs(20), gap: rs(20) },
  inputGroup: { gap: rs(8) },
  label: { fontSize: rs(16), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  subLabel: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard' },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: rs(40), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: rs(16) },
  textInputBox: { height: rs(40), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: rs(16), justifyContent: 'center' },
  textAreaBox: { height: rs(168), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', padding: rs(16) },
  inputText: { fontSize: rs(14), fontFamily: 'Pretendard', color: 'black', padding: 0 },
  placeholderText: { color: '#555555' },
  charCount: { textAlign: 'right', fontSize: rs(12), color: '#828282', marginTop: rs(4) },
  uploadBtn: { height: rs(40), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: rs(8) },
  uploadBtnText: { fontSize: rs(14), color: '#828282', fontFamily: 'Pretendard' },
  fileBox: { height: rs(40), backgroundColor: '#F5F5F5', borderRadius: rs(8), paddingHorizontal: rs(16), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileName: { fontSize: rs(14), color: 'black', maxWidth: '80%' },

  // === [History Styles] ===
  listContainer: { paddingHorizontal: rs(20) },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(12), paddingHorizontal: rs(5) },
  itemTitle: { flex: 1, fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', marginRight: rs(10) },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  dateText: { fontSize: rs(10), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard' },
  badge: { paddingHorizontal: rs(7), paddingVertical: rs(4), borderRadius: rs(20), justifyContent: 'center', alignItems: 'center' },
  badgeGreen: { backgroundColor: '#34B262' },
  badgeGray: { backgroundColor: '#D5D5D5' },
  badgeText: { color: 'white', fontSize: rs(10), fontWeight: '700', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  accordionBody: { backgroundColor: '#F9F9F9', padding: rs(15), marginBottom: rs(10), borderRadius: rs(8) },
  qBox: { marginBottom: rs(10) },
  qText: { fontSize: rs(13), color: '#333', fontFamily: 'Pretendard', lineHeight: rs(18) },
  emptyContainer: { paddingVertical: rs(40), alignItems: 'center' },
  emptyText: { color: '#828282', fontSize: rs(14) },

  // 하단 버튼
  bottomContainer: { position: 'absolute', bottom: rs(30), left: 0, right: 0, paddingHorizontal: rs(20), backgroundColor: 'transparent' },
  submitBtn: { height: rs(48), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnActive: { backgroundColor: '#34B262' },
  submitBtnDisabled: { backgroundColor: '#D5D5D5' },
  submitBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },

  // 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20), padding: rs(20), paddingBottom: rs(40) },
  modalTitle: { fontSize: rs(18), fontWeight: '700', marginBottom: rs(20), textAlign: 'center' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(15), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalItemText: { fontSize: rs(16), color: '#333' },
  modalItemTextActive: { color: '#34B262', fontWeight: '700' },
});
