import { rs } from '@/src/shared/theme/scale';
import { Brand, Gray, Text as TextColor } from '@/src/shared/theme/theme';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  storeUrl?: string;
}

export function ForceUpdateModal({ visible, storeUrl }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>업데이트 필요</Text>
          <Text style={styles.body}>
            더 나은 서비스를 위해{'\n'}최신 버전으로 업데이트해 주세요.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => storeUrl && Linking.openURL(storeUrl)}
          >
            <Text style={styles.buttonText}>업데이트하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: Gray.white,
    borderRadius: rs(16),
    paddingVertical: rs(28),
    paddingHorizontal: rs(24),
    width: '80%',
    alignItems: 'center',
    gap: rs(16),
  },
  title: {
    fontSize: rs(18),
    fontFamily: 'Pretendard-SemiBold',
    color: TextColor.primary,
  },
  body: {
    fontSize: rs(14),
    fontFamily: 'Pretendard-Regular',
    color: TextColor.secondary,
    textAlign: 'center',
    lineHeight: rs(22),
  },
  button: {
    backgroundColor: Brand.primary,
    borderRadius: rs(12),
    paddingVertical: rs(12),
    paddingHorizontal: rs(24),
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: rs(15),
    fontFamily: 'Pretendard-SemiBold',
    color: Gray.white,
  },
});
