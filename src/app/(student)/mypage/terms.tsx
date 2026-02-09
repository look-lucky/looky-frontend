import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TERMS_DATA = [
    {
        title: "1. 서비스 이용약관",
        items: [
            { id: 't1-1', title: '제1조 (목적)', content: '로렘 입숨(lorem ipsum; 줄여서 립숨, lipsum)은 출판이나 그래픽 디자인 분야에서 폰트, 타이포그래피, 레이아웃 같은 그래픽 요소나 시각적 연출을 보여줄 때 사용하는 표준 채우기 텍스트로, 최종 결과물에 들어가는 실제적인 문장 내용이 ...' },
            { id: 't1-2', title: '제2조 (용어의 정의)', content: '본 약관에서 사용하는 용어의 정의는 다음과 같습니다...' },
            { id: 't1-3', title: '제3조', content: '제3조 내용입니다...' },
            { id: 't1-4', title: '제4조', content: '제4조 내용입니다...' },
            { id: 't1-5', title: '제5조', content: '제5조 내용입니다...' },
            { id: 't1-6', title: '제6조', content: '제6조 내용입니다...' },
        ]
    },
    {
        title: "2. 개인정보처리방침",
        items: [
            { id: 't2-1', title: '개인정보의 수집·이용 목적', content: '회사는 다음과 같은 목적으로 개인정보를 수집하고 이용합니다...' },
            { id: 't2-2', title: '제3자 제공시 제공받는 자의 성명, 제공받는 자의 이용목적', content: '회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다...' },
            { id: 't2-3', title: '개인정보의 보유 및 이용기간, 파기절차 및 파기방법', content: '회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다...' },
        ]
    }
];

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>이용약관</Text>
        <Text style={styles.pageSubtitle}>루키 이용약관을 확인하세요</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.termsContainer}>
          {TERMS_DATA.map((section, sectionIndex) => (
            <View key={sectionIndex}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.divider} />
              {section.items.map((item) => {
                const isExpanded = expandedIds.includes(item.id);
                return (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.termItem}
                      onPress={() => toggleExpand(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.termTitle}>{item.title}</Text>
                      <Ionicons
                        name="chevron-down"
                        size={rs(16)}
                        color="#828282"
                        style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.termContentBox}>
                        <Text style={styles.termContentText}>{item.content}</Text>
                      </View>
                    )}
                    <View style={styles.divider} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  content: { paddingBottom: rs(50) },
  titleContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5) },
  pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard' },
  termsContainer: { backgroundColor: 'white', paddingHorizontal: rs(20), paddingVertical: rs(10) },
  sectionHeader: { paddingVertical: rs(10), justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  termItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(15), paddingHorizontal: rs(5) },
  termTitle: { fontSize: rs(12), fontWeight: '600', color: '#444444', fontFamily: 'Pretendard', flex: 1 },
  termContentBox: { backgroundColor: '#F9F9F9', padding: rs(15) },
  termContentText: { fontSize: rs(10), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(16) },
});
