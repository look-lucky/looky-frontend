import { StyleSheet, Text, TouchableOpacity, type ColorValue, type TouchableOpacityProps } from 'react-native';

// // 기본 로그인 버튼
// <LoginButton onPress={handleLogin} />

// // 다른 색상의 버튼
// <AppButton label="회원가입" backgroundColor="#007AFF" />
// <AppButton label="취소" backgroundColor="#666666" />
// <AppButton label="삭제" backgroundColor="#FF3B30" />

export type AppButtonProps = TouchableOpacityProps & {
  label?: string;
  backgroundColor?: ColorValue;
  onPress?: () => void;
};

export function AppButton({
  label = '로그인',
  backgroundColor = '#40ce2b',
  onPress,
  style,
  ...otherProps
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
      {...otherProps}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Pretendard',
  },
});
