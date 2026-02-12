import { useCreateReview } from '@/src/api/review';
import { AppButton } from '@/src/shared/common/app-button';
import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Colors } from '@/src/shared/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RATING_MESSAGES = [
  '',
  '별로예요.',
  '그저 그래요.',
  '괜찮아요.',
  '좋아요!',
  '별 다섯 개가 부족할 정도, 훌륭해요!',
];

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 300;
const MAX_PHOTOS = 3;

const COLORS = {
  primary: '#40CE2B',
  warning: '#FF6B00',
  starActive: '#FFD700',
  starInactive: '#E0E0E0',
  textPrimary: Colors.light.text,
  textSecondary: '#828282',
  border: '#EEEEEE',
  disabled: '#CCCCCC',
  danger: '#FF3B30',
  background: Colors.light.background,
} as const;

export default function ReviewWriteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const { mutate: createReview, isPending } = useCreateReview({
    mutation: {
      onSuccess: () => {
        router.back();
      },
      onError: (error: any) => {
        if (error?.status === 409) {
          Alert.alert('알림', '이미 작성한 리뷰가 있습니다.');
        } else {
          Alert.alert('오류', '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
        }
      },
    },
  });

  const isSubmitDisabled =
    rating === 0 || reviewContent.trim().length < MIN_REVIEW_LENGTH || isPending;

  const handleBack = () => router.back();
  const handleStarPress = (star: number) => setRating(star);

  const handleRemovePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    const images = photos.map((asset) => ({
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `review_${Date.now()}.jpg`,
    }));

    createReview({
      storeId: Number(id),
      data: {
        request: {
          content: reviewContent.trim(),
          rating,
        },
        images: images.length > 0 ? (images as any) : undefined,
      },
    });
  };

  const handleAddPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
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
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const oversized = result.assets.find(
        (a) => a.fileSize && a.fileSize > 10 * 1024 * 1024,
      );
      if (oversized) {
        Alert.alert('알림', '10MB 이하의 사진만 업로드할 수 있습니다.');
        return;
      }
      setPhotos((prev) => [...prev, ...result.assets].slice(0, MAX_PHOTOS));
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ArrowLeft onPress={handleBack} />
      </View>

      <ScrollView
        style={{ flex: 1, }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="subtitle">평화와 평화 구내매점</ThemedText>

        {/* 별점 */}
        <View style={styles.section}>
          <LabelRow label="별점" required />
          <View style={styles.ratingContainer}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={rs(40)}
                    color={star <= rating ? COLORS.starActive : COLORS.starInactive}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <ThemedText type='defaultSemiBold' lightColor={COLORS.textPrimary}>
                {RATING_MESSAGES[rating]}
              </ThemedText>
            )}
          </View>
        </View>

        <Divider />

        {/* 사진 업로드 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">사진 업로드</ThemedText>
          <ThemedText type="default" lightColor={COLORS.textSecondary} style={{ fontSize: 12, }}>
            매장과 관련된 사진을 업로드 해주세요.
          </ThemedText>
          <View style={styles.photoContainer}>
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddPhoto}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={rs(24)} color={COLORS.textSecondary} />
                <ThemedText lightColor={COLORS.textSecondary} style={{ fontSize: rs(10) }}>
                  {photos.length}/{MAX_PHOTOS}
                </ThemedText>
              </TouchableOpacity>
            )}
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close-circle" size={rs(20)} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* 리뷰 작성 */}
        <View style={styles.section}>
          <LabelRow
            label="리뷰 작성"
            required
            rightText={`${reviewContent.length}/${MAX_REVIEW_LENGTH}`}
          />
          <TextInput
            style={styles.textInput}
            placeholder="리뷰를 작성해주세요."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            value={reviewContent}
            onChangeText={setReviewContent}
            textAlignVertical="top"
            maxLength={MAX_REVIEW_LENGTH}
          />
        </View>

        <Divider />

        {/* 리뷰 정책 */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">니어딜 리뷰 정책</ThemedText>
          <ThemedText lightColor={COLORS.textSecondary} style={styles.policyText}>
            * 매장 이용과 무관한 내용이나 허위 및 과장, 저작물 무단 도용, 초상권
            및 사생활 침해 비방 등이 포함된 내용은 삭제될 수 있습니다.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + rs(16) }]}>
        <AppButton
          label="리뷰 등록하기"
          backgroundColor={isSubmitDisabled ? COLORS.disabled : COLORS.primary}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        />
      </View>
    </View>
  );
}

// ============================================
// Sub Components
// ============================================

function Divider() {
  return <View style={styles.divider} />;
}

function LabelRow({
  label,
  required,
  rightText,
}: {
  label: string;
  required?: boolean;
  rightText?: string;
}) {
  return (
    <View style={styles.labelRow}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      {required && (
        <ThemedText lightColor={COLORS.warning} type="defaultSemiBold">
          *
        </ThemedText>
      )}
      {rightText && (
        <ThemedText lightColor={COLORS.textSecondary} style={styles.rightText}>
          {rightText}
        </ThemedText>
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: rs(20),
  },
  header: {
    paddingVertical: rs(12),
    alignItems: 'flex-start'
  },
  scrollContent: {
    gap: rs(24),
    paddingBottom: rs(100),
  },
  section: {
    gap: rs(8),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(2),
  },
  rightText: {
    flex: 1,
    textAlign: 'right',
    fontSize: rs(12),
  },
  description: {
    fontSize: rs(12),
  },
  ratingContainer: {
    alignItems: 'center',
    gap: rs(12),
    paddingVertical: rs(16),
  },
  starsRow: {
    flexDirection: 'row',
    gap: rs(8),
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
    borderColor: COLORS.border,
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
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: rs(8),
    padding: rs(12),
    fontSize: rs(16),
    color: COLORS.textPrimary,
    minHeight: rs(120),
    fontFamily: 'Pretendard',
  },
  policyText: {
    fontSize: rs(12),
    lineHeight: rs(18),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  bottomBar: {
    paddingTop: rs(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
