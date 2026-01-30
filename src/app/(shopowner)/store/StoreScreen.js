import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// # Helper Functions & Constants
const TIME_12H = [];
for (let i = 1; i <= 12; i++) {
  const hour = i.toString().padStart(2, '0');
  for (let j = 0; j < 60; j += 5) {
    const minute = j.toString().padStart(2, '0');
    TIME_12H.push(`${hour}:${minute}`);
  }
}

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

const convert12to24 = (ampm, time12) => {
  const [h, m] = time12.split(':').map(Number);
  let hour24 = h;
  if (ampm === '오후' && h !== 12) hour24 += 12;
  if (ampm === '오전' && h === 12) hour24 = 0;
  return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getFormatDate = (date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// # Component: StoreScreen
export default function StoreScreen() {
  
  // # State: UI Control
  const [activeTab, setActiveTab] = useState('info');
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  
  // # State: Time Picker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [targetField, setTargetField] = useState(null); 
  const [tempAmpm, setTempAmpm] = useState('오전');
  const [tempTime, setTempTime] = useState('10:00');

  // # State: Store Data
  const [storeInfo, setStoreInfo] = useState({
    categories: [], vibes: [], intro: '', address: '', detailAddress: '', phone: '', logoImage: null, bannerImage: null
  });

  const initialHours = ['월', '화', '수', '목', '금', '토', '일'].map(day => ({
    day, open: '10:00', close: '22:00', isClosed: false
  }));
  const [operatingHours, setOperatingHours] = useState(initialHours);

  // # State: Calendar & Status
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedHolidays, setSelectedHolidays] = useState(['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23']);
  const [isPaused, setIsPaused] = useState(false);

  // # State: Menu Management
  const [menuCategories, setMenuCategories] = useState(['메인메뉴', '사이드', '음료/주류', '세트메뉴']);
  const [selectedCategory, setSelectedCategory] = useState('메인메뉴');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  
  // 메뉴 추가/수정 모달 관련 상태
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // true: 수정, false: 추가
  const [menuForm, setMenuForm] = useState({
      name: '', price: '', desc: '', category: '메인메뉴', 
      isRepresentative: false, badge: null, isSoldOut: false, isHidden: false
  });

  // # State: Menu List (Dummy Data)
  const [menuList, setMenuList] = useState([
    { id: 1, name: '떡볶이', price: '4,500', desc: '매콤달콤한 국민 간식', badge: 'BEST', isRepresentative: true, isSoldOut: false, image: null },
    { id: 2, name: '순대', price: '4,000', desc: '찹쌀순대와 당면순대 반반', badge: null, isRepresentative: false, isSoldOut: false, image: null },
    { id: 3, name: '크림떡볶이', price: '6,500', desc: '꾸우덕한 크림이 가득~!', badge: 'BEST', isRepresentative: false, isSoldOut: true, image: null },
  ]);

  // # State: Edit Temp Data
  const [editBasicData, setEditBasicData] = useState({ ...storeInfo });
  const [editHoursData, setEditHoursData] = useState([...operatingHours]);

  // # Constants
  const ALL_CATEGORIES = ['식당', '주점', '카페', '놀거리', '뷰티', '헬스', 'ETC'];
  const ALL_VIBES = ['1인 혼밥', '회식', '모임', '야식', '데이트'];
  const BADGE_TYPES = ['BEST', 'NEW', 'HOT', '비건'];

  // # Logic Functions
  const openBasicEditModal = () => {
    const rawPhone = storeInfo.phone ? storeInfo.phone.replace(/-/g, '') : '';
    setEditBasicData({ ...storeInfo, phone: rawPhone });
    setBasicModalVisible(true);
  };

  const openHoursEditModal = () => {
    setEditHoursData(JSON.parse(JSON.stringify(operatingHours)));
    setHoursModalVisible(true);
  };

  const toggleSelection = (item, key) => {
    const currentList = editBasicData[key];
    if (currentList.includes(item)) {
      setEditBasicData({ ...editBasicData, [key]: currentList.filter(i => i !== item) });
    } else {
      setEditBasicData({ ...editBasicData, [key]: [...currentList, item] });
    }
  };

  const handleBasicSave = () => { setStoreInfo({ ...editBasicData }); setBasicModalVisible(false); };
  const handleHoursSave = () => { setOperatingHours(editHoursData); setHoursModalVisible(false); };

  const toggleHoliday = (index) => {
    const newHours = [...editHoursData];
    newHours[index].isClosed = !newHours[index].isClosed;
    setEditHoursData(newHours);
  };

  const handleMockAction = (msg) => Alert.alert("알림", msg);

  // # Time Picker Logic
  const openTimePicker = (index, field) => {
    setTargetIndex(index); setTargetField(field);
    const current24 = editHoursData[index][field];
    const { ampm, time } = convert24to12(current24);
    setTempAmpm(ampm); setTempTime(time); setPickerVisible(true);
  };

  const confirmTimePicker = () => {
    if (targetIndex !== null && targetField) {
      const time24 = convert12to24(tempAmpm, tempTime);
      const newHours = [...editHoursData];
      newHours[targetIndex][targetField] = time24;
      setEditHoursData(newHours);
    }
    setPickerVisible(false);
  };

  // # Calendar Logic
  const changeMonth = (direction) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)); };
  
  const handleDatePress = (dateStr) => {
    const today = getFormatDate(new Date());
    if (dateStr < today) return; 
    if (selectedHolidays.includes(dateStr)) setSelectedHolidays(selectedHolidays.filter(d => d !== dateStr));
    else setSelectedHolidays([...selectedHolidays, dateStr]);
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  };

  // # Menu List Logic
  const toggleMenuSoldOut = (id) => {
    setMenuList(prev => prev.map(item => item.id === id ? { ...item, isSoldOut: !item.isSoldOut } : item));
  };
  const toggleMenuRepresentative = (id) => {
    setMenuList(prev => prev.map(item => item.id === id ? { ...item, isRepresentative: !item.isRepresentative } : item));
  };

  // # Menu Modal Logic
  const openAddMenuModal = () => {
      setIsEditMode(false);
      setMenuForm({
          name: '', price: '', desc: '', category: selectedCategory,
          isRepresentative: false, badge: null, isSoldOut: false, isHidden: false
      });
      setMenuModalVisible(true);
  };

  const openEditMenuModal = (item) => {
      setIsEditMode(true);
      setMenuForm({
          name: item.name, price: item.price.replace(/,/g, '').replace('원', ''), desc: item.desc, category: selectedCategory,
          isRepresentative: item.isRepresentative, badge: item.badge, isSoldOut: item.isSoldOut, isHidden: false
      });
      setMenuModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Logo */}
        <Image source={require('@/assets/images/shopowner/logo2.png')} style={styles.logo} resizeMode="contain" />
        
        {/* Tabs */}
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

        {/* ==================== 매장 정보 탭 ==================== */}
        {activeTab === 'info' ? (
          <View style={{ gap: rs(20) }}>
            {/* Card 1: 기본 정보 */}
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
              <InfoRow icon="grid" label="가게 종류" content={<View style={styles.tagContainer}>{storeInfo.categories.length > 0 ? storeInfo.categories.map((cat, i) => <Tag key={i} text={cat} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>}/>
              <InfoRow icon="sparkles" label="가게 분위기" content={<View style={styles.tagContainer}>{storeInfo.vibes.length > 0 ? storeInfo.vibes.map((v, i) => <Tag key={i} text={v} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>}/>
              <InfoRow icon="information-circle" label="가게 소개" content={storeInfo.intro ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{storeInfo.intro}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} />
              <InfoRow icon="image" label="가게 이미지" content={<View style={styles.imageDisplayRow}><ImagePlaceholder label="로고" size={105} /><ImagePlaceholder label="배너" size={105} /></View>} />
              <InfoRow icon="location" label="주소" content={<View style={{ marginTop: rs(2) }}>{storeInfo.address ? (<><Text style={styles.bodyText}>{storeInfo.address}</Text>{storeInfo.detailAddress ? <Text style={[styles.bodyText, {color:'#828282', marginTop:rs(2)}]}>{storeInfo.detailAddress}</Text> : null}</>) : <Text style={[styles.placeholderText, {marginTop: 0}]}>정보 없음</Text>}</View>} />
              <InfoRow icon="call" label="전화번호" content={storeInfo.phone ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{storeInfo.phone}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} />
            </View>

            {/* Card 2: 영업시간 */}
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
                    {item.isClosed ? <View style={styles.closedBadge}><Text style={styles.timeText}>휴무</Text></View> : <View style={styles.timeDisplayContainer}><Text style={styles.timeText}>{item.open}</Text><Text style={styles.hyphen}>-</Text><Text style={styles.timeText}>{item.close}</Text></View>}
                  </View>
                ))}
              </View>
            </View>
            
            {/* Card 3: 매장 소식 */}
            <TouchableOpacity style={[styles.infoCard, { paddingVertical: rs(22) }]} activeOpacity={0.7} onPress={() => handleMockAction("매장 소식 페이지로 이동 (준비중)")}>
              <View style={styles.newsContentRow}>
                <View style={styles.newsLeftSection}>
                   <View style={styles.timeIconCircle}><Ionicons name="megaphone" size={rs(18)} color="#34B262" /></View>
                   <View><Text style={styles.headerTitle}>매장 소식</Text><Text style={styles.subTitle}>고객에게 전할 공지사항</Text></View>
                </View>
                <Ionicons name="chevron-forward" size={rs(18)} color="#34B262" />
              </View>
            </TouchableOpacity>

            {/* Card 4: 휴무일 캘린더 */}
            <View style={styles.infoCard}>
               <View style={styles.cardHeader}>
                 <View style={styles.headerTitleRow}>
                  <View style={styles.timeIconCircle}><Ionicons name="calendar" size={rs(18)} color="#34B262" /></View>
                  <View><Text style={styles.headerTitle}>휴무일</Text><Text style={styles.subTitle}>임시 휴무일을 터치로 지정</Text></View>
                </View>
              </View>
              <View style={styles.calendarControl}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}><Ionicons name="chevron-back" size={rs(20)} color="#ccc" /></TouchableOpacity>
                  <Text style={styles.calendarTitle}>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}><Ionicons name="chevron-forward" size={rs(20)} color="#ccc" /></TouchableOpacity>
              </View>
              <View style={styles.weekHeader}>
                  {WEEKDAYS.map((day, index) => (<Text key={index} style={[styles.weekText, index === 0 && {color:'#FF3E41'}, index === 6 && {color:'#007AFF'}]}>{day}</Text>))}
              </View>
              <View style={styles.daysGrid}>
                  {generateCalendar().map((date, index) => {
                      if (!date) return <View key={index} style={styles.dayCell} />;
                      const dateStr = getFormatDate(date);
                      const isSelected = selectedHolidays.includes(dateStr);
                      const isPast = dateStr < getFormatDate(new Date());
                      const dayOfWeek = date.getDay();
                      
                      const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
                      const tomorrow = new Date(date); tomorrow.setDate(date.getDate() + 1);
                      const isPrevSelected = selectedHolidays.includes(getFormatDate(yesterday));
                      const isNextSelected = selectedHolidays.includes(getFormatDate(tomorrow));

                      const cellStyle = [styles.dayBtn];
                      const textStyle = [styles.dayTextNum];
                      if (dayOfWeek === 0) textStyle.push({color: '#FF3E41'}); else if (dayOfWeek === 6) textStyle.push({color: '#007AFF'});
                      if (isSelected) {
                          cellStyle.push(styles.dayBtnSelected); textStyle.push({color: 'white', fontWeight: '700'});
                          if (isPrevSelected && dayOfWeek !== 0) cellStyle.push(styles.connectLeft);
                          if (isNextSelected && dayOfWeek !== 6) cellStyle.push(styles.connectRight);
                      }
                      if (isPast) textStyle.push({color: '#E0E0E0'});

                      return (<View key={index} style={styles.dayCell}><TouchableOpacity style={cellStyle} onPress={() => handleDatePress(dateStr)} disabled={isPast} activeOpacity={0.8}><Text style={textStyle}>{date.getDate()}</Text></TouchableOpacity></View>);
                  })}
              </View>
            </View>

            {/* Card 5: 영업 일시 중지 */}
            <View style={[styles.infoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rs(15), gap: rs(10) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(10), flex: 1 }}>
                    <View style={styles.alertIconCircle}><Ionicons name="warning" size={rs(18)} color="#DC2626" /></View>
                    <View style={{flex: 1}}><Text style={styles.headerTitle}>영업 일시 중지</Text><Text style={styles.subTitle}>급한 사정 시 가게를 잠시 닫습니다</Text></View>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsPaused(!isPaused)}>
                    <View style={[styles.customSwitch, isPaused ? styles.switchOn : styles.switchOff]}><View style={styles.switchKnob} /></View>
                </TouchableOpacity>
            </View>
            <View style={{height: rs(20)}} />
          </View>
        ) : (
          /* ==================== 메뉴 관리 탭 ==================== */
          <View style={{flex: 1}}>
              <View style={styles.categoryScrollContainer}>
                <View style={{ flex: 1 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingRight: rs(10) }}>
                        {menuCategories.map((category, index) => (
                            <TouchableOpacity key={index} style={[styles.categoryTab, selectedCategory === category ? styles.categoryTabSelected : styles.categoryTabUnselected]} onPress={() => setSelectedCategory(category)}>
                                <Text style={[styles.categoryText, selectedCategory === category ? styles.categoryTextSelected : styles.categoryTextUnselected]}>{category}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <TouchableOpacity style={styles.addCategoryBtn} onPress={() => setCategoryModalVisible(true)}>
                    <View style={styles.addCategoryIcon}><Ionicons name="add" size={rs(14)} color="#34B262" /></View>
                    <Text style={styles.addCategoryText}>메뉴 카테고리</Text>
                </TouchableOpacity>
              </View>

              {/* 메뉴 리스트 영역 */}
              {selectedCategory === '메인메뉴' ? (
                  <View style={styles.menuListContainer}>
                     {menuList.map((item) => (
                        <View key={item.id} style={styles.menuCard}>
                            <View style={styles.dragHandle}>
                                <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                                <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                                <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                            </View>
                            <View style={[styles.menuContent, item.isSoldOut && { opacity: 0.5 }]}>
                                <View style={styles.menuImageContainer}>
                                    <View style={styles.menuImagePlaceholder} />
                                    {item.isSoldOut && <View style={styles.soldOutOverlay} />}
                                    {item.isRepresentative && <View style={styles.imageStarBadge}><Ionicons name="star" size={rs(8)} color="white" /></View>}
                                </View>
                                <View style={styles.menuInfo}>
                                    <View style={styles.menuTitleRow}>
                                        <Text style={styles.menuName}>{item.name}</Text>
                                        {item.badge && <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>}
                                    </View>
                                    <Text style={styles.menuPrice}>{item.price}원</Text>
                                    <Text style={styles.menuDesc} numberOfLines={1}>{item.desc}</Text>
                                </View>
                            </View>
                            <View style={styles.menuActions}>
                                <TouchableOpacity onPress={() => toggleMenuRepresentative(item.id)}>
                                    <View style={[styles.actionCircle, item.isRepresentative ? {backgroundColor: '#FFFACA'} : {backgroundColor: '#F5F5F5'}]}>
                                        <Ionicons name="star" size={rs(12)} color={item.isRepresentative ? "#EAB308" : "#DADADA"} />
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.soldOutContainer}>
                                    <Text style={styles.soldOutLabel}>품절</Text>
                                    <TouchableOpacity onPress={() => toggleMenuSoldOut(item.id)}>
                                        <View style={[styles.soldOutSwitch, item.isSoldOut ? styles.soldOutOn : styles.soldOutOff]}><View style={styles.soldOutKnob} /></View>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={() => openEditMenuModal(item)}>
                                    <Ionicons name="pencil" size={rs(16)} color="#828282" />
                                </TouchableOpacity>
                            </View>
                        </View>
                     ))}
                  </View>
              ) : (
                  <View style={{height: rs(200)}} />
              )}

              {/* + 메뉴 추가하기 버튼 (하단) */}
              <TouchableOpacity style={styles.addMenuButton} onPress={openAddMenuModal}>
                  <View style={styles.addMenuIconBox}><Ionicons name="add" size={rs(10)} color="#34B262" /></View>
                  <Text style={styles.addMenuText}>메뉴 추가하기</Text>
              </TouchableOpacity>
              <View style={{height: rs(30)}} />

              {/* 카테고리 관리 모달 */}
              <Modal transparent={true} visible={categoryModalVisible} animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
                  <TouchableOpacity style={styles.catModalOverlay} activeOpacity={1} onPress={() => setCategoryModalVisible(false)}>
                      <View style={styles.catModalContent}>
                            <View style={styles.catModalItemOrange}>
                                <View style={{width: rs(25), height: rs(20), backgroundColor: '#F6A823', borderRadius: rs(8)}} />
                                <View style={styles.catModalIconBox}><Ionicons name="reorder-two" size={rs(12)} color="white" /></View>
                                <Text style={styles.catModalTextWhite}>메인메뉴</Text>
                            </View>
                            <View style={styles.catModalItem}>
                                <View style={{width: rs(25), height: rs(20), backgroundColor: 'white', borderRadius: rs(8)}} />
                                <View style={styles.catModalIconBoxWhite}><Ionicons name="reorder-two" size={rs(12)} color="#DADADA" /></View>
                                <Text style={styles.catModalTextBlack}>사이드</Text>
                            </View>
                            <View style={styles.catModalItem}>
                                <View style={{width: rs(25), height: rs(20), backgroundColor: 'white', borderRadius: rs(8)}} />
                                <View style={styles.catModalIconBoxWhite}><Ionicons name="reorder-two" size={rs(12)} color="#DADADA" /></View>
                                <Text style={styles.catModalTextBlack}>음료/주류</Text>
                            </View>
                            <View style={styles.catModalItem}>
                                <View style={{width: rs(25), height: rs(20), backgroundColor: 'white', borderRadius: rs(8)}} />
                                <View style={styles.catModalIconBoxWhite}><Ionicons name="reorder-two" size={rs(12)} color="#DADADA" /></View>
                                <Text style={styles.catModalTextBlack}>세트메뉴</Text>
                            </View>
                            <TouchableOpacity style={[styles.catModalItem, { gap: rs(2), marginTop: rs(10) }]}>
                                <View style={{width: rs(25), height: rs(20), backgroundColor: 'white', borderRadius: rs(8)}} />
                                <View style={styles.catModalIconBoxWhite}><Ionicons name="add" size={rs(12)} color="#828282" /></View>
                                <View style={{flexDirection:'row', alignItems:'center', gap: rs(2)}}>
                                     <View style={{width:rs(14), height:rs(14), justifyContent:'center', alignItems:'center', overflow:'hidden'}}>
                                         <View style={{width:rs(8.75), height:rs(8.75), backgroundColor:'rgba(130, 130, 130, 0.70)'}} />
                                     </View>
                                     <Text style={styles.catModalTextGray}>메뉴 카테고리</Text>
                                </View>
                            </TouchableOpacity>
                      </View>
                  </TouchableOpacity>
              </Modal>
          </View>
        )}
      </ScrollView>

      {/* =================================================================
         # Modal: Menu Add/Edit (메뉴 추가/수정)
         ================================================================= */}
      <Modal animationType="slide" transparent={true} visible={menuModalVisible} onRequestClose={() => setMenuModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.menuModalHeader}>
                    <Text style={styles.modalTitle}>{isEditMode ? '메뉴 수정' : '메뉴 추가'}</Text>
                    <TouchableOpacity onPress={() => setMenuModalVisible(false)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                        <Ionicons name="close" size={rs(24)} color="#333" />
                    </TouchableOpacity>
                </View>

                
                <ScrollView contentContainerStyle={styles.modalScroll}>
                    {/* 1. 기본 정보 */}
                    <Text style={styles.sectionTitle}>기본 정보</Text>
                    
                    {/* 사진 추가 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>메뉴 사진(1:1 비율 권장)</Text>
                        <TouchableOpacity style={styles.photoUploadBox} onPress={() => handleMockAction('사진첩 열기')}>
                            <View style={styles.cameraIconBox}><Ionicons name="camera" size={rs(18)} color="rgba(130, 130, 130, 0.70)" /></View>
                            <Text style={styles.photoUploadText}>사진 추가</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 메뉴명 */}
                    <View style={styles.inputGroup}>
                        <View style={{flexDirection:'row'}}><Text style={styles.inputLabel}>메뉴명 </Text><Text style={styles.requiredStar}>*</Text></View>
                        <View style={styles.textInputBox}>
                            <TextInput style={styles.textInput} placeholder="예: 마늘간장치킨" placeholderTextColor="#999" value={menuForm.name} onChangeText={(t) => setMenuForm({...menuForm, name: t})} />
                            <Text style={styles.charCount}>{menuForm.name.length}/20</Text>
                        </View>
                    </View>

                    {/* 가격 */}
                    <View style={styles.inputGroup}>
                        <View style={{flexDirection:'row'}}><Text style={styles.inputLabel}>가격 </Text><Text style={styles.requiredStar}>*</Text></View>
                        <View style={styles.textInputBox}>
                            <TextInput style={styles.textInput} keyboardType="numeric" placeholder="0" placeholderTextColor="#999" value={menuForm.price} onChangeText={(t) => setMenuForm({...menuForm, price: t})} />
                            <Text style={styles.unitText}>원</Text>
                        </View>
                    </View>

                    {/* 설명 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>메뉴 설명</Text>
                        <View style={[styles.textInputBox, {height: rs(60), alignItems: 'flex-start', paddingVertical: rs(10)}]}>
                            <TextInput style={[styles.textInput, {height: '100%'}]} multiline placeholder="특제 간장소스로 맛을 낸 짭쪼름한 치킨" placeholderTextColor="#999" value={menuForm.desc} onChangeText={(t) => setMenuForm({...menuForm, desc: t})} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 2. 카테고리 및 속성 */}
                    <Text style={styles.sectionTitle}>카테고리 및 속성</Text>

                    {/* 메뉴 카테고리 (dropdown mock) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>메뉴 카테고리</Text>
                        <View style={styles.dropdownBox}>
                            <Text style={styles.dropdownText}>{menuForm.category}</Text>
                            <Ionicons name="caret-down" size={rs(10)} color="#333" />
                        </View>
                    </View>

                    {/* 대표 메뉴 설정 */}
                    <TouchableOpacity style={styles.optionRow} onPress={() => setMenuForm({...menuForm, isRepresentative: !menuForm.isRepresentative})}>
                        <View style={[styles.checkBoxSquare, menuForm.isRepresentative && {backgroundColor: '#34B262', borderColor: '#34B262'}]}>
                            {menuForm.isRepresentative && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                        </View>
                        <View>
                            <Text style={styles.optionTitle}>우리 가게 대표 메뉴로 설정</Text>
                            <Text style={styles.optionDesc}>고객 앱 최상단 '사장님 추천' 영역에 우선 노출됩니다</Text>
                        </View>
                    </TouchableOpacity>

                    {/* 배지 설정 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>배지설정</Text>
                        <View style={{flexDirection: 'row', gap: rs(8)}}>
                            {BADGE_TYPES.map((badge) => (
                                <TouchableOpacity 
                                    key={badge} 
                                    style={[styles.badgeChip, menuForm.badge === badge ? styles.badgeChipSelected : styles.badgeChipUnselected]}
                                    onPress={() => setMenuForm({...menuForm, badge: menuForm.badge === badge ? null : badge})}
                                >
                                    <Text style={[styles.badgeText, menuForm.badge === badge ? {color:'white', fontWeight:'600'} : {color:'black'}]}>{badge}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* 3. 상태 설정 */}
                    <Text style={styles.sectionTitle}>상태 설정</Text>

                    {/* 품절 토글 */}
                    <View style={styles.toggleRow}>
                        <View>
                            <Text style={styles.optionTitle}>품절</Text>
                            <Text style={styles.optionDesc}>품절 시 고객에게 표시됩니다</Text>
                        </View>
                        <TouchableOpacity onPress={() => setMenuForm({...menuForm, isSoldOut: !menuForm.isSoldOut})}>
                            <View style={[styles.menuToggleSwitch, menuForm.isSoldOut ? styles.menuToggleOn : styles.menuToggleOff]}>
                                <View style={styles.menuToggleKnob} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 숨기기 토글 */}
                    <View style={styles.toggleRow}>
                        <View>
                            <Text style={styles.optionTitle}>메뉴 숨기기</Text>
                            <Text style={styles.optionDesc}>메뉴판에서 임시로 숨깁니다</Text>
                        </View>
                        <TouchableOpacity onPress={() => setMenuForm({...menuForm, isHidden: !menuForm.isHidden})}>
                            <View style={[styles.menuToggleSwitch, menuForm.isHidden ? styles.menuToggleOn : styles.menuToggleOff]}>
                                <View style={styles.menuToggleKnob} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{height: rs(5)}} /> 
                </ScrollView>

                {/* 하단 고정 추가하기 버튼 */}
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.modalSubmitBtn} onPress={() => { setMenuModalVisible(false); handleMockAction(isEditMode ? "수정 완료" : "추가 완료"); }}>
                        <Text style={styles.modalSubmitText}>{isEditMode ? '수정하기' : '추가하기'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Basic Modal & Hours Modal */}
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
                <EditSection icon="information-circle" label="가게 소개"><View style={styles.inputWrapper}><TextInput style={styles.textInput} placeholder="가게를 소개하는 글을 적어주세요" value={editBasicData.intro} onChangeText={(text) => setEditBasicData({...editBasicData, intro: text})} /><Text style={styles.charCount}>{editBasicData.intro.length}/50</Text></View></EditSection>
                <EditSection icon="image" label="가게 이미지"><View style={styles.imageDisplayRow}><TouchableOpacity style={styles.uploadBoxWrapper} onPress={() => handleMockAction("갤러리 연결")}><Text style={styles.uploadLabel}>로고</Text><View style={[styles.uploadBox, { width: rs(90), height: rs(90) }]}><Ionicons name="camera" size={rs(20)} color="#aaa" /><Text style={styles.uploadPlaceholder}>로고 업로드</Text></View></TouchableOpacity><TouchableOpacity style={styles.uploadBoxWrapper} onPress={() => handleMockAction("갤러리 연결")}><Text style={styles.uploadLabel}>배너</Text><View style={[styles.uploadBox, { width: rs(90), height: rs(90) }]}><Ionicons name="image" size={rs(20)} color="#aaa" /><Text style={styles.uploadPlaceholder}>배너 업로드</Text></View></TouchableOpacity></View></EditSection>
                <EditSection icon="location" label="주소"><TouchableOpacity style={[styles.inputWrapper, {marginBottom: rs(8)}]} onPress={() => handleMockAction("주소 검색")}><Text style={[styles.textInput, {color: editBasicData.address ? 'black' : '#ccc'}]}>{editBasicData.address || "건물명, 도로명 또는 지번 검색"}</Text><Ionicons name="search" size={rs(16)} color="#ccc" style={{marginRight: rs(10)}}/></TouchableOpacity><View style={[styles.inputWrapper, {backgroundColor: 'rgba(218, 218, 218, 0.50)'}]}><TextInput style={styles.textInput} placeholder="상세주소를 입력해주세요." value={editBasicData.detailAddress} onChangeText={(text) => setEditBasicData({...editBasicData, detailAddress: text})} /></View></EditSection>
                <EditSection icon="call" label="전화번호"><View style={styles.inputWrapper}><TextInput style={styles.textInput} placeholder="숫자만 입력해주세요" keyboardType="number-pad" value={editBasicData.phone} onChangeText={(text) => setEditBasicData({...editBasicData, phone: text.replace(/[^0-9]/g, '')})} /></View></EditSection>
             </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={hoursModalVisible} onRequestClose={() => setHoursModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { height: 'auto', maxHeight: rs(600) }]}> 
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: rs(8)}}><View style={styles.timeIconCircleSmall}><Ionicons name="time" size={rs(14)} color="#34B262" /><View style={styles.greenDotDecoSmall} /></View><Text style={styles.modalTitle}>영업시간</Text></View>
                 <TouchableOpacity style={styles.saveButton} onPress={handleHoursSave}><Text style={styles.saveButtonText}>완료</Text></TouchableOpacity>
              </View>
              <Text style={[styles.subTitle, {marginBottom: rs(15)}]}>요일별 설정</Text>
              {editHoursData.map((item, index) => {
                  const open12 = convert24to12(item.open); const close12 = convert24to12(item.close);
                  return (
                  <View key={index} style={styles.editHourRow}>
                      <Text style={styles.editHourDay}>{item.day}</Text>
                      <View style={styles.timeInputGroup}>
                          <TouchableOpacity style={styles.timeInputBox} onPress={() => !item.isClosed && openTimePicker(index, 'open')} activeOpacity={0.7}><Text style={styles.timeLabel}>{open12.ampm}</Text><Text style={styles.timeValue}>{open12.time}</Text><Ionicons name="caret-down" size={rs(10)} color="black" /></TouchableOpacity>
                          <Text style={{marginHorizontal:5, color:'black'}}>~</Text>
                          <TouchableOpacity style={styles.timeInputBox} onPress={() => !item.isClosed && openTimePicker(index, 'close')} activeOpacity={0.7}><Text style={styles.timeLabel}>{close12.ampm}</Text><Text style={styles.timeValue}>{close12.time}</Text><Ionicons name="caret-down" size={rs(10)} color="black" /></TouchableOpacity>
                          {item.isClosed && <View style={styles.blurOverlay} />}
                      </View>
                      <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleHoliday(index)}>
                          <View style={[styles.checkbox, item.isClosed && styles.checkboxChecked]}>{item.isClosed && <Ionicons name="checkmark" size={rs(10)} color="white" />}</View><Text style={styles.checkboxLabel}>휴무</Text>
                      </TouchableOpacity>
                  </View>
              )})}
              <View style={{height: rs(20)}} />
            </ScrollView>
            {pickerVisible && (
              <View style={styles.bottomSheetOverlay}>
                <TouchableOpacity style={styles.bottomSheetBackdrop} activeOpacity={1} onPress={() => setPickerVisible(false)} />
                <View style={styles.bottomSheetContainer}>
                  <View style={styles.bottomSheetHeader}><Text style={styles.bottomSheetTitle}>시간 선택</Text><TouchableOpacity onPress={confirmTimePicker}><Text style={styles.confirmText}>확인</Text></TouchableOpacity></View>
                  <View style={styles.pickerBody}>
                    <View style={styles.pickerColumn}><Text style={styles.pickerColumnTitle}>오전/오후</Text><ScrollView style={{height: rs(150)}} showsVerticalScrollIndicator={false}>{['오전', '오후'].map(ampm => (<TouchableOpacity key={ampm} style={[styles.pickerItem, tempAmpm === ampm && styles.pickerItemSelected]} onPress={() => setTempAmpm(ampm)}><Text style={[styles.pickerItemText, tempAmpm === ampm && styles.pickerItemTextSelected]}>{ampm}</Text>{tempAmpm === ampm && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}</TouchableOpacity>))}</ScrollView></View>
                    <View style={{width: 1, height: '80%', backgroundColor: '#eee'}} />
                    <View style={styles.pickerColumn}><Text style={styles.pickerColumnTitle}>시간 (5분 단위)</Text><ScrollView style={{height: rs(150)}} showsVerticalScrollIndicator={false}>{TIME_12H.map(time => (<TouchableOpacity key={time} style={[styles.pickerItem, tempTime === time && styles.pickerItemSelected]} onPress={() => setTempTime(time)}><Text style={[styles.pickerItemText, tempTime === time && styles.pickerItemTextSelected]}>{time}</Text>{tempTime === time && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}</TouchableOpacity>))}</ScrollView></View>
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

// Sub-Components
const InfoRow = ({ icon, label, content }) => (<View style={styles.rowSection}><View style={styles.fixedLabel}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View><View style={styles.contentArea}>{content}</View></View>);
const EditSection = ({ icon, label, children }) => (<View style={styles.editSection}><View style={styles.labelRow}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View>{children}</View>);
const Tag = ({ text }) => <View style={styles.tagBox}><Text style={styles.tagText}>{text}</Text></View>;
const ImagePlaceholder = ({ label, size = 90 }) => (<View style={styles.uploadBoxWrapper}><Text style={styles.uploadLabel}>{label}</Text><View style={[styles.uploadBox, { width: rs(size), height: rs(size) }]}><Ionicons name={label==='로고'?'camera':'image'} size={rs(24)} color="#aaa" /><Text style={styles.uploadPlaceholder}>{label} 업로드</Text></View></View>);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight: 0,},
  scrollContent: { paddingTop: rs(10), paddingBottom: rs(40), paddingHorizontal: rs(20) },
  logo: { width: rs(120), height: rs(30), marginBottom: rs(20) },
  tabWrapper: { alignItems: 'center', marginBottom: rs(20) },
  tabContainer: { width: '100%', height: rs(48), backgroundColor: 'rgba(218, 218, 218, 0.40)', borderRadius: rs(10), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(4) },
  tabButton: { flex: 1, height: rs(40), justifyContent: 'center', alignItems: 'center', borderRadius: rs(8) },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  inactiveTab: { backgroundColor: 'transparent' },
  tabText: { fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard' },
  activeText: { color: 'black' },
  inactiveText: { color: '#828282' },
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
  hourRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(4) },
  dayText: { width: rs(30), fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
  timeDisplayContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  timeText: { fontSize: rs(11), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
  hyphen: { fontSize: rs(13), fontWeight: '500', color: 'black' },
  closedBadge: { paddingHorizontal: rs(10), paddingVertical: rs(4), backgroundColor: '#E0EDE4', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: rs(335), height: rs(650), backgroundColor: 'white', borderRadius: rs(8), overflow: 'hidden' },
  modalScroll: { padding: rs(20) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  
  // 메뉴 추가 모달 헤더 스타일 (여백 및 패딩 조정)
  menuModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(20), marginBottom: rs(5), paddingBottom: rs(15), paddingHorizontal: rs(20), borderBottomWidth: 1, borderBottomColor: '#eee', },
  
  modalTitle: { fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  saveButton: { width: rs(41), height: rs(23), backgroundColor: '#34B262', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
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
  newsContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  newsLeftSection: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  calendarControl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(15), paddingHorizontal: rs(10) },
  calendarTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
  navButton: { padding: rs(5) },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(5) },
  weekText: { width: '14%', textAlign: 'center', fontSize: rs(13), fontWeight: '500', color: '#333', fontFamily: 'Pretendard' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: rs(2) },
  dayBtn: { width: rs(34), height: rs(34), borderRadius: rs(17), alignItems: 'center', justifyContent: 'center' },
  dayTextNum: { fontSize: rs(13), fontWeight: '500', color: '#333', fontFamily: 'Pretendard' },
  dayBtnSelected: { backgroundColor: '#F6A823' },
  connectLeft: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: rs(-6), paddingLeft: rs(6), width: rs(40) },
  connectRight: { borderTopRightRadius: 0, borderBottomRightRadius: 0, marginRight: rs(-6), paddingRight: rs(6), width: rs(40) },
  alertIconCircle: { width: rs(35), height: rs(35), borderRadius: rs(17.5), backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  customSwitch: { width: rs(42), height: rs(24), borderRadius: rs(12), justifyContent: 'center', paddingHorizontal: rs(2) },
  switchOn: { backgroundColor: '#34B262', alignItems: 'flex-end' },
  switchOff: { backgroundColor: '#E2E9E4', alignItems: 'flex-start' },
  switchKnob: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: 'white', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  categoryScrollContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(15) },
  categoryTab: { paddingHorizontal: rs(12), paddingVertical: rs(8), borderRadius: rs(10), marginRight: rs(8), borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  categoryTabSelected: { backgroundColor: '#34B262', borderColor: '#34B262' },
  categoryTabUnselected: { backgroundColor: 'transparent', borderColor: '#DADADA' },
  categoryText: { fontSize: rs(10), fontWeight: '600', fontFamily: 'Inter' },
  categoryTextSelected: { color: '#F5F5F5' },
  categoryTextUnselected: { color: 'black' },
  addCategoryBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(2), paddingLeft: rs(5) },
  addCategoryIcon: { width: rs(14), height: rs(14), justifyContent: 'center', alignItems: 'center' },
  addCategoryText: { color: '#34B262', fontSize: rs(10), fontWeight: '500', fontFamily: 'Inter' },
  catModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }, 
  catModalContent: { width: rs(287), backgroundColor: 'white', borderRadius: rs(12), padding: rs(5), shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.05, elevation: 5 },
  catModalItem: { flexDirection: 'row', alignItems: 'center', gap: rs(5), paddingVertical: rs(3), paddingHorizontal: rs(5), height: rs(26), borderRadius: rs(8) },
  catModalItemOrange: { flexDirection: 'row', alignItems: 'center', gap: rs(5), paddingVertical: rs(3), paddingHorizontal: rs(5), height: rs(26), backgroundColor: '#F6A823', borderRadius: rs(8) },
  catModalIconBox: { width: rs(16), height: rs(16), borderRadius: rs(8), overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  catModalIconBoxWhite: { width: rs(16), height: rs(16), borderRadius: rs(8), overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderColor: 'transparent' },
  catModalTextWhite: { color: 'white', fontSize: rs(11), fontFamily: 'Inter', fontWeight: '600' },
  catModalTextBlack: { color: 'black', fontSize: rs(11), fontFamily: 'Inter', fontWeight: '400' },
  catModalTextGray: { color: '#828282', fontSize: rs(10), fontFamily: 'Inter', fontWeight: '400' },
  menuListContainer: { gap: rs(12) },
  menuCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(11), paddingVertical: rs(22), backgroundColor: 'white', borderRadius: rs(12), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  dragHandle: { width: rs(20), alignItems: 'center', justifyContent: 'center', gap: rs(3), marginRight: rs(10) },
  dragDotRow: { flexDirection: 'row', gap: rs(3) },
  dragDot: { width: rs(3), height: rs(3), borderRadius: rs(1.5), backgroundColor: '#757575' },
  menuContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: rs(10) },
  menuImageContainer: { position: 'relative' },
  menuImagePlaceholder: { width: rs(56), height: rs(56), borderRadius: rs(12), backgroundColor: '#EDF3EF' },
  soldOutOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: rs(12), zIndex: 1 },
  imageStarBadge: { position: 'absolute', top: rs(-5), left: rs(-5), width: rs(16), height: rs(16), borderRadius: rs(8), backgroundColor: '#FACC15', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderWidth: 1, borderColor: 'white' },
  menuInfo: { flex: 1, justifyContent: 'center' },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(4), marginBottom: rs(2) },
  menuName: { fontSize: rs(13), color: 'black', fontFamily: 'Inter', fontWeight: '400' },
  menuBadge: { backgroundColor: '#34B262', borderRadius: rs(10), paddingHorizontal: rs(6), paddingVertical: rs(2) },
  menuBadgeText: { fontSize: rs(8), color: 'white', fontFamily: 'Inter', fontWeight: '600' },
  menuPrice: { fontSize: rs(15), color: '#34B262', fontFamily: 'Inter', fontWeight: '600', marginBottom: rs(2) },
  menuDesc: { fontSize: rs(9), color: '#828282', fontFamily: 'Inter', fontWeight: '500' },
  menuActions: { flexDirection: 'row', alignItems: 'center', gap: rs(15), marginLeft: rs(10) },
  actionCircle: { width: rs(19), height: rs(19), borderRadius: rs(9.5), justifyContent: 'center', alignItems: 'center' },
  soldOutContainer: { alignItems: 'center', gap: rs(4) },
  soldOutLabel: { fontSize: rs(9), color: '#828282', fontFamily: 'Inter', fontWeight: '500' },
  soldOutSwitch: { width: rs(34), height: rs(17), borderRadius: rs(9), justifyContent: 'center', paddingHorizontal: rs(2) },
  soldOutOn: { backgroundColor: '#FF3E41', alignItems: 'flex-end' },
  soldOutOff: { backgroundColor: '#E2E9E4', alignItems: 'flex-start' },
  soldOutKnob: { width: rs(14), height: rs(14), borderRadius: rs(7), backgroundColor: 'white', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 1 },
  addMenuButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: rs(15), },
  addMenuIconBox: { width: rs(14), height: rs(14), justifyContent: 'center', alignItems: 'center' },
  addMenuText: { fontSize: rs(10), color: '#34B262', fontFamily: 'Inter', fontWeight: '500' },
  sectionTitle: { fontSize: rs(13), fontWeight: '600', fontFamily: 'Inter', color: 'black', marginBottom: rs(10) },
  inputGroup: { marginBottom: rs(15) },
  inputLabel: { fontSize: rs(11), fontWeight: '500', fontFamily: 'Inter', color: '#828282', marginBottom: rs(4) },
  requiredStar: { fontSize: rs(11), fontWeight: '500', fontFamily: 'Inter', color: '#FF3E41' },
  photoUploadBox: { width: rs(108), height: rs(108), backgroundColor: 'rgba(217, 217, 217, 0.50)', borderRadius: rs(8), borderWidth: 1, borderColor: 'rgba(130, 130, 130, 0.30)', justifyContent: 'center', alignItems: 'center', gap: rs(5) },
  cameraIconBox: { width: rs(31), height: rs(31), backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', borderRadius: rs(4) }, 
  photoUploadText: { fontSize: rs(11), color: 'rgba(130, 130, 130, 0.70)', fontFamily: 'Inter' },
  textInputBox: { flexDirection: 'row', alignItems: 'center', height: rs(36), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), paddingHorizontal: rs(10) },
  textInput: { flex: 1, fontSize: rs(11), fontFamily: 'Inter', color: 'black', paddingVertical: 0 },
  charCount: { fontSize: rs(10), color: '#828282', fontFamily: 'Inter' },
  unitText: { fontSize: rs(11), color: '#828282', fontFamily: 'Inter' },
  divider: { height: rs(1), backgroundColor: '#E5E5E5', marginVertical: rs(20) },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: rs(36), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), paddingHorizontal: rs(10) },
  dropdownText: { fontSize: rs(11), fontFamily: 'Inter', color: 'black' },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', padding: rs(10), backgroundColor: '#F4F7F4', borderRadius: rs(8), gap: rs(10), marginBottom: rs(15) },
  checkBoxSquare: { width: rs(16), height: rs(16), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(4), backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginTop: rs(2) },
  optionTitle: { fontSize: rs(11), fontWeight: '500', fontFamily: 'Inter', color: 'black' },
  optionDesc: { fontSize: rs(10), fontWeight: '400', fontFamily: 'Inter', color: '#828282', marginTop: rs(2) },
  badgeChip: { paddingHorizontal: rs(10), paddingVertical: rs(6), borderRadius: rs(10), borderWidth: 1, borderColor: '#DADADA' },
  badgeChipSelected: { backgroundColor: '#34B262', borderColor: '#34B262' },
  badgeChipUnselected: { backgroundColor: 'white' },
  badgeText: { fontSize: rs(10), fontFamily: 'Inter' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: rs(10), backgroundColor: '#F4F7F4', borderRadius: rs(8), marginBottom: rs(10) },
  menuToggleSwitch: { width: rs(51), height: rs(22), borderRadius: rs(11), justifyContent: 'center', paddingHorizontal: rs(2) },
  menuToggleOn: { backgroundColor: '#34B262', alignItems: 'flex-end' },
  menuToggleOff: { backgroundColor: '#E2E9E4', alignItems: 'flex-start' },
  menuToggleKnob: { width: rs(18), height: rs(18), borderRadius: rs(9), backgroundColor: 'white', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 1 },
  modalFooter: { padding: rs(20), borderTopWidth: 1, borderColor: '#eee', backgroundColor: 'white' },
  modalSubmitBtn: { backgroundColor: '#34B262', borderRadius: rs(8), height: rs(42), justifyContent: 'center', alignItems: 'center' },
  modalSubmitText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Inter' }
});