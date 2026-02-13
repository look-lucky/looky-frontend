import { searchUnclaimedStores } from "@/src/api/store-claim";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { Gray, Owner, Text as TextColors } from "@/src/shared/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StoreItem {
  id: number;
  name: string;
  roadAddress?: string;
}

const MANUAL_ID = -1;

async function searchStores(keyword: string): Promise<StoreItem[]> {
  const res = await searchUnclaimedStores({ keyword });
  const data = (res as any).data;
  return data?.data ?? [];
}

export default function StoreSelectPage() {
  const router = useRouter();
  const { setSignupFields } = useSignupStore();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(MANUAL_ID);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const stores = await searchStores(keyword.trim());
        setResults(stores);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [keyword]);

  const handleSelect = useCallback(() => {
    if (selectedId === MANUAL_ID) {
      // 직접 입력 선택 → store-register로 이동
      router.push("/auth/store-register");
      return;
    }

    const store = results.find((s) => s.id === selectedId);
    if (store) {
      setSignupFields({
        storeName: store.name,
        storeAddress: store.roadAddress ?? "",
      });
    }
    router.canGoBack() ? router.back() : router.replace("/auth");
  }, [selectedId, results, setSignupFields, router]);

  const listData: StoreItem[] = [
    { id: MANUAL_ID, name: "직접 입력" },
    ...results,
  ];

  const renderItem = useCallback(
    ({ item, index }: { item: StoreItem; index: number }) => {
      const isSelected = selectedId === item.id;
      const isLast = index === listData.length - 1;
      return (
        <View>
          <TouchableOpacity
            style={styles.listItem}
            activeOpacity={0.7}
            onPress={() => setSelectedId(item.id)}
          >
            <View style={styles.itemTextContainer}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              {item.roadAddress && (
                <ThemedText style={styles.itemAddress}>
                  {item.roadAddress}
                </ThemedText>
              )}
            </View>
            <View style={isSelected ? styles.radioSelected : styles.radioUnselected} />
          </TouchableOpacity>
          {!isLast && <View style={styles.divider} />}
        </View>
      );
    },
    [selectedId, listData.length],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <>
              {/* 타이틀 */}
              <View style={styles.titleContainer}>
                <ThemedText style={styles.titleText}>
                  안녕하세요 사장님 !{"\n"}내 가게를 선택해주세요!
                </ThemedText>
                <ThemedText style={styles.subtitleText}>
                  지도에 등록된 가게 정보를 불러왔어요{"\n"}
                  내 가게가 있다면 클릭하고 없다면 직접 입력해주세요
                </ThemedText>
              </View>

              {/* 검색창 */}
              <View style={styles.searchBar}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="가게명 검색"
                  placeholderTextColor="#999999"
                  value={keyword}
                  onChangeText={setKeyword}
                />
                <Ionicons name="search" size={rs(20)} color="#828282" />
              </View>

              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color={Owner.primary}
                  style={{ marginBottom: rs(8) }}
                />
              )}
            </>
          }
          ListFooterComponent={<View style={{ height: rs(100) }} />}
          ItemSeparatorComponent={undefined}
        />

        {/* 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
            <ThemedText style={styles.selectButtonText}>선택하기</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    backgroundColor: "#F9F9F9",
  },
  scrollContent: {
    paddingHorizontal: rs(20),
  },
  titleContainer: {
    marginTop: rs(20),
    marginBottom: rs(20),
    gap: rs(8),
  },
  titleText: {
    fontSize: rs(22),
    fontWeight: "700",
    color: "#1B1D1F",
    fontFamily: "Pretendard",
    lineHeight: rs(30),
  },
  subtitleText: {
    fontSize: rs(13),
    color: "#828282",
    fontFamily: "Pretendard",
    lineHeight: rs(19),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: rs(12),
    height: rs(48),
    paddingHorizontal: rs(16),
    marginBottom: rs(20),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    fontFamily: "Pretendard",
    color: "black",
    marginRight: rs(10),
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: rs(16),
    paddingVertical: rs(10),
    paddingHorizontal: rs(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rs(18),
    paddingHorizontal: rs(20),
    backgroundColor: "white",
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: rs(10),
    gap: rs(4),
  },
  itemName: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#1B1D1F",
    fontFamily: "Pretendard",
  },
  itemAddress: {
    fontSize: rs(12),
    color: "#828282",
    fontFamily: "Pretendard",
    lineHeight: rs(16),
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: rs(20),
  },
  radioSelected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: "#66E155",
    borderWidth: 1,
    borderColor: "#66E155",
    shadowColor: "#66E155",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  radioUnselected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: "#D9D9D9",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: rs(20),
    left: 0,
    right: 0,
    paddingHorizontal: rs(20),
  },
  selectButton: {
    width: "100%",
    height: rs(50),
    backgroundColor: "#34B262",
    borderRadius: rs(12),
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: rs(16),
    fontWeight: "700",
    color: "white",
    fontFamily: "Pretendard",
  },
});
