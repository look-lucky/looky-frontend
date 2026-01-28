import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ReportCompleteScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 중앙 콘텐츠 영역 */}
      <View style={styles.content}>
        <Image 
          source={ require('@/assets/images/shopowner/ReportComplete.png') } 
          style={styles.completeImage} 
        />

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>신고가 완료되었어요</Text>
          <Text style={styles.subText}>빠르게 검토하고 조치할게요</Text>
        </View>
      </View>

      {/* 2. 하단 버튼 영역 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Review' })}
        >
          <Text style={styles.confirmButtonText}>리뷰 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  
  // 94x94 이미지 스타일
  completeImage: { 
    width: 94, 
    height: 94, 
    marginBottom: 20 
  },

  textContainer: { 
    alignItems: 'center', 
    gap: 5 
  },
  titleText: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: 'black', 
    lineHeight: 28,
    fontFamily: 'Pretendard' 
  },
  subText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#828282', 
    lineHeight: 19.6,
    fontFamily: 'Pretendard' 
  },

  // 하단 버튼 스타일
  footer: { 
    paddingHorizontal: 20, 
    paddingBottom: 30, 
    alignItems: 'center' 
  },
  confirmButton: { 
    width: '100%', // 너비를 카드 너비에 맞춰 100%로 설정
    height: 45, 
    backgroundColor: 'black',
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  confirmButtonText: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: '700',
    fontFamily: 'Pretendard' 
  },
});