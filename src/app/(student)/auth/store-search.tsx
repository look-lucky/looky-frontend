import { customFetch } from "@/src/api/mutator";
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

async function searchStores(keyword: string): Promise<StoreItem[]> {
  const qs = new URLSearchParams();
  qs.append("keyword", keyword);
  qs.append("page", "0");
  qs.append("size", "20");

  const res = await customFetch<{
    data: { data?: { content?: StoreItem[] } };
    status: number;
  }>(`/api/stores?${qs.toString()}`, { method: "GET" });

  return res.data?.data?.content ?? [];
}

export default function StoreSearchPage() {
  const router = useRouter();
  const { setSignupFields } = useSignupStore();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 디바운스 검색
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!keyword.trim()) {
      setResults([]);
      setSelectedId(null);
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
    if (selectedId === null) return;

    const store = results.find((s) => s.id === selectedId);
    if (store) {
      setSignupFields({
        storeName: store.name,
        storeAddress: store.roadAddress ?? "",
      });
    }
    router.back();
  }, [selectedId, results, setSignupFields, router]);

  const renderItem = useCallback(
    ({ item }: { item: StoreItem }) => {
      const isSelected = selectedId === item.id;
      return (
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
          <View
            style={isSelected ? styles.radioSelected : styles.radioUnselected}
          />
        </TouchableOpacity>
      );
    },
    [selectedId],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.back()} />
      </View>

      {/* 타이틀 */}
      <View style={styles.titleSection}>
        <ThemedText type="subtitle" style={styles.title}>
          내 가게를 검색해주세요
        </ThemedText>
        <ThemedText style={styles.description}>
          등록된 가게가 있다면 선택해주세요
        </ThemedText>
      </View>

      {/* 검색창 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="가게명 검색"
          placeholderTextColor={TextColors.placeholder}
          value={keyword}
          onChangeText={setKeyword}
          autoFocus
        />
        <Ionicons name="search" size={rs(20)} color={Gray.gray9} />
      </View>

      {/* 결과 리스트 */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={Owner.primary} />
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            showsVerticalScrollIndicator={false}
          />
        ) : keyword.trim().length > 0 ? (
          <View style={styles.centered}>
            <ThemedText style={styles.emptyText}>
              검색 결과가 없습니다
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomContent}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: selectedId ? Owner.primary : Gray.gray5 },
          ]}
          onPress={handleSelect}
          disabled={!selectedId}
        >
          <ThemedText style={styles.selectButtonText}>선택하기</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
    padding: rs(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rs(8),
  },
  titleSection: {
    gap: rs(4),
    marginBottom: rs(20),
  },
  title: {
    color: TextColors.primary,
  },
  description: {
    color: TextColors.secondary,
    fontSize: rs(14),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Gray.gray2,
    borderRadius: rs(8),
    height: rs(44),
    paddingHorizontal: rs(16),
    marginBottom: rs(16),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    fontFamily: "Pretendard",
    color: TextColors.primary,
    marginRight: rs(8),
  },
  listContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: TextColors.tertiary,
    fontSize: rs(14),
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rs(16),
  },
  itemTextContainer: {
    flex: 1,
    paddingRight: rs(12),
    gap: rs(4),
  },
  itemName: {
    fontSize: rs(15),
    fontWeight: "600",
    color: TextColors.primary,
  },
  itemAddress: {
    fontSize: rs(12),
    color: TextColors.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Gray.gray3,
  },
  radioSelected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: Owner.primary,
  },
  radioUnselected: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: Gray.gray4,
  },
  bottomContent: {
    paddingTop: rs(16),
  },
  selectButton: {
    width: "100%",
    height: rs(44),
    borderRadius: rs(8),
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: Gray.white,
  },
});
