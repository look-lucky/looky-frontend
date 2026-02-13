import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import { createCoupon, getCouponsByStore, verifyCoupon } from '@/src/api/coupon';
import { countFavorites } from '@/src/api/favorite';
import { getMyStores } from '@/src/api/store';

// 날짜 포맷 헬퍼
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}까지`;
};

const formatDateTimeFull = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    return `${year}.${month}.${day} ${ampm} ${hours}:${minutes}`;
};

export default function CouponScreen({ navigation, route }) {
    const [activeTab, setActiveTab] = useState('coupon');

    // [데이터 상태]
    const [storeId, setStoreId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activeCoupons, setActiveCoupons] = useState([]);   // 진행 중 쿠폰
    const [expiredCoupons, setExpiredCoupons] = useState([]); // 종료된 쿠폰
    const [patronCount, setPatronCount] = useState(0);        // 단골 수

    // [모달 & 검증 상태]
    const [usageModalVisible, setUsageModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createStep, setCreateStep] = useState(1); // [새 쿠폰] 1: 타입선택, 2: 상세입력
    const [selectedType, setSelectedType] = useState('FIXED_AMOUNT'); // [새 쿠폰] 선택된 타입
    const [couponInput, setCouponInput] = useState('');

    // [새 쿠폰 - 상세 정보]
    const [couponName, setCouponName] = useState('');
    const [benefitValue, setBenefitValue] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, valid, expired, invalid
    const [isCouponUsed, setIsCouponUsed] = useState(false);
    const [verifiedCouponData, setVerifiedCouponData] = useState(null); // 검증된 쿠폰 정보

    // [새 쿠폰 - 수량 & 기간]
    const [totalQuantity, setTotalQuantity] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [validDays, setValidDays] = useState(0); // 0이면 발급 만료 시간
    const [customValidDaysInput, setCustomValidDaysInput] = useState('');
    const [isValidDaysDropdownOpen, setIsValidDaysDropdownOpen] = useState(false);
    const [isCustomValidDaysMode, setIsCustomValidDaysMode] = useState(false);
    const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [activePeriodTab, setActivePeriodTab] = useState('start'); // start, end
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
    const [isIssuePeriodSelected, setIsIssuePeriodSelected] = useState(false);
    const [isStartDatePicked, setIsStartDatePicked] = useState(false);
    const [isEndDatePicked, setIsEndDatePicked] = useState(false);
    const [isExitConfirmVisible, setIsExitConfirmVisible] = useState(false);

    // [헬퍼] 숫자 콤마 포맷팅
    const formatNumber = (val) => {
        if (!val) return '';
        const num = val.toString().replace(/[^0-9]/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // [헬퍼] 날짜 포맷팅 (M월 D일 오전/오후 H:MM)
    const formatDateKorean = (date) => {
        if (!date) return '';
        const m = date.getMonth() + 1;
        const d = date.getDate();
        let h = date.getHours();
        const ampm = h >= 12 ? '오후' : '오전';
        h = h % 12;
        h = h ? h : 12; // 0시 -> 12시
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${m}월 ${d}일 ${ampm} ${h}:${min}`;
    };

    // [헬퍼] 전체 날짜 포맷팅 (YYYY.MM.DD 오전/오후 HH:MM)
    const formatFullDateKorean = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        let h = date.getHours();
        const ampm = h >= 12 ? '오후' : '오전';
        const h12 = h % 12 || 12;
        const min = date.getMinutes().toString().padStart(2, '0');
        return `${y}.${m}.${d} ${ampm} ${h12}:${min}`;
    };

    // [헬퍼] 기간 문자열 생성
    const formatPeriodString = (start, end) => {
        if (!start || !end) return '';
        return `${formatFullDateKorean(start)} - ${formatFullDateKorean(end)}`;
    };

    // [헬퍼] 종료 일시 유효성 검사 및 보정
    const validateEndDate = (start, end) => {
        if (end <= start) {
            const newEnd = new Date(start.getTime() + 1 * 60 * 60 * 1000); // 최소 1시간 뒤
            return newEnd;
        }
        return end;
    };

    // [헬퍼] 달력 날짜 생성
    const getCalendarDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        const startPadding = firstDay.getDay(); // 0(일) ~ 6(토)

        // 이전 달 끝부분
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, month: 'prev', date: new Date(year, month - 1, prevMonthLastDay - i) });
        }

        // 현재 달
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ day: i, month: 'curr', date: new Date(year, month, i) });
        }

        // 다음 달 시작부분 (6x7 그리드 맞추기)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({ day: i, month: 'next', date: new Date(year, month + 1, i) });
        }

        return days;
    };

    // [핸들러] 날짜 클릭
    const handleDatePress = (dayObj) => {
        Keyboard.dismiss();
        if (dayObj.month !== 'curr') return;

        const selectedDate = new Date(dayObj.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activePeriodTab === 'start') {
            // [제약] 시작 일시: 오늘부터 다음 달 말일까지만 선택 가능
            const nextMonthLimit = new Date();
            nextMonthLimit.setMonth(nextMonthLimit.getMonth() + 2);
            nextMonthLimit.setDate(0); // 다음 달의 마지막 날
            nextMonthLimit.setHours(23, 59, 59, 999);

            if (selectedDate < today || selectedDate > nextMonthLimit) return;

            // 시간 유지
            selectedDate.setHours(customStartDate.getHours(), customStartDate.getMinutes());
            setCustomStartDate(selectedDate);
            setIsStartDatePicked(true);

            // 시작일시 변경 시 종료일시 자동 검증/보정 (가드 제거)
            setCustomEndDate(validateEndDate(selectedDate, customEndDate));
        } else {
            // [제약] 종료 일시: 시작 일시보다 이전 날짜 선택 불가
            // 시작일이 아직 안 골라졌다면 오늘 기준으로 비교
            const compareDate = isStartDatePicked ? new Date(customStartDate) : today;
            compareDate.setHours(0, 0, 0, 0);

            if (selectedDate < compareDate) return;

            selectedDate.setHours(customEndDate.getHours(), customEndDate.getMinutes());

            // 시간까지 포함하여 최종 검증
            const finalStart = isStartDatePicked ? customStartDate : today;
            setCustomEndDate(validateEndDate(finalStart, selectedDate));
            setIsEndDatePicked(true);
        }
    };

    // [핸들러] 월 이동
    const handleMonthChange = (direction) => {
        const nextDate = new Date(currentCalendarDate);
        nextDate.setMonth(nextDate.getMonth() + direction);

        const today = new Date();
        const minDate = new Date(today.getFullYear(), today.getMonth(), 1);

        if (direction === -1 && nextDate < minDate) return; // 지난 달로 이동 불가

        setCurrentCalendarDate(nextDate);
    };

    const isStep2Valid = couponName.trim() !== '' && benefitValue.trim() !== '' && minOrderAmount.trim() !== '';
    const isStep3Valid = isIssuePeriodSelected && (isUnlimited || (totalQuantity.trim() !== '' && !isNaN(totalQuantity.replace(/,/g, ''))));

    useEffect(() => {
        if (route.params?.initialTab) {
            setActiveTab(route.params.initialTab);
        }
    }, [route.params]);

    // --------------------------------------------------------
    // [새 쿠폰] 타입 선택 핸들러
    const handleOptionPress = (type) => {
        if (selectedType === type) {
            setCreateStep(2);
        } else {
            setSelectedType(type);
            setValidDays(0);
            setTotalQuantity('');
        }
    };

    const handlePrevStep = () => {
        Keyboard.dismiss();
        if (createStep === 4) {
            setCreateStep(3);
        } else if (createStep === 3) {
            setCreateStep(2);
        } else {
            setCreateStep(1);
            setCouponName('');
            setBenefitValue('');
            setMinOrderAmount('');
            setValidDays(0);
            setTotalQuantity('');
            setIsIssuePeriodSelected(false);
        }
    };

    // [핸들러] 쿠폰 발행 (Step 4)
    const handleCreateCoupon = async () => {
        try {
            // [최종 검증] 종료일이 시작일보다 빨라서는 안됨 (서버 422 방지)
            if (customEndDate <= customStartDate) {
                const correctedEnd = validateEndDate(customStartDate, customEndDate);
                setCustomEndDate(correctedEnd);
                // 보정된 값으로 신청 진행
            }
            setIsLoading(true);

            // 데이터 매핑
            const benefitTypeMap = {
                'FIXED_AMOUNT': 'FIXED_DISCOUNT',
                'PERCENTAGE': 'PERCENTAGE_DISCOUNT',
                'GIFT': 'SERVICE_GIFT'
            };

            const requestBody = {
                title: couponName,
                benefitType: benefitTypeMap[selectedType],
                benefitValue: benefitValue,
                minOrderAmount: Number(minOrderAmount.replace(/,/g, '')),
                totalQuantity: isUnlimited ? null : Number(totalQuantity.replace(/,/g, '')),
                validDays: validDays,
                limitPerUser: 1, // 기본값
                issueStartsAt: customStartDate.toISOString(),
                issueEndsAt: customEndDate.toISOString(),
                status: 'ACTIVE'
            };

            const res = await createCoupon(storeId, requestBody);

            if (res.status === 201) {
                // 성공 캐시 무효화 및 데이터 새로고침
                await fetchData();
                setCreateModalVisible(false);
                setCreateStep(1);
                // 필드 초기화
                setCouponName('');
                setBenefitValue('');
                setMinOrderAmount('');
                setTotalQuantity('');
                setIsUnlimited(false);
                setValidDays(0);
                setCustomStartDate(new Date());
                setCustomEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                setIsIssuePeriodSelected(false);
            } else {
                console.error("쿠폰 발행 실패:", res);
                alert("쿠폰 발행에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("쿠폰 발행 에러:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // --------------------------------------------------------
    // [API] 데이터 로딩 함수
    // --------------------------------------------------------
    const fetchData = async () => {
        try {
            setIsLoading(true);

            // 1. 선택된 가게 ID 가져오기 (AsyncStorage)
            let currentStoreId = await AsyncStorage.getItem('SELECTED_STORE_ID');

            // 2. 만약 저장된 ID가 없으면 내 가게 목록에서 첫 번째 가져오기
            if (!currentStoreId) {
                const storeRes = await getMyStores();
                const myStores = storeRes.data?.data || [];
                if (myStores && myStores.length > 0) {
                    currentStoreId = myStores[0].id.toString();
                    await AsyncStorage.setItem('SELECTED_STORE_ID', currentStoreId);
                }
            }

            if (!currentStoreId) {
                console.log("가게 정보가 없습니다.");
                setIsLoading(false);
                return;
            }

            const storeIdNum = parseInt(currentStoreId, 10);
            setStoreId(storeIdNum);

            // 3. 쿠폰 목록 & 단골 수 병렬 요청
            const [couponsRes, favRes] = await Promise.all([
                getCouponsByStore(storeIdNum).catch(() => ({ data: { data: [] } })),
                countFavorites(storeIdNum).catch(() => ({ data: { data: 0 } }))
            ]);

            // 3. 단골 수 설정
            setPatronCount(favRes.data?.data || 0);

            // 4. 쿠폰 분류 (진행중 vs 종료됨)
            const allCoupons = couponsRes.data?.data || [];
            const today = new Date();

            const active = [];
            const expired = [];

            allCoupons.forEach(coupon => {
                const endDateStr = coupon.issueEndsAt || coupon.expiredAt;
                const expireDate = endDateStr ? new Date(endDateStr) : new Date(8640000000000000);

                // UI에 맞게 데이터 가공
                const mappedCoupon = {
                    id: coupon.id,
                    title: coupon.title || coupon.name,
                    startsAt: coupon.issueStartsAt,
                    endsAt: coupon.issueEndsAt || coupon.expiredAt,
                    date: endDateStr ? formatDate(endDateStr) : "기한 없음",
                    issued: coupon.issuedCount || 0,
                    used: coupon.usedCount || 0,
                    total: coupon.totalQuantity || -1, // -1 means unlimited
                    validDays: coupon.validDays || 0,
                    type: coupon.benefitType, // 'FIXED_DISCOUNT' | 'PERCENTAGE_DISCOUNT' | 'SERVICE_GIFT'
                };

                // 만료일이 지났거나 상태가 EXPIRED면 종료된 쿠폰
                if (coupon.status === 'EXPIRED' || expireDate < today) {
                    expired.push(mappedCoupon);
                } else {
                    active.push(mappedCoupon);
                }
            });

            setActiveCoupons(active);
            setExpiredCoupons(expired);

        } catch (error) {
            console.error("쿠폰 데이터 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 화면 포커스 시 데이터 갱신
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    // --------------------------------------------------------
    // [로직] 쿠폰 번호 검증 (API 연결)
    // --------------------------------------------------------
    const handleVerifyCoupon = async () => {
        if (!storeId) return;

        try {
            // [API 호출] 쿠폰 코드 검증
            // VerifyCouponRequest: { code: string } 
            const response = await verifyCoupon(storeId, { code: couponInput });

            // 성공 시 (200 OK)
            setVerificationStatus('valid');
            setVerifiedCouponData(response.data); // 검증된 쿠폰 상세 정보 저장

        } catch (error) {
            console.error("쿠폰 검증 실패:", error);
            const status = error.status;

            if (status === 404) {
                setVerificationStatus('invalid'); // 존재하지 않는 코드
            } else if (status === 409 || status === 400) {
                setVerificationStatus('expired'); // 이미 사용됨 or 만료됨
            } else {
                setVerificationStatus('invalid');
            }
        }
    };

    // [로직] 사용 완료 처리 (UI 인터랙션)
    const handleUseCoupon = () => {
        setIsCouponUsed(true);

        // 실제로 verifyCoupon 시점에 이미 사용처리가 되었을 수 있음
        // (API 명세: "코드를 입력하여 사용 처리합니다")
        //  UI로 '도장'을 찍어주고 잠시 후 닫기

        setTimeout(() => {
            closeModal();
            fetchData(); // 데이터(사용 수량 등) 갱신
        }, 1500);
    };

    // [로직] 모달 닫기 및 초기화
    const closeModal = () => {
        setUsageModalVisible(false);
        setCouponInput('');
        setVerificationStatus('idle');
        setIsCouponUsed(false);
        setVerifiedCouponData(null);
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#34B262" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ height: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: '#E0EDE4' }} />
            <View style={styles.backgroundTop} />

            {/* 헤더 */}
            <View style={styles.header}>
                <Image
                    source={require('@/assets/images/shopowner/logo2.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* 탭 (쿠폰/단골) */}
            <View style={styles.fixedTabContainer}>
                <View style={styles.tabWrapper}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'coupon' ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => setActiveTab('coupon')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.tabContent}>
                                <Ionicons name="ticket" size={rs(16)} color={activeTab === 'coupon' ? "black" : "#828282"} />
                                <Text style={[styles.tabText, activeTab === 'coupon' ? styles.activeText : styles.inactiveText]}>쿠폰 관리</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'patron' ? styles.activeTab : styles.inactiveTab]}
                            onPress={() => setActiveTab('patron')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.tabContent}>
                                <View style={styles.iconWrapper}>
                                    <Ionicons name="people" size={rs(16)} color={activeTab === 'patron' ? "black" : "#828282"} />
                                    <Ionicons name="heart" size={rs(10)} color="#FF3E41" style={styles.redHeartIcon} />
                                </View>
                                <Text style={[styles.tabText, activeTab === 'patron' ? styles.activeText : styles.inactiveText]}>단골 관리</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {activeTab === 'coupon' ? (
                    <View style={{ paddingBottom: rs(100) }}>

                        {/* 진행 중인 쿠폰 */}
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="gift-outline" size={rs(16)} color="#34B262" />
                                <Text style={styles.sectionTitleGreen}>진행 중인 쿠폰</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.moreBtn}
                                onPress={() => navigation.navigate('CouponList', { initialTab: 'active' })}
                            >
                                <Text style={styles.moreBtnTextGreen}>전체보기</Text>
                                <Ionicons name="chevron-forward" size={rs(12)} color="#34B262" />
                            </TouchableOpacity>
                        </View>

                        {activeCoupons.length === 0 ? (
                            <View style={{ padding: rs(20), alignItems: 'center' }}>
                                <Text style={{ color: '#828282', fontSize: rs(12) }}>진행 중인 쿠폰이 없습니다.</Text>
                            </View>
                        ) : (
                            activeCoupons.map((coupon) => (
                                <View key={coupon.id} style={styles.couponCard}>
                                    <View style={styles.couponHeader}>
                                        <View style={[
                                            styles.couponIconBox,
                                            coupon.type === 'FIXED_DISCOUNT' && { backgroundColor: '#EAF6EE' },
                                            coupon.type === 'PERCENTAGE_DISCOUNT' && { backgroundColor: '#EAF6EE' },
                                            coupon.type === 'SERVICE_GIFT' && { backgroundColor: '#EAF6EE' }
                                        ]}>
                                            {coupon.type === 'FIXED_DISCOUNT' && <Ionicons name="logo-usd" size={rs(24)} color="#34B262" />}
                                            {coupon.type === 'PERCENTAGE_DISCOUNT' && <Text style={[styles.percentIcon, { fontSize: rs(24), color: '#34B262' }]}>%</Text>}
                                            {coupon.type === 'SERVICE_GIFT' && <Ionicons name="gift" size={rs(24)} color="#34B262" />}
                                        </View>
                                        <View style={styles.couponInfo}>
                                            <Text style={styles.couponTitle}>{coupon.title}</Text>
                                            <View style={styles.couponMetaRow}>
                                                <Ionicons name="time-outline" size={rs(9)} color="#828282" />
                                                <Text style={styles.couponMetaTextDate}>
                                                    {formatDateTimeFull(coupon.startsAt)} ~ {formatDateTimeFull(coupon.endsAt)}
                                                </Text>
                                            </View>
                                            <View style={styles.couponMetaRow}>
                                                <Ionicons name="checkbox-outline" size={rs(9)} color="#828282" />
                                                <Text style={styles.couponMetaTextValidity}>
                                                    {coupon.validDays === 0 ? '발급 종료 시간까지 사용 가능' : `발급일로부터 ${coupon.validDays}일간 사용 가능`}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* 프로그레스 바 영역 */}
                                    <View style={styles.dualProgressContainer}>
                                        {/* 1. 발급 수량 (다운로드 수 / 전체) */}
                                        <View style={styles.progressItem}>
                                            <View style={styles.progressLabelRow}>
                                                <Text style={styles.progressLabel}>발급 수량</Text>
                                                <Text style={styles.progressValue}>
                                                    {coupon.total === -1
                                                        ? `${coupon.issued} / 무제한`
                                                        : `${coupon.issued} / ${coupon.total}장`}
                                                </Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[
                                                    styles.progressBarFill,
                                                    { backgroundColor: '#7CDE9B' }, // 연두색
                                                    { width: coupon.total === -1 ? '100%' : `${Math.min((coupon.issued / coupon.total) * 100, 100)}%` },
                                                    coupon.total === -1 && { backgroundColor: '#D9D9D9' } // 무제한일 때 회색 바 (이미지 참고)
                                                ]} />
                                            </View>
                                        </View>

                                        {/* 2. 사용 수량 (사용완료 / 다운로드 수) */}
                                        <View style={styles.progressItem}>
                                            <View style={styles.progressLabelRow}>
                                                <Text style={styles.progressLabel}>사용 수량</Text>
                                                <Text style={styles.progressValue}>
                                                    {coupon.issued === 0 ? '0 / 0장' : `${coupon.used} / ${coupon.issued}장`}
                                                </Text>
                                            </View>
                                            <View style={styles.progressBarBg}>
                                                <View style={[
                                                    styles.progressBarFill,
                                                    { backgroundColor: '#34B262' }, // 진초록
                                                    { width: coupon.issued === 0 ? '0%' : `${Math.min((coupon.used / coupon.issued) * 100, 100)}%` }
                                                ]} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}

                        {/* 종료된 쿠폰 */}
                        <View style={[styles.sectionHeader, { marginTop: rs(20) }]}>
                            <Text style={styles.sectionTitleGray}>종료된 쿠폰</Text>
                            <TouchableOpacity
                                style={styles.moreBtn}
                                onPress={() => navigation.navigate('CouponList', { initialTab: 'expired' })}
                            >
                                <Text style={styles.moreBtnTextGray}>전체보기</Text>
                                <Ionicons name="chevron-forward" size={rs(12)} color="#828282" />
                            </TouchableOpacity>
                        </View>

                        {expiredCoupons.length === 0 ? (
                            <View style={{ padding: rs(20), alignItems: 'center' }}>
                                <Text style={{ color: '#BDBDBD', fontSize: rs(12) }}>종료된 쿠폰이 없습니다.</Text>
                            </View>
                        ) : (
                            expiredCoupons.map((coupon) => (
                                <View key={coupon.id} style={styles.expiredCard}>
                                    <Text style={styles.expiredTitle}>{coupon.title}</Text>
                                    <Text style={styles.expiredValue}>{coupon.used} / {coupon.total}장 사용</Text>
                                </View>
                            ))
                        )}

                        {/* 쿠폰 사용완료 처리 버튼 -> 모달 오픈 */}
                        <TouchableOpacity
                            style={styles.completeBtn}
                            onPress={() => setUsageModalVisible(true)}
                        >
                            <View style={styles.completeBtnLeft}>
                                <Ionicons name="checkbox-outline" size={rs(18)} color="#34B262" />
                                <Text style={styles.completeBtnText}>쿠폰 사용완료 처리</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={rs(16)} color="#34B262" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    // [단골 관리 화면]
                    <View style={styles.cardContainer}>
                        <View style={styles.iconBox}>
                            <Ionicons name="people" size={rs(40)} color="#34B262" />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>우리 가게를 찜한 고객</Text>
                            <Text style={styles.infoCount}>{patronCount}명</Text>
                            <View style={styles.trendContainer}>
                                <Ionicons name="trending-up" size={rs(12)} color="#34B262" />
                                <Text style={styles.trendText}>꾸준히 늘어나고 있어요!</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {activeTab === 'coupon' && (
                <View style={styles.bottomFixedBtnContainer}>
                    <TouchableOpacity
                        style={styles.newCouponBtn}
                        onPress={() => {
                            setSelectedType('FIXED_AMOUNT');
                            setCreateStep(1);
                            setCouponName('');
                            setBenefitValue('');
                            setMinOrderAmount('');
                            setTotalQuantity('');
                            setIsUnlimited(false);
                            setValidDays(0);
                            setCustomStartDate(new Date());
                            setCustomEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
                            setIsIssuePeriodSelected(false);
                            setCreateModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={rs(18)} color="white" />
                        <Text style={styles.newCouponBtnText}>새 쿠폰 만들기</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* =======================================================
          [모달] 새 쿠폰 만들기
      ======================================================= */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setIsExitConfirmVisible(true)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.createModalContainer}>
                            {/* 닫기 버튼 */}
                            <TouchableOpacity
                                style={styles.createModalCloseBtn}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setIsExitConfirmVisible(true);
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={rs(24)} color="#BDBDBD" />
                            </TouchableOpacity>

                            {createStep === 1 ? (
                                <>
                                    {/* 타이틀 */}
                                    <View style={styles.createModalHeader}>
                                        <View style={styles.createModalIconBox}>
                                            <Ionicons name="ticket" size={rs(24)} color="#34B262" />
                                        </View>
                                        <Text style={styles.createModalTitle}>새 쿠폰 만들기</Text>
                                    </View>
                                    <Text style={styles.createModalSubtitle}>어떤 종류의 쿠폰을 만들까요?</Text>

                                    {/* 옵션 리스트 */}
                                    <View style={styles.createOptionList}>
                                        {/* 1. 금액 할인 */}
                                        <TouchableOpacity
                                            style={[styles.createOptionCard, selectedType === 'FIXED_AMOUNT' && styles.createOptionSelected]}
                                            onPress={() => handleOptionPress('FIXED_AMOUNT')}
                                        >
                                            <View style={[styles.createOptionIconBox, { backgroundColor: selectedType === 'FIXED_AMOUNT' ? '#E4F7EA' : '#F2F2F2' }]}>
                                                <Ionicons name="logo-usd" size={rs(20)} color={selectedType === 'FIXED_AMOUNT' ? '#34B262' : '#828282'} />
                                            </View>
                                            <View style={styles.createOptionInfo}>
                                                <Text style={styles.createOptionTitle}>금액 할인</Text>
                                                <Text style={styles.createOptionDesc}>1,000원 할인</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={rs(20)} color="#BDBDBD" />
                                        </TouchableOpacity>

                                        {/* 2. 비율 할인 */}
                                        <TouchableOpacity
                                            style={[styles.createOptionCard, selectedType === 'PERCENTAGE' && styles.createOptionSelected]}
                                            onPress={() => handleOptionPress('PERCENTAGE')}
                                        >
                                            <View style={[styles.createOptionIconBox, { backgroundColor: selectedType === 'PERCENTAGE' ? '#E4F7EA' : '#F2F2F2' }]}>
                                                <Text style={{ fontSize: rs(18), fontWeight: '700', color: selectedType === 'PERCENTAGE' ? '#34B262' : '#828282' }}>%</Text>
                                            </View>
                                            <View style={styles.createOptionInfo}>
                                                <Text style={styles.createOptionTitle}>비율 할인</Text>
                                                <Text style={styles.createOptionDesc}>10% 할인</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={rs(20)} color="#BDBDBD" />
                                        </TouchableOpacity>

                                        {/* 3. 서비스 증정 */}
                                        <TouchableOpacity
                                            style={[styles.createOptionCard, selectedType === 'GIFT' && styles.createOptionSelected]}
                                            onPress={() => handleOptionPress('GIFT')}
                                        >
                                            <View style={[styles.createOptionIconBox, { backgroundColor: selectedType === 'GIFT' ? '#E4F7EA' : '#F2F2F2' }]}>
                                                <Ionicons name="gift" size={rs(22)} color={selectedType === 'GIFT' ? '#34B262' : '#828282'} />
                                            </View>
                                            <View style={styles.createOptionInfo}>
                                                <Text style={styles.createOptionTitle}>서비스 증정</Text>
                                                <Text style={styles.createOptionDesc}>음료수 1캔 무료</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={rs(20)} color="#BDBDBD" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* 페이지네이션 */}
                                    <View style={styles.createPagination}>
                                        <View style={[styles.createDot, { backgroundColor: '#34B262' }]} />
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                    </View>
                                </>
                            ) : createStep === 2 ? (
                                <>
                                    {/* 타이틀 */}
                                    <View style={styles.createModalHeader}>
                                        <View style={styles.createModalIconBox}>
                                            <Ionicons name="ticket" size={rs(24)} color="#34B262" />
                                        </View>
                                        <Text style={styles.createModalTitle}>
                                            {selectedType === 'FIXED_AMOUNT' ? '금액 할인' : (selectedType === 'PERCENTAGE' ? '비율 할인' : '서비스 증정')} 쿠폰 만들기
                                        </Text>
                                    </View>
                                    <Text style={styles.createModalSubtitle}>혜택 상세 정보를 입력해주세요</Text>

                                    <ScrollView
                                        style={{ width: '100%' }}
                                        contentContainerStyle={{ alignItems: 'center', paddingBottom: rs(10) }}
                                        showsVerticalScrollIndicator={false}
                                    >
                                        {/* 상세 아이콘 상단바 */}
                                        <View style={styles.createStep2Header}>
                                            <View style={[styles.createOptionIconBox, { backgroundColor: '#E4F7EA', marginRight: rs(10) }]}>
                                                {selectedType === 'FIXED_AMOUNT' && <Ionicons name="logo-usd" size={rs(20)} color="#34B262" />}
                                                {selectedType === 'PERCENTAGE' && <Text style={{ fontSize: rs(18), fontWeight: '700', color: '#34B262' }}>%</Text>}
                                                {selectedType === 'GIFT' && <Ionicons name="gift" size={rs(22)} color="#34B262" />}
                                            </View>
                                            <View style={styles.createInputWrapper}>
                                                <TextInput
                                                    style={styles.createInput}
                                                    placeholder="쿠폰 이름을 적어주세요" placeholderTextColor="#BDBDBD"
                                                    value={couponName}
                                                    onChangeText={setCouponName}
                                                    maxLength={20}
                                                />
                                            </View>
                                        </View>

                                        {/* 입력 필드들 */}
                                        <View style={styles.createFormFieldList}>
                                            {/* 필드 1: 할인 금액 / 할인율 / 증정 내용 */}
                                            <View style={styles.createFormField}>
                                                <Text style={styles.createFormLabel}>
                                                    {selectedType === 'FIXED_AMOUNT' ? '할인 금액' : (selectedType === 'PERCENTAGE' ? '할인율' : '증정 내용')}
                                                </Text>
                                                <View style={styles.createInputBox}>
                                                    <TextInput
                                                        style={styles.createFormInput}
                                                        placeholder={selectedType === 'FIXED_AMOUNT' ? '2,000' : (selectedType === 'PERCENTAGE' ? '10' : 'ex. 콜라 1캔')}
                                                        placeholderTextColor="#BDBDBD"
                                                        value={benefitValue}
                                                        onChangeText={(text) => setBenefitValue(selectedType === 'GIFT' ? text : formatNumber(text))}
                                                        keyboardType={selectedType === 'GIFT' ? 'default' : 'number-pad'}
                                                    />
                                                    <Text style={styles.createInputUnit}>
                                                        {selectedType === 'FIXED_AMOUNT' ? '원' : (selectedType === 'PERCENTAGE' ? '%' : '')}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* 필드 2: 최소 주문 금액 */}
                                            <View style={styles.createFormField}>
                                                <Text style={styles.createFormLabel}>최소 주문 금액</Text>
                                                <View style={styles.createInputBox}>
                                                    <TextInput
                                                        style={styles.createFormInput}
                                                        placeholder="10,000"
                                                        placeholderTextColor="#BDBDBD"
                                                        value={minOrderAmount}
                                                        onChangeText={(text) => setMinOrderAmount(formatNumber(text))}
                                                        keyboardType="number-pad"
                                                    />
                                                    <Text style={styles.createInputUnit}>원 이상</Text>
                                                </View>
                                            </View>

                                        </View>
                                    </ScrollView>

                                    {/* 하단 버튼 */}
                                    <View style={styles.createStep2BtnRow}>
                                        <TouchableOpacity style={styles.createPrevBtn} onPress={handlePrevStep}>
                                            <Ionicons name="chevron-back" size={rs(16)} color="#34B262" />
                                            <Text style={styles.createPrevBtnText}>이전</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.createNextBtn, !isStep2Valid && { backgroundColor: '#D5D5D5' }]}
                                            onPress={() => setCreateStep(3)}
                                            disabled={!isStep2Valid}
                                        >
                                            <Text style={styles.createNextBtnText}>다음</Text>
                                            <Ionicons name="chevron-forward" size={rs(16)} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* 페이지네이션 */}
                                    <View style={styles.createPagination}>
                                        <View style={styles.createDot} />
                                        <View style={[styles.createDot, { backgroundColor: '#34B262' }]} />
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                    </View>
                                </>
                            ) : createStep === 3 ? (
                                <>
                                    {/* 타이틀 */}
                                    <View style={styles.createModalHeader}>
                                        <View style={styles.createModalIconBox}>
                                            <Ionicons name="ticket" size={rs(24)} color="#34B262" />
                                        </View>
                                        <Text style={styles.createModalTitle}>새 쿠폰 만들기</Text>
                                    </View>
                                    <Text style={styles.createModalSubtitle}>발행 수량과 기간을 설정해주세요</Text>

                                    <View style={{ width: '100%', gap: rs(20) }}>
                                        {/* 섹션 1: 발행 수량 */}
                                        <View style={styles.createFormField}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={styles.createFormLabel}>선착순 발행 수량</Text>
                                                <TouchableOpacity
                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: rs(4) }}
                                                    onPress={() => {
                                                        setIsUnlimited(!isUnlimited);
                                                        Keyboard.dismiss();
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={isUnlimited ? "checkbox" : "square-outline"}
                                                        size={rs(16)}
                                                        color={isUnlimited ? "#34B262" : "#BDBDBD"}
                                                    />
                                                    <Text style={{ fontSize: rs(11), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' }}>수량 제한 없음</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={[styles.createInputBox, isUnlimited && { backgroundColor: '#F0F0F0' }]}>
                                                <TextInput
                                                    style={[styles.createFormInput, isUnlimited && { color: '#828282' }]}
                                                    placeholder="50"
                                                    placeholderTextColor="#BDBDBD"
                                                    value={isUnlimited ? "" : totalQuantity}
                                                    onChangeText={(text) => setTotalQuantity(formatNumber(text))}
                                                    keyboardType="number-pad"
                                                    editable={!isUnlimited}
                                                />
                                                <Text style={[styles.createInputUnit, isUnlimited && { color: '#828282' }]}>장</Text>
                                            </View>
                                        </View>

                                        {/* 섹션 2: 쿠폰 발급 기간 */}
                                        <View style={styles.createFormField}>
                                            <Text style={styles.createFormLabel}>쿠폰 발급 기간</Text>
                                            <TouchableOpacity
                                                style={styles.createInputBox}
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    setIsPeriodModalVisible(true);
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        flex: 1,
                                                        fontSize: isIssuePeriodSelected ? rs(11) : rs(13),
                                                        fontWeight: '500',
                                                        color: isIssuePeriodSelected ? 'black' : '#BDBDBD',
                                                        fontFamily: 'Pretendard'
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {isIssuePeriodSelected ? formatPeriodString(customStartDate, customEndDate) : '기간을 설정해주세요'}
                                                </Text>
                                                <Ionicons name="chevron-down" size={rs(18)} color="black" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* 섹션 3: 쿠폰 만료 일시 */}
                                        <View style={styles.createFormField}>
                                            <Text style={styles.createFormLabel}>쿠폰 만료 일시(다운받은 시점부터)</Text>
                                            <TouchableOpacity
                                                style={styles.createInputBox}
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    setIsValidDaysDropdownOpen(!isValidDaysDropdownOpen);
                                                }}
                                            >
                                                <Text style={{ flex: 1, fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' }} numberOfLines={1}>
                                                    {validDays === 0 ? '발급 종료 시간' :
                                                        validDays === 1 ? '24시간' :
                                                            `${validDays}일간`}
                                                </Text>
                                                <Ionicons name={isValidDaysDropdownOpen ? "chevron-up" : "chevron-down"} size={rs(18)} color="black" />
                                            </TouchableOpacity>

                                            {isValidDaysDropdownOpen && (
                                                <View style={[styles.createValidityDropdown, { top: rs(60) }]}>
                                                    {[0, 1, 3, 7, 30].map((days) => {
                                                        const isSelected = validDays === days && !isCustomValidDaysMode;
                                                        const labels = {
                                                            0: '발급 종료 시간',
                                                            1: '24시간',
                                                            3: '3일간',
                                                            7: '7일간',
                                                            30: '30일간'
                                                        };
                                                        return (
                                                            <TouchableOpacity
                                                                key={days}
                                                                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                                onPress={() => {
                                                                    setValidDays(days);
                                                                    setIsCustomValidDaysMode(false);
                                                                    setIsValidDaysDropdownOpen(false);
                                                                }}
                                                            >
                                                                {isSelected && <Ionicons name="checkmark" size={rs(16)} color="#34B262" style={{ marginRight: rs(4) }} />}
                                                                <Text style={[styles.dropdownText, isSelected && { color: '#34B262' }]}>{labels[days]}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                    {!isCustomValidDaysMode ? (
                                                        <TouchableOpacity
                                                            style={[styles.dropdownItem, { justifyContent: 'center' }]}
                                                            onPress={() => setIsCustomValidDaysMode(true)}
                                                        >
                                                            <Text style={[styles.dropdownText, { color: '#828282' }]}>+ 만료 일시 생성</Text>
                                                        </TouchableOpacity>
                                                    ) : (
                                                        <View style={{ paddingHorizontal: rs(10), paddingBottom: rs(10) }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8) }}>
                                                                <View style={[styles.createInputBox, { flex: 1, height: rs(36) }]}>
                                                                    <TextInput
                                                                        style={styles.createFormInput}
                                                                        placeholder="발급 만료 일자를 적어주세요"
                                                                        placeholderTextColor="#BDBDBD"
                                                                        value={customValidDaysInput}
                                                                        onChangeText={(text) => setCustomValidDaysInput(text.replace(/[^0-9]/g, ''))}
                                                                        keyboardType="number-pad"
                                                                    />
                                                                </View>
                                                                <TouchableOpacity
                                                                    style={{ backgroundColor: '#34B262', paddingHorizontal: rs(12), paddingVertical: rs(8), borderRadius: rs(8) }}
                                                                    onPress={() => {
                                                                        if (customValidDaysInput) {
                                                                            setValidDays(Number(customValidDaysInput));
                                                                            setCustomValidDaysInput('');
                                                                            setIsCustomValidDaysMode(false);
                                                                            setIsValidDaysDropdownOpen(false);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>추가</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* 하단 버튼 */}
                                    <View style={styles.createStep2BtnRow}>
                                        <TouchableOpacity style={styles.createPrevBtn} onPress={handlePrevStep}>
                                            <Ionicons name="chevron-back" size={rs(16)} color="#34B262" />
                                            <Text style={styles.createPrevBtnText}>이전</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.createNextBtn, !isStep3Valid && { backgroundColor: '#D5D5D5' }]}
                                            onPress={() => {
                                                Keyboard.dismiss();
                                                setCreateStep(4);
                                            }}
                                            disabled={!isStep3Valid}
                                        >
                                            <Text style={styles.createNextBtnText}>다음</Text>
                                            <Ionicons name="chevron-forward" size={rs(16)} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* 페이지네이션 */}
                                    <View style={styles.createPagination}>
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                        <View style={[styles.createDot, { backgroundColor: '#34B262' }]} />
                                        <View style={styles.createDot} />
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* 타이틀 */}
                                    <View style={styles.createModalHeader}>
                                        <View style={styles.createModalIconBox}>
                                            <Ionicons name="ticket" size={rs(24)} color="#34B262" />
                                        </View>
                                        <Text style={styles.createModalTitle}>새 쿠폰 만들기</Text>
                                    </View>
                                    <Text style={styles.createModalSubtitle}>학생들에게 보여질 쿠폰 미리보기</Text>

                                    {/* 쿠폰 미리보기 카드 */}
                                    <View style={styles.previewCouponCard}>
                                        <View style={[
                                            styles.previewIconBox,
                                            selectedType === 'FIXED_AMOUNT' && { backgroundColor: '#EAF6EE' },
                                            selectedType === 'PERCENTAGE' && { backgroundColor: '#FFDDDE' },
                                            selectedType === 'GIFT' && { backgroundColor: '#FFF4D6' }
                                        ]}>
                                            <Image
                                                source={
                                                    selectedType === 'FIXED_AMOUNT' ? require('@/assets/images/shopowner/coupon-price.png') :
                                                        selectedType === 'PERCENTAGE' ? require('@/assets/images/shopowner/coupon-percent.png') :
                                                            require('@/assets/images/shopowner/coupon-present.png')
                                                }
                                                style={styles.previewImage}
                                            />
                                        </View>
                                        <View style={styles.previewInfo}>
                                            <View style={styles.previewTitleRow}>
                                                <Text style={styles.previewBenefitTitle}>
                                                    {selectedType === 'FIXED_AMOUNT' ? `${formatNumber(benefitValue) || '2,000'}원 할인` :
                                                        selectedType === 'PERCENTAGE' ? `${benefitValue || '10'}% 할인` :
                                                            `${benefitValue || '서비스'} 증정`}
                                                </Text>
                                            </View>
                                            <Text style={styles.previewCouponName} numberOfLines={1}>{couponName || '쿠폰 이름을 입력해주세요'}</Text>

                                            <View style={styles.previewMetaRow}>
                                                <Text style={styles.previewMetaText}>최소 주문 {formatNumber(minOrderAmount) || '0'}원</Text>
                                                <Text style={styles.previewMetaText}>
                                                    {isIssuePeriodSelected
                                                        ? `${formatFullDateKorean(customEndDate)}까지 발급 가능`
                                                        : '발급 기간을 설정해주세요'}
                                                </Text>
                                            </View>

                                            {!isUnlimited && totalQuantity !== '' && (
                                                <View style={styles.createBadgeRow}>
                                                    <View style={styles.previewBadge}>
                                                        <Text style={styles.previewBadgeText}>{formatNumber(totalQuantity)}장 남음</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* 하단 버튼 */}
                                    <View style={styles.createStep2BtnRow}>
                                        <TouchableOpacity style={styles.createPrevBtn} onPress={handlePrevStep}>
                                            <Ionicons name="chevron-back" size={rs(16)} color="#34B262" />
                                            <Text style={styles.createPrevBtnText}>이전</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.createNextBtn, { backgroundColor: '#34B262' }]}
                                            onPress={handleCreateCoupon}
                                        >
                                            <Ionicons name="checkmark" size={rs(16)} color="white" />
                                            <Text style={styles.createNextBtnText}>발행하기</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* 페이지네이션 */}
                                    <View style={styles.createPagination}>
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                        <View style={styles.createDot} />
                                        <View style={[styles.createDot, { backgroundColor: '#34B262' }]} />
                                    </View>
                                </>
                            )}

                        </View>
                    </TouchableWithoutFeedback>

                    {/* =======================================================
                          [내부 오버레이] 쿠폰 유효 기간 설정 (상격) - 커스텀 View 방식
                      ======================================================= */}
                    {isPeriodModalVisible && (
                        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, { zIndex: 100 }]}>
                            <View style={styles.periodModalContainer}>
                                {/* 탭 헤더: 시작 / 종료 */}
                                <View style={styles.periodTabRow}>
                                    <TouchableOpacity
                                        style={[styles.periodTabBtn, activePeriodTab === 'start' && styles.periodTabBtnActive]}
                                        onPress={() => setActivePeriodTab('start')}
                                    >
                                        <Text style={[styles.periodTabText, activePeriodTab === 'start' && styles.periodTabTextActive]}>시작</Text>
                                        <Text style={[
                                            styles.periodTabDetail,
                                            activePeriodTab === 'start' && styles.periodTabDetailActive,
                                            !isStartDatePicked && { color: '#BDBDBD', fontSize: rs(10) }
                                        ]} numberOfLines={1}>
                                            {isStartDatePicked ? formatDateKorean(customStartDate) : '일시를 선택해 주세요'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.periodTabBtn, activePeriodTab === 'end' && styles.periodTabBtnActive]}
                                        onPress={() => setActivePeriodTab('end')}
                                    >
                                        <Text style={[styles.periodTabText, activePeriodTab === 'end' && styles.periodTabTextActive]}>종료</Text>
                                        <Text style={[
                                            styles.periodTabDetail,
                                            activePeriodTab === 'end' && styles.periodTabDetailActive,
                                            !isEndDatePicked && { color: '#BDBDBD', fontSize: rs(10) }
                                        ]} numberOfLines={1}>
                                            {isEndDatePicked ? formatDateKorean(customEndDate) : '일시를 선택해 주세요'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* 캘린더 영역 */}
                                <View style={styles.calendarContainer}>
                                    <View style={styles.calendarHeader}>
                                        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                                            <Ionicons name="chevron-back" size={rs(18)} color="#828282" />
                                        </TouchableOpacity>
                                        <Text style={styles.calendarMonthText}>
                                            {currentCalendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleMonthChange(1)}>
                                            <Ionicons name="chevron-forward" size={rs(18)} color="#828282" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.calendarGrid}>
                                        {/* 요일 */}
                                        <View style={styles.calendarDayRow}>
                                            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                                                <Text key={d} style={[styles.calendarDayText, i === 0 && { color: '#FF6B6B' }, i === 6 && { color: '#4A90E2' }]}>{d}</Text>
                                            ))}
                                        </View>
                                        {/* 날짜 데이터 */}
                                        <View style={styles.calendarDateGrid}>
                                            {getCalendarDays(currentCalendarDate).map((item, idx) => {
                                                const isSelected = (activePeriodTab === 'start' && isStartDatePicked && item.date.toDateString() === customStartDate.toDateString()) ||
                                                    (activePeriodTab === 'end' && isEndDatePicked && item.date.toDateString() === customEndDate.toDateString());

                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);

                                                let isDisabled = false;
                                                if (activePeriodTab === 'start') {
                                                    const nextMonthLimit = new Date();
                                                    nextMonthLimit.setMonth(nextMonthLimit.getMonth() + 2);
                                                    nextMonthLimit.setDate(0);
                                                    nextMonthLimit.setHours(23, 59, 59, 999);
                                                    isDisabled = item.date < today || item.date > nextMonthLimit;
                                                } else {
                                                    const compareDate = isStartDatePicked ? new Date(customStartDate) : today;
                                                    compareDate.setHours(0, 0, 0, 0);
                                                    isDisabled = item.date < compareDate;
                                                }

                                                const isSat = item.date.getDay() === 6;
                                                const isSun = item.date.getDay() === 0;

                                                return (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={[styles.calendarDateCell, isSelected && styles.calendarDateCellSelected]}
                                                        onPress={() => handleDatePress(item)}
                                                    >
                                                        <Text style={[
                                                            styles.calendarDateText,
                                                            (item.month !== 'curr' || isDisabled) && styles.calendarDateTextDisabled,
                                                            isSelected && styles.calendarDateTextSelected,
                                                            isSun && item.month === 'curr' && !isDisabled && { color: '#FF6B6B' },
                                                            isSat && item.month === 'curr' && !isDisabled && { color: '#4A90E2' },
                                                            isDisabled && item.month === 'curr' && { color: '#DEDEDE' }
                                                        ]}>{item.day}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>

                                {/* 시간 선택기 */}
                                <View style={styles.timePickerRow}>
                                    <TouchableOpacity onPress={() => {
                                        const newDate = new Date(activePeriodTab === 'start' ? customStartDate : customEndDate);
                                        newDate.setHours((newDate.getHours() + 12) % 24);
                                        if (activePeriodTab === 'start') {
                                            setCustomStartDate(newDate);
                                            setIsStartDatePicked(true);
                                            setCustomEndDate(validateEndDate(newDate, customEndDate));
                                        } else {
                                            const finalStart = isStartDatePicked ? customStartDate : new Date();
                                            setCustomEndDate(validateEndDate(finalStart, newDate));
                                            setIsEndDatePicked(true);
                                        }
                                    }}>
                                        <Text style={styles.timePickerOption}>{(activePeriodTab === 'start' ? customStartDate : customEndDate).getHours() >= 12 ? '오후' : '오전'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        const newDate = new Date(activePeriodTab === 'start' ? customStartDate : customEndDate);
                                        newDate.setHours((newDate.getHours() + 1) % 12 + (newDate.getHours() >= 12 ? 12 : 0));
                                        if (activePeriodTab === 'start') {
                                            setCustomStartDate(newDate);
                                            setIsStartDatePicked(true);
                                            setCustomEndDate(validateEndDate(newDate, customEndDate));
                                        } else {
                                            const finalStart = isStartDatePicked ? customStartDate : new Date();
                                            setCustomEndDate(validateEndDate(finalStart, newDate));
                                            setIsEndDatePicked(true);
                                        }
                                    }}>
                                        <Text style={styles.timePickerValue}>{(activePeriodTab === 'start' ? customStartDate : customEndDate).getHours() % 12 || 12}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.timePickerSeparator}>:</Text>
                                    <TouchableOpacity onPress={() => {
                                        const newDate = new Date(activePeriodTab === 'start' ? customStartDate : customEndDate);
                                        newDate.setMinutes((newDate.getMinutes() + 10) % 60);
                                        if (activePeriodTab === 'start') {
                                            setCustomStartDate(newDate);
                                            setIsStartDatePicked(true);
                                            setCustomEndDate(validateEndDate(newDate, customEndDate));
                                        } else {
                                            const finalStart = isStartDatePicked ? customStartDate : new Date();
                                            setCustomEndDate(validateEndDate(finalStart, newDate));
                                            setIsEndDatePicked(true);
                                        }
                                    }}>
                                        <Text style={styles.timePickerValue}>{(activePeriodTab === 'start' ? customStartDate : customEndDate).getMinutes().toString().padStart(2, '0')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity><Ionicons name="chevron-down" size={rs(16)} color="#34B262" /></TouchableOpacity>
                                </View>

                                {/* 하단 버튼 */}
                                <View style={styles.periodModalBtnRow}>
                                    <TouchableOpacity style={styles.periodCancelBtn} onPress={() => {
                                        setIsPeriodModalVisible(false);
                                        Keyboard.dismiss();
                                    }}>
                                        <Text style={styles.periodCancelText}>취소</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.periodConfirmBtn} onPress={() => {
                                        setIsIssuePeriodSelected(true);
                                        setIsPeriodModalVisible(false);
                                        Keyboard.dismiss();
                                    }}>
                                        <Text style={styles.periodConfirmText}>확인</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* [내부 오버레이] 닫기 재확인 - 커스텀 View 방식 */}
                    {isExitConfirmVisible && (
                        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, { zIndex: 110 }]}>
                            <View style={styles.confirmModalContainer}>
                                <Text style={styles.confirmModalTitle}>쿠폰 작성을 취소하시겠습니까?</Text>
                                <Text style={styles.confirmModalSubtitle}>지금 닫으시면 작성 중인 내용이 사라집니다.</Text>
                                <View style={styles.confirmModalBtnRow}>
                                    <TouchableOpacity
                                        style={styles.confirmCancelBtn}
                                        onPress={() => setIsExitConfirmVisible(false)}
                                    >
                                        <Text style={styles.confirmCancelBtnText}>취소</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.confirmExitBtn}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setIsExitConfirmVisible(false);
                                            setCreateModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.confirmExitBtnText}>닫기</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>


            {/* =======================================================
          [모달] 쿠폰 사용완료 처리 
      ======================================================= */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={usageModalVisible}
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                            >
                                <View style={[styles.usageModalContainer, verificationStatus === 'valid' && { height: rs(400) }]}>
                                    {/* 닫기 버튼 */}
                                    <TouchableOpacity
                                        style={styles.modalCloseBtn}
                                        onPress={closeModal}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close" size={rs(20)} color="#828282" />
                                    </TouchableOpacity>

                                    {/* 타이틀 */}
                                    <View style={styles.modalTitleRow}>
                                        <View style={styles.modalTitleIconBox}>
                                            <Ionicons name="ticket" size={rs(16)} color="white" style={{ transform: [{ rotate: '-45deg' }] }} />
                                        </View>
                                        <Text style={styles.usageModalTitle}>쿠폰 번호 확인</Text>
                                    </View>

                                    <Text style={styles.usageModalSubtitle}>손님의 쿠폰 번호를 입력하고, 혜택을 제공해주세요</Text>

                                    {/* 입력창 & 확인 버튼 */}
                                    <View style={styles.usageInputRow}>
                                        <View style={styles.usageInputBox}>
                                            <TextInput
                                                style={styles.usageInput}
                                                placeholder="쿠폰 번호 입력"
                                                placeholderTextColor="#828282"
                                                value={couponInput}
                                                onChangeText={setCouponInput}
                                                keyboardType="number-pad"
                                                maxLength={4}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.usageConfirmBtn, { backgroundColor: couponInput.length === 4 ? '#34B262' : '#D5D5D5' }]}
                                            onPress={handleVerifyCoupon}
                                            disabled={couponInput.length !== 4}
                                        >
                                            <Text style={styles.usageConfirmText}>확인</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* [에러 메시지 영역] */}
                                    {verificationStatus === 'expired' && (
                                        <Text style={styles.errorText}>이미 사용되었거나 만료된 쿠폰입니다</Text>
                                    )}
                                    {verificationStatus === 'invalid' && (
                                        <Text style={styles.errorText}>잘못된 쿠폰 번호입니다.</Text>
                                    )}

                                    {/* [성공 시 쿠폰 카드 표시 영역] */}
                                    {verificationStatus === 'valid' && (
                                        <View style={{ width: '100%', alignItems: 'center', marginTop: rs(0) }}>
                                            <Text style={styles.successText}>쿠폰이 확인되었습니다</Text>

                                            {/* 쿠폰 티켓 UI */}
                                            <View style={[styles.ticketContainer, isCouponUsed && { opacity: 0.5 }]}>
                                                {/* 티켓 상단 (내용) */}
                                                <View style={styles.ticketTop}>
                                                    <Text style={styles.ticketTitle}>{verifiedCouponData?.name || '쿠폰'}</Text>

                                                    <View style={styles.ticketInfoRow}>
                                                        <Text style={styles.ticketLabel}>사용처</Text>
                                                        <Text style={styles.ticketValue}>{verifiedCouponData?.shopName}</Text>
                                                    </View>
                                                    <View style={styles.ticketInfoRow}>
                                                        <Text style={styles.ticketLabel}>혜택</Text>
                                                        <Text style={styles.ticketValue}>{verifiedCouponData?.benefitValue}</Text>
                                                    </View>
                                                    <View style={styles.ticketInfoRow}>
                                                        <Text style={styles.ticketLabel}>만료기한</Text>
                                                        <Text style={styles.ticketValue}>~{formatDate(verifiedCouponData?.expiredAt)}까지</Text>
                                                    </View>
                                                </View>

                                                {/* 티켓 절취선 (점선) */}
                                                <View style={styles.ticketDivider}>
                                                    <View style={styles.notchLeft} />
                                                    <View style={styles.dashedLine} />
                                                    <View style={styles.notchRight} />
                                                </View>

                                                {/* 티켓 하단 (번호) */}
                                                <View style={styles.ticketBottom}>
                                                    {couponInput.split('').map((digit, index) => (
                                                        <View key={index} style={styles.ticketDigitBox}>
                                                            <Text style={styles.ticketDigitText}>{digit}</Text>
                                                        </View>
                                                    ))}
                                                </View>

                                                {/* [사용완료 도장] */}
                                                {isCouponUsed && (
                                                    <View style={styles.stampContainer}>
                                                        <View style={styles.stampCircle}>
                                                            <Text style={styles.stampText}>사용{'\n'}완료</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>

                                            {/* 하단 버튼 (사용완료 처리) */}
                                            <TouchableOpacity
                                                style={[styles.finalUseBtn, isCouponUsed && { backgroundColor: '#D5D5D5' }]}
                                                onPress={handleUseCoupon}
                                                disabled={isCouponUsed}
                                            >
                                                <Text style={styles.finalUseBtnText}>쿠폰 사용완료 처리</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal >

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0EDE4' },
    header: { paddingTop: rs(10), paddingHorizontal: rs(20), },
    logo: { width: rs(120), height: rs(30), marginBottom: rs(20) },
    fixedTabContainer: { paddingHorizontal: rs(20), backgroundColor: '#E0EDE4', zIndex: 1, },
    scrollContent: { paddingHorizontal: rs(20), paddingTop: rs(10), },
    tabWrapper: { alignItems: 'center', marginBottom: rs(10) },
    tabContainer: { width: '100%', height: rs(48), backgroundColor: 'rgba(218, 218, 218, 0.40)', borderRadius: rs(10), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(4) },
    tabButton: { flex: 1, height: rs(40), justifyContent: 'center', alignItems: 'center', borderRadius: rs(8) },
    tabContent: { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
    activeTab: { backgroundColor: 'white', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    inactiveTab: { backgroundColor: 'transparent' },
    tabText: { fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard' },
    activeText: { color: 'black' },
    inactiveText: { color: '#828282' },
    iconWrapper: { position: 'relative' },
    redHeartIcon: { position: 'absolute', top: -3, right: -4 },
    backgroundTop: { position: 'absolute', top: 0, left: 0, right: 0, height: rs(300), backgroundColor: '#E0EDE4', borderBottomLeftRadius: rs(20), borderBottomRightRadius: rs(20) },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(10) },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    sectionTitleGreen: { fontSize: rs(14), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
    sectionTitleGray: { fontSize: rs(14), fontWeight: '600', color: '#828282', fontFamily: 'Pretendard' },
    moreBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
    moreBtnTextGreen: { fontSize: rs(10), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
    moreBtnTextGray: { fontSize: rs(10), fontWeight: '600', color: '#828282', fontFamily: 'Pretendard' },
    couponCard: {
        backgroundColor: 'white',
        borderRadius: rs(12),
        paddingHorizontal: rs(16),
        paddingVertical: rs(11),
        marginBottom: rs(12),
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
    },
    couponHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(10) },
    couponIconBox: {
        width: rs(45),
        height: rs(45),
        backgroundColor: '#EAF6EE',
        borderRadius: rs(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: rs(12)
    },
    percentIcon: { fontSize: rs(16), fontWeight: '700', color: '#34B262', fontFamily: 'Pretendard' },
    couponInfo: { flex: 1, gap: 0 },
    couponTitle: { fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(2) },
    couponMetaRow: { flexDirection: 'row', alignItems: 'center', gap: rs(2) },
    couponMetaTextDate: { fontSize: rs(9), color: '#828282', fontWeight: '400', fontFamily: 'Pretendard' },
    couponMetaTextValidity: { fontSize: rs(9), color: '#828282', fontWeight: '400', fontFamily: 'Pretendard' },

    dualProgressContainer: { gap: rs(8) },
    progressItem: { width: '100%', gap: rs(4) },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontSize: rs(10), color: '#828282', fontWeight: '500', fontFamily: 'Pretendard' },
    progressValue: { fontSize: rs(10), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
    progressBarBg: { height: rs(6), backgroundColor: '#F0F0F0', borderRadius: rs(3), overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: rs(3) },
    expiredCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: rs(12), borderRadius: rs(10), marginBottom: rs(8), elevation: 1 },
    expiredTitle: { fontSize: rs(12), color: '#828282', fontFamily: 'Pretendard' },
    expiredValue: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },
    completeBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(10), paddingVertical: rs(10) },
    completeBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: rs(5) },
    completeBtnText: { fontSize: rs(14), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
    bottomFixedBtnContainer: { position: 'absolute', bottom: rs(20), left: 0, right: 0, paddingHorizontal: rs(20), },
    newCouponBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#34B262', paddingVertical: rs(12), borderRadius: rs(12), gap: rs(6), elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 },
    newCouponBtnText: { fontSize: rs(16), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },
    cardContainer: { width: '100%', backgroundColor: 'white', borderRadius: rs(16), paddingVertical: rs(40), alignItems: 'center', shadowColor: "rgba(0, 0, 0, 0.05)", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
    iconBox: { width: rs(80), height: rs(80), backgroundColor: '#E0EDE4', borderRadius: rs(25), justifyContent: 'center', alignItems: 'center', marginBottom: rs(16) },
    infoContainer: { alignItems: 'center', gap: rs(8) },
    infoLabel: { fontSize: rs(12), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard' },
    infoCount: { fontSize: rs(32), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard', marginBottom: rs(4) },
    trendContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
    trendText: { fontSize: rs(12), fontWeight: '500', color: '#34B262', fontFamily: 'Pretendard' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', },
    usageModalContainer: { width: rs(331), backgroundColor: 'white', borderRadius: rs(10), paddingTop: rs(17), paddingBottom: rs(20), paddingHorizontal: rs(22), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, },
    modalCloseBtn: { position: 'absolute', top: rs(15), right: rs(15), zIndex: 1, },
    modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: rs(7), marginBottom: rs(6), },
    modalTitleIconBox: { width: rs(23), height: rs(23), backgroundColor: '#34B262', justifyContent: 'center', alignItems: 'center', borderRadius: rs(4), },
    usageModalTitle: { fontSize: rs(16), fontWeight: '600', fontFamily: 'Pretendard', color: 'black', },
    usageModalSubtitle: { fontSize: rs(11), fontWeight: '500', fontFamily: 'Pretendard', color: '#668776', marginBottom: rs(20), },
    usageInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: rs(10), },
    usageInputBox: { flex: 1, height: rs(36), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center', paddingHorizontal: rs(16), },
    usageInput: { fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '500', color: 'black', padding: 0, },
    usageConfirmBtn: { width: rs(80), height: rs(36), borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', },
    usageConfirmText: { fontSize: rs(14), fontFamily: 'Pretendard', fontWeight: '700', color: 'white', },
    errorText: { fontSize: rs(10), color: '#FF6200', fontFamily: 'Pretendard', fontWeight: '500', marginTop: rs(6), },
    successText: { width: '100%', fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard', fontWeight: '500', marginTop: rs(5), marginBottom: rs(10), },
    ticketContainer: { width: '100%', backgroundColor: '#F2F2F2', borderRadius: rs(0), borderWidth: 1, borderColor: 'transparent', marginBottom: rs(15), overflow: 'hidden', position: 'relative', },
    ticketTop: { paddingVertical: rs(15), paddingHorizontal: rs(20), alignItems: 'center', },
    ticketTitle: { fontSize: rs(18), fontWeight: '700', color: '#34B262', fontFamily: 'Pretendard', marginBottom: rs(4), },
    ticketInfoRow: { width: '100%', flexDirection: 'row', marginBottom: rs(4), },
    ticketLabel: { width: rs(50), fontSize: rs(10), fontWeight: '600', color: '#444444', fontFamily: 'Pretendard', },
    ticketValue: { fontSize: rs(10), fontWeight: '500', color: '#828282', fontFamily: 'Pretendard', },
    ticketDivider: { height: rs(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative', backgroundColor: '#F2F2F2', },
    dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#D5D5D5', borderStyle: 'dashed', marginHorizontal: rs(10), },
    notchLeft: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: 'white', marginLeft: rs(-10), },
    notchRight: { width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: 'white', marginRight: rs(-10), },
    ticketBottom: { paddingVertical: rs(20), alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: rs(12) },
    ticketDigitBox: { borderBottomWidth: rs(1.5), borderBottomColor: '#1B1D1F', paddingHorizontal: rs(6), paddingBottom: rs(4), minWidth: rs(24), alignItems: 'center' },
    ticketDigitText: { fontSize: rs(24), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard' },
    ticketNumber: { fontSize: rs(24), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard', letterSpacing: rs(8) },
    finalUseBtn: { width: '100%', height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', },
    finalUseBtnText: { fontSize: rs(14), fontWeight: '700', color: 'white', fontFamily: 'Pretendard', },
    stampContainer: { position: 'absolute', top: 0, bottom: 0, left: 100, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10, },
    stampCircle: { width: rs(64), height: rs(64), borderRadius: rs(32), borderWidth: 2, borderColor: '#34B262', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', transform: [{ rotate: '-20deg' }], marginLeft: rs(100), marginTop: rs(20), },
    stampText: { fontSize: rs(16), fontWeight: '700', color: '#34B262', textAlign: 'center', fontFamily: 'Pretendard', lineHeight: rs(18), },

    // [새 쿠폰 모달]
    createModalContainer: { width: rs(350), backgroundColor: 'white', borderRadius: rs(20), padding: rs(24), position: 'relative' },
    createModalCloseBtn: { position: 'absolute', top: rs(20), right: rs(20), zIndex: 10 },

    // 닫기 재확인 모달 스타일
    confirmModalContainer: {
        width: rs(300),
        backgroundColor: 'white',
        borderRadius: rs(16),
        padding: rs(24),
        alignItems: 'center',
    },
    confirmModalTitle: {
        fontSize: rs(16),
        fontWeight: '700',
        color: 'black',
        fontFamily: 'Pretendard',
        marginBottom: rs(8),
    },
    confirmModalSubtitle: {
        fontSize: rs(13),
        color: '#828282',
        fontFamily: 'Pretendard',
        marginBottom: rs(24),
        textAlign: 'center',
    },
    confirmModalBtnRow: {
        flexDirection: 'row',
        gap: rs(12),
        width: '100%',
    },
    confirmCancelBtn: {
        flex: 1,
        height: rs(44),
        backgroundColor: '#F2F2F2',
        borderRadius: rs(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmCancelBtnText: {
        fontSize: rs(14),
        fontWeight: '600',
        color: '#828282',
        fontFamily: 'Pretendard',
    },
    confirmExitBtn: {
        flex: 1,
        height: rs(44),
        backgroundColor: '#34B262',
        borderRadius: rs(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmExitBtnText: {
        fontSize: rs(14),
        fontWeight: '600',
        color: 'white',
        fontFamily: 'Pretendard',
    },
    createModalHeader: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: rs(10) },
    createModalIconBox: { width: rs(23), height: rs(23), justifyContent: 'center', alignItems: 'center', marginRight: rs(7), overflow: 'hidden' },
    createModalIconTicket: { width: rs(18), height: rs(15), backgroundColor: '#34B262', borderRadius: rs(2) },
    createModalTitle: { fontSize: rs(16), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
    createModalSubtitle: { alignSelf: 'flex-start', fontSize: rs(11), color: '#668776', fontWeight: '500', marginBottom: rs(25), fontFamily: 'Pretendard' },

    createOptionList: { width: '100%', gap: rs(8) },
    createOptionCard: { width: '100%', height: rs(68), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(15), borderRadius: rs(10), borderWidth: rs(2), borderColor: '#DADADA', backgroundColor: 'white' },
    createOptionSelected: { borderColor: '#34B262', backgroundColor: '#F1F8F3' },

    createOptionIconBox: { width: rs(36), height: rs(36), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center', marginRight: rs(11) },
    createOptionImage: { width: rs(20), height: rs(20) },
    createOptionInfo: { flex: 1 },
    createOptionTitle: { fontSize: rs(16), fontWeight: '600', color: 'black', marginBottom: rs(2), fontFamily: 'Pretendard' },
    createOptionDesc: { fontSize: rs(11), fontWeight: '500', color: '#668776', fontFamily: 'Pretendard' },

    createPagination: { flexDirection: 'row', gap: rs(3), marginTop: rs(17), alignSelf: 'center' },
    createDot: { width: rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: '#D9D9D9' },

    // [새 쿠폰 - Step 2 상세]
    createStep2Header: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: rs(20) },
    createInputWrapper: { flex: 1, height: rs(36), borderRadius: rs(8), borderWidth: 1, borderColor: '#DADADA', justifyContent: 'center', paddingHorizontal: rs(10) },
    createInput: { fontSize: rs(13), fontWeight: '500', color: 'black', padding: 0, fontFamily: 'Pretendard' },
    createFormFieldList: { width: '100%', gap: rs(15) },
    createFormField: { width: '100%', gap: rs(5) },
    createFormLabel: { fontSize: rs(12), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
    createInputBox: { width: '100%', height: rs(36), backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#DADADA', flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(12) },
    createFormInput: { flex: 1, fontSize: rs(13), fontWeight: '500', color: 'black', padding: 0, fontFamily: 'Pretendard' },
    createInputUnit: { fontSize: rs(12), color: '#828282', fontWeight: '500', fontFamily: 'Pretendard', marginLeft: rs(5) },
    createStep2BtnRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: rs(30) },
    createPrevBtn: { width: rs(138), height: rs(36), borderRadius: rs(8), borderWidth: 2, borderColor: '#34B262', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(5) },
    createPrevBtnText: { fontSize: rs(13), fontWeight: '600', color: '#34B262', fontFamily: 'Pretendard' },
    createNextBtn: { width: rs(138), height: rs(36), backgroundColor: '#34B262', borderRadius: rs(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(5) },
    createNextBtnText: { fontSize: rs(13), fontWeight: '600', color: 'white', fontFamily: 'Pretendard' },
    createCharCountRow: { position: 'absolute', bottom: rs(5), right: rs(10) },
    createCharCountText: { fontSize: rs(10), color: '#828282', fontFamily: 'Pretendard' },

    // [Step 3 추가]
    createValidityDropdown: { position: 'absolute', top: rs(60), left: 0, right: 0, backgroundColor: 'white', borderRadius: rs(8), borderWidth: 1, borderColor: '#DADADA', paddingVertical: rs(10), zIndex: 10, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(10), paddingHorizontal: rs(15), marginHorizontal: rs(10) },
    dropdownItemSelected: { backgroundColor: '#EAF6EE', borderRadius: rs(8) },
    dropdownText: { fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },

    // [Step 3 상세 모달 추가]
    periodModalContainer: { width: rs(331), backgroundColor: 'white', borderRadius: rs(16), padding: rs(20), alignItems: 'center' },
    periodTabRow: { flexDirection: 'row', width: '100%', gap: rs(10), marginBottom: rs(25) },
    periodTabBtn: { flex: 1, height: rs(58), backgroundColor: '#F8F8F8', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', gap: rs(2) },
    periodTabBtnActive: { backgroundColor: '#34B262' },
    periodTabText: { fontSize: rs(12), fontWeight: '600', color: '#1B1D1F', fontFamily: 'Pretendard' },
    periodTabTextActive: { color: 'white' },
    periodTabDetail: { fontSize: rs(11), fontWeight: '500', color: '#1B1D1F', fontFamily: 'Pretendard' },
    periodTabDetailActive: { color: 'white' },

    calendarContainer: { width: '100%', marginBottom: rs(20) },
    calendarHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: rs(40), marginBottom: rs(20) },
    calendarMonthText: { fontSize: rs(14), fontWeight: '700', color: '#1B1D1F', fontFamily: 'Pretendard' },
    calendarGrid: { width: '100%' },
    calendarDayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(15) },
    calendarDayText: { width: rs(32), textAlign: 'center', fontSize: rs(11), color: '#828282', fontWeight: '600', fontFamily: 'Pretendard' },
    calendarDateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
    calendarDateCell: { width: rs(41), height: rs(36), justifyContent: 'center', alignItems: 'center' },
    calendarDateCellSelected: { backgroundColor: '#F1F8F3', borderRadius: rs(8) },
    calendarDateText: { fontSize: rs(13), color: '#1B1D1F', fontWeight: '500', fontFamily: 'Pretendard' },
    calendarDateTextSelected: { color: '#34B262', fontWeight: '700' },
    calendarDateTextDisabled: { color: '#DEDEDE' },

    timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: rs(25), marginBottom: rs(30) },
    timePickerOption: { fontSize: rs(18), color: '#34B262', fontWeight: '500', fontFamily: 'Pretendard' },
    timePickerValue: { fontSize: rs(18), color: '#34B262', fontWeight: '500', fontFamily: 'Pretendard' },
    timePickerSeparator: { fontSize: rs(18), color: '#34B262', fontWeight: '500', fontFamily: 'Pretendard' },

    periodModalBtnRow: { flexDirection: 'row', width: '100%', gap: rs(10) },
    periodCancelBtn: { flex: 1, height: rs(40), backgroundColor: '#DADADA', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    periodConfirmBtn: { flex: 1, height: rs(40), backgroundColor: '#34B262', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
    periodCancelText: { fontSize: rs(13), fontWeight: '700', color: '#828282', fontFamily: 'Pretendard' },
    periodConfirmText: { fontSize: rs(13), fontWeight: '700', color: 'white', fontFamily: 'Pretendard' },

    // [Step 4 - 미리보기 상세]
    previewCouponCard: { width: rs(295), height: rs(100), backgroundColor: '#FBFBFB', borderRadius: rs(15), paddingLeft: rs(15), paddingRight: rs(10), flexDirection: 'row', alignItems: 'center', gap: rs(15), elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3, marginBottom: rs(10), zIndex: 1 },
    previewIconBox: { width: rs(65), height: rs(65), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: rs(42), height: rs(42), resizeMode: 'contain' },
    previewInfo: { flex: 1, paddingVertical: rs(5), justifyContent: 'center', alignItems: 'flex-start', gap: rs(3) },
    previewTitleRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: rs(3) },
    previewBenefitTitle: { fontSize: rs(14), fontWeight: '600', color: 'black', fontFamily: 'Pretendard' },
    previewCouponName: { fontSize: rs(12), fontWeight: '400', color: 'black', fontFamily: 'Pretendard', marginVertical: rs(2) },
    previewMetaRow: { alignSelf: 'stretch', gap: rs(1) },
    previewMetaText: { fontSize: rs(10), fontWeight: '400', color: '#757575', fontFamily: 'Pretendard' },
    createBadgeRow: { flexDirection: 'row', alignItems: 'center' },
    previewBadge: { paddingHorizontal: rs(3), paddingVertical: rs(1), backgroundColor: '#FFE4E5', borderRadius: rs(2), justifyContent: 'center', alignItems: 'center' },
    previewBadgeText: { fontSize: rs(8), fontWeight: '400', color: '#F15051', fontFamily: 'Pretendard' },
    previewViewBtn: { backgroundColor: '#34B262', borderRadius: rs(15), paddingHorizontal: rs(12), paddingVertical: rs(4), color: 'white', fontSize: rs(12), fontWeight: '600', overflow: 'hidden' },
});
