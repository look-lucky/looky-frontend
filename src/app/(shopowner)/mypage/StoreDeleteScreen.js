import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function StoreDeleteScreen({ navigation, route }) {
  const { storeData } = route.params || { storeData: { name: '모쿠모쿠 전북대점' } }; 

  // 삭제 확인 팝업 상태만 남김
  const [confirmModalVisible, setConfirmModalVisible] = useState(false); 

  const handleDeletePress = () => {
    setConfirmModalVisible(true);
  };

  // 삭제 확인 시 -> 바로 목록 화면으로 이동하며 신호(deleted: true) 전달
  const handleConfirmDelete = () => {
    setConfirmModalVisible(false);
    setTimeout(() => {
        navigation.navigate('StoreManagement', { showDeleteSuccess: true }); 
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>가게 삭제하기</Text>
          <Text style={styles.pageSubtitle}>삭제하려는 가게의 정보를 확인해주세요</Text>
        </View>

        <View style={styles.formContainer}>
          <ReadOnlyInput label="가게 이름" value={storeData.name} />
          <ReadOnlyInput label="가게 전화번호" value="063-123-4567" />
          <ReadOnlyInput label="대표자명" value="김루키" />
          <ReadOnlyInput label="휴대폰번호" value="010-1234-5678" />
          <ReadOnlyInput label="사업자등록번호" value="123-456-7890" />
        </View>

        <View style={styles.attachContainer}>
            <Text style={styles.attachTitle}>사업자 등록증 첨부</Text>
            <View style={styles.attachBox}>
                <Text style={styles.attachFileName}>사업자등록증</Text>
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image" size={rs(24)} color="rgba(130, 130, 130, 0.70)" />
                </View>
            </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePress}>
            <Text style={styles.deleteBtnText}>가게 삭제하기</Text>
        </TouchableOpacity>
      </View>

      {/* 삭제 확인 팝업 */}
      <Modal transparent animationType="fade" visible={confirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.popupBox, { height: rs(227) }]}>
                <TouchableOpacity style={styles.closeIcon} onPress={() => setConfirmModalVisible(false)}>
                    <Ionicons name="close" size={rs(20)} color="#333" />
                </TouchableOpacity>

                <View style={[styles.popupTextContainer, { marginTop: rs(40) }]}>
                    <Text style={styles.popupTitle}>가게를 삭제하시겠어요?</Text>
                    <Text style={styles.popupSubtitle}>
                        가게 삭제 시 해당 가게 정보는 모두 소멸되며,{'\n'}
                        복구가 불가능합니다.{'\n'}
                        정말로 삭제하시겠어요?
                    </Text>
                </View>

                <View style={styles.twoButtonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmModalVisible(false)}>
                        <Text style={styles.buttonTextWhite}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                        <Text style={styles.buttonTextWhite}>삭제하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const ReadOnlyInput = ({ label, value }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#FAFAFA' },
  content: { paddingHorizontal: rs(20), paddingBottom: rs(100) },
  titleContainer: { marginVertical: rs(10), gap: rs(5) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard' },
  formContainer: { marginTop: rs(20), gap: rs(15) },
  inputGroup: {},
  inputLabel: { fontSize: rs(12), color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5), marginLeft: rs(5) },
  readOnlyBox: { height: rs(40), backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: rs(8), paddingHorizontal: rs(16), justifyContent: 'center' },
  readOnlyText: { fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '500', color: 'black' },
  attachContainer: { marginTop: rs(30), gap: rs(10) },
  attachTitle: { fontSize: rs(16), fontWeight: '700', color: '#272828', fontFamily: 'Pretendard' },
  attachBox: { gap: rs(5) },
  attachFileName: { fontSize: rs(11), color: '#828282', fontFamily: 'Pretendard' },
  imagePlaceholder: { width: rs(100), height: rs(100), backgroundColor: 'rgba(217, 217, 217, 0.50)', borderRadius: rs(8), borderWidth: 1, borderColor: 'rgba(130, 130, 130, 0.30)', justifyContent: 'center', alignItems: 'center' },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: rs(20), backgroundColor: '#FAFAFA' },
  deleteBtn: { height: rs(48), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  
  // 팝업 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { width: rs(335), backgroundColor: 'white', borderRadius: rs(10), alignItems: 'center', paddingHorizontal: rs(15), elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 },
  closeIcon: { position: 'absolute', top: rs(10), right: rs(10), padding: rs(5), zIndex: 1 },
  popupTextContainer: { alignItems: 'center', gap: rs(10), width: '100%' },
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center' },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center', lineHeight: rs(20) },
  buttonTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  twoButtonContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: rs(10), position: 'absolute', bottom: rs(20) },
  cancelButton: { flex: 1, height: rs(40), backgroundColor: '#D5D5D5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  confirmDeleteButton: { flex: 1, height: rs(40), backgroundColor: '#FF6200', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
});