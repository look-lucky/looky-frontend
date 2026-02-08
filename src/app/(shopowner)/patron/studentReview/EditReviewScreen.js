import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
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

const { width } = Dimensions.get('window');

export default function EditReviewScreen({ navigation, route }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('휘낭시에 맛집 !!');
  const [photos, setPhotos] = useState([1, 2, 3]); 

  // [추가] 수정 완료 팝업 상태
  const [editSuccessVisible, setEditSuccessVisible] = useState(false);

  const getRatingComment = (score) => {
      switch(score) {
          case 5: return "별 다섯 개가 부족할 정도, 훌륭해요!";
          case 4: return "만족스러워요!";
          case 3: return "보통이에요.";
          case 2: return "아쉬워요.";
          case 1: return "별로예요.";
          default: return "별점을 눌러 평가해주세요.";
      }
  };

  // [추가] 리뷰 수정 버튼 핸들러
  const handleUpdateReview = () => {
      // 서버 통신 로직이 들어갈 자리
      setEditSuccessVisible(true); // 성공 팝업 띄우기
  };

  // [추가] 팝업 확인 버튼 핸들러
  const handleConfirmSuccess = () => {
      setEditSuccessVisible(false);
      navigation.goBack(); // 이전 화면(리뷰 목록)으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* 1. 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            hitSlop={{top:10, bottom:10, left:10, right:10}}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* 2. 가게 이름 (타이틀) */}
            <Text style={styles.storeTitle}>평화와 평화 구내매점</Text>

            {/* 3. 별점 입력 섹션 */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>별점 <Text style={styles.requiredStar}>*</Text></Text>
                
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((score) => (
                        <TouchableOpacity 
                            key={score} 
                            onPress={() => setRating(score)}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name="star" 
                                size={rs(36)} 
                                color={score <= rating ? "#FFCC00" : "#E0E0E0"} 
                                style={{ marginHorizontal: rs(4) }}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                
                <Text style={styles.ratingComment}>{getRatingComment(rating)}</Text>
            </View>

            <View style={styles.divider} />

            {/* 4. 사진 업로드 섹션 */}
            <View style={styles.sectionContainer}>
                <View style={{marginBottom: rs(16)}}>
                    <Text style={styles.sectionLabel}>사진 업로드</Text>
                    <Text style={styles.helperText}>매장과 관련된 사진을 업로드 해주세요.</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
                    {/* 사진 추가 버튼 */}
                    <TouchableOpacity style={styles.addPhotoBtn}>
                        <Ionicons name="camera-outline" size={rs(24)} color="#ACACAC" />
                    </TouchableOpacity>

                    {/* 업로드된 사진 리스트 */}
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.photoItem}>
                            <View style={styles.photoPlaceholder} /> 
                            <TouchableOpacity style={styles.deletePhotoBtn}>
                                <Ionicons name="close-circle" size={rs(20)} color="rgba(0,0,0,0.3)" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.divider} />

            {/* 5. 리뷰 작성 섹션 */}
            <View style={styles.sectionContainer}>
                <View style={styles.reviewLabelRow}>
                    <Text style={styles.sectionLabel}>리뷰 작성 <Text style={styles.requiredStar}>*</Text></Text>
                    <Text style={styles.textCount}>{reviewText.length}/300자</Text>
                </View>

                <View style={styles.textInputBox}>
                    <TextInput 
                        style={styles.textInput}
                        multiline
                        placeholder="솔직한 리뷰를 남겨주세요."
                        placeholderTextColor="#828282"
                        value={reviewText}
                        onChangeText={setReviewText}
                        maxLength={300}
                        textAlignVertical="top" 
                    />
                </View>
            </View>

            <View style={styles.divider} />

            {/* 6. 리뷰 정책 안내 */}
            <View style={styles.policyContainer}>
                <Text style={styles.policyTitle}>니어딜 리뷰 정책</Text>
                <Text style={styles.policyText}>
                    * 매장 이용과 무관한 내용이나 허위 및 과장, 저작물 무단 도용, 초상권
                    및 사생활 침해 비방 등이 포함된 내용은 삭제될 수 있습니다.
                </Text>
            </View>

            <View style={{ height: rs(80) }} />

        </ScrollView>

        {/* 7. 하단 고정 버튼 */}
        <View style={styles.bottomBtnContainer}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateReview}>
                <Text style={styles.submitBtnText}>리뷰 수정하기</Text>
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* =======================================================
          [팝업] 리뷰 수정 완료
      ======================================================= */}
      <Modal transparent visible={editSuccessVisible} animationType="fade" onRequestClose={handleConfirmSuccess}>
            <View style={styles.modalOverlay}>
                <View style={styles.popupContainer}>
                    <View style={styles.popupTextContainer}>
                        <Text style={styles.popupTitle}>리뷰가 수정되었어요!</Text>
                        <Text style={styles.popupSubtitle}>정성스러운 후기 감사합니다</Text>
                    </View>
                    <View style={styles.popupBtnContainerOne}>
                        <TouchableOpacity style={styles.popupBtnFullGreen} onPress={handleConfirmSuccess}>
                            <Text style={styles.popupBtnTextWhite}>확인</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: rs(20), paddingTop: rs(10), paddingBottom: rs(10) },
  scrollContent: { paddingHorizontal: rs(20), paddingBottom: rs(20) },
  storeTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', marginTop: rs(10), marginBottom: rs(30) },
  sectionContainer: { marginVertical: rs(20) },
  sectionLabel: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5) },
  requiredStar: { color: '#34A853' },
  helperText: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  starContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: rs(15) },
  ratingComment: { textAlign: 'center', fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard' },
  photoScroll: { flexDirection: 'row', gap: rs(10) },
  addPhotoBtn: { width: rs(95), height: rs(95), borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  photoItem: { width: rs(95), height: rs(95), position: 'relative' },
  photoPlaceholder: { width: '100%', height: '100%', borderRadius: rs(8), backgroundColor: '#D9D9D9' },
  deletePhotoBtn: { position: 'absolute', top: rs(4), right: rs(4) },
  reviewLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: rs(10) },
  textCount: { fontSize: rs(12), color: '#828282', fontFamily: 'Pretendard' },
  textInputBox: { height: rs(120), borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', padding: rs(16) },
  textInput: { flex: 1, fontSize: rs(14), color: 'black', fontFamily: 'Pretendard', lineHeight: rs(20) },
  policyContainer: { marginTop: rs(10), marginBottom: rs(20) },
  policyTitle: { fontSize: rs(14), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5) },
  policyText: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(18) },
  bottomBtnContainer: { position: 'absolute', bottom: rs(20), left: 0, right: 0, paddingHorizontal: rs(20) },
  submitBtn: { width: '100%', height: rs(48), backgroundColor: '#40CE2B', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { fontSize: rs(14), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },

  // ============================
  // [팝업 공통 스타일] - 다른 페이지와 규격 동일하게 적용
  // ============================
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { 
      width: rs(335), 
      backgroundColor: 'white', 
      borderRadius: rs(10), 
      paddingTop: rs(40), 
      paddingBottom: rs(25), 
      alignItems: 'center', 
      shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 
  },
  popupTextContainer: { alignItems: 'center', marginBottom: rs(20), paddingHorizontal: rs(10) },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5), textAlign: 'center' },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  
  popupBtnContainerOne: { width: '100%', alignItems: 'center' },
  popupBtnFullGreen: { width: rs(300), paddingVertical: rs(10), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' }, // 캡처의 #309821와 유사
  popupBtnTextWhite: { fontSize: rs(14), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },
});