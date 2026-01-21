import { useLogout } from "@/src/api/auth";
import { useGetMyFavorites } from "@/src/api/favorite";
import { useAuth } from "@/src/lib/auth";
import { rs } from "@/src/theme/scale";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePage() {
  const router = useRouter();
  const { handleLogout, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const { data, isLoading, error } = useGetMyFavorites(
    { pageable: { page: 0, size: 10 } },
    { query: { enabled: isAuthenticated } }
  );

  const onLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSettled: async () => {
        await handleLogout();
        router.replace("/landing");
      },
    });
  };

  const favorites = data?.data.data?.content ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>홈</Text>
        <TouchableOpacity onPress={onLogout} disabled={logoutMutation.isPending}>
          <Text style={styles.logoutText}>
            {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 즐겨찾기 ({favorites.length})</Text>

        {isLoading && <ActivityIndicator style={styles.loader} />}

        {error && (
          <Text style={styles.errorText}>
            즐겨찾기를 불러오는데 실패했습니다.
          </Text>
        )}

        {!isLoading && !error && favorites.length === 0 && (
          <Text style={styles.emptyText}>즐겨찾기한 매장이 없습니다.</Text>
        )}

        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.storeId)}
          renderItem={({ item }) => (
            <View style={styles.favoriteItem}>
              <Text style={styles.storeName}>{item.name}</Text>
              <Text style={styles.storeCategory}>
                {item.storeCategories?.join(", ")}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: rs(24),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: rs(16),
  },
  title: {
    fontSize: rs(20),
    fontWeight: "700",
    color: "#272828",
    fontFamily: "Pretendard",
  },
  logoutText: {
    fontSize: rs(14),
    color: "#828282",
    fontFamily: "Pretendard",
  },
  section: {
    flex: 1,
    paddingTop: rs(16),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "600",
    color: "#272828",
    fontFamily: "Pretendard",
    marginBottom: rs(12),
  },
  loader: {
    marginTop: rs(20),
  },
  errorText: {
    color: "#e74c3c",
    fontSize: rs(14),
    textAlign: "center",
    marginTop: rs(20),
  },
  emptyText: {
    color: "#828282",
    fontSize: rs(14),
    textAlign: "center",
    marginTop: rs(20),
  },
  favoriteItem: {
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  storeName: {
    fontSize: rs(15),
    fontWeight: "600",
    color: "#272828",
    fontFamily: "Pretendard",
  },
  storeCategory: {
    fontSize: rs(13),
    color: "#828282",
    fontFamily: "Pretendard",
    marginTop: rs(4),
  },
});
