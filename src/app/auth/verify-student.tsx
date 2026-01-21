import { ArrowLeft } from "@/src/components/button/arrow-left";
import { rs } from "@/src/theme/scale";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type SheetType = "college" | "major";

export default function VerifyStudentPage() {
  const router = useRouter();
  const { nickname } = useLocalSearchParams<{ nickname?: string }>();
  const displayName = (nickname?.trim() || "사용자") as string;

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // UI용 타이머(실제 로직 붙이기 전 임시)
  const [timeLeft, setTimeLeft] = useState("04:55");

  const [college, setCollege] = useState<string>("");
  const [major, setMajor] = useState<string>("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<SheetType>("college");

  const colleges = useMemo(
    () => [
      "경상대학",
      "공과대학",
      "환경생명자원대학",
      "인문대학",
      "사회과학대학",
    ],
    [],
  );

  const majors = useMemo(
    () => ["경영학과", "경제학과", "컴퓨터공학과", "산업공학과", "전자공학과"],
    [],
  );

  const openSheet = (type: SheetType) => {
    setSheetType(type);
    setSheetOpen(true);
  };
  const closeSheet = () => setSheetOpen(false);

  const list = sheetType === "college" ? colleges : majors;
  const selected = sheetType === "college" ? college : major;

  const selectItem = (value: string) => {
    if (sheetType === "college") {
      setCollege(value);
      setMajor("");
    } else {
      setMajor(value);
    }
    closeSheet();
  };

  const canRequestCode = email.trim().length > 0; // 나중에 이메일 정규식으로 강화
  const canOpenMajor = !!college;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        {/* Header */}
        <View style={styles.header}>
          <ArrowLeft onPress={() => router.back()} />
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{`(${displayName}) 님이시네요 !`}</Text>
          <Text style={styles.desc}>학생 인증을 위한 정보를 기입해주세요.</Text>
        </View>

        {/* Email */}
        <Text style={styles.sectionTitle}>대학 이메일 인증</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="학생인증을 위한 메일을 입력해주세요"
              placeholderTextColor="#828282"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <Pressable
              onPress={() => {
                if (!canRequestCode) return;
                // TODO: 이메일로 인증번호 요청 API 연결
                // setTimeLeft("05:00");
              }}
              disabled={!canRequestCode}
              style={[
                styles.innerButton,
                { backgroundColor: canRequestCode ? "#d5d5d5" : "#eeeeee" },
              ]}
            >
              <Text style={styles.innerButtonText}>인증번호 받기</Text>
            </Pressable>
          </View>
        </View>

        {/* Code */}
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="인증번호"
              placeholderTextColor="#828282"
              keyboardType="number-pad"
              style={styles.input}
            />
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>

        {/* College */}
        <Text style={[styles.sectionTitle, { marginTop: rs(18) }]}>
          단과대학 선택
        </Text>
        <Pressable
          onPress={() => openSheet("college")}
          style={styles.selectBox}
        >
          <Text style={[styles.selectText, !college && styles.placeholderText]}>
            {college || "단과대학을 선택해주세요"}
          </Text>
        </Pressable>

        {/* Major */}
        <Text style={[styles.sectionTitle, { marginTop: rs(18) }]}>
          학과 선택
        </Text>
        <Pressable
          onPress={() => openSheet("major")}
          style={[styles.selectBox, !canOpenMajor && { opacity: 0.5 }]}
          disabled={!canOpenMajor}
        >
          <Text style={[styles.selectText, !major && styles.placeholderText]}>
            {major || "학과를 선택해주세요"}
          </Text>
        </Pressable>

        {/* BottomSheet (Modal) */}
        <Modal
          transparent
          visible={sheetOpen}
          animationType="slide"
          onRequestClose={closeSheet}
        >
          <Pressable style={styles.dim} onPress={closeSheet} />

          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {sheetType === "college" ? "단과대학" : "학과"}
            </Text>

            <FlatList
              data={list}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.sheetList}
              renderItem={({ item }) => {
                const isSelected = item === selected;
                return (
                  <Pressable
                    onPress={() => selectItem(item)}
                    style={styles.sheetItem}
                  >
                    <Text
                      style={[
                        styles.sheetItemText,
                        isSelected && styles.sheetItemSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Pressable onPress={closeSheet} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>닫기</Text>
            </Pressable>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  inner: { flex: 1, paddingHorizontal: rs(24) },

  header: {
    paddingVertical: rs(12),
    alignItems: "flex-start",
  },

  titleWrap: { marginTop: rs(12), marginBottom: rs(18) },
  title: {
    fontSize: rs(22),
    fontWeight: "800",
    color: "#111111",
    fontFamily: "Pretendard",
  },
  desc: {
    marginTop: rs(8),
    fontSize: rs(14),
    color: "#9B9B9B",
    fontFamily: "Pretendard",
  },

  sectionTitle: {
    marginTop: rs(8),
    marginBottom: rs(10),
    fontSize: rs(16),
    fontWeight: "700",
    color: "#111111",
    fontFamily: "Pretendard",
  },

  inputGroup: { marginBottom: rs(12) },

  // SignupInfoPage 패턴 그대로
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    height: rs(40),
    gap: rs(8),
  },
  input: {
    flex: 1,
    fontSize: rs(14),
    color: "#272828",
    fontFamily: "Pretendard",
    paddingVertical: 0, // Android 중앙정렬 안정화
  },

  innerButton: {
    paddingHorizontal: rs(12),
    height: rs(28),
    borderRadius: rs(8),
    justifyContent: "center",
    alignItems: "center",
  },
  innerButtonText: {
    fontSize: rs(12),
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "Pretendard",
  },

  timerText: {
    fontSize: rs(14),
    fontWeight: "700",
    color: "#40ce2b",
    fontFamily: "Pretendard",
  },

  selectBox: {
    height: rs(40),
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  selectText: {
    fontSize: rs(14),
    color: "#272828",
    fontFamily: "Pretendard",
  },
  placeholderText: { color: "#828282" },

  dim: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    backgroundColor: "#FFFFFF",
    paddingTop: rs(14),
    paddingBottom: rs(18),
    paddingHorizontal: rs(20),
    borderTopLeftRadius: rs(18),
    borderTopRightRadius: rs(18),
  },
  sheetTitle: {
    textAlign: "center",
    fontSize: rs(16),
    fontWeight: "800",
    color: "#111111",
    fontFamily: "Pretendard",
    marginBottom: rs(10),
  },
  sheetList: { paddingBottom: rs(10) },
  sheetItem: { paddingVertical: rs(14), alignItems: "center" },
  sheetItemText: {
    fontSize: rs(16),
    color: "#222222",
    fontFamily: "Pretendard",
  },
  sheetItemSelected: { color: "#40ce2b", fontWeight: "800" },

  closeBtn: {
    marginTop: rs(6),
    height: rs(52),
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  closeBtnText: {
    fontSize: rs(16),
    fontWeight: "800",
    color: "#111111",
    fontFamily: "Pretendard",
  },
});
