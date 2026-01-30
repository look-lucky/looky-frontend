import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function VersionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#FAFAFA' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>버전 정보</Text>
        </View>

        {/* 버전 표시 행 */}
        <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>버전</Text>
            <Text style={styles.versionValue}>0.0.1</Text>
        </View>

        <View style={styles.divider} />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingHorizontal: rs(20) },

  // 타이틀
  titleContainer: { marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },

  // 버전 정보 행
  versionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: rs(15),
      paddingVertical: rs(15), 
      gap: rs(10),
  },
  versionLabel: {
      fontSize: rs(14),
      fontWeight: '400',
      color: 'black',
      fontFamily: 'Pretendard',
  },
  versionValue: {
      fontSize: rs(14),
      fontWeight: '600',
      color: '#34B262',
      fontFamily: 'Pretendard',
  },

  // 구분선
  divider: {
      height: 1,
      backgroundColor: '#E6E6E6',
      width: '100%',
  },
});