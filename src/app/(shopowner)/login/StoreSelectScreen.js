import { useSearchUnclaimedStores } from '@/src/api/store-claim';
import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StoreSelectScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data: searchRes, isFetching } = useSearchUnclaimedStores(
    { keyword: submittedText },
    { query: { enabled: submittedText.length >= 1 } }
  );

  const storeList = useMemo(() => {
    const raw = searchRes?.data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [searchRes]);

  const selectedStore = storeList.find((s) => s.id === selectedId) ?? null;

  const handleSearch = () => {
    if (searchText.trim().length < 1) return;
    setSubmittedText(searchText.trim());
    setSelectedId(null);
  };

  const handleSelect = () => {
    if (!selectedStore) return;
    navigation.navigate('StoreRegister', { store: selectedStore });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#F9F9F9' }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* 타이틀 */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>안녕하세요 사장님 !{'\n'}내 가게를 선택해주세요!</Text>
            <Text style={styles.subtitleText}>
              가게명으로 검색하여 내 가게를 선택해주세요{'\n'}
              검색 결과에 없다면 직접 입력하세요
            </Text>
          </View>

          {/* 검색창 */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="가게명 검색"
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="search" size={rs(20)} color="#828282" />
            </TouchableOpacity>
          </View>

          {/* 결과 리스트 */}
          {isFetching ? (
            <ActivityIndicator style={{ marginTop: rs(20) }} color="#34B262" />
          ) : submittedText.length > 0 && storeList.length === 0 ? (
            <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
          ) : (
            storeList.length > 0 && (
              <View style={styles.cardContainer}>
                {storeList.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.listItem}
                      activeOpacity={0.7}
                      onPress={() => setSelectedId(item.id)}
                    >
                      <View style={styles.itemTextContainer}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.roadAddress && (
                          <Text style={styles.itemAddress}>{item.roadAddress}</Text>
                        )}
                      </View>
                      <View style={styles.radioButtonContainer}>
                        {selectedId === item.id ? (
                          <View style={styles.radioSelected} />
                        ) : (
                          <View style={styles.radioUnselected} />
                        )}
                      </View>
                    </TouchableOpacity>
                    {index < storeList.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            )
          )}

        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.selectButton, !selectedStore && styles.selectButtonDisabled]}
            onPress={handleSelect}
            disabled={!selectedStore}
          >
            <Text style={styles.selectButtonText}>선택하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), backgroundColor: '#F9F9F9' },
  scrollContent: { paddingHorizontal: rs(20), paddingBottom: rs(120) },
  titleContainer: { marginTop: rs(20), marginBottom: rs(20) },
  titleText: { fontSize: rs(22), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard', lineHeight: rs(30), marginBottom: rs(8) },
  subtitleText: { fontSize: rs(13), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(19) },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: rs(12), height: rs(48), paddingHorizontal: rs(16), marginBottom: rs(20) },
  searchInput: { flex: 1, fontSize: rs(14), fontFamily: 'Pretendard', color: 'black', marginRight: rs(10) },
  emptyText: { textAlign: 'center', marginTop: rs(20), fontSize: rs(14), color: '#828282', fontFamily: 'Pretendard' },
  cardContainer: { backgroundColor: 'white', borderRadius: rs(16), paddingVertical: rs(10), paddingHorizontal: rs(20), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rs(18) },
  itemTextContainer: { flex: 1, paddingRight: rs(10) },
  itemName: { fontSize: rs(15), fontWeight: '600', color: '#1B1D1F', fontFamily: 'Pretendard', marginBottom: rs(4) },
  itemAddress: { fontSize: rs(12), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(16) },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  radioButtonContainer: { justifyContent: 'center', alignItems: 'center' },
  radioSelected: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: '#66E155', borderWidth: 1, borderColor: '#66E155' },
  radioUnselected: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: '#D9D9D9' },
  bottomButtonContainer: { position: 'absolute', bottom: rs(20), left: 0, right: 0, paddingHorizontal: rs(20) },
  selectButton: { width: '100%', height: rs(50), backgroundColor: '#34B262', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  selectButtonDisabled: { backgroundColor: '#D5D5D5' },
  selectButtonText: { fontSize: rs(16), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },
});
