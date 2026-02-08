import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

// [API] 내 가게 목록 가져오기
import { getMyStores } from '@/src/api/store';

export default function StoreManagementScreen({ navigation, route }) {
  // [상태] 가게 목록 데이터
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  
  // 삭제 완료 팝업 상태
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);

  // [API] 가게 목록 불러오기 함수
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await getMyStores();
      // response.data가 배열이라고 가정 (API 명세 확인 필요)
      setStores(response.data || []); 
    } catch (error) {
      console.error('가게 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // [초기 로딩 & 포커스 시 갱신]
  useFocusEffect(
    useCallback(() => {
      fetchStores();
    }, [])
  );

  // 삭제 완료 후 파라미터 처리
  useEffect(() => {
    if (route.params?.showDeleteSuccess) {
      setDeleteSuccessVisible(true);
      // params 초기화
      navigation.setParams({ showDeleteSuccess: false });
      
      // 선택 상태 초기화 및 목록 갱신
      setSelectedStoreId(null);
      fetchStores(); 
    }
  }, [route.params]);

  const toggleSelection = (id) => {
    if (selectedStoreId === id) setSelectedStoreId(null);
    else setSelectedStoreId(id);
  };

  const handleAddStore = () => {
    navigation.navigate('StoreAdd', { mode: 'add' });
  };

  const handleEditStore = () => {
    if (!selectedStoreId) return;
    const selectedStore = stores.find(s => s.id === selectedStoreId);
    navigation.navigate('StoreAdd', { mode: 'edit', storeData: selectedStore });
  };

  const handleDeleteStore = () => {
    if (!selectedStoreId) return;
    const selectedStore = stores.find(s => s.id === selectedStoreId);
    navigation.navigate('StoreDelete', { storeData: selectedStore });
  };

  const handleDeleteSuccessConfirm = () => {
      setDeleteSuccessVisible(false);
  };

  if (loading) {
      return (
          <View style={[styles.container, {justifyContent:'center', alignItems:'center'}]}>
              <ActivityIndicator size="large" color="#34B262" />
          </View>
      );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: 'white' }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:10, bottom:10, left:10, right:10}}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>가게 관리</Text>
          <TouchableOpacity style={styles.addStoreBtn} onPress={handleAddStore}>
            <Ionicons name="add" size={rs(12)} color="#34B262" />
            <Text style={styles.addStoreText}>가게 추가하기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.storeList} showsVerticalScrollIndicator={false}>
          <View style={styles.divider} />
          {stores.length === 0 ? (
              <View style={{padding: rs(20), alignItems:'center'}}>
                  <Text style={{color:'#828282'}}>등록된 가게가 없습니다.</Text>
              </View>
          ) : (
              stores.map((store) => {
                const isSelected = selectedStoreId === store.id;
                return (
                  <View key={store.id}>
                    <TouchableOpacity style={styles.storeItem} onPress={() => toggleSelection(store.id)} activeOpacity={0.7}>
                      <View style={styles.storeNameContainer}>
                        {isSelected && <Ionicons name="checkmark-circle" size={rs(20)} color="#34B262" style={{ marginRight: rs(8) }} />}
                        <Text style={styles.storeName}>{store.name}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={rs(16)} color="#BDBDBD" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                  </View>
                );
              })
          )}
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.bottomBtn, { backgroundColor: selectedStoreId ? '#828282' : '#D5D5D5' }]} 
            disabled={!selectedStoreId} 
            onPress={handleDeleteStore}
          >
            <Text style={styles.bottomBtnText}>삭제하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bottomBtn, { backgroundColor: selectedStoreId ? '#34B262' : '#D5D5D5' }]} 
            disabled={!selectedStoreId} 
            onPress={handleEditStore}
          >
            <Text style={styles.bottomBtnText}>수정하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 삭제 완료 팝업 */}
      <Modal transparent animationType="fade" visible={deleteSuccessVisible} onRequestClose={handleDeleteSuccessConfirm}>
        <View style={styles.modalOverlay}>
            <View style={styles.popupBox}>
                
                <View style={styles.popupTextContainer}>
                    <Text style={styles.popupTitle}>가게가 삭제되었어요</Text>
                    <Text style={styles.popupSubtitle}>새로운 가게를 추가해주세요</Text>
                </View>

                <TouchableOpacity style={styles.successButton} onPress={handleDeleteSuccessConfirm}>
                    <Text style={styles.buttonTextWhite}>확인</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  contentContainer: { flex: 1, paddingHorizontal: rs(20) },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  addStoreBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
  addStoreText: { fontSize: rs(12), fontWeight: '500', color: '#34B262', fontFamily: 'Pretendard' },
  storeList: { flex: 1 },
  storeItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(15), paddingHorizontal: rs(5) },
  storeNameContainer: { flexDirection: 'row', alignItems: 'center' },
  storeName: { fontSize: rs(14), fontWeight: '400', color: 'black', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  bottomButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: rs(40), marginTop: rs(20), gap: rs(15) },
  bottomBtn: { flex: 1, height: rs(40), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  bottomBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },

  // --- 팝업 스타일 ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  popupBox: { 
      width: rs(335), 
      height: rs(180), 
      backgroundColor: 'white', 
      borderRadius: rs(10), 
      alignItems: 'center', 
      paddingHorizontal: rs(15),
      elevation: 10, 
      shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10 
  },
  
  // 텍스트 컨테이너
  popupTextContainer: { 
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center', 
      width: '100%',
      marginBottom: rs(40), 
  },
  
  popupTitle: { fontSize: rs(20), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', textAlign: 'center', marginBottom: rs(5) },
  popupSubtitle: { fontSize: rs(14), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', textAlign: 'center' },
  
  successButton: { 
      width: '100%', 
      height: rs(30), 
      backgroundColor: '#FF6200',
      borderRadius: rs(8), 
      justifyContent: 'center', 
      alignItems: 'center', 
      position: 'absolute', 
      bottom: rs(15) 
  },
  buttonTextWhite: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
});