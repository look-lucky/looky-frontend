import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.fixedTitleContainer}>
        <Text style={styles.pageTitle}>내 정보 수정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <MenuRow label="아이디" onPress={() => router.push('/mypage/change-id' as any)} />
          <MenuRow label="비밀번호" onPress={() => router.push('/mypage/change-password' as any)} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/mypage/withdraw' as any)}>
          <Text style={styles.deleteAccountText}>회원탈퇴</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="#BDBDBD" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const MenuRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
    <Text style={styles.menuText}>{label}</Text>
    <Ionicons name="chevron-forward" size={rs(16)} color="#1B1D1F" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  fixedTitleContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(10), backgroundColor: '#FAFAFA', zIndex: 1 },
  pageTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  content: { paddingHorizontal: rs(20), paddingBottom: rs(50), paddingTop: rs(10) },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(18), backgroundColor: 'transparent' },
  menuText: { fontSize: rs(15), fontWeight: '500', color: '#1B1D1F', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', marginVertical: rs(10) },
  deleteAccountText: { fontSize: rs(14), fontWeight: '500', color: '#BDBDBD', fontFamily: 'Pretendard' },
});
