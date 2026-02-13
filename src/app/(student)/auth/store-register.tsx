import { ArrowLeft } from "@/src/shared/common/arrow-left";
import { ThemedText } from "@/src/shared/common/themed-text";
import { useSignupStore } from "@/src/shared/stores/signup-store";
import { rs } from "@/src/shared/theme/scale";
import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoreRegisterPage() {
  const router = useRouter();
  const { storeName, storeAddress, setSignupFields } = useSignupStore();

  // 직접 입력 필드는 로컬 state로 관리 후 등록하기 시 zustand에 저장
  const [localName, setLocalName] = useState(storeName);
  const [branchName, setBranchName] = useState("");
  const [localAddress, setLocalAddress] = useState(storeAddress);
  const [detailAddress, setDetailAddress] = useState("");

  const handleRegister = () => {
    const fullAddress = detailAddress
      ? `${localAddress} ${detailAddress}`.trim()
      : localAddress;

    setSignupFields({
      storeName: branchName ? `${localName} ${branchName}`.trim() : localName,
      storeAddress: fullAddress,
    });

    router.canGoBack() ? router.back() : router.replace("/auth");
  };

  const isValid = localName.trim().length > 0 && localAddress.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <ArrowLeft onPress={() => router.canGoBack() ? router.back() : router.replace("/auth")} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 타이틀 */}
          <View style={styles.titleContainer}>
            <ThemedText style={styles.titleText}>
              안녕하세요 사장님 !{"\n"}가게 정보를 입력해주세요!
            </ThemedText>
            <ThemedText style={styles.subtitleText}>
              지도에 등록되지않은 가게 정보를 입력해주세요{"\n"}
              내 가게가 있다면 클릭하고 없다면 직접 입력해주세요
            </ThemedText>
          </View>

          {/* 입력 폼 */}
          <View style={styles.formContainer}>
            <ThemedText style={styles.sectionTitle}>가게명/주소</ThemedText>
            <View style={styles.descriptionRow}>
              <ThemedText style={styles.descriptionText}>
                가게명과 주소를 정확히 입력해주세요
              </ThemedText>
              <ThemedText style={styles.descriptionText}>
                네이버맵 기준 가게명으로 설정해주세요
              </ThemedText>
            </View>

            <View style={styles.inputList}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="가게명 *"
                  placeholderTextColor="#828282"
                  value={localName}
                  onChangeText={setLocalName}
                />
              </View>

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="가게 지점명"
                  placeholderTextColor="#828282"
                  value={branchName}
                  onChangeText={setBranchName}
                />
              </View>

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="가게 주소 *"
                  placeholderTextColor="#828282"
                  value={localAddress}
                  onChangeText={setLocalAddress}
                />
              </View>

              <View style={styles.detailInputBox}>
                <TextInput
                  style={styles.detailTextInput}
                  placeholder="상세주소를 입력해주세요 (예: 4층, 405호)"
                  placeholderTextColor="#D0D0D0"
                  value={detailAddress}
                  onChangeText={setDetailAddress}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.registerButton, !isValid && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={!isValid}
          >
            <ThemedText style={styles.registerButtonText}>등록하기</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// useState import 누락 방지
import { useState } from "react";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(10),
    backgroundColor: "white",
  },
  scrollContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(120),
  },
  titleContainer: {
    marginTop: rs(20),
    marginBottom: rs(40),
    gap: rs(10),
  },
  titleText: {
    fontSize: rs(20),
    fontWeight: "700",
    color: "black",
    fontFamily: "Pretendard",
    lineHeight: rs(30),
  },
  subtitleText: {
    fontSize: rs(14),
    fontWeight: "600",
    color: "#A6A6A6",
    fontFamily: "Pretendard",
    lineHeight: rs(19.6),
  },
  formContainer: {
    marginBottom: rs(20),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "700",
    color: "#272828",
    fontFamily: "Pretendard",
    lineHeight: rs(22.4),
    marginBottom: rs(5),
  },
  descriptionRow: {
    gap: rs(2),
    marginBottom: rs(20),
  },
  descriptionText: {
    fontSize: rs(10),
    color: "#828282",
    fontFamily: "Inter",
    lineHeight: rs(14),
  },
  inputList: {
    gap: rs(10),
  },
  inputBox: {
    height: rs(40),
    backgroundColor: "white",
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: rs(16),
  },
  textInput: {
    fontSize: rs(14),
    color: "black",
    fontFamily: "Pretendard",
    padding: 0,
  },
  detailInputBox: {
    height: rs(40),
    backgroundColor: "#ECECEC",
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: rs(16),
  },
  detailTextInput: {
    fontSize: rs(14),
    color: "black",
    fontFamily: "Pretendard",
    padding: 0,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: rs(34),
    left: 0,
    right: 0,
    paddingHorizontal: rs(24),
  },
  registerButton: {
    width: "100%",
    height: rs(40),
    backgroundColor: "#40CE2B",
    borderRadius: rs(8),
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonDisabled: {
    backgroundColor: "#D9D9D9",
  },
  registerButtonText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: "white",
    fontFamily: "Pretendard",
  },
});
