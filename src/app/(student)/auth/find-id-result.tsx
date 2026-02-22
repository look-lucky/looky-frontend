import LookyLogo from "@/assets/images/logo/looky-logo.svg";
import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FindIdResultPage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.replace("/auth/find-id")} />
      </View>

      <View style={styles.content}>
        <LookyLogo width={169} height={57} />

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => router.replace("/auth/find-id")}>
            <Text style={[styles.tabText, styles.tabActive]}>아이디찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => router.replace("/auth/find-password")}>
            <Text style={styles.tabText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>가입하신 아이디</Text>
          <Text style={styles.resultUsername}>{username || "-"}</Text>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => router.replace("/auth/find-password")}
        >
          <Text style={styles.outlineButtonText}>비밀번호 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.replace("/auth/sign-in")}
        >
          <Text style={styles.primaryButtonText}>로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#272828",
  },
  tabActive: {
    color: "#40ce2b",
  },
  divider: {
    width: 1,
    height: 25,
    backgroundColor: "#e6e6e6",
    marginHorizontal: 20,
  },
  resultBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: "#828282",
    fontFamily: "Pretendard",
  },
  resultUsername: {
    fontSize: 18,
    fontWeight: "700",
    color: "#272828",
    fontFamily: "Pretendard",
  },
  bottomButtons: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#40ce2b",
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#40ce2b",
    fontFamily: "Pretendard",
  },
  primaryButton: {
    backgroundColor: "#40ce2b",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },
});
