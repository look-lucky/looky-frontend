import { ArrowLeft } from '@/src/shared/common/arrow-left';
import { ThemedText } from '@/src/shared/common/themed-text';
import { rs } from '@/src/shared/theme/scale';
import { Fonts, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
        <ThemedText style={styles.pageTitle}>설정</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>계정</ThemedText>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mypage/profile-edit' as any)}>
          <ThemedText style={styles.menuText}>프로필 수정</ThemedText>
          <Ionicons name="chevron-forward" size={rs(16)} color={Gray.gray6} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>기타</ThemedText>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mypage/terms' as any)}>
          <ThemedText style={styles.menuText}>이용약관</ThemedText>
          <Ionicons name="chevron-forward" size={rs(16)} color={Gray.gray6} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/mypage/version' as any)}>
          <ThemedText style={styles.menuText}>버전정보</ThemedText>
          <Ionicons name="chevron-forward" size={rs(16)} color={Gray.gray6} />
        </TouchableOpacity>

        <View style={styles.divider} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Gray.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(12),
    gap: rs(12),
  },
  headerRight: { width: rs(24) },
  content: { paddingBottom: rs(50) },
  pageTitle: {
    flex: 1,
    fontSize: rs(18),
    fontWeight: '700',
    color: TextColor.primary,
    fontFamily: Fonts.bold,
  },
  sectionHeader: { paddingHorizontal: rs(20), paddingVertical: rs(8), marginTop: rs(8) },
  sectionTitle: { fontSize: rs(12), fontWeight: '400', color: TextColor.tertiary, fontFamily: Fonts.regular },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: Gray.white,
  },
  menuText: { fontSize: rs(14), fontWeight: '400', color: TextColor.primary, fontFamily: Fonts.regular },
  divider: { height: 1, backgroundColor: Gray.gray2, width: '100%' },
});
