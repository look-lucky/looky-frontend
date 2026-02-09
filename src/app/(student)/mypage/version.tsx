import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VersionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>버전 정보</Text>
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionLabel}>버전</Text>
          <Text style={styles.versionValue}>0.0.1</Text>
        </View>

        <View style={styles.divider} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  content: { paddingHorizontal: rs(20) },
  titleContainer: { marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  versionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(15), paddingVertical: rs(15), gap: rs(10) },
  versionLabel: { fontSize: rs(14), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  versionValue: { fontSize: rs(14), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
});
