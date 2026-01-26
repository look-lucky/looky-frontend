import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 아까 만든 '채영식당' 카드 코드를 나중에 여기에 넣으면 됩니다!
export default function MyPageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>마이페이지(MyPageScreen) 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});