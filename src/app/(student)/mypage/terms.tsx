import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TERMS_DATA = [
  {
    title: "1. 서비스 이용약관",
    items: [
      { id: 't1-1', title: '제1조 (목적)', content: '본 약관은 루키(LOOKY)(이하 "운영자")가 제공하는 루키(LOOKY) 서비스(이하 "서비스")의 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.' },
      { id: 't1-2', title: '제2조 (용어의 정의)', content: '본 약관에서 사용하는 주요 용어의 정의는 다음과 같습니다.\n\n"서비스"란 운영자가 제공하는 대학생 대상 하이퍼로컬 혜택 지도 플랫폼으로, 제휴 매장 정보, 실시간 이벤트 정보, 위치기반 혜택 탐색, 커뮤니티 등의 기능을 포함합니다.\n\n"회원"란 본 약관에 동의하고 운영자와 서비스 이용계약을 체결한 자를 말합니다.\n\n"학생 회원"이란 대학교 재학생 신분으로 서비스를 이용하는 회원을 말합니다.\n\n"파트너 회원"이란 제휴 매장, 소상공인 등 혜택 정보를 등록하고 관리하는 사업자 회원을 말합니다.\n\n"제휴 혜택"이란 학생회 제휴, 파트너 회원이 제공하는 할인, 이벤트 등의 혜택을 말합니다.\n\n"실시간 이벤트"란 팝업스토어, 플리마켓, 홍보 부스, 버스킹 등 일시적으로 진행되는 현장 이벤트 정보를 말합니다.\n\n"파트너 센터"란 파트너 회원이 혜택 정보를 등록, 수정, 관리할 수 있는 관리 시스템을 말합니다.' },
      { id: 't1-3', title: '제3조 (약관의 효력 및 변경)', content: '본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n\n운영자는 필요하다고 인정되는 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.\n\n운영자가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 공지합니다. 다만, 회원에게 불리한 약관 변경의 경우에는 30일 전부터 공지하며, 이메일, 앱 푸시, SMS 등의 방법으로 개별 통지합니다.\n\n회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 거부 의사를 표시하지 않고 서비스를 계속 이용할 경우 변경된 약관에 동의한 것으로 간주합니다.' },
      { id: 't1-4', title: '제4조 (계정 관련)', content: '1. 회원가입 및 계정 생성\n\n가입 연령 제한: 본 서비스는 만 15세 이상의 이용자에 한하여 가입이 가능합니다. 운영자는 서비스 가입 단계에서 생년월일 확인 등을 통해 만 15세 미만 아동의 가입을 기술적으로 제한하고 있습니다.\n\n서비스 대상: 본 서비스는 대학생 전용 혜택 제공을 목적으로 하므로, 만 15세 이상이더라도 대학교 인증(이메일 또는 학생증)이 불가능한 경우 서비스 이용이 제한될 수 있습니다.\n\n회원가입: 이용자는 운영자가 정한 가입 양식에 따라 아이디, 비밀번호 및 필요한 회원 정보를 입력하고 본 약관에 동의함으로써 가입을 신청합니다.\n\n본인 인증 및 승인:\n학생 회원: 대학교 이메일 인증을 통해 학생 신분을 인증합니다.\n파트너 회원(점주): 이메일 인증 및 사업자등록증 확인 후 운영자의 최종 승인을 통해 가입이 완료됩니다.\n\n2. 계정 관리 의무: 회원은 자신의 아이디와 비밀번호를 안전하게 관리할 책임이 있으며, 이를 타인에게 양도하거나 대여할 수 없습니다. 관리 소홀로 발생하는 불이익은 회원 본인이 부담합니다.\n\n3. 가입 거절: 타인 명의 도용, 허위 정보 입력, 과거 위반 이력 등이 있는 경우 가입 승인을 하지 않거나 사후에 해지할 수 있습니다.\n\n4. 계정 생성이 거부되는 경우: 아래의 경우에는 계정 생성 및 로그인을 승인하지 않을 수 있습니다.\n- 다른 사람의 명의나 휴대전화 번호, 학교 이메일 등 개인정보를 이용하여 계정을 생성하려 한 경우\n- 계정 생성 시 필요한 정보를 입력하지 않거나 허위 정보를 입력한 경우\n- 운영자가 과거에 운영정책 또는 법률 위반 등의 정당한 사유로 삭제 또는 징계한 회원과 동일한 이용자로 판단할 수 있는 경우\n\n5. 계정 이용 원칙: 회원 계정에 로그인이 있는 경우 특별한 사정이 없는 한 해당 회원이 로그인한 것으로 보며, 로그인 상태에서 행해진 게시물 게재 등의 다양한 활동 역시 특별한 사정이 없는 한 해당 회원의 서비스 이용으로 간주됩니다.\n\n6. 이용 자격 및 연령:\n① 본 서비스는 만 15세 이상의 대학생(재학생, 휴학생 등 대학 이메일 등 대학생 인증이 가능한 자)에 한하여 가입 및 이용이 가능합니다.\n② 운영자는 서비스의 성격상 이용자의 신분을 확인하기 위해 학교 이메일 인증 등의 절차를 요구할 수 있으며, 이에 응하지 않거나 대학생 신분이 아님이 확인될 경우 가입 승인을 거절하거나 이용을 제한할 수 있습니다.\n③ 만 15세 미만 아동의 가입은 엄격히 금지되며, 발견 시 지체 없이 계정이 삭제됩니다.' },
      { id: 't1-5', title: '제5조 (개인정보 보호)', content: '개인정보는 서비스의 원활한 제공을 위하여 이용자가 동의한 목적과 범위 내에서만 이용됩니다. 개인정보 보호 관련 기타 상세한 사항은 회사의 개인정보처리방침을 참고하시기 바랍니다.' },
      { id: 't1-6', title: '제6조 (위치정보의 수집 및 이용)', content: '1. 위치정보 서비스 제공\n\n운영자는 회원에게 하이퍼로컬 혜택 정보를 제공하기 위해 위치기반서비스를 제공하며, 이를 위해 회원의 위치정보를 수집합니다.\n\n운영자는 단말기의 설정 상태에 따라, 회원이 앱을 구동하거나 사용하는 특정 시점 혹은 회원이 앱 내 특정 서비스를 활성화하거나 학교 인증 등의 액션을 하는 시점에, 위치정보사업자로부터 위치정보를 위경도 좌표의 형식으로 직접 전달받거나, 특정 게시물 또는 이용자가 저장하는 콘텐츠에 포함된 위치정보를 수집할 수 있습니다.\n\n회원은 위치정보 수집에 대한 동의를 거부할 수 있으나, 이 경우 서비스의 핵심 기능(주변 혜택 지도, 실시간 이벤트 등) 이용이 제한될 수 있습니다.\n\n운영자는 수집한 위치정보를 회원이 요청한 서비스 제공 목적 외의 용도로 이용하지 않으며, 회원의 동의 없이 제3자에게 제공하지 않습니다.\n\n2. 위치정보를 활용한 서비스:\n주변 혜택 지도: 회원의 위치를 기반으로 주변 제휴 매장 및 혜택 정보를 지도에 표시\n실시간 이벤트 알림: 회원 위치 주변에서 진행 중인 이벤트, 팝업스토어 정보 제공\n혜택 검색 및 추천: 회원의 위치를 활용하여 거리순 정렬, 근처 매장 추천\n부정 이용 방지: 비정상적인 서비스 이용 시도 차단\n\n3. 위치정보 기록 및 보관:\n운영자는 「위치정보의 보호 및 이용 등에 관한 법률」 제16조 제2항에 따라 위치정보 수집·이용·제공 사실 확인자료를 위치정보시스템에 자동으로 기록, 보존하며, 해당 자료는 6개월 이상 보관합니다.\n\n운영자는 개인위치정보의 수집, 이용 또는 제공 목적을 달성하거나, 서비스를 종료하거나, 회원이 탈퇴 등의 방법으로 개인위치정보의 이용에 대한 동의를 철회하는 때에는 당해 개인위치정보를 지체 없이 파기합니다.' },
      { id: 't1-7', title: '제7조 (운영자의 의무)', content: '운영자는 관련 법령과 본 약관을 준수하며, 계속적이고 안정적인 서비스 제공을 위해 최선을 다합니다.\n\n운영자는 회원의 개인정보 보호를 위해 보안시스템을 구축하고 개인정보처리방침을 공시하고 준수합니다.\n\n운영자는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우 이를 처리하여야 하며, 처리 과정 및 결과를 회원에게 전달합니다.' },
      { id: 't1-8', title: '제8조 (회원의 의무)', content: '루키는 이용자가 아래와 같이 잘못된 방법이나 행위로 서비스를 이용할 경우 사용에 대한 제재(이용정지, 강제탈퇴 등)를 가할 수 있습니다. 회원은 다음 각 호의 행위를 하여서는 안 됩니다.\n\n1. 신청 또는 변경 시 허위 내용의 등록\n2. 타인의 정보 도용\n3. 운영자가 게시한 정보의 무단 변경\n4. 운영자가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시\n5. 운영자 또는 제3자의 저작권 등 지적재산권에 대한 침해\n6. 운영자 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위\n7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위\n8. 허위 혜택 정보를 유포하는 행위\n9. 서비스를 영리 목적으로 이용하는 행위(파트너 회원의 정상적인 사업 활동 제외)\n10. 잘못된 방법으로 서비스의 제공을 방해하거나 회사가 안내하는 방법 이외의 다른 방법을 사용하여 서비스에 접근하는 행위\n\n회원은 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 운영자가 통지하는 사항 등을 준수하여야 합니다.' },
      { id: 't1-9', title: '제9조 (서비스의 제공 및 변경)', content: '운영자는 다음과 같은 서비스를 제공합니다.\n1. 하이퍼로컬 제휴 혜택 지도 서비스\n2. 실시간 이벤트 정보 제공\n3. 제휴 매장 및 혜택 검색 기능\n4. 캠퍼스 커뮤니티 서비스\n5. 파트너 센터(파트너 회원 대상)\n\n서비스의 이용은 연중무휴 1일 24시간을 원칙으로 합니다. 단, 운영자의 업무 또는 기술상의 이유로 서비스가 일시 중지될 수 있으며, 운영상의 목적으로 운영자가 정한 기간에도 서비스는 일시 중지될 수 있습니다.' },
      { id: 't1-10', title: '제10조 (서비스의 중단)', content: '운영자는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.\n1. 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우\n2. 서비스를 위한 설비의 보수 등 공사로 인해 부득이한 경우\n3. 정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우\n4. 국가비상사태, 천재지변 등 불가항력적 사유가 있는 경우' },
      { id: 't1-11', title: '제11조 (제휴 혜택 정보의 제공)', content: '운영자는 제휴 매장 및 파트너 회원이 제공하는 혜택 정보를 지도 기반으로 회원에게 제공합니다.\n\n제휴 혜택의 내용, 기간, 조건 등은 제휴 매장 및 파트너 회원이 직접 결정하며, 운영자는 정보 제공의 매개 역할을 수행합니다. 운영자는 제공되는 혜택 정보의 정확성을 위해 노력하나, 실제 혜택 제공 여부 및 조건은 해당 매장과 회원 간의 관계에서 결정됩니다.' },
      { id: 't1-12', title: '제12조 (파트너 회원(점주)의 권리와 의무)', content: '파트너 회원(점주)은 파트너 센터를 통해 제휴 혜택 및 이벤트 정보를 등록, 수정, 삭제할 수 있습니다. 파트너 회원(점주)은 등록하는 정보가 사실과 부합하고 관련 법령을 위반하지 않을 책임이 있습니다.' },
      { id: 't1-13', title: '제13조 (데이터베이스에 대한 보호)', content: '루키에서 제공되는 모든 콘텐츠 및 데이터에 대하여 아래 행위들은 금지됩니다.\n\n1. 운영자의 명시적인 사전 서면 동의 없이 자동화된 도구(예: 로봇, 스파이더, 크롤러 등)를 활용하여 데이터 수집·복제·저장 등을 하는 행위\n2. 운영자의 명시적인 사전 서면 동의 없이 기계 학습, 인공지능 모델 학습 목적으로 콘텐츠를 이용하는 행위' },
      { id: 't1-14', title: '제14조 (게시물의 저작권 보호)', content: '서비스 이용자가 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다. 이용자는 운영자에게 서비스 제공 및 개선을 위해 게시물을 이용할 수 있는 전 세계적인 라이선스를 제공하게 됩니다.' },
      { id: 't1-15', title: '제15조 (게시물의 관리)', content: '운영자는 관련 법령에 위반되거나 운영 정책에 어긋나는 게시물에 대해 게시중단 및 삭제 등의 조치를 취할 수 있습니다. 타인을 비방하거나 명예를 훼손하는 등 부적절한 게시물은 사전 통지 없이 삭제될 수 있습니다.' },
      { id: 't1-16', title: '제16조 (사용권리)', content: '운영자는 이용자에게 서비스 이용에 필요한 무상의 라이선스를 제공하나, 루키 상표 및 로고를 사용할 권리를 부여하는 것은 아닙니다.' },
      { id: 't1-17', title: '제17조 (아동의 개인정보 보호)', content: '운영자는 만 15세 미만 아동의 개인정보를 수집하지 않으며, 만 15세 미만 아동의 가입을 원천적으로 차단하는 기술적 조치를 취하고 있습니다.' },
      { id: 't1-18', title: '제18조 (서비스 고지 및 홍보내용 표시)', content: '운영자는 서비스 이용과 관련된 각종 고지 및 홍보 정보를 앱 내에 표시하거나 이메일 등으로 발송할 수 있습니다. 이용자는 이에 동의하며, 발생하는 데이터 통신 요금은 가입한 통신사업자와의 계약에 따라 이용자가 부담합니다.' },
      { id: 't1-19', title: '제19조 (유료서비스)', content: '운영자는 향후 일부 기능이나 콘텐츠를 유료로 제공할 수 있습니다. 유료 서비스 도입 시 결제 조건 및 환불 등에 관한 사항은 별도로 고지합니다.' },
      { id: 't1-20', title: '제20조 (이용계약 해지 및 서비스 탈퇴)', content: '이용자는 언제든지 서비스 내 메뉴를 통해 탈퇴 신청을 할 수 있습니다. 탈퇴 시 관련 법령에 따라 보관이 필요한 경우를 제외하고 이용자 데이터는 삭제됩니다.' },
      { id: 't1-21', title: '제21조 (분쟁 조정)', content: '운영자는 이용자 간 분쟁 해결을 위해 노력하며, 적법한 절차에 따른 관계 기관의 요청 시 관련 자료를 제출할 수 있습니다.' },
      { id: 't1-22', title: '제22조 (책임제한)', content: '운영자는 법령상 허용되는 한도 내에서 서비스의 특정 기능이나 이용가능성에 대해 어떠한 약정이나 보증도 하지 않으며, 서비스를 있는 그대로 제공할 뿐입니다.' },
      { id: 't1-23', title: '제23조 (손해배상)', content: '운영자의 과실로 인해 이용자가 손해를 입은 경우 법령에 따라 배상합니다. 단, 제3자의 불법 행위나 불가항력적 사유로 인한 손해에 대해서는 책임을 지지 않습니다.' },
      { id: 't1-24', title: '제24조 (면책조항)', content: '천재지변, 불가항력, 회원의 귀책사유로 인한 서비스 이용 장애 등에 대해서는 운영자의 책임이 면제됩니다.' },
      { id: 't1-25', title: '제25조 (회원에 대한 통지)', content: '운영자는 이메일, 전화번호 또는 공지사항 게시를 통해 회원에게 주요 사항을 통지합니다.' },
      { id: 't1-26', title: '제26조 (이용자 의견)', content: '이용자는 언제든지 고객센터를 통해 의견을 개진할 수 있으며, 운영자는 이를 소중히 검토합니다.' },
      { id: 't1-27', title: '제27조 (분쟁의 해결)', content: '운영자와 회원 간 분쟁 발생 시 성실히 협의하여 해결하며, 해결되지 않을 경우 대한민국 법률에 따라 관할 법원에서 소송을 진행합니다.' },
      { id: 't1-28', title: '제28조 (그 외)', content: '본 약관 중 일부 조항의 집행이 불가능하더라도 다른 조항에는 영향을 미치지 않습니다.\n\n부칙 제1조 (시행일): 본 약관은 2026년 2월 8일부터 시행됩니다.\n\n[문의처]\n상호: 루키팀\n이메일: neardeals2@gmail.com\n고객센터: 서비스 내 문의하기 기능 이용' },
    ]
  },
  {
    title: "2. 개인정보처리방침",
    items: [
      {
        id: 't2-1',
        title: '개인정보처리방침 안내',
        link: 'https://sites.google.com/view/looky-privacy-policy/%ED%99%88',
        icon: 'information-circle-outline'
      },
    ]
  }
];
// [도움 함수] **텍스트** 형식을 볼드로 변환
const renderBoldText = (text: string) => {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={{ fontWeight: 'bold', color: '#1B1D1F' }}>
          {part.replace(/\*\*/g, '')}
        </Text>
      );
    }
    return part;
  });
};

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleItemPress = (item: any) => {
    if (item.link) {
      Linking.openURL(item.link);
    } else {
      toggleExpand(item.id);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={rs(24)} color="#1B1D1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>이용약관</Text>
        <Text style={styles.pageSubtitle}>루키 이용약관을 확인하세요</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.termsContainer}>
          {TERMS_DATA.map((section, sectionIndex) => (
            <View key={sectionIndex}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.divider} />
              {section.items.map((item: any) => {
                const isExpanded = expandedIds.includes(item.id);
                return (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.termItem}
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {item.icon && (
                          <Ionicons name={item.icon} size={rs(16)} color="#828282" style={{ marginRight: rs(8) }} />
                        )}
                        <Text style={styles.termTitle}>{item.title}</Text>
                      </View>
                      {item.link ? (
                        <Ionicons name="open-outline" size={rs(16)} color="#828282" />
                      ) : (
                        <Ionicons
                          name="chevron-down"
                          size={rs(16)}
                          color="#828282"
                          style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                        />
                      )}
                    </TouchableOpacity>
                    {isExpanded && item.content && (
                      <View style={styles.termContentBox}>
                        <Text style={styles.termContentText}>{renderBoldText(item.content)}</Text>
                      </View>
                    )}
                    <View style={styles.divider} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: rs(20), paddingVertical: rs(10), justifyContent: 'center', alignItems: 'flex-start' },
  content: { paddingBottom: rs(50) },
  titleContainer: { paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(20) },
  pageTitle: { fontSize: rs(20), fontWeight: '600', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(5) },
  pageSubtitle: { fontSize: rs(14), fontWeight: '600', color: '#A6A6A6', fontFamily: 'Pretendard' },
  termsContainer: { backgroundColor: 'white', paddingHorizontal: rs(20), paddingVertical: rs(10) },
  sectionHeader: { paddingVertical: rs(10), justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
  divider: { height: 1, backgroundColor: '#E6E6E6', width: '100%' },
  termItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: rs(15), paddingHorizontal: rs(5) },
  termTitle: { fontSize: rs(12), fontWeight: '600', color: '#444444', fontFamily: 'Pretendard', flex: 1 },
  termContentBox: { backgroundColor: '#F9F9F9', padding: rs(15) },
  termContentText: { fontSize: rs(10), fontWeight: '400', color: '#828282', fontFamily: 'Pretendard', lineHeight: rs(16) },
});
