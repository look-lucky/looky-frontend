import { AppButton } from "@/src/shared/common/app-button";
import { ThemedText } from "@/src/shared/common/themed-text";
import { rs } from "@/src/shared/theme/scale";
import { Brand, Gray, Text as TextColors } from "@/src/shared/theme/theme";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Polyline } from "react-native-svg";

// ============================================
// 약관 내용
// ============================================

const TERMS_CONTENT = `제1조 (목적)
본 약관은 루키(LOOKY)(이하 "운영자")가 제공하는 루키(LOOKY) 서비스(이하 "서비스")의 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.

"서비스"란 운영자가 제공하는 대학생 대상 하이퍼로컬 혜택 지도 플랫폼으로, 제휴 매장 정보, 실시간 이벤트 정보, 위치기반 혜택 탐색, 커뮤니티 등의 기능을 포함합니다.

"회원"란 본 약관에 동의하고 운영자와 서비스 이용계약을 체결한 자를 말합니다.

"학생 회원"이란 대학교 재학생 신분으로 서비스를 이용하는 회원을 말합니다.

"파트너 회원"이란 제휴 매장, 소상공인 등 혜택 정보를 등록하고 관리하는 사업자 회원을 말합니다.

"제휴 혜택"이란 학생회 제휴, 파트너 회원이 제공하는 할인, 이벤트 등의 혜택을 말합니다.

"실시간 이벤트"란 팝업스토어, 플리마켓, 홍보 부스, 버스킹 등 일시적으로 진행되는 현장 이벤트 정보를 말합니다.

"파트너 센터"란 파트너 회원이 혜택 정보를 등록, 수정, 관리할 수 있는 관리 시스템을 말합니다.

제3조 (약관의 효력 및 변경)
본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.

운영자는 필요하다고 인정되는 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.

운영자가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 공지합니다. 다만, 회원에게 불리한 약관 변경의 경우에는 30일 전부터 공지하며, 이메일, 앱 푸시, SMS 등의 방법으로 개별 통지합니다.

회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 거부 의사를 표시하지 않고 서비스를 계속 이용할 경우 변경된 약관에 동의한 것으로 간주합니다.

제4조 (계정 관련)
1. 회원가입 및 계정 생성

가입 연령 제한: 본 서비스는 만 14세 이상의 이용자에 한하여 가입이 가능합니다. 운영자는 서비스 가입 단계에서 생년월일 확인 등을 통해 만 14세 미만 아동의 가입을 기술적으로 제한하고 있습니다.

서비스 대상: 본 서비스는 대학생 전용 혜택 제공을 목적으로 하므로, 만 14세 이상이더라도 대학교 인증(이메일 또는 학생증)이 불가능한 경우 서비스 이용이 제한될 수 있습니다.

회원가입: 이용자는 운영자가 정한 가입 양식에 따라 아이디, 비밀번호 및 필요한 회원 정보를 입력하고 본 약관에 동의함으로써 가입을 신청합니다.

본인 인증 및 승인:
학생 회원: 대학교 이메일 인증을 통해 학생 신분을 인증합니다.
파트너 회원(점주): 이메일 인증 및 사업자등록증 확인 후 운영자의 최종 승인을 통해 가입이 완료됩니다.

2. 계정 관리 의무: 회원은 자신의 아이디와 비밀번호를 안전하게 관리할 책임이 있으며, 이를 타인에게 양도하거나 대여할 수 없습니다. 관리 소홀로 발생하는 불이익은 회원 본인이 부담합니다.

3. 가입 거절: 타인 명의 도용, 허위 정보 입력, 과거 위반 이력 등이 있는 경우 가입 승인을 하지 않거나 사후에 해지할 수 있습니다.

4. 계정 생성이 거부되는 경우:
- 다른 사람의 명의나 휴대전화 번호, 학교 이메일 등 개인정보를 이용하여 계정을 생성하려 한 경우
- 계정 생성 시 필요한 정보를 입력하지 않거나 허위 정보를 입력한 경우
- 운영자가 과거에 운영정책 또는 법률 위반 등의 정당한 사유로 삭제 또는 징계한 회원과 동일한 이용자로 판단할 수 있는 경우

제5조 (개인정보 보호)
개인정보는 서비스의 원활한 제공을 위하여 이용자가 동의한 목적과 범위 내에서만 이용됩니다. 개인정보 보호 관련 기타 상세한 사항은 회사의 개인정보처리방침을 참고하시기 바랍니다.

제6조 (위치정보의 수집 및 이용)
운영자는 회원에게 하이퍼로컬 혜택 정보를 제공하기 위해 위치기반서비스를 제공하며, 이를 위해 회원의 위치정보를 수집합니다.

회원은 위치정보 수집에 대한 동의를 거부할 수 있으나, 이 경우 서비스의 핵심 기능(주변 혜택 지도, 실시간 이벤트 등) 이용이 제한될 수 있습니다.

운영자는 수집한 위치정보를 회원이 요청한 서비스 제공 목적 외의 용도로 이용하지 않으며, 회원의 동의 없이 제3자에게 제공하지 않습니다.

제7조 (운영자의 의무)
운영자는 관련 법령과 본 약관을 준수하며, 계속적이고 안정적인 서비스 제공을 위해 최선을 다합니다.

운영자는 회원의 개인정보 보호를 위해 보안시스템을 구축하고 개인정보처리방침을 공시하고 준수합니다.

제8조 (회원의 의무)
회원은 다음 각 호의 행위를 하여서는 안 됩니다.

1. 신청 또는 변경 시 허위 내용의 등록
2. 타인의 정보 도용
3. 운영자가 게시한 정보의 무단 변경
4. 운영자 또는 제3자의 저작권 등 지적재산권에 대한 침해
5. 운영자 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위
6. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위
7. 허위 혜택 정보를 유포하는 행위
8. 서비스를 영리 목적으로 이용하는 행위(파트너 회원의 정상적인 사업 활동 제외)

제9조 (서비스의 제공 및 변경)
운영자는 다음과 같은 서비스를 제공합니다.
1. 하이퍼로컬 제휴 혜택 지도 서비스
2. 실시간 이벤트 정보 제공
3. 제휴 매장 및 혜택 검색 기능
4. 캠퍼스 커뮤니티 서비스
5. 파트너 센터(파트너 회원 대상)

제10조 (서비스의 중단)
운영자는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
1. 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우
2. 정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우
3. 국가비상사태, 천재지변 등 불가항력적 사유가 있는 경우

제11조 (제휴 혜택 정보의 제공)
운영자는 제휴 매장 및 파트너 회원이 제공하는 혜택 정보를 지도 기반으로 회원에게 제공합니다.

제12조 (파트너 회원(점주)의 권리와 의무)
파트너 회원(점주)은 파트너 센터를 통해 제휴 혜택 및 이벤트 정보를 등록, 수정, 삭제할 수 있습니다.

제13조 (데이터베이스에 대한 보호)
루키에서 제공되는 모든 콘텐츠 및 데이터에 대하여 아래 행위들은 금지됩니다.
1. 운영자의 명시적인 사전 서면 동의 없이 자동화된 도구를 활용하여 데이터 수집·복제·저장 등을 하는 행위
2. 운영자의 명시적인 사전 서면 동의 없이 기계 학습, 인공지능 모델 학습 목적으로 콘텐츠를 이용하는 행위

제14조 (게시물의 저작권 보호)
서비스 이용자가 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.

제15조 (게시물의 관리)
운영자는 관련 법령에 위반되거나 운영 정책에 어긋나는 게시물에 대해 게시중단 및 삭제 등의 조치를 취할 수 있습니다.

제16조 (사용권리)
운영자는 이용자에게 서비스 이용에 필요한 무상의 라이선스를 제공하나, 루키 상표 및 로고를 사용할 권리를 부여하는 것은 아닙니다.

제17조 (아동의 개인정보 보호)
운영자는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 만 14세 미만 아동의 가입을 원천적으로 차단하는 기술적 조치를 취하고 있습니다.

제18조 (서비스 고지 및 홍보내용 표시)
운영자는 서비스 이용과 관련된 각종 고지 및 홍보 정보를 앱 내에 표시하거나 이메일 등으로 발송할 수 있습니다.

제19조 (유료서비스)
운영자는 향후 일부 기능이나 콘텐츠를 유료로 제공할 수 있습니다.

제20조 (이용계약 해지 및 서비스 탈퇴)
이용자는 언제든지 서비스 내 메뉴를 통해 탈퇴 신청을 할 수 있습니다.

제21조 (분쟁 조정)
운영자는 이용자 간 분쟁 해결을 위해 노력하며, 적법한 절차에 따른 관계 기관의 요청 시 관련 자료를 제출할 수 있습니다.

제22조 (책임제한)
운영자는 법령상 허용되는 한도 내에서 서비스를 있는 그대로 제공할 뿐입니다.

제23조 (손해배상)
운영자의 과실로 인해 이용자가 손해를 입은 경우 법령에 따라 배상합니다.

제24조 (면책조항)
천재지변, 불가항력, 회원의 귀책사유로 인한 서비스 이용 장애 등에 대해서는 운영자의 책임이 면제됩니다.

제25조 (회원에 대한 통지)
운영자는 이메일, 전화번호 또는 공지사항 게시를 통해 회원에게 주요 사항을 통지합니다.

제26조 (이용자 의견)
이용자는 언제든지 고객센터를 통해 의견을 개진할 수 있으며, 운영자는 이를 소중히 검토합니다.

제27조 (분쟁의 해결)
운영자와 회원 간 분쟁 발생 시 성실히 협의하여 해결하며, 해결되지 않을 경우 대한민국 법률에 따라 관할 법원에서 소송을 진행합니다.

부칙
시행일: 본 약관은 2026년 2월 8일부터 시행됩니다.

[문의처]
상호: 루키팀
이메일: neardeals2@gmail.com`;

const PRIVACY_CONTENT = `루키(LOOKY) 개인정보처리방침

루키팀(이하 "운영자")은 이용자의 개인정보를 중요시하며, 개인정보 보호법 등 관련 법령을 준수합니다.

제1조 (수집하는 개인정보 항목)
운영자는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

필수 수집 항목:
- 학생 회원: 이메일(학교 이메일), 비밀번호, 닉네임, 성별, 생년월일, 학교명, 단과대학명, 학과명
- 소셜 로그인 회원: 소셜 계정 고유 식별자, 닉네임, 성별, 생년월일, 학교명, 단과대학명, 학과명
- 파트너 회원: 이메일, 비밀번호, 상호명, 사업자등록번호, 대표자명, 연락처, 매장 주소

자동 수집 항목:
- 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP, 기기 정보(OS, 앱 버전)
- 위치정보(서비스 이용 시 일시적으로 수집, 저장하지 않음)

제2조 (개인정보의 수집 및 이용 목적)
운영자는 다음의 목적으로 개인정보를 수집·이용합니다.

1. 서비스 제공 및 계약 이행: 회원가입, 본인 확인, 서비스 이용, 콘텐츠 제공
2. 회원 관리: 회원제 서비스 운영, 불량회원 차단, 분쟁 조정, 고지사항 전달
3. 서비스 개선 및 신규 서비스 개발: 통계 분석, 맞춤형 서비스 제공
4. 마케팅 및 광고 활용(선택): 이벤트 안내, 혜택 정보 발송

제3조 (개인정보의 보유 및 이용 기간)
원칙적으로 개인정보 수집 및 이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다.

단, 관계 법령에 따라 보존할 필요가 있는 경우 다음과 같이 보관합니다.
- 계약 또는 청약철회 기록: 5년 (전자상거래법)
- 소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)
- 로그인 기록: 3개월 (통신비밀보호법)

탈퇴 시 처리:
- 이메일, 닉네임, 학교 정보, 성별, 생년월일 등 식별 가능한 정보는 즉시 파기
- 탈퇴 후 14일 이내 재가입 차단을 위해 이메일의 단방향 해시값(SHA-256)만 14일간 보관 후 삭제

제4조 (개인정보의 제3자 제공)
운영자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.

제5조 (개인정보 처리의 위탁)
운영자는 서비스 향상을 위해 필요한 경우 개인정보 처리를 외부에 위탁할 수 있으며, 이 경우 관련 법령에 따라 안전하게 관리합니다.

제6조 (이용자의 권리)
이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
- 개인정보 열람 요청
- 오류 등이 있을 경우 정정 요청
- 삭제 요청
- 처리 정지 요청

제7조 (개인정보의 파기 절차 및 방법)
이용자의 개인정보는 목적 달성 후 즉시 파기됩니다.
- 전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제
- 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각

제8조 (개인정보 보호책임자)
이메일: neardeals2@gmail.com

[시행일] 본 방침은 2026년 2월 8일부터 시행됩니다.`;

// ============================================
// Icons
// ============================================

function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 1.5C5.3 1.5 1.5 5.3 1.5 10S5.3 18.5 10 18.5 18.5 14.7 18.5 10 14.7 1.5 10 1.5z"
        stroke={checked ? Brand.primary : Gray.gray5}
        strokeWidth={1.5}
        fill={checked ? Brand.primary : "none"}
      />
      <Polyline
        points="6.5,10 9,12.5 13.5,7.5"
        stroke={checked ? Gray.white : Gray.gray5}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={rs(16)} height={rs(16)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={Gray.gray5}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronLeftIcon() {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={Gray.gray7}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================
// Terms Detail Modal (약관 상세)
// ============================================

type TermsType = "terms" | "privacy";

function TermsDetailModal({
  visible,
  type,
  onClose,
}: {
  visible: boolean;
  type: TermsType;
  onClose: () => void;
}) {
  const title = type === "terms" ? "서비스 이용약관" : "개인정보처리방침";
  const content = type === "terms" ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={detailStyles.container} edges={["top", "bottom"]}>
        <View style={detailStyles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={detailStyles.title}>
            {title}
          </ThemedText>
          <View style={{ width: rs(20) }} />
        </View>
        <ScrollView
          style={detailStyles.scrollView}
          contentContainerStyle={detailStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={detailStyles.contentText}>{content}</ThemedText>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Gray.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(24),
    paddingVertical: rs(16),
  },
  title: {
    fontSize: rs(16),
    color: TextColors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: rs(24),
    paddingBottom: rs(40),
  },
  contentText: {
    color: TextColors.secondary,
    fontSize: rs(13),
    lineHeight: rs(22),
  },
});

// ============================================
// Agree Modal (동의 메인)
// ============================================

type AgreeModalProps = {
  visible: boolean;
  onAgree: () => void;
  onClose: () => void;
};

export function AgreeModal({ visible, onAgree, onClose }: AgreeModalProps) {
  const insets = useSafeAreaInsets();
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [detailModal, setDetailModal] = useState<TermsType | null>(null);

  const allChecked = termsChecked && privacyChecked && ageChecked;

  const toggleAll = () => {
    const next = !allChecked;
    setTermsChecked(next);
    setPrivacyChecked(next);
    setAgeChecked(next);
  };

  const handleAgree = () => {
    if (!allChecked) return;
    onAgree();
  };

  const handleClose = () => {
    Alert.alert(
      "회원가입 취소",
      "회원가입을 그만두시겠어요?",
      [
        { text: "계속하기", style: "cancel" },
        { text: "그만두기", style: "destructive", onPress: onClose },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + rs(16) }]}>
            <View style={styles.handle} />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ChevronLeftIcon />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ThemedText type="subtitle" style={styles.title}>
              <ThemedText type="subtitle" lightColor={Brand.primary}>
                루키
              </ThemedText>
              {" "}이용을 위해 동의가 필요해요
            </ThemedText>

            {/* 전체 동의 */}
            <TouchableOpacity style={styles.allAgreeBox} onPress={toggleAll} activeOpacity={0.8}>
              <CheckIcon checked={allChecked} />
              <View style={styles.allAgreeTextBox}>
                <ThemedText type="defaultSemiBold" style={styles.allAgreeTitle}>
                  전체 동의
                </ThemedText>
                <ThemedText style={styles.allAgreeDesc}>
                  서비스 이용에 필수적인 최소한의 개인정보 수집 및 이용, 본인확인, 위치정보 수집 및 이용, 광고성 정보 수신(선택) 및 마케팅 정보 수신(선택) 동의를 포함합니다
                </ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* 서비스 이용약관 */}
            <View style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemLeft}
                onPress={() => setTermsChecked((v) => !v)}
                activeOpacity={0.8}
              >
                <CheckIcon checked={termsChecked} />
                <ThemedText style={styles.itemLabel}>
                  <ThemedText style={styles.required}>(필수) </ThemedText>
                  서비스 이용약관
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDetailModal("terms")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRightIcon />
              </TouchableOpacity>
            </View>

            {/* 개인정보 수집 및 이용 */}
            <View style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemLeft}
                onPress={() => setPrivacyChecked((v) => !v)}
                activeOpacity={0.8}
              >
                <CheckIcon checked={privacyChecked} />
                <ThemedText style={styles.itemLabel}>
                  <ThemedText style={styles.required}>(필수) </ThemedText>
                  개인정보 수집 및 이용
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDetailModal("privacy")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ChevronRightIcon />
              </TouchableOpacity>
            </View>

            {/* 만 14세 이상 */}
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => setAgeChecked((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={styles.itemLeft}>
                <CheckIcon checked={ageChecked} />
                <ThemedText style={styles.itemLabel}>
                  <ThemedText style={styles.required}>(필수) </ThemedText>
                  만 14세 이상입니다
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottom}>
            <AppButton
              label="회원가입"
              backgroundColor={allChecked ? Brand.primary : Gray.gray5}
              onPress={handleAgree}
              disabled={!allChecked}
            />
          </View>
          </View>
        </View>
      </Modal>

      {/* 약관 상세 모달 */}
      {detailModal && (
        <TermsDetailModal
          visible={!!detailModal}
          type={detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: Gray.white,
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
  },
  handle: {
    width: rs(40),
    height: rs(4),
    backgroundColor: Gray.gray4,
    borderRadius: rs(2),
    alignSelf: "center",
    marginTop: rs(12),
    marginBottom: rs(4),
  },
  header: {
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
  },
  content: {
    paddingHorizontal: rs(24),
    paddingTop: rs(8),
    gap: rs(20),
  },
  title: {
    color: TextColors.primary,
    lineHeight: rs(34),
  },
  allAgreeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(12),
    paddingVertical: rs(16),
    paddingHorizontal: rs(16),
    backgroundColor: Gray.gray2,
    borderRadius: rs(12),
  },
  allAgreeTextBox: {
    flex: 1,
    gap: rs(4),
  },
  allAgreeTitle: {
    color: TextColors.primary,
    fontSize: rs(15),
  },
  allAgreeDesc: {
    color: TextColors.secondary,
    fontSize: rs(11),
    lineHeight: rs(16),
  },
  divider: {
    height: 1,
    backgroundColor: Gray.gray3,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: rs(4),
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    flex: 1,
  },
  itemLabel: {
    color: TextColors.primary,
    fontSize: rs(14),
  },
  required: {
    color: TextColors.secondary,
    fontSize: rs(14),
  },
  bottom: {
    paddingHorizontal: rs(24),
    paddingTop: rs(24),
  },
});
