import { useUpdateReview } from '@/src/api/review';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditReview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    reviewId,
    storeName,
    rating: initialRating,
    content: initialContent,
    imageUrls: initialImageUrls,
  } = useLocalSearchParams<{
    reviewId: string;
    storeName: string;
    rating: string;
    content: string;
    imageUrls?: string;
  }>();

  const [rating, setRating] = useState(Number(initialRating) || 5);
  const [reviewText, setReviewText] = useState(
    decodeURIComponent(initialContent || '')
  );
  const [editSuccessVisible, setEditSuccessVisible] = useState(false);

  // 이미지 관련 상태
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const MAX_PHOTOS = 3;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // 기존 이미지 초기화
  useEffect(() => {
    if (initialImageUrls) {
      try {
        const urls = JSON.parse(decodeURIComponent(initialImageUrls));
        if (Array.isArray(urls)) {
          setExistingImages(urls);
        }
      } catch (e) {
        console.error('Failed to parse imageUrls:', e);
      }
    }
  }, [initialImageUrls]);

  const { mutate: updateReview } = useUpdateReview();

  const getRatingComment = (score: number) => {
    switch (score) {
      case 5:
        return '별 다섯 개가 부족할 정도, 훌륭해요!';
      case 4:
        return '만족스러워요!';
      case 3:
        return '보통이에요.';
      case 2:
        return '아쉬워요.';
      case 1:
        return '별로예요.';
      default:
        return '별점을 눌러 평가해주세요.';
    }
  };

  // 사진 추가 핸들러
  const handleAddPhoto = async () => {
    const totalPhotos = existingImages.length + newImages.length;
    if (totalPhotos >= MAX_PHOTOS) {
      Alert.alert('알림', `사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있습니다.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('알림', '사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - totalPhotos,
      quality: 0.8,
    });

    if (!result.canceled) {
      const oversized = result.assets.find(
        (a) => a.fileSize && a.fileSize > MAX_FILE_SIZE,
      );
      if (oversized) {
        Alert.alert('알림', '10MB 이하의 사진만 업로드할 수 있습니다.');
        return;
      }
      setNewImages((prev) => [...prev, ...result.assets].slice(0, MAX_PHOTOS - existingImages.length));
    }
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  // 새 이미지 삭제
  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateReview = () => {
    if (!reviewId) return;

    // 새 이미지를 FormData 형식으로 변환
    const images = newImages.map((asset) => ({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `review_${Date.now()}.jpg`,
    }));

    updateReview(
      {
        reviewId: Number(reviewId),
        data: {
          request: { content: reviewText, rating },
          images: images.length > 0 ? (images as any) : undefined,
        },
      },
      { onSuccess: () => setEditSuccessVisible(true) }
    );
  };

  const handleConfirmSuccess = () => {
    setEditSuccessVisible(false);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.storeTitle}>
            {decodeURIComponent(storeName || '')}
          </Text>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              별점 <Text style={styles.requiredStar}>*</Text>
            </Text>
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
                    color={score <= rating ? '#FFCC00' : '#E0E0E0'}
                    style={{ marginHorizontal: rs(4) }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingComment}>{getRatingComment(rating)}</Text>
          </View>

          <View style={styles.divider} />

          {/* 사진 업로드 섹션 */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>사진 업로드</Text>
            <Text style={styles.sectionDescription}>
              매장과 관련된 사진을 업로드 해주세요.
            </Text>
            <View style={styles.photoContainer}>
              {/* 기존 이미지 */}
              {existingImages.map((url, index) => (
                <View key={`existing-${index}`} style={styles.photoItem}>
                  <Image source={{ uri: url }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemoveExistingImage(url)}
                  >
                    <Ionicons name="close-circle" size={rs(20)} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* 새로 추가된 이미지 */}
              {newImages.map((photo, index) => (
                <View key={`new-${index}`} style={styles.photoItem}>
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemoveNewImage(index)}
                  >
                    <Ionicons name="close-circle" size={rs(20)} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* 사진 추가 버튼 */}
              {(existingImages.length + newImages.length) < MAX_PHOTOS && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleAddPhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={rs(24)} color="#828282" />
                  <Text style={styles.photoCount}>
                    {existingImages.length + newImages.length}/{MAX_PHOTOS}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionContainer}>
            <View style={styles.reviewLabelRow}>
              <Text style={styles.sectionLabel}>
                리뷰 작성 <Text style={styles.requiredStar}>*</Text>
              </Text>
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

          <View style={styles.policyContainer}>
            <Text style={styles.policyTitle}>니어딜 리뷰 정책</Text>
            <Text style={styles.policyText}>
              * 매장 이용과 무관한 내용이나 허위 및 과장, 저작물 무단 도용, 초상권
              및 사생활 침해 비방 등이 포함된 내용은 삭제될 수 있습니다.
            </Text>
          </View>

          <View style={{ height: rs(80) }} />
        </ScrollView>

        <View style={styles.bottomBtnContainer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateReview}>
            <Text style={styles.submitBtnText}>리뷰 수정하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={editSuccessVisible}
        animationType="fade"
        onRequestClose={handleConfirmSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupTextContainer}>
              <Text style={styles.popupTitle}>리뷰가 수정되었어요!</Text>
              <Text style={styles.popupSubtitle}>정성스러운 후기 감사합니다</Text>
            </View>
            <View style={styles.popupBtnContainerOne}>
              <TouchableOpacity
                style={styles.popupBtnFullGreen}
                onPress={handleConfirmSuccess}
              >
                <Text style={styles.popupBtnTextWhite}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: rs(20), paddingTop: rs(10), paddingBottom: rs(10) },
  scrollContent: { paddingHorizontal: rs(20), paddingBottom: rs(20) },
  storeTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginTop: rs(10),
    marginBottom: rs(30),
  },
  sectionContainer: { marginVertical: rs(20) },
  sectionLabel: {
    fontSize: rs(16),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginBottom: rs(5),
  },
  sectionDescription: {
    fontSize: rs(12),
    color: '#828282',
    fontFamily: 'Pretendard',
    marginBottom: rs(12),
  },
  requiredStar: { color: '#34A853' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: rs(15),
  },
  ratingComment: {
    textAlign: 'center',
    fontSize: rs(14),
    fontWeight: '500',
    color: '#828282',
    fontFamily: 'Pretendard',
  },
  reviewLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: rs(10),
  },
  textCount: { fontSize: rs(12), color: '#828282', fontFamily: 'Pretendard' },
  textInputBox: {
    height: rs(120),
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: rs(16),
  },
  textInput: {
    flex: 1,
    fontSize: rs(14),
    color: 'black',
    fontFamily: 'Pretendard',
    lineHeight: rs(20),
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(12),
  },
  addPhotoButton: {
    width: rs(64),
    height: rs(64),
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoItem: {
    position: 'relative',
  },
  photoImage: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(8),
  },
  removePhotoButton: {
    position: 'absolute',
    top: rs(-8),
    right: rs(-8),
  },
  photoCount: {
    fontSize: rs(10),
    color: '#828282',
    fontFamily: 'Pretendard',
    marginTop: rs(4),
  },
  policyContainer: { marginTop: rs(10), marginBottom: rs(20) },
  policyTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginBottom: rs(5),
  },
  policyText: {
    fontSize: rs(12),
    fontWeight: '400',
    color: '#828282',
    fontFamily: 'Pretendard',
    lineHeight: rs(18),
  },
  bottomBtnContainer: {
    position: 'absolute',
    bottom: rs(20),
    left: 0,
    right: 0,
    paddingHorizontal: rs(20),
  },
  submitBtn: {
    width: '100%',
    height: rs(48),
    backgroundColor: '#40CE2B',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: rs(14),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: rs(335),
    backgroundColor: 'white',
    borderRadius: rs(10),
    paddingTop: rs(40),
    paddingBottom: rs(25),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  popupTextContainer: {
    alignItems: 'center',
    marginBottom: rs(20),
    paddingHorizontal: rs(10),
  },
  popupTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: 'black',
    fontFamily: 'Pretendard',
    marginBottom: rs(5),
    textAlign: 'center',
  },
  popupSubtitle: {
    fontSize: rs(14),
    fontWeight: '500',
    color: '#828282',
    fontFamily: 'Pretendard',
    textAlign: 'center',
  },
  popupBtnContainerOne: { width: '100%', alignItems: 'center' },
  popupBtnFullGreen: {
    width: rs(300),
    paddingVertical: rs(10),
    backgroundColor: '#34B262',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBtnTextWhite: {
    fontSize: rs(14),
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Pretendard',
  },
});
