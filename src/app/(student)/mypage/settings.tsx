import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = (menuName: string) => {
    switch (menuName) {
      case '내 정보 수정':
        router.push('/mypage/edit-profile');
        break;
      case '이용약관':
        router.push('/mypage/terms');
        break;
      case '버전정보':
        router.push('/mypage/version');
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>설정</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>계정</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('내 정보 수정')}>
          <Text style={styles.menuText}>내 정보 수정</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>기타</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('이용약관')}>
          <Text style={styles.menuText}>이용약관</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('버전정보')}>
          <Text style={styles.menuText}>버전정보</Text>
          <Ionicons name="chevron-forward" size={rs(16)} color="black" />
        </TouchableOpacity>

        <View style={styles.divider} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  content: { paddingBottom: rs(50) },
  titleContainer: { paddingHorizontal: rs(20), marginVertical: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  sectionHeader: { paddingHorizontal: rs(20), paddingVertical: rs(5), marginTop: rs(10), marginBottom: rs(5) },
  sectionTitle: { fontSize: rs(14), fontWeight: '400', color: '#444444', fontFamily: 'Pretendard' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(15),
    backgroundColor: '#FAFAFA',
  },
  menuText: { fontSize: rs(14), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%', marginVertical: rs(5) },
});
