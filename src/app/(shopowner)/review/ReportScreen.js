import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


import { useReportReview } from '@/src/api/review';

// UI 라벨 → API reason enum 매핑
const REASON_MAP = {
  '근거 없이 악의적인 내용': 'MALICIOUS_SLANDER',
  '음란성 또는 욕설 등 부적절한 내용': 'INAPPROPRIATE_CONTENT',
  '명예훼손 및 저작권 침해': 'RIGHTS_VIOLATION',
  '다른 매장 리뷰': 'IRRELEVANT',
  '초상권 침해 또는 개인정보 노출': 'PRIVACY_INFRINGEMENT',
  '서비스나 메뉴 등 대가를 목적으로 작성된 리뷰': 'COMMERCIAL_PROMOTION',
  '리뷰 작성 대행업체를 통해 게제된 허위 리뷰': 'FRAUDULENT_REVIEW',
  '기타': 'OTHER',
};

export default function ReportScreen({ navigation, route }) {
  const reviewId = route?.params?.reviewId;
  const scrollViewRef = useRef(null);

  const [reporterType, setReporterType] = useState('owner');
  const [selectedReason, setSelectedReason] = useState(null);
  const [detailText, setDetailText] = useState('');

  const reportMutation = useReportReview();

  const reasons = [
    '근거 없이 악의적인 내용',
    '음란성 또는 욕설 등 부적절한 내용',
    '명예훼손 및 저작권 침해',
    '다른 매장 리뷰',
    '초상권 침해 또는 개인정보 노출',
    '서비스나 메뉴 등 대가를 목적으로 작성된 리뷰',
    '리뷰 작성 대행업체를 통해 게제된 허위 리뷰',
    '기타',
  ];

  // [추가] 뒤로가기 버튼 클릭 시 확인 팝업
  const handleBackPress = () => {
    if (selectedReason === '기타' && detailText.trim().length > 0) {
      Alert.alert(
        '작성 중인 내용이 있습니다',
        '나가시겠습니까? 작성 중인 내용은 저장되지 않습니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => {
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('알림', '신고 사유를 선택해주세요.');
      return;
    }
    if (!reviewId) {
      Alert.alert('오류', '리뷰 정보를 찾을 수 없습니다.');
      return;
    }

    const apiReason = REASON_MAP[selectedReason] || 'OTHER';
    const body = {
      reason: apiReason,
      ...(selectedReason === '기타' && detailText.trim() ? { detail: detailText.trim() } : {}),
    };

    reportMutation.mutate(
      { reviewId, data: body },
      {
        onSuccess: () => navigation.navigate('ReportComplete'),
        onError: (error) => {
          if (error?.status === 409) {
            Alert.alert('알림', '이미 신고된 리뷰입니다.');
          } else {
            Alert.alert('오류', '신고 처리 중 문제가 발생했습니다.');
          }
        },
      }
    );
  };

  const RadioItem = ({ label, isSelected, onPress }) => {
    const activeColor = "#FF6200";
    const inactiveColor = "#ACACAC";
    const activeBg = "#FFBE95";
    const inactiveBg = "#E9E9E9";

    return (
      <TouchableOpacity
        style={styles.radioItem}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <View style={[styles.radioOuter, { backgroundColor: isSelected ? activeBg : inactiveBg }]}>
          <View style={[styles.radioInner, { backgroundColor: isSelected ? activeColor : inactiveColor }]} />
        </View>
        <Text style={[styles.radioLabel, isSelected && styles.radioLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1B1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>리뷰 신고</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>신고자 정보</Text>
            <View style={styles.radioGroup}>
              <RadioItem
                label="매장 관계자"
                isSelected={reporterType === 'owner'}
                onPress={() => setReporterType('owner')}
              />
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.section}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.sectionTitle}>신고 사유 </Text>
              <Text style={{ color: '#FF6200', fontSize: 16, fontWeight: '700' }}>*</Text>
            </View>
            <View style={styles.radioGroup}>
              {reasons.map((reason, index) => (
                <RadioItem
                  key={index}
                  label={reason}
                  isSelected={selectedReason === reason}
                  onPress={() => setSelectedReason(prev => prev === reason ? null : reason)}
                />
              ))}
            </View>
            <View style={styles.divider} />
          </View>

          {selectedReason === '기타' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>상세 내용</Text>
              <TextInput
                style={styles.textInput}
                placeholder="리뷰 신고 사유를 자세하게 적어주세요"
                placeholderTextColor="#828282"
                multiline
                textAlignVertical="top"
                value={detailText}
                onChangeText={(text) => {
                  if (text.length <= 300) setDetailText(text);
                }}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                maxLength={300}
              />
              <Text style={styles.charCount}>{detailText.length}/300</Text>
              <View style={styles.divider} />
            </View>
          )}

          <View style={styles.policySection}>
            <Text style={styles.policyTitle}>니어딜 신고 정책</Text>
            <Text style={styles.policyInfo}>* 근거 없는 허위 신고 시 서비스 이용이 제한될 수 있습니다.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedReason || (selectedReason === '기타' && detailText.trim().length === 0) || reportMutation.isPending) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason || (selectedReason === '기타' && detailText.trim().length === 0) || reportMutation.isPending}
        >
          <Text style={styles.submitButtonText}>{reportMutation.isPending ? '처리 중...' : '신고하기'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
  },
  backButton: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },

  content: { paddingHorizontal: 20, paddingTop: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 20 },

  divider: { height: 1, backgroundColor: '#E6E6E6', marginTop: 20 },

  radioGroup: { gap: 20 },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  radioOuter: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  radioLabel: { fontSize: 14, color: '#272828', fontWeight: '400' },
  radioLabelActive: { fontWeight: '600', color: '#000' },

  textInput: {
    width: '100%', height: 95, backgroundColor: '#fff', borderRadius: 8,
    borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 16, paddingTop: 10,
    fontSize: 12, color: '#000',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 10,
    color: '#828282',
    marginTop: 4,
  },

  policySection: { marginTop: 10, marginBottom: 40 },
  policyTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 5 },
  policyInfo: { fontSize: 12, color: '#828282', lineHeight: 16.8 },

  footer: { paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' },
  submitButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#FF6200',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButtonDisabled: { backgroundColor: '#ACACAC' },
  submitButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
});