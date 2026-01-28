import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// # Helper Functions & Constants
// # Data: 12시간제 시간 리스트 생성 (5분 단위)
const TIME_12H = [];
for (let i = 1; i <= 12; i++) {
  const hour = i.toString().padStart(2, '0');
  for (let j = 0; j < 60; j += 5) {
    const minute = j.toString().padStart(2, '0');
    TIME_12H.push(`${hour}:${minute}`);
  }
}

// # Logic: 24시간제("14:30") -> 12시간제 객체({ampm: "오후", time: "02:30"}) 변환
const convert24to12 = (time24) => {
  if (!time24) return { ampm: '오전', time: '10:00' };
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? '오후' : '오전';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12; 
  const hourString = hour12.toString().padStart(2, '0');
  const minuteString = m.toString().padStart(2, '0');
  return { ampm, time: `${hourString}:${minuteString}` };
};

// # Logic: 12시간제("오후", "02:30") -> 24시간제("14:30") 변환
const convert12to24 = (ampm, time12) => {
  const [h, m] = time12.split(':').map(Number);
  let hour24 = h;
  if (ampm === '오후' && h !== 12) hour24 += 12;
  if (ampm === '오전' && h === 12) hour24 = 0;
  return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// # Calendar Helpers
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// 날짜 포맷 (YYYY-MM-DD)
const getFormatDate = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// # Component: StoreScreen
export default function StoreScreen() {
  
  // # State: UI Control (탭, 모달 가시성)
  const [activeTab, setActiveTab] = useState('info');
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  
  // # State: Bottom Sheet Time Picker (시간 선택기 상태)
  const [pickerVisible, setPickerVisible] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [targetField, setTargetField] = useState(null); 
  const [tempAmpm, setTempAmpm] = useState('오전');
  const [tempTime, setTempTime] = useState('10:00');

  // # State: Data (매장 기본 정보)
  const [storeInfo, setStoreInfo] = useState({
    categories: [], vibes: [], intro: '', address: '', detailAddress: '', phone: '', logoImage: null, bannerImage: null
  });

  // # State: Data (영업시간 - 24시간제 저장)
  const initialHours = ['월', '화', '수', '목', '금', '토', '일'].map(day => ({
    day,
    open: '10:00', 
    close: '22:00',
    isClosed: false
  }));
  const [operatingHours, setOperatingHours] = useState(initialHours);

  // # State: Calendar (휴무일 관리)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // 2026년 1월 시작
  const [selectedHolidays, setSelectedHolidays] = useState([
    '2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23' // 예시 데이터
  ]);

  // # State: Edit Temp Data (수정 중 임시 데이터)
  const [editBasicData, setEditBasicData] = useState({ ...storeInfo });
  const [editHoursData, setEditHoursData] = useState([...operatingHours]);

  // # Data: 카테고리 및 분위기 옵션 목록
  const ALL_CATEGORIES = ['식당', '주점', '카페', '놀거리', '뷰티', '헬스', 'ETC'];
  const ALL_VIBES = ['1인 혼밥', '회식', '모임', '야식', '데이트'];

  // # Logic Functions
  // # Logic: Modal Open (기본 정보)
  const openBasicEditModal = () => {
    const rawPhone = storeInfo.phone ? storeInfo.phone.replace(/-/g, '') : '';
    setEditBasicData({ ...storeInfo, phone: rawPhone });
    setBasicModalVisible(true);
  };

  // # Logic: Modal Open (영업 시간)
  const openHoursEditModal = () => {
    setEditHoursData(JSON.parse(JSON.stringify(operatingHours)));
    setHoursModalVisible(true);
  };

  // # Logic: Selection Toggle (다중 선택)
  const toggleSelection = (item, key) => {
    const currentList = editBasicData[key];
    if (currentList.includes(item)) {
      setEditBasicData({ ...editBasicData, [key]: currentList.filter(i => i !== item) });
    } else {
      setEditBasicData({ ...editBasicData, [key]: [...currentList, item] });
    }
  };

  // # Logic: Save Handler (기본 정보)
  const handleBasicSave = () => {
    setStoreInfo({ ...editBasicData });
    setBasicModalVisible(false);
  };

  // # Logic: Save Handler (영업 시간)
  const handleHoursSave = () => {
    setOperatingHours(editHoursData);
    setHoursModalVisible(false);
  };

  // # Logic: Holiday Toggle (휴무 설정)
  const toggleHoliday = (index) => {
    const newHours = [...editHoursData];
    newHours[index].isClosed = !newHours[index].isClosed;
    setEditHoursData(newHours);
  };

  const handleMockAction = (msg) => Alert.alert("알림", msg);

  // # Logic: Time Picker Open/Confirm
  const openTimePicker = (index, field) => {
    setTargetIndex(index);
    setTargetField(field);
    
    // 현재 설정된 24시간 -> 12시간제로 변환해 피커 초기값 설정
    const current24 = editHoursData[index][field];
    const { ampm, time } = convert24to12(current24);
    
    setTempAmpm(ampm);
    setTempTime(time);
    setPickerVisible(true);
  };

  const confirmTimePicker = () => {
    if (targetIndex !== null && targetField) {
      // 선택된 12시간제 -> 24시간제로 변환해 저장
      const time24 = convert12to24(tempAmpm, tempTime);
      const newHours = [...editHoursData];
      newHours[targetIndex][targetField] = time24;
      setEditHoursData(newHours);
    }
    setPickerVisible(false);
  };

  // # Logic: Calendar
  const changeMonth = (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  const handleDatePress = (dateStr) => {
    const today = getFormatDate(new Date());
    // 지난 날짜 수정 불가 (여기선 2026년 기준이라 로직만 넣어둠)
    if (dateStr < today) return; 

    if (selectedHolidays.includes(dateStr)) {
        setSelectedHolidays(selectedHolidays.filter(d => d !== dateStr));
    } else {
        setSelectedHolidays([...selectedHolidays, dateStr]);
    }
  };

  // 캘린더 생성 로직
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay(); // 0(일) ~ 6(토)
    const lastDate = new Date(year, month + 1, 0).getDate(); // 이번달 마지막 날짜
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    
    for (let i = 1; i <= lastDate; i++) {
        days.push(new Date(year, month, i));
    }

    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* # UI: Top Logo */}
        <Image source={require('@/assets/images/shopowner/logo2.png')} style={styles.logo} resizeMode="contain" />
        
        {/* # UI: Tabs (매장 정보 / 메뉴 관리) */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabButton, activeTab === 'info' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('info')}>
              <Text style={[styles.tabText, activeTab === 'info' ? styles.activeText : styles.inactiveText]}>매장 정보</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabButton, activeTab === 'management' ? styles.activeTab : styles.inactiveTab]} onPress={() => setActiveTab('management')}>
              <Text style={[styles.tabText, activeTab === 'management' ? styles.activeText : styles.inactiveText]}>메뉴 관리</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* # UI: Main Content Area */}
        {activeTab === 'info' ? (
          <View style={{ gap: rs(20) }}>
            
            {/* # UI: Card 1 - 기본 정보 */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconCircle}><Ionicons name="storefront" size={rs(14)} color="#34B262" /></View>
                  <Text style={styles.headerTitle}>기본 정보</Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={openBasicEditModal}>
                  <Text style={styles.editButtonText}>수정</Text>
                </TouchableOpacity>
              </View>
              {/* Info Rows */}
              <InfoRow icon="grid" label="가게 종류" content={<View style={styles.tagContainer}>{storeInfo.categories.length > 0 ? storeInfo.categories.map((cat, i) => <Tag key={i} text={cat} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>}/>
              <InfoRow icon="sparkles" label="가게 분위기" content={<View style={styles.tagContainer}>{storeInfo.vibes.length > 0 ? storeInfo.vibes.map((v, i) => <Tag key={i} text={v} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>}/>
              <InfoRow icon="information-circle" label="가게 소개" content={storeInfo.intro ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{storeInfo.intro}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} />
              <InfoRow icon="image" label="가게 이미지" content={<View style={styles.imageDisplayRow}><ImagePlaceholder label="로고" size={105} /><ImagePlaceholder label="배너" size={105} /></View>} />
              <InfoRow icon="location" label="주소" content={<View style={{ marginTop: rs(2) }}>{storeInfo.address ? (<><Text style={styles.bodyText}>{storeInfo.address}</Text>{storeInfo.detailAddress ? <Text style={[styles.bodyText, {color:'#828282', marginTop:rs(2)}]}>{storeInfo.detailAddress}</Text> : null}</>) : <Text style={[styles.placeholderText, {marginTop: 0}]}>정보 없음</Text>}</View>} />
              <InfoRow icon="call" label="전화번호" content={storeInfo.phone ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{storeInfo.phone}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} />
            </View>

            {/* # UI: Card 2 - 영업시간 */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                  <View style={styles.headerTitleRow}>
                  <View style={styles.timeIconCircle}>
                      <Ionicons name="time" size={rs(18)} color="#34B262" />
                  </View>
                  <View>
                      <Text style={styles.headerTitle}>영업시간</Text>
                      <Text style={styles.subTitle}>요일별 설정</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={openHoursEditModal}>
                  <Text style={styles.editButtonText}>수정</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: rs(8) }}>
                {operatingHours.map((item, index) => (
                  <View key={index} style={[styles.hourRow, item.isClosed && { opacity: 0.3 }]}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    {item.isClosed ? (
                        <View style={styles.closedBadge}>
                             <Text style={styles.timeText}>휴무</Text>
                        </View>
                    ) : (
                        <View style={styles.timeDisplayContainer}>
                            <Text style={styles.timeText}>{item.open}</Text>
                            <Text style={styles.hyphen}>-</Text>
                            <Text style={styles.timeText}>{item.close}</Text>
                        </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
            
            {/* =================================================================
               # UI: Card 3 - 매장 소식
               ================================================================= */}
            <TouchableOpacity 
              style={[styles.infoCard, { paddingVertical: rs(22) }]} // 높이 조절을 위해 패딩 추가
              activeOpacity={0.7}
              onPress={() => handleMockAction("매장 소식 페이지로 이동 (준비중)")}
            >
              <View style={styles.newsContentRow}>
                {/* 왼쪽: 아이콘 + 텍스트 */}
                <View style={styles.newsLeftSection}>
                   {/* 녹색 원형 확성기 아이콘 */}
                   <View style={styles.timeIconCircle}>
                      <Ionicons name="megaphone" size={rs(18)} color="#34B262" />
                   </View>
                   <View>
                      <Text style={styles.headerTitle}>매장 소식</Text>
                      <Text style={styles.subTitle}>고객에게 전할 공지사항</Text>
                   </View>
                </View>

                {/* 오른쪽: 화살표 아이콘 */}
                <Ionicons name="chevron-forward" size={rs(18)} color="#34B262" />
              </View>
            </TouchableOpacity>

            {/* =================================================================
               # UI: Card 3 - 휴무일 캘린더
               ================================================================= */}
            <View style={styles.infoCard}>
               {/* 캘린더 헤더 */}
               <View style={styles.cardHeader}>
                 <View style={styles.headerTitleRow}>
                  <View style={styles.timeIconCircle}>
                      <Ionicons name="calendar" size={rs(18)} color="#34B262" />
                  </View>
                  <View>
                      <Text style={styles.headerTitle}>휴무일</Text>
                      <Text style={styles.subTitle}>임시 휴무일을 터치로 지정</Text>
                  </View>
                </View>
              </View>

              {/* 달력 컨트롤 (월 이동) */}
              <View style={styles.calendarControl}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
                      <Ionicons name="chevron-back" size={rs(20)} color="#ccc" />
                  </TouchableOpacity>
                  <Text style={styles.calendarTitle}>
                      {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
                      <Ionicons name="chevron-forward" size={rs(20)} color="#ccc" />
                  </TouchableOpacity>
              </View>

              {/* 요일 헤더 */}
              <View style={styles.weekHeader}>
                  {WEEKDAYS.map((day, index) => (
                      <Text key={index} style={[styles.weekText, index === 0 && {color:'#FF3E41'}, index === 6 && {color:'#007AFF'}]}>
                          {day}
                      </Text>
                  ))}
              </View>

              {/* 날짜 그리드 */}
              <View style={styles.daysGrid}>
                  {generateCalendar().map((date, index) => {
                      if (!date) return <View key={index} style={styles.dayCell} />;

                      const dateStr = getFormatDate(date);
                      const isSelected = selectedHolidays.includes(dateStr);
                      
                      // 연속 날짜 체크 (디자인용)
                      const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
                      const tomorrow = new Date(date); tomorrow.setDate(date.getDate() + 1);
                      const isPrevSelected = selectedHolidays.includes(getFormatDate(yesterday));
                      const isNextSelected = selectedHolidays.includes(getFormatDate(tomorrow));
                      
                      const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
                      
                      // 오늘 날짜인지 (비활성화용, 여기선 2026년이라 패스하지만 로직상 필요)
                      const isPast = dateStr < getFormatDate(new Date());

                      // 스타일 계산
                      const cellStyle = [styles.dayBtn];
                      const textStyle = [styles.dayTextNum];

                      // 텍스트 색상 (일:빨강, 토:파랑)
                      if (dayOfWeek === 0) textStyle.push({color: '#FF3E41'});
                      else if (dayOfWeek === 6) textStyle.push({color: '#007AFF'});

                      // 선택되었을 때 스타일 (오렌지 배경)
                      if (isSelected) {
                          cellStyle.push(styles.dayBtnSelected);
                          textStyle.push({color: 'white', fontWeight: '700'});

                          // 연속된 날짜 연결 로직 (왼쪽/오른쪽 라운드 제거)
                          // 일요일(0)이면 왼쪽은 무조건 라운드, 토요일(6)이면 오른쪽 무조건 라운드
                          if (isPrevSelected && dayOfWeek !== 0) {
                              cellStyle.push(styles.connectLeft);
                          }
                          if (isNextSelected && dayOfWeek !== 6) {
                              cellStyle.push(styles.connectRight);
                          }
                      }

                      // 지난 날짜 스타일
                      if (isPast) {
                          textStyle.push({color: '#E0E0E0'});
                      }

                      return (
                          <View key={index} style={styles.dayCell}>
                              <TouchableOpacity 
                                  style={cellStyle}
                                  onPress={() => handleDatePress(dateStr)}
                                  disabled={isPast} // 지난 날짜 클릭 금지
                                  activeOpacity={0.8}
                              >
                                  <Text style={textStyle}>{date.getDate()}</Text>
                              </TouchableOpacity>
                          </View>
                      );
                  })}
              </View>

            </View>

          </View>
        ) : (
          <View style={styles.placeholderArea}><Text style={{color: '#aaa', fontFamily: 'Pretendard'}}>메뉴 관리 화면</Text></View>
        )}
      </ScrollView>

      {/* =================================================================
         # Modal: Basic Info Edit (기본 정보 수정)
         ================================================================= */}
      <Modal animationType="slide" transparent={true} visible={basicModalVisible} onRequestClose={() => setBasicModalVisible(false)}>
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
             <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalHeader}>
                   <Text style={styles.modalTitle}>기본 정보</Text>
                   <TouchableOpacity style={styles.saveButton} onPress={handleBasicSave}><Text style={styles.saveButtonText}>완료</Text></TouchableOpacity>
                </View>
                <EditSection icon="grid" label="가게 종류"><View style={styles.selectionGrid}>{ALL_CATEGORIES.map((cat) => (<TouchableOpacity key={cat} style={[styles.selectChip, editBasicData.categories.includes(cat) ? styles.selectChipActive : styles.selectChipInactive]} onPress={() => toggleSelection(cat, 'categories')}><Text style={[styles.chipText, editBasicData.categories.includes(cat) ? styles.chipTextActive : styles.chipTextInactive]}>{cat}</Text></TouchableOpacity>))}</View></EditSection>
                <EditSection icon="sparkles" label="가게 분위기"><View style={styles.selectionGrid}>{ALL_VIBES.map((vibe) => (<TouchableOpacity key={vibe} style={[styles.selectChip, editBasicData.vibes.includes(vibe) ? styles.selectChipActive : styles.selectChipInactive]} onPress={() => toggleSelection(vibe, 'vibes')}><Text style={[styles.chipText, editBasicData.vibes.includes(vibe) ? styles.chipTextActive : styles.chipTextInactive]}>{vibe}</Text></TouchableOpacity>))}</View></EditSection>
                <EditSection icon="information-circle" label="가게 소개"><View style={styles.inputWrapper}><TextInput style={styles.textInput} placeholder="가게를 소개하는 글을 적어주세요" placeholderTextColor="#ccc" maxLength={50} value={editBasicData.intro} onChangeText={(text) => setEditBasicData({...editBasicData, intro: text})} /><Text style={styles.charCount}>{editBasicData.intro.length}/50</Text></View></EditSection>
                <EditSection icon="image" label="가게 이미지"><View style={styles.imageDisplayRow}><TouchableOpacity style={styles.uploadBoxWrapper} onPress={() => handleMockAction("갤러리 연결")}><Text style={styles.uploadLabel}>로고</Text><View style={[styles.uploadBox, { width: rs(90), height: rs(90) }]}><Ionicons name="camera" size={rs(20)} color="#aaa" /><Text style={styles.uploadPlaceholder}>로고 업로드</Text></View></TouchableOpacity><TouchableOpacity style={styles.uploadBoxWrapper} onPress={() => handleMockAction("갤러리 연결")}><Text style={styles.uploadLabel}>배너</Text><View style={[styles.uploadBox, { width: rs(90), height: rs(90) }]}><Ionicons name="image" size={rs(20)} color="#aaa" /><Text style={styles.uploadPlaceholder}>배너 업로드</Text></View></TouchableOpacity></View></EditSection>
                <EditSection icon="location" label="주소"><TouchableOpacity style={[styles.inputWrapper, {marginBottom: rs(8)}]} onPress={() => handleMockAction("주소 검색")}><Text style={[styles.textInput, {color: editBasicData.address ? 'black' : '#ccc'}]}>{editBasicData.address || "건물명, 도로명 또는 지번 검색"}</Text><Ionicons name="search" size={rs(16)} color="#ccc" style={{marginRight: rs(10)}}/></TouchableOpacity><View style={[styles.inputWrapper, {backgroundColor: 'rgba(218, 218, 218, 0.50)'}]}><TextInput style={styles.textInput} placeholder="상세주소를 입력해주세요. (예 : 4층, 405호)" placeholderTextColor="#828282" value={editBasicData.detailAddress} onChangeText={(text) => setEditBasicData({...editBasicData, detailAddress: text})} /></View></EditSection>
                <EditSection icon="call" label="전화번호"><View style={styles.inputWrapper}><TextInput style={styles.textInput} placeholder="숫자만 입력해주세요" placeholderTextColor="#ccc" keyboardType="number-pad" value={editBasicData.phone} onChangeText={(text) => setEditBasicData({...editBasicData, phone: text.replace(/[^0-9]/g, '')})} /></View></EditSection>
             </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =================================================================
         # Modal: Operating Hours Edit (영업시간 수정)
         ================================================================= */}
      <Modal animationType="slide" transparent={true} visible={hoursModalVisible} onRequestClose={() => setHoursModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: 'auto', maxHeight: rs(600) }]}> 
            <ScrollView contentContainerStyle={styles.modalScroll}>
              
              <View style={styles.modalHeader}>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: rs(8)}}>
                    <View style={styles.timeIconCircleSmall}>
                         <Ionicons name="time" size={rs(14)} color="#34B262" />
                         <View style={styles.greenDotDecoSmall} />
                    </View>
                    <Text style={styles.modalTitle}>영업시간</Text>
                 </View>
                 <TouchableOpacity style={styles.saveButton} onPress={handleHoursSave}><Text style={styles.saveButtonText}>완료</Text></TouchableOpacity>
              </View>

              <Text style={[styles.subTitle, {marginBottom: rs(15)}]}>요일별 설정</Text>

              {editHoursData.map((item, index) => {
                  const open12 = convert24to12(item.open);
                  const close12 = convert24to12(item.close);

                  return (
                  <View key={index} style={styles.editHourRow}>
                      <Text style={styles.editHourDay}>{item.day}</Text>
                      
                      {/* 시간 입력 박스 (오전/오후 분리) */}
                      <View style={styles.timeInputGroup}>
                          <TouchableOpacity 
                            style={styles.timeInputBox}
                            onPress={() => !item.isClosed && openTimePicker(index, 'open')}
                            activeOpacity={0.7}
                          >
                              <Text style={styles.timeLabel}>{open12.ampm}</Text>
                              <Text style={styles.timeValue}>{open12.time}</Text>
                              <Ionicons name="caret-down" size={rs(10)} color="black" />
                          </TouchableOpacity>
                          
                          <Text style={{marginHorizontal:5, color:'black'}}>~</Text>
                          
                          <TouchableOpacity 
                            style={styles.timeInputBox}
                            onPress={() => !item.isClosed && openTimePicker(index, 'close')}
                            activeOpacity={0.7}
                          >
                              <Text style={styles.timeLabel}>{close12.ampm}</Text>
                              <Text style={styles.timeValue}>{close12.time}</Text>
                              <Ionicons name="caret-down" size={rs(10)} color="black" />
                          </TouchableOpacity>

                          {/* 휴무일 경우 가림막 */}
                          {item.isClosed && <View style={styles.blurOverlay} />}
                      </View>

                      {/* 휴무 체크박스 */}
                      <TouchableOpacity 
                        style={styles.checkboxContainer}
                        onPress={() => toggleHoliday(index)}
                      >
                          <View style={[styles.checkbox, item.isClosed && styles.checkboxChecked]}>
                              {item.isClosed && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                          </View>
                          <Text style={styles.checkboxLabel}>휴무</Text>
                      </TouchableOpacity>
                  </View>
              )})}
              <View style={{height: rs(20)}} />
            </ScrollView>

            {/* # UI: Bottom Sheet Time Picker (시간 선택기) */}
            {pickerVisible && (
              <View style={styles.bottomSheetOverlay}>
                <TouchableOpacity 
                  style={styles.bottomSheetBackdrop} 
                  activeOpacity={1} 
                  onPress={() => setPickerVisible(false)}
                />
                <View style={styles.bottomSheetContainer}>
                  
                  <View style={styles.bottomSheetHeader}>
                    <Text style={styles.bottomSheetTitle}>시간 선택</Text>
                    <TouchableOpacity onPress={confirmTimePicker}>
                        <Text style={styles.confirmText}>확인</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pickerBody}>
                    {/* Picker Column: 오전/오후 */}
                    <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnTitle}>오전/오후</Text>
                        <ScrollView style={{height: rs(150)}} showsVerticalScrollIndicator={false}>
                            {['오전', '오후'].map(ampm => (
                                <TouchableOpacity 
                                    key={ampm} 
                                    style={[styles.pickerItem, tempAmpm === ampm && styles.pickerItemSelected]}
                                    onPress={() => setTempAmpm(ampm)}
                                >
                                    <Text style={[styles.pickerItemText, tempAmpm === ampm && styles.pickerItemTextSelected]}>{ampm}</Text>
                                    {tempAmpm === ampm && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={{width: 1, height: '80%', backgroundColor: '#eee'}} />

                    {/* Picker Column: 시간 (5분 단위) */}
                    <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnTitle}>시간 (5분 단위)</Text>
                        <ScrollView style={{height: rs(150)}} showsVerticalScrollIndicator={false}>
                             {TIME_12H.map(time => (
                                <TouchableOpacity 
                                    key={time} 
                                    style={[styles.pickerItem, tempTime === time && styles.pickerItemSelected]}
                                    onPress={() => setTempTime(time)}
                                >
                                    <Text style={[styles.pickerItemText, tempTime === time && styles.pickerItemTextSelected]}>{time}</Text>
                                    {tempTime === time && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}
                                </TouchableOpacity>
                             ))}
                        </ScrollView>
                    </View>
                  </View>
                </View>
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// =================================================================
// # Sub-Components
// =================================================================
const InfoRow = ({ icon, label, content }) => (
  <View style={styles.rowSection}>
    <View style={styles.fixedLabel}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View>
    <View style={styles.contentArea}>{content}</View>
  </View>
);
const EditSection = ({ icon, label, children }) => (
  <View style={styles.editSection}>
     <View style={styles.labelRow}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View>
    {children}
  </View>
);
const Tag = ({ text }) => <View style={styles.tagBox}><Text style={styles.tagText}>{text}</Text></View>;
const ImagePlaceholder = ({ label, size = 90 }) => (
  <View style={styles.uploadBoxWrapper}>
    <Text style={styles.uploadLabel}>{label}</Text>
    <View style={[styles.uploadBox, { width: rs(size), height: rs(size) }]}><Ionicons name={label==='로고'?'camera':'image'} size={rs(24)} color="#aaa" /><Text style={styles.uploadPlaceholder}>{label} 업로드</Text></View>
  </View>
);

// =================================================================
// # Style Definitions
// =================================================================
const styles = StyleSheet.create({
  // # Style: Container & Layout
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight: 0,},
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },
  logo: { width: rs(120), height: rs(30), marginBottom: rs(20) },

  // # Style: Tabs
  tabWrapper: { alignItems: 'center', marginBottom: rs(20) },
  tabContainer: { width: '100%', height: rs(48), backgroundColor: 'rgba(218, 218, 218, 0.40)', borderRadius: rs(10), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(4) },
  tabButton: { flex: 1, height: rs(40), justifyContent: 'center', alignItems: 'center', borderRadius: rs(8) },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  inactiveTab: { backgroundColor: 'transparent' },
  tabText: { fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard' },
  activeText: { color: 'black' },
  inactiveText: { color: '#828282' },

  // # Style: Main Card & Headers
  infoCard: { backgroundColor: 'white', borderRadius: rs(12), padding: rs(16), elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10) },
  iconCircle: { width: rs(35), height: rs(35), borderRadius: rs(17.5), backgroundColor: '#E0EDE4', justifyContent: 'center', alignItems: 'center' },
  
  timeIconCircle: { width: rs(35), height: rs(35), borderRadius: rs(17.5), backgroundColor: '#E0EDE4', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  greenDotDeco: { position: 'absolute', width: rs(6), height: rs(6), backgroundColor: '#34B262', borderRadius: rs(3), bottom: rs(8), right: rs(8) },
  timeIconCircleSmall: { width: rs(24), height: rs(24), borderRadius: rs(12), backgroundColor: '#E0EDE4', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  greenDotDecoSmall: { position: 'absolute', width: rs(4), height: rs(4), backgroundColor: '#34B262', borderRadius: rs(2), bottom: rs(5), right: rs(5) },

  headerTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  subTitle: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard', marginTop: rs(2) },
  editButton: { backgroundColor: '#34B262', borderRadius: rs(12), paddingHorizontal: rs(12), paddingVertical: rs(6) },
  editButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },

  // # Style: Rows & Elements
  rowSection: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: rs(20) },
  fixedLabel: { flexDirection: 'row', alignItems: 'center', width: rs(80), marginTop: rs(2) }, 
  labelText: { fontSize: rs(11), fontWeight: '500', color: '#828282', marginLeft: rs(4), fontFamily: 'Pretendard' },
  contentArea: { flex: 1 }, 
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(6) },
  placeholderText: { fontSize: rs(11), color: '#ccc', marginTop: rs(2), fontFamily: 'Pretendard' }, 
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6) },
  tagBox: { paddingHorizontal: rs(10), paddingVertical: rs(4), backgroundColor: 'white', borderRadius: rs(12), borderWidth: 1, borderColor: '#DADADA' },
  tagText: { fontSize: rs(10), color: '#828282', fontWeight: '500', fontFamily: 'Pretendard' },
  bodyText: { fontSize: rs(11), color: 'black', lineHeight: rs(16), fontFamily: 'Pretendard' },

  imageDisplayRow: { flexDirection: 'row', gap: rs(10), justifyContent: 'flex-start' }, 
  uploadBoxWrapper: { alignItems: 'flex-start', gap: rs(4) },
  uploadLabel: { fontSize: rs(11), color: '#828282', fontWeight: '500', fontFamily: 'Pretendard' },
  uploadBox: { backgroundColor: 'rgba(217, 217, 217, 0.30)', borderRadius: rs(8), borderWidth: 1, borderColor: 'rgba(130, 130, 130, 0.30)', justifyContent: 'center', alignItems: 'center', gap: rs(5) },
  uploadPlaceholder: { fontSize: rs(10), color: '#aaa', fontFamily: 'Pretendard' },
  
  placeholderArea: { height: rs(300), justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: rs(12) },
  
  // # Style: Operating Hours (Main)
  hourRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(4) },
  dayText: { width: rs(30), fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
  timeDisplayContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  timeText: { fontSize: rs(11), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
  hyphen: { fontSize: rs(13), fontWeight: '500', color: 'black' },
  closedBadge: { paddingHorizontal: rs(10), paddingVertical: rs(4), backgroundColor: '#E0EDE4', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },

  // # Style: Modal Layout
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: rs(335), height: rs(650), backgroundColor: 'white', borderRadius: rs(8), overflow: 'hidden' },
  modalScroll: { padding: rs(20) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  modalTitle: { fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  saveButton: { width: rs(41), height: rs(23), backgroundColor: '#34B262', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },

  // # Style: Modal Elements
  editSection: { marginBottom: rs(20) },
  selectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6) },
  selectChip: { paddingHorizontal: rs(10), height: rs(18), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  selectChipActive: { backgroundColor: '#34B262', borderColor: '#34B262' },
  selectChipInactive: { backgroundColor: 'white', borderColor: '#DADADA' },
  chipText: { fontSize: rs(10), fontWeight: '500', fontFamily: 'Pretendard' },
  chipTextActive: { color: 'white' },
  chipTextInactive: { color: '#828282' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: rs(29), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), paddingHorizontal: rs(10) },
  textInput: { flex: 1, fontSize: rs(10), color: 'black', padding: 0, fontFamily: 'Pretendard' },
  charCount: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },

  // # Style: Hours Edit Logic
  editHourRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(15) },
  editHourDay: { width: rs(25), fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard' },
  timeInputGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-start', position: 'relative' },
  timeInputBox: { width: rs(101), height: rs(26), borderRadius: rs(8), borderWidth: 1, borderColor: '#DADADA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(8), gap: rs(4) },
  timeLabel: { fontSize: rs(11), fontWeight: '300', color: 'black', fontFamily: 'Pretendard' },
  timeValue: { fontSize: rs(11), fontWeight: '300', color: 'black', fontFamily: 'Pretendard' },
  blurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.60)', zIndex: 10 },
  
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(5), marginLeft: rs(10) },
  checkbox: { width: rs(14), height: rs(14), borderRadius: rs(2), borderWidth: 1, borderColor: '#DADADA', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2D6EFF', borderColor: '#2D6EFF', borderWidth: 0 },
  checkboxLabel: { fontSize: rs(11), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },

  // # Style: Bottom Sheet Picker
  bottomSheetOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, justifyContent: 'flex-end' },
  bottomSheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheetContainer: { backgroundColor: 'white', borderTopLeftRadius: rs(20), borderTopRightRadius: rs(20), padding: rs(20), minHeight: rs(300), shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  bottomSheetTitle: { fontSize: rs(18), fontWeight: '700', fontFamily: 'Pretendard' },
  confirmText: { fontSize: rs(16), color: '#34B262', fontWeight: '600', fontFamily: 'Pretendard' },

  pickerBody: { flexDirection: 'row', height: rs(200) },
  pickerColumn: { flex: 1, alignItems: 'center' },
  pickerColumnTitle: { fontSize: rs(14), fontWeight: '600', color: '#828282', marginBottom: rs(10), fontFamily: 'Pretendard' },
  pickerItem: { paddingVertical: rs(12), width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: rs(5) },
  pickerItemSelected: { backgroundColor: '#F5F5F5', borderRadius: rs(8) },
  pickerItemText: { fontSize: rs(16), color: '#333', fontFamily: 'Pretendard' },
  pickerItemTextSelected: { fontWeight: '700', color: 'black' },

  // # Style: News Card
  newsContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  newsLeftSection: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },

  // # Style: Calendar
  calendarControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(15), paddingHorizontal: rs(10) },
  calendarTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  navButton: { padding: rs(5) },
  
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(5) },
  weekText: { width: '14%', textAlign: 'center', fontSize: rs(13), fontWeight: '500', color: '#333', fontFamily: 'Pretendard' },
  
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: rs(2) },
  
  dayBtn: { 
    width: rs(34), height: rs(34), borderRadius: rs(17), // 기본 원형
    alignItems: 'center', justifyContent: 'center',
  },
  dayTextNum: { fontSize: rs(13), fontWeight: '500', color: '#333', fontFamily: 'Pretendard' },
  
  // 선택된 상태 스타일
  dayBtnSelected: {
    backgroundColor: '#F6A823', // 오렌지 배경
  },
  
  // 연결 효과: 왼쪽이 연결될 때
  connectLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: rs(-6), // 살짝 왼쪽으로 확장해서 붙임 (View 간격 보정)
    paddingLeft: rs(6), // 텍스트 중앙 정렬 보정
    width: rs(40),      // 너비 확장
  },
  // 연결 효과: 오른쪽이 연결될 때
  connectRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: rs(-6),
    paddingRight: rs(6),
    width: rs(40),
  }
});