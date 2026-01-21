import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

export type EmailInputProps = TextInputProps & {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
};

export function EmailInput({
  placeholder = 'example@univ.ac.kr',
  value,
  onChangeText,
  style,
  ...otherProps
}: EmailInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor="#828282"
        value={value}
        onChangeText={onChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
        {...otherProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Pretendard',
    color: '#1B1D1F',
    height: 40,
  },
});
