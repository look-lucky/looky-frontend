import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReportScreen({ navigation }) {
  const [reporterType, setReporterType] = useState('user'); 
  const [selectedReason, setSelectedReason] = useState(null);
  const [detailText, setDetailText] = useState('');

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

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('알림', '신고 사유를 선택해주세요.');
      return;
    }
    navigation.navigate('ReportComplete');
  };

  // 라디오 버튼 컴포넌트 (텍스트 포함 전체 터치 가능)
  const RadioItem = ({ label, isSelected, onPress }) => {
    const activeColor = "#FF6200";
    const inactiveColor = "#ACACAC";
    const activeBg = "#FFBE95";
    const inactiveBg = "#E9E9E9";

    return (
      // TouchableOpacity가 레이아웃 전체를 감싸고 있어 글자를 눌러도 onPress가 작동합니다.
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1B1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 신고</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신고자 정보</Text>
          <View style={styles.radioGroup}>
            <RadioItem 
              label="일반 사용자" 
              isSelected={reporterType === 'user'} 
              onPress={() => setReporterType('user')} 
            />
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
                onPress={() => setSelectedReason(reason)}
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
              onChangeText={setDetailText}
            />
            <View style={styles.divider} />
          </View>
        )}

        <View style={styles.policySection}>
          <Text style={styles.policyTitle}>니어딜 신고 정책</Text>
          <Text style={styles.policyInfo}>* 근거 없는 허위 신고 시 서비스 이용이 제한될 수 있습니다.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={!selectedReason}
        >
          <Text style={styles.submitButtonText}>신고하기</Text>
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