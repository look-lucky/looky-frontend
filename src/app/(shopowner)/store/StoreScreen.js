import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 아까 만든 '채영식당' 카드 코드를 나중에 여기에 넣으면 됩니다!
export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>가게 관리(StoreScreen) 화면</Text>
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