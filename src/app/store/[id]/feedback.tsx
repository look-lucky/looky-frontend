import { AppButton } from '@/src/components/button/app-button';
import { ArrowLeft } from '@/src/components/button/arrow-left';
import { ThemedText } from '@/src/components/themed-text';
import { rs } from '@/src/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FEEDBACK_OPTIONS = [
  { id: 'no_benefit', label: '매장이 제휴혜택을 제공하지 않아요.' },
  { id: 'different_benefit', label: '매장이 실제로는 다른 제휴혜택을 제공해요.' },
  { id: 'wrong_name', label: '매장 이름이 잘못되었어요.' },
  { id: 'wrong_address', label: '매장 주소가 잘못되었어요.' },
  { id: 'wrong_phone', label: '매장 전화번호가 잘못되었어요.' },
  { id: 'wrong_hours', label: '매장 휴무일 정보가 잘못되었어요.' },
  { id: 'wrong_menu', label: '매장 메뉴가 잘못되었어요.' },
  { id: 'other', label: '기타' },
];

export default function StoreFeedbackScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [detailContent, setDetailContent] = useState('');

  const isOtherSelected = selectedOptions.includes('other');
  const isSubmitDisabled =
    selectedOptions.length === 0 ||
    (isOtherSelected && detailContent.trim() === '');

  const handleBack = () => {
    router.back();
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    // TODO: API 호출
    console.log('Submit feedback:', {
      storeId: id,
      selectedOptions,
      detailContent,
    });

    router.replace(`/store/${id}/feedback-complete`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ArrowLeft onPress={handleBack} />
        <ThemedText type="title" lightColor='#111111'>매장 정보 피드백하기</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 설명 텍스트 */}
        <ThemedText style={styles.description}>
          수정이 필요한 부분을 모두 선택해주세요.
        </ThemedText>

        {/* 수정 항목 섹션 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>수정 항목</ThemedText>
          <View style={styles.optionsContainer}>
            {FEEDBACK_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={() => toggleOption(option.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    selectedOptions.includes(option.id)
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={rs(20)}
                  color={
                    selectedOptions.includes(option.id) ? '#FF6B00' : '#CCCCCC'
                  }
                />
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* 상세 내용 섹션 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>상세 내용</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="수정 필요한 부분을 자세하게 적어주세요."
            placeholderTextColor="#999999"
            multiline
            value={detailContent}
            onChangeText={setDetailContent}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.divider} />

        {/* 피드백 정책 */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>니어딜 피드백 정책</ThemedText>
          <ThemedText style={styles.policyText}>
            등록하신 정보는 검수 과정을 거친 후 반영됩니다.
          </ThemedText>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + rs(16) }]}>
        <AppButton
          label="등록하기"
          backgroundColor={isSubmitDisabled ? '#CCCCCC' : '#FF6B00'}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: rs(12),
    gap: rs(16),
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#272828',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: rs(100),
  },
  description: {
    fontSize: 16,
    color: '#828282',
    marginBottom: rs(24),
  },
  section: {
    gap: rs(16),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#272828',
  },
  optionsContainer: {
    gap: rs(12),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  optionLabel: {
    fontSize: 16,
    color: '#272828',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: rs(24),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: rs(12),
    fontSize: 16,
    color: '#272828',
    minHeight: rs(100),
    fontFamily: 'Pretendard',
  },
  policyText: {
    fontSize: 12,
    color: '#999999',
  },
  bottomBar: {
    paddingTop: rs(16),
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitButton: {
    width: '100%',
  },
});
