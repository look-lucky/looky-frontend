import { rs } from '@/src/shared/theme/scale';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert, Animated, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// [필수] 네비게이션 훅 임포트
import PostcodeModal from '@/src/shared/common/PostcodeModal';
import { ErrorPopup } from '@/src/shared/common/error-popup';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';

// [필수] 토큰 가져오기 (Direct Fetch용)
import { getToken } from '@/src/shared/lib/auth/token';

// [API] Hooks Import
import { useCreateItem, useDeleteItem, useGetItems, useUpdateItem } from '@/src/api/item';
import { useCreateItemCategory, useDeleteItemCategory, useGetItemCategories, useUpdateItemCategory } from '@/src/api/item-category';
import { useGetMyStores } from '@/src/api/store';

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

const formatPhoneNumber = (value) => {
  if (!value) return "";
  const num = value.replace(/[^0-9]/g, '');
  if (num.length > 3) {
    if (num.startsWith('02')) { // 02 (서울)
      if (num.length <= 5) return num.replace(/(\d{2})(\d{1,3})/, '$1-$2');
      else if (num.length <= 9) return num.replace(/(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3');
      else return num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    } else { // 010, 031, 063 등
      if (num.length <= 7) return num.replace(/(\d{3})(\d{1,4})/, '$1-$2');
      else if (num.length <= 10) return num.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
      else return num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
  }
  return num;
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

  const navigation = useNavigation();

  // =================================================================
  // 1. API Hooks 연결 (Store & Item)
  // =================================================================

  // (1) 내 가게 조회
  const {
    data: storeDataResponse,
    isLoading: isStoreLoading,
    isError: isStoreError,
    refetch: refetchStore
  } = useGetMyStores();
  const [myStoreId, setMyStoreId] = useState(null);

  // (2) 가게 정보 수정 (Mutation은 사용 안 함 -> Direct Fetch로 대체)
  // const updateStoreMutation = useUpdateStore(); 

  // (3) 메뉴(상품) 목록 조회
  const queryClient = useQueryClient();
  const {
    data: itemsDataResponse,
    isLoading: isItemsLoading,
    isError: isItemsError,
    isRefetching: isItemsRefetching,
    refetch: refetchItems
  } = useGetItems(myStoreId, {
    query: {
      enabled: !!myStoreId,
      onError: () => setIsErrorPopupVisible(true)
    }
  });

  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  const [holidayModalVisible, setHolidayModalVisible] = useState(false); // 휴무일 모달 상태
  const [isFullScreenBannerVisible, setIsFullScreenBannerVisible] = useState(false); // 배너 전체화면 모달 상태
  const [postcodeVisible, setPostcodeVisible] = useState(false); // 주소 검색 모달 상태

  // Temp Data for Modals
  const [tempSelectedHolidays, setTempSelectedHolidays] = useState([]); // 모달용 임시 휴무일 데이터

  // (4) 메뉴 추가/수정/삭제 Mutations
  const createItemMutation = useCreateItem({ mutation: { onError: () => setIsErrorPopupVisible(true) } });
  const updateItemMutation = useUpdateItem({ mutation: { onError: () => setIsErrorPopupVisible(true) } });
  const deleteItemMutation = useDeleteItem({ mutation: { onError: () => setIsErrorPopupVisible(true) } });

  // (5) 카테고리 목록 조회
  const {
    data: categoriesResponse,
    isError: isCategoriesError,
    refetch: refetchCategories
  } = useGetItemCategories(myStoreId, {
    query: {
      enabled: !!myStoreId,
      onError: () => setIsErrorPopupVisible(true)
    }
  });
  const categories = categoriesResponse?.data?.data || [];


  // # State: UI Control
  const [activeTab, setActiveTab] = useState('info');
  const [isErrorPopupVisible, setIsErrorPopupVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 에러 발생 시 팝업 노출
  useEffect(() => {
    if (isStoreError || isItemsError || isCategoriesError) {
      setIsErrorPopupVisible(true);
    }
  }, [isStoreError, isItemsError, isCategoriesError]);

  // 에러 팝업 내 새로고침 로직
  const handleErrorRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStore(),
        myStoreId ? refetchItems() : Promise.resolve(),
        myStoreId ? refetchCategories() : Promise.resolve(),
      ]);
      // 성공적으로 데이터를 가져오면 팝업 닫기
      setIsErrorPopupVisible(false);
    } catch (err) {
      console.error("재시도 실패:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // # State: Time Picker
  const [pickerVisible, setPickerVisible] = useState(false);
  const [targetIndex, setTargetIndex] = useState(null);
  const [targetField, setTargetField] = useState(null);
  const [tempAmpm, setTempAmpm] = useState('오전');
  const [tempTime, setTempTime] = useState('10:00');

  // # State: Store Data
  const [storeInfo, setStoreInfo] = useState({
    name: '', branch: '', categories: [], vibes: [], intro: '', address: '', detailAddress: '', phone: '', logoImage: null, bannerImages: []
  });

  const initialHours = ['월', '화', '수', '목', '금', '토', '일'].map(day => ({
    day, open: null, close: null, breakStart: null, breakEnd: null, isClosed: false
  }));
  const [operatingHours, setOperatingHours] = useState(initialHours);
  const [hasBreakTime, setHasBreakTime] = useState(false);

  // # State: Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalDate, setModalDate] = useState(new Date()); // 모달용 별도 날짜 상태
  const [selectedHolidays, setSelectedHolidays] = useState(['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23']);
  const [isPaused, setIsPaused] = useState(false);

  // # State: Menu Management
  // Dynamic categories from API (`categories` variable above) used instead of local state
  // const [menuCategories, setMenuCategories] = useState([]); // Removed local state

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false); // 카테고리 추가 입력 모드

  // [추가] 매장 정보 등록 상태 확인 (소개, 전화번호, 주소, 이미지, 영업시간)
  const isProfileComplete = useMemo(() => {
    const hasIntro = !!storeInfo.intro;
    const hasPhone = !!storeInfo.phone;
    const hasAddress = !!storeInfo.address;
    const hasBanners = storeInfo.bannerImages && storeInfo.bannerImages.length > 0;
    const hasHours = operatingHours.some(h => !h.isClosed && h.open && h.close);

    return hasIntro && hasPhone && hasAddress && hasBanners && hasHours;
  }, [storeInfo, operatingHours]);

  // [추가] 메뉴 등록 상태 확인 (모든 카테고리 합산 메뉴 수)
  const isMenusEmpty = useMemo(() => {
    // itemsDataResponse가 null이거나 data가 비어있으면 메뉴 없음
    const items = itemsDataResponse?.data?.data || [];
    return items.length === 0;
  }, [itemsDataResponse]);

  // [추가] 강조 애니메이션 (Opacity Pulse)
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    // 정보 미등록 또는 메뉴 미등록 시 애니메이션 가동
    if (!isProfileComplete || isMenusEmpty) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]);
      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isProfileComplete, isMenusEmpty, pulseAnim]);

  const [newCategoryName, setNewCategoryName] = useState(''); // 새 카테고리 이름 입력

  // Selected Category ID for Tab Filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Initial Selection Effect
  useEffect(() => {
    if (categories.length > 0) {
      // If no selection or invalid selection, select the first one
      const isValid = categories.some(c => c.id === selectedCategoryId);
      if (!selectedCategoryId || !isValid) {
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, selectedCategoryId]);

  // Mutations for Category
  const createCategoryMutation = useCreateItemCategory();
  const updateCategoryMutation = useUpdateItemCategory();
  const deleteCategoryMutation = useDeleteItemCategory();

  // Category Options & Editing State
  const [categoryOptionsId, setCategoryOptionsId] = useState(null); // ID of category showing ... menu
  const [editingCategoryId, setEditingCategoryId] = useState(null); // ID of category being renamed
  const [editingCategoryName, setEditingCategoryName] = useState(''); // Temp name for rename
  const [isDeleteErrorVisible, setIsDeleteErrorVisible] = useState(false); // Custom error modal

  // Handle Create Category
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate(
      { storeId: myStoreId, data: { name: newCategoryName.trim() } },
      {
        onSuccess: () => {
          refetchCategories();
          setNewCategoryName('');
          setIsAddingCategory(false);
          // Alert.alert("성공", "카테고리가 추가되었습니다.");
        },
        onError: (err) => {
          console.error(err);
          Alert.alert("실패", "카테고리 추가에 실패했습니다.");
        }
      }
    );
  };

  // Handle Update Category (Rename)
  const handleUpdateCategory = (categoryId) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    updateCategoryMutation.mutate(
      { storeId: myStoreId, categoryId: categoryId, data: { name: editingCategoryName.trim() } },
      {
        onSuccess: () => {
          refetchCategories();
          setEditingCategoryId(null);
          setEditingCategoryName('');
        },
        onError: (err) => {
          console.error(err);
          Alert.alert("실패", "카테고리 수정에 실패했습니다.");
        }
      }
    );
  };

  // Handle Delete Category
  const handleDeleteCategory = (categoryToDelete) => {
    // Check if items exist in this category
    const hasItems = menuListArray && menuListArray.some(item => {
      const catId = item.itemCategoryId ?? item.categoryId ?? item.item_category_id ?? item.category_id;
      return Number(catId) === categoryToDelete.id;
    });

    if (hasItems) {
      // Show custom error modal instead of Alert
      setIsDeleteErrorVisible(true);
      setCategoryOptionsId(null);
    } else {
      // Re-confirm deletion for empty categories
      Alert.alert(
        "카테고리 삭제",
        `'${categoryToDelete.name}' 카테고리를 정말 삭제하시겠습니까?`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => confirmDeleteCategory(categoryToDelete.id)
          }
        ]
      );
    }
  };

  const confirmDeleteCategory = (categoryId) => {
    deleteCategoryMutation.mutate(
      { storeId: myStoreId, categoryId: categoryId },
      {
        onSuccess: () => {
          refetchCategories();
          refetchItems(); // Items might be deleted cascades
          // If selected was deleted, effect will reset selection
        },
        onError: (err) => {
          console.error(err);
          Alert.alert("실패", "카테고리 삭제에 실패했습니다.");
        }
      }
    );
  };

  /*
  const confirmDeleteCategory = (categoryId) => {
    deleteCategoryMutation.mutate(
      { storeId: myStoreId, categoryId: categoryId },
      {
        onSuccess: () => {
          refetchCategories();
          refetchItems(); // Items might be deleted cascades
          // If selected was deleted, effect will reset selection
        },
        onError: (err) => {
            console.error(err);
            Alert.alert("실패", "카테고리 삭제에 실패했습니다.");
        }
      }
    );
  };
  */

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetItemId, setTargetItemId] = useState(null);

  // 메뉴 폼 데이터
  const [menuForm, setMenuForm] = useState({
    name: '', price: '', desc: '', category: '메인메뉴',
    isRepresentative: false, badge: null, isSoldOut: false, isHidden: false
  });

  // # State: Edit Temp Data
  const [editBasicData, setEditBasicData] = useState({ ...storeInfo });
  const [editHoursData, setEditHoursData] = useState([...operatingHours]);

  // # Constants
  const ALL_CATEGORIES = ['식당', '주점', '카페', '놀거리', '뷰티•헬스', 'ETC'];

  const CATEGORY_KR_TO_EN = {
    '식당': 'RESTAURANT',
    '주점': 'BAR',
    '카페': 'CAFE',
    '놀거리': 'ENTERTAINMENT',
    '뷰티•헬스': 'BEAUTY_HEALTH',
    'ETC': 'ETC'
  };

  const CATEGORY_EN_TO_KR = {
    'RESTAURANT': '식당',
    'BAR': '주점',
    'CAFE': 'CAFE',
    'ENTERTAINMENT': '놀거리',
    'BEAUTY_HEALTH': '뷰티•헬스',
    'ETC': 'ETC'
  };
  const ALL_VIBES = ['1인 혼밥', '회식', '모임', '야식', '데이트'];
  const BADGE_TYPES = ['BEST', 'NEW', 'HOT', '비건'];
  const BADGE_MAP = {
    'BEST': 'BEST',
    'NEW': 'NEW',
    'HOT': 'HOT',
    '비건': 'VEGAN'
  };

  // =================================================================
  // 2. 데이터 바인딩
  // =================================================================

  useEffect(() => {
    const initStore = async () => {
      // 1. AsyncStorage에서 선택된 가게 ID 가져오기
      const savedStoreId = await AsyncStorage.getItem('SELECTED_STORE_ID');

      const rawData = storeDataResponse?.data;
      const myStoresList = (Array.isArray(rawData) ? rawData : (rawData?.data ? (Array.isArray(rawData.data) ? rawData.data[0] : rawData.data) : [])) || [];

      // myStoresList가 단일 객체인 경우를 배열로 정규화
      const normalizedList = Array.isArray(myStoresList) ? myStoresList : [myStoresList];

      let currentStoreId = null;
      let matchedStore = null;

      if (savedStoreId) {
        currentStoreId = parseInt(savedStoreId, 10);
        matchedStore = normalizedList.find(s => s.id === currentStoreId);
      }

      // 저장된 ID가 없거나 리스트에서 못 찾은 경우 첫 번째 가게 사용
      if (!matchedStore && normalizedList.length > 0) {
        matchedStore = normalizedList[0];
        currentStoreId = matchedStore.id;
        await AsyncStorage.setItem('SELECTED_STORE_ID', currentStoreId.toString());
      }

      if (matchedStore) {
        setMyStoreId(currentStoreId);

        // 데이터 바인딩 로직 계속...
        const myStore = matchedStore;
        console.log("🏪 [StoreScreen] initStore matchedStore:", myStore);

        // 1. 분위기 (Enum -> 한글 변환)
        const MOOD_MAP = {
          'GROUP_GATHERING': '모임',
          'ROMANTIC': '데이트',
          'QUIET': '조용한',
          'LIVELY': '활기찬',
          'SOLO_DINING': '1인 혼밥',
          'LATE_NIGHT': '야식',
          'COMPANY_DINNER': '회식',
          // 필요에 따라 추가
        };
        const mappedMoods = myStore.storeMoods ? myStore.storeMoods.map(m => MOOD_MAP[m] || m) : [];

        // 영업시간 파싱
        let parsedHours = initialHours;
        if (myStore.operatingHours) {
          try {
            const hoursObj = typeof myStore.operatingHours === 'string'
              ? JSON.parse(myStore.operatingHours)
              : myStore.operatingHours;

            const newHours = initialHours.map((item, idx) => {
              const key = idx.toString();
              const dayData = hoursObj[key];

              if (dayData && Array.isArray(dayData) && dayData.length > 0 && dayData[0] && dayData[0][0]) {
                return {
                  ...item,
                  open: dayData[0][0],
                  close: dayData[0][1],
                  breakStart: dayData[1] && dayData[1][0] ? dayData[1][0] : null,
                  breakEnd: dayData[1] && dayData[1][1] ? dayData[1][1] : null,
                  isClosed: false
                };
              } else {
                return { ...item, isClosed: true };
              }
            });
            setOperatingHours(newHours);
            setEditHoursData(JSON.parse(JSON.stringify(newHours)));

            // 브레이크타임 유무 판단
            const anyBreakTime = newHours.some(h => !h.isClosed && h.breakStart && h.breakEnd);
            setHasBreakTime(anyBreakTime);
          } catch (e) {
            console.error("영업시간 파싱 실패:", e);
          }
        }

        console.log("DEBUG: myStore object:", myStore);
        console.log("DEBUG: Setting storeInfo with name:", myStore.name, "branch:", myStore.branch);

        setStoreInfo({
          name: myStore.name || '',
          branch: myStore.branch || '',
          categories: myStore.storeCategories
            ? myStore.storeCategories.map(c => CATEGORY_EN_TO_KR[c] || c)
            : (myStore.category ? [CATEGORY_EN_TO_KR[myStore.category] || myStore.category] : []),
          vibes: mappedMoods,
          intro: myStore.introduction || '',
          address: myStore.roadAddress || myStore.jibunAddress || '', // roadAddress 우선 사용
          detailAddress: '', // 상세주소는 분리되어 있지 않아 보임, 필요하면 jibunAddress 등 활용
          phone: myStore.phone || '', // phoneNumber -> phone 수정
          // 로고 제거됨, 배너는 배열 전체 사용 (최대 3장)
          bannerImages: (myStore.imageUrls && Array.isArray(myStore.imageUrls))
            ? myStore.imageUrls.slice(0, 3)
            : []
        });
        console.log("📸 [StoreScreen] 매장 이미지 목록:", myStore.imageUrls);
        console.log("📸 [StoreScreen] 설정된 배너 목록:", (myStore.imageUrls && Array.isArray(myStore.imageUrls)) ? myStore.imageUrls.slice(0, 3) : "없음");

        // 2. 휴무일 초기화 (holidayDates 전용)
        if (myStore.holidayDates && Array.isArray(myStore.holidayDates)) {
          setSelectedHolidays(myStore.holidayDates);
        } else {
          setSelectedHolidays([]);
        }

        // 3. 영업 일시 중지 초기화
        setIsPaused(myStore.isSuspended || false);
      } else {
        // [추가] 매장이 없는 경우 상태 초기화
        setMyStoreId(null);
        setStoreInfo({
          name: '', branch: '', categories: [], vibes: [], intro: '', address: '', detailAddress: '', phone: '', logoImage: null, bannerImages: []
        });
        setOperatingHours(initialHours);
        setSelectedHolidays([]);
        setHasBreakTime(false);
        setIsPaused(false);
        console.log("🏪 [StoreScreen] No store matched or found. State reset.");
      }
    };

    initStore();
  }, [storeDataResponse]);

  // [Fix] 기본 모달이 닫힐 때 주소 검색 모달도 함께 닫히도록 처리 (화면 멈춤 방지)
  useEffect(() => {
    if (!basicModalVisible) {
      setPostcodeVisible(false);
    }
  }, [basicModalVisible]);

  // Force Refetch when menuCategories changes or simple refetch
  // This helps UI refresh
  useEffect(() => {
    if (itemsDataResponse) {
      // Optional: Log data or trigger local state update if needed
    }
  }, [itemsDataResponse]);

  const rawMenuList = itemsDataResponse?.data?.data || itemsDataResponse?.data || [];
  const menuListArray = Array.isArray(rawMenuList) ? rawMenuList : (rawMenuList.content || []);

  // Calculate total representative items count
  const representativeCount = menuListArray.filter(item =>
    item.isRecommended || item.representative || item.isRepresentative
  ).length;

  const menuList = useMemo(() => {
    const list = menuListArray
      .map(item => {
        // [Robust Category Resolution]
        // 1. Try common ID fields
        let rid = item.itemCategoryId ?? item.categoryId ?? item.item_category_id ?? item.category_id;

        // 2. Try nested object: item.itemCategory.id or item.category.id
        if (rid === undefined || rid === null) {
          if (item.itemCategory && typeof item.itemCategory === 'object') rid = item.itemCategory.id;
          else if (item.category && typeof item.category === 'object') rid = item.category.id;
        }

        // 3. Try to find by name from categories array if still no ID
        if (rid === undefined || rid === null) {
          const cName = (typeof item.category === 'string') ? item.category :
            (item.itemCategory && typeof item.itemCategory === 'object' ? item.itemCategory.name :
              (item.category && typeof item.category === 'object' ? item.category.name : null));

          if (cName) {
            const matched = categories.find(c => c.name === cName);
            if (matched) rid = matched.id;
          }
        }

        // 4. Final fallback to 1 (usually 'Main/Pasta') only if everything else fails
        // [IMPORTANT] Defaulting to 1 is likely why items "stay in Pasta" if data is missing
        const finalCategoryId = (rid !== undefined && rid !== null) ? Number(rid) : 1;

        return {
          id: item.id,
          name: item.name,
          price: item.price ? item.price.toString() : '0',
          desc: item.description || '',
          category: (typeof item.category === 'string') ? item.category : '메인메뉴',
          isRepresentative: item.isRecommended || item.representative || item.isRepresentative || false,
          isSoldOut: item.isSoldOut || item.soldOut || false,
          isHidden: item.isHidden || item.hidden || false,
          badge: item.badge || null,
          image: item.imageUrl || null,
          categoryId: finalCategoryId,
          itemOrder: item.itemOrder ?? 0,
        };
      });

    console.log("🥘 [StoreScreen] Total Items from Server:", menuListArray.length);
    console.log("🥘 [StoreScreen] Filtered Menu List (Total:", list.length, ", SelectedCat:", selectedCategoryId, ")");

    // Filter and SORT by itemOrder
    return list
      .filter(item => item.categoryId === selectedCategoryId)
      .sort((a, b) => (a.itemOrder || 0) - (b.itemOrder || 0));
  }, [menuListArray, categories, selectedCategoryId]);


  // =================================================================
  // 3. 액션 핸들러 (API 호출)
  // =================================================================

  // [수정됨] 기본 정보 저장 (Direct Fetch + FormData 사용)
  const handleBasicSave = async () => {
    if (!myStoreId) {
      Alert.alert("오류", "가게 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      // 1. 토큰 확보
      const tokenData = await getToken();
      const token = tokenData?.accessToken;

      // 2. FormData 생성
      const formData = new FormData();

      // 3. JSON 데이터를 문자열로 변환하여 'request' 파트에 담기

      const requestData = {
        name: editBasicData.name, // 수정된 이름 사용
        branch: editBasicData.branch, // 지점명 추가
        introduction: editBasicData.intro,
        address: editBasicData.address,
        addressDetail: editBasicData.detailAddress,
        phone: editBasicData.phone ? editBasicData.phone.replace(/-/g, '') : '', // 하이픈 제거 후 전송 (키 이름 수정: phoneNumber -> phone)
        storeCategories: editBasicData.categories.map(c => CATEGORY_KR_TO_EN[c] || c),
        storeMoods: editBasicData.vibes.map(v => {
          // 한글 -> 영어 변환 매핑 (API 스펙에 맞게)
          const VIBE_KR_TO_EN = {
            '모임': 'GROUP_GATHERING',
            '데이트': 'ROMANTIC',
            '조용한': 'QUIET',
            '활기찬': 'LIVELY',
            '1인 혼밥': 'SOLO_DINING',
            '야식': 'LATE_NIGHT',
            '회식': 'COMPANY_DINNER'
          };
          return VIBE_KR_TO_EN[v] || v;
        }),
        images: editBasicData.bannerImages
          .map((img, index) => ({ uri: img, index }))
          .filter(item => item.uri.startsWith('http'))
          .map(item => ({ url: item.uri, orderIndex: item.index }))
      };

      console.log("🚀 [handleBasicSave] Request Payload:", JSON.stringify(requestData, null, 2));

      // [핵심] JSON 포장 (표준 전송 방식 - Blob 사용하여 Content-Type 지정)
      formData.append("request", new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

      // 4. 이미지 파일이 있다면 formData에 추가 (키: images) - 다중 이미지 처리
      if (editBasicData.bannerImages && editBasicData.bannerImages.length > 0) {
        editBasicData.bannerImages.forEach((imgUri) => {
          if (!imgUri.startsWith('http')) {
            const localUri = imgUri;
            const filename = localUri.split('/').pop();
            const ext = filename.split('.').pop().toLowerCase();
            const type = (ext === 'png') ? 'image/png' : 'image/jpeg';

            // 키값 'images' (백엔드 스펙)
            formData.append('images', { uri: localUri, name: filename, type });
            console.log("📸 [매장 수정] 배너 이미지 추가됨 (key: images):", filename, type);
          }
        });
      }

      console.log("🚀 [매장 정보 수정] Direct Fetch 시작...");

      // 5. 전송
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/stores/${myStoreId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          // Content-Type은 절대 설정 금지! (FormData가 알아서 설정함)
        },
        body: formData,
      });

      const textResponse = await response.text(); // 응답 텍스트 확인
      console.log("📩 [수정 응답]", response.status, textResponse);

      if (response.ok) {
        Alert.alert("성공", "가게 정보가 수정되었습니다.");
        // [Fix 1] Update local storeInfo state immediately to reflect changes in basic info card
        setStoreInfo(prev => ({
          ...prev,
          name: editBasicData.name,
          branch: editBasicData.branch,
          intro: editBasicData.intro,
          address: editBasicData.address,
          detailAddress: editBasicData.detailAddress,
          phone: editBasicData.phone,
          categories: editBasicData.categories,
          vibes: editBasicData.vibes,
          bannerImages: editBasicData.bannerImages // Update banner images
        }));
        setBasicModalVisible(false);
      } else {
        // 에러 메시지 파싱 시도
        try {
          const errJson = JSON.parse(textResponse);
          Alert.alert("실패", errJson.message || "정보 수정에 실패했습니다.");
        } catch {
          Alert.alert("실패", `서버 오류 (${response.status})`);
        }
      }

    } catch (error) {
      console.error("💥 [매장 수정 에러]", error);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
    }
  };

  // 메뉴 추가/수정 저장
  const handleMenuSave = async () => {
    if (!myStoreId) return;

    if (!menuForm.name || !menuForm.price) {
      Alert.alert("알림", "메뉴명과 가격은 필수입니다.");
      return;
    }

    const priceNum = parseInt(String(menuForm.price).replace(/,/g, ''), 10) || 0;

    try {
      const tokenData = await getToken();
      const token = tokenData?.accessToken;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const url = isEditMode && targetItemId
        ? `${baseUrl}/api/items/${targetItemId}`
        : `${baseUrl}/api/stores/${myStoreId}/items`;
      const method = isEditMode ? 'PATCH' : 'POST';

      // 선택된 카테고리명에 해당하는 ID 찾기 (DEPRECATED: apiCategories is empty)
      // const targetCategory = apiCategories.find(c => c.name === menuForm.category);
      // const categoryId = targetCategory ? targetCategory.id : 1; // Fallback needed if no match

      const formData = new FormData();
      let requestData = {};
      const mappedBadge = BADGE_MAP[menuForm.badge] || null;

      console.log(`🥘 [Menu Save] Saving menu item. Mode: ${isEditMode ? 'Edit' : 'Create'}, CategoryId: ${menuForm.categoryId}`);

      if (isEditMode) {
        // PATCH: Use UpdateItemRequest schema (isSoldOut, isRepresentative)
        requestData = {
          name: menuForm.name,
          price: priceNum,
          description: menuForm.desc,
          itemCategoryId: Number(menuForm.categoryId),
          categoryId: Number(menuForm.categoryId), // Added for compatibility
          badge: mappedBadge,
          isHidden: menuForm.isHidden,
          isSoldOut: menuForm.isSoldOut,
          isRepresentative: menuForm.isRepresentative
        };
      } else {
        // POST: Use CreateItemRequest schema (soldOut, representative)
        requestData = {
          name: menuForm.name,
          price: priceNum,
          description: menuForm.desc,
          itemCategoryId: Number(menuForm.categoryId),
          categoryId: Number(menuForm.categoryId), // Added for compatibility
          badge: mappedBadge,
          hidden: menuForm.isHidden,
          soldOut: menuForm.isSoldOut,
          representative: menuForm.isRepresentative
        };
      }

      formData.append('request', {
        string: JSON.stringify(requestData),
        type: 'application/json',
        name: 'request'
      });

      if (menuForm.image && !menuForm.image.startsWith('http')) {
        const localUri = menuForm.image;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('image', { uri: localUri, name: filename, type });
      } else {
        formData.append('image', "");
      }

      console.log(`🥘 [Menu Save] Request Body:`, JSON.stringify(requestData, null, 2));

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      Alert.alert("성공", isEditMode ? "메뉴가 수정되었습니다." : "새 메뉴가 등록되었습니다.");
      setMenuModalVisible(false);
      refetchItems();

    } catch (error) {
      console.error("[Menu Save Error]", error);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
    }
  };

  // 즉시 상태 변경 (품절, 대표메뉴)
  const handleQuickUpdate = async (item, field, value) => {
    try {
      const tokenData = await getToken();
      const token = tokenData?.accessToken;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const url = `${baseUrl}/api/items/${item.id}`;

      // 카테고리 ID 조회 (DEPRECATED: apiCategories is empty)
      // const targetCategory = apiCategories.find(c => c.name === item.category);
      // const categoryId = targetCategory ? targetCategory.id : 1;

      const mappedBadge = BADGE_MAP[item.badge] || null;

      const formData = new FormData();
      // PATCH Schema: isHidden, isSoldOut, isRepresentative
      const requestData = {
        name: item.name,
        price: parseInt(String(item.price).replace(/,/g, ''), 10),
        description: item.desc,
        itemCategoryId: Number(item.categoryId),
        categoryId: Number(item.categoryId), // Added for compatibility
        badge: mappedBadge,
        isHidden: item.isHidden,
        isSoldOut: item.isSoldOut,
        isRepresentative: item.isRepresentative,
        ...(field === 'isSoldOut' && { isSoldOut: value }), // field match logic
        ...(field === 'isRecommended' && { isRepresentative: value }), // field match logic
      };

      console.log(`🥘 [Quick Update] PATCH ${url}`, JSON.stringify(requestData, null, 2));

      formData.append('request', {
        string: JSON.stringify(requestData),
        type: 'application/json',
        name: 'request'
      });

      // Backend requirement workaround: 'image' part must be present
      formData.append('image', "");

      console.log(`[Quick Update] PATCH ${url}`, requestData);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      refetchItems();

    } catch (error) {
      console.error("[Quick Update Error]", error);
      Alert.alert("오류", "상태 변경에 실패했습니다.");
    }
  };

  // 메뉴 드래그 종료 핸들러
  const handleMenuDragEnd = async ({ data }) => {
    try {
      console.log("🔄 [Menu Drag] Reordering menus locally...");

      // 1. Optimistic Update: Update Query Cache immediately
      // This prevents the "snap back" effect
      const queryKey = [`/api/stores/${myStoreId}/items`]; // Matches useGetItems structure from src/api/item.ts

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;

        // Items are in oldData.data.data or oldData.data
        const rawData = oldData.data?.data || oldData.data || [];
        const isArray = Array.isArray(rawData);
        const currentItems = isArray ? rawData : (rawData.content || []);

        // Find items NOT in current category to keep them as is
        const otherCategoryItems = currentItems.filter(item => {
          const catId = item.itemCategoryId ?? item.categoryId ?? item.item_category_id ?? item.category_id;
          return Number(catId) !== selectedCategoryId;
        });

        // Map the new sorted data from drag end to the server format
        const reorderedItems = data.map((item, index) => {
          const originalItem = currentItems.find(i => i.id === item.id);
          return {
            ...originalItem,
            itemOrder: index
          };
        });

        const updatedData = [...otherCategoryItems, ...reorderedItems];

        if (isArray) {
          return { ...oldData, data: { ...oldData.data, data: updatedData } };
        } else {
          return { ...oldData, data: { ...oldData.data, content: updatedData } };
        }
      });

      // 2. Prepare updates for API
      const updates = data.map((item, index) => ({
        itemId: item.id,
        itemOrder: index
      }));

      // 3. Batch update to backend in parallel
      const tokenData = await getToken();
      const token = tokenData?.accessToken;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

      await Promise.all(updates.map(update => {
        const url = `${baseUrl}/api/items/${update.itemId}`;
        const formData = new FormData();
        const requestData = { itemOrder: update.itemOrder };

        formData.append('request', {
          string: JSON.stringify(requestData),
          type: 'application/json',
          name: 'request'
        });
        formData.append('image', "");

        return fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });
      }));

      console.log("✅ [Menu Drag] Order persisted successfully");
      // Optional: final refetch to stay 100% in sync
      refetchItems();
    } catch (error) {
      console.error("[Menu Drag Error]", error);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
      refetchItems(); // Restore from server on error
    }
  };


  // # UI Logic Helpers
  const openBasicEditModal = () => {
    console.log("DEBUG: Opening Edit Modal. storeInfo:", storeInfo);
    setEditBasicData({
      ...storeInfo,
      phone: formatPhoneNumber(storeInfo.phone)
    });
    setBasicModalVisible(true);
  };

  const openHoursEditModal = () => {
    const currentHours = JSON.parse(JSON.stringify(operatingHours));

    // 모달 열 때 현재 데이터 기준으로 브레이크타임 설정이 하나라도 있는지 체크
    const exists = currentHours.some(h => !h.isClosed && h.breakStart && h.breakEnd);

    // 기존에 브레이크타임이 설정된 요일들은 그대로 두고, 
    // 전역 토글이 한번도 켜진 적 없는 상태를 대비해 데이터만 준비 (실제 null 유지는 UI에서 체크박스로 판단)
    setEditHoursData(currentHours);
    setHasBreakTime(exists);
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

  const handleHoursSave = async () => {
    try {
      const tokenData = await getToken();
      const token = tokenData?.accessToken;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

      // Construct JSON object for operating hours
      // Format: { "0": [["OPEN", "CLOSE"], ["BREAK_START", "BREAK_END"] or null], ... }
      const hoursJson = {};
      editHoursData.forEach((item, index) => {
        const key = index.toString();
        if (item.isClosed) {
          hoursJson[key] = [];
        } else {
          const openTimes = [item.open, item.close];
          // hasBreakTime이 true이고, 브레이크 시작/종료 시간이 있을 때만 전송
          const breakTimes = (hasBreakTime && item.breakStart && item.breakEnd) ? [item.breakStart, item.breakEnd] : null;
          hoursJson[key] = [openTimes, breakTimes];
        }
      });

      const formData = new FormData();
      formData.append("request", {
        string: JSON.stringify({ operatingHours: JSON.stringify(hoursJson) }),
        // Note: The structure is `request: { operatingHours: "STRINGIFIED_JSON" }` based on user saying "operatingHours": "..."
        // Wait, standard `STORE UPDATE` usually takes flat fields or nested?
        // User said: "operatingHours": "{\"0\": ...}" 
        // This implies `operatingHours` field in the JSON body is a STRING.
        type: "application/json",
        name: "request"
      });
      // append image ('') to satisfy multipart if needed, or maybe not if just updating info? 
      // `handleBasicSave` appends `images` if exists. Here we might not need it? 
      // Safest to append empty string if backend requires it, but let's try without first as it's a specific patch.
      // Actually, `handleQuickUpdate` appended `image: ""` workaround, so I should probably do it too.
      formData.append('image', "");

      console.log("🚀 [Hours Save] Payload:", JSON.stringify(hoursJson, null, 2));

      const response = await fetch(`${baseUrl}/api/stores/${myStoreId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        // 성공 시, 서버에 보낸 hoursJson 구조와 동일하게 로컬 operatingHours도 업데이트
        const updatedHours = editHoursData.map(item => ({
          ...item,
          // hasBreakTime이 꺼져있으면 명시적으로 null 처리
          breakStart: hasBreakTime ? item.breakStart : null,
          breakEnd: hasBreakTime ? item.breakEnd : null
        }));

        setOperatingHours(updatedHours);
        setHoursModalVisible(false);
        Alert.alert("성공", "영업시간이 저장되었습니다.");
      } else {
        const errText = await response.text();
        console.error("비정상 응답:", errText);
        Alert.alert("실패", "영업시간 저장 실패");
      }
    } catch (error) {
      console.error("영업시간 저장 에러:", error);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
    }
  };

  const toggleHoliday = (index) => {
    setEditHoursData(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isClosed: !next[index].isClosed };
      return next;
    });
  };



  const handleMockAction = (msg) => Alert.alert("알림", msg);

  // # Time Picker Logic
  const openTimePicker = (index, field) => {
    setTargetIndex(index); setTargetField(field);
    const current24 = editHoursData[index][field] || '10:00'; // 기본값 안전처리
    const { ampm, time } = convert24to12(current24);
    setTempAmpm(ampm); setTempTime(time); setPickerVisible(true);
  };

  const confirmTimePicker = () => {
    if (targetIndex !== null && targetField) {
      const time24 = convert12to24(tempAmpm, tempTime);
      setEditHoursData(prev => {
        const next = [...prev];
        next[targetIndex] = { ...next[targetIndex], [targetField]: time24 };
        return next;
      });
    }
    setPickerVisible(false);
  };

  // # Calendar Logic
  const changeMonth = (direction) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)); };
  const changeModalMonth = (direction) => {
    const today = new Date();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const targetMonth = new Date(modalDate.getFullYear(), modalDate.getMonth() + direction, 1);

    if (targetMonth >= minMonth && targetMonth <= maxMonth) {
      setModalDate(targetMonth);
    }
  };

  const handleDatePress = (dateStr) => {
    const today = getFormatDate(new Date());
    if (dateStr < today) return;
    if (selectedHolidays.includes(dateStr)) setSelectedHolidays(selectedHolidays.filter(d => d !== dateStr));
    else setSelectedHolidays([...selectedHolidays, dateStr]);
  };

  const openHolidayEditModal = () => {
    setTempSelectedHolidays([...selectedHolidays]);
    setModalDate(new Date(currentDate)); // 모달 열 때 현재 캘린더 날짜와 동기화
    setHolidayModalVisible(true);
  };

  const handleTempDatePress = (dateStr) => {
    // Individual Date Toggle Logic
    const today = getFormatDate(new Date());
    if (dateStr < today) return;

    if (tempSelectedHolidays.includes(dateStr)) {
      setTempSelectedHolidays(tempSelectedHolidays.filter(d => d !== dateStr));
    } else {
      setTempSelectedHolidays([...tempSelectedHolidays, dateStr]);
    }
  };

  const handleHolidaySave = async (targetHolidays = selectedHolidays) => {
    try {
      if (targetHolidays.length === 0) {
        // 휴무일 없음 -> 빈 배열로 전송
        const formData = new FormData();
        const requestData = { holidayDates: [] };
        formData.append('request', {
          string: JSON.stringify(requestData),
          type: 'application/json',
          name: 'request'
        });
        await manualStoreUpdate(formData);
        Alert.alert("성공", "휴무일 설정이 해제되었습니다.");
        setSelectedHolidays([]);
        setHolidayModalVisible(false);
        return;
      }

      // 날짜 정렬
      const sortedDates = [...targetHolidays].sort();

      const formData = new FormData();
      const requestData = {
        holidayDates: sortedDates
      };
      formData.append('request', {
        string: JSON.stringify(requestData),
        type: 'application/json',
        name: 'request'
      });

      await manualStoreUpdate(formData);
      Alert.alert("성공", "휴무일 설정이 저장되었습니다.");
      setSelectedHolidays(sortedDates);
      setHolidayModalVisible(false);
    } catch (error) {
      console.error("휴무일 저장 실패", error);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
    }
  };

  const handlePauseToggle = async (newValue) => {
    console.log("[handlePauseToggle] Called with:", newValue);
    try {
      setIsPaused(newValue); // UI 선반영
      const formData = new FormData();
      const requestData = { isSuspended: newValue };
      formData.append('request', {
        string: JSON.stringify(requestData),
        type: 'application/json',
        name: 'request'
      });
      await manualStoreUpdate(formData);
      // 성공 메세지는 생략하거나 짧게 토스트 처리 (여기선 생략)
    } catch (error) {
      console.error("영업 일시 중지 변경 실패", error);
      setIsPaused(!newValue);
      setIsErrorPopupVisible(true); // 에러 팝업으로 변경
    }
  };

  // 공통 업데이트 함수
  const manualStoreUpdate = async (formData) => {
    try {
      const tokenData = await getToken();
      const token = tokenData?.accessToken;
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      const url = `${baseUrl}/api/stores/${myStoreId}`;

      console.log("[manualStoreUpdate] Request URL:", url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // 'Content-Type': 'multipart/form-data', // 자동 설정됨
        },
        body: formData,
      });

      console.log("[manualStoreUpdate] Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[manualStoreUpdate] Response Error:", errorText);
        throw new Error(`Failed to update store: ${response.status} ${errorText}`);
      }

      // text()로 먼저 확인 후 JSON 파싱 (안전장치)
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log("[manualStoreUpdate] Success:", json);
        return json;
      } catch (e) {
        // 내용은 없지만 성공일 수 있음 (200 OK empty body)
        return {};
      }
    } catch (err) {
      console.error("[manualStoreUpdate] Fetch Exception:", err);
      throw err;
    }
  };

  const generateCalendar = (baseDate = currentDate) => {
    const year = baseDate.getFullYear(); const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  };



  // # Menu Modal Logic
  const openAddMenuModal = () => {
    setIsEditMode(false);
    setTargetItemId(null);
    setMenuForm({
      name: '', price: '', desc: '',
      category: '', // Name is redundant but kept for form compatibility if needed
      isRepresentative: false, badge: null, isSoldOut: false, isHidden: false,
      image: null,
      categoryId: selectedCategoryId || (categories[0]?.id) // Use selected or first category
    });
    setIsCategoryDropdownOpen(false);
    setMenuModalVisible(true);
  };

  const openEditMenuModal = (item) => {
    setIsEditMode(true);
    setTargetItemId(item.id);
    setMenuForm({
      name: item.name,
      price: String(item.price),
      desc: item.desc,
      category: item.category,
      isRepresentative: item.isRepresentative,
      badge: item.badge,
      isSoldOut: item.isSoldOut,
      isHidden: item.isHidden,
      image: item.image, // Fixed: use item.image instead of item.imageUrl
      categoryId: item.categoryId // Load preserved ID
    });
    setMenuModalVisible(true);
    setIsCategoryDropdownOpen(false);
  };

  // # Image Picker Logic
  const pickImage = async () => {
    // 1. 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 부족', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    // 2. 개수 제한 확인 (최대 3장)
    if (editBasicData.bannerImages && editBasicData.bannerImages.length >= 3) {
      Alert.alert('알림', '배너 이미지는 최대 3장까지 등록할 수 있습니다.');
      return;
    }

    // 3. 이미지 선택
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1.7, 1], // 배너 비율 유지
      quality: 0.8, // 용량 최적화 (413 에러 방지)
      maxWidth: 1024, // 가로 해상도 제한
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // 4. 용량 제한 확인 (10MB)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('용량 초과', '이미지 파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      // 5. 상태 업데이트 (배열에 추가)
      const newImageUri = asset.uri;
      setEditBasicData(prev => ({
        ...prev,
        bannerImages: [...(prev.bannerImages || []), newImageUri]
      }));
    }
  };

  const pickMenuImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced to fix 413 Payload Too Large
      });

      if (!result.canceled) {
        setMenuForm({ ...menuForm, image: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("오류", "이미지를 불러오는데 실패했습니다.");
    }
  };

  const handleDeleteMenu = () => {
    if (!targetItemId) return;
    Alert.alert("메뉴 삭제", "정말로 이 메뉴를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteItemMutation.mutate(
            { itemId: targetItemId },
            {
              onSuccess: () => {
                Alert.alert("삭제 완료", "메뉴가 삭제되었습니다.");
                setMenuModalVisible(false);
                refetchItems();
              },
              onError: () => Alert.alert("실패", "메뉴 삭제에 실패했습니다.")
            }
          );
        }
      }
    ]);
  };

  // 로딩 화면
  if (isStoreLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#34B262" />
        <Text style={{ marginTop: 10, color: '#828282' }}>가게 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: rs(20) }}>
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
        </View>

        {/* [추가] 매장 정보 등록 안내 (탭별 분리 및 상단 고정) */}
        {activeTab === 'info' && !isProfileComplete && (
          <Animated.View style={[styles.registrationAlertContainer, { opacity: pulseAnim }]}>
            <Text style={styles.registrationAlertText}>매장 정보를 등록해주세요!</Text>
          </Animated.View>
        )}
        {activeTab === 'management' && isMenusEmpty && (
          <Animated.View style={[styles.registrationAlertContainer, { opacity: pulseAnim }]}>
            <Text style={styles.registrationAlertText}>메뉴를 추가해주세요!</Text>
          </Animated.View>
        )}

        {/* ==================== 매장 정보 탭 ==================== */}
        {activeTab === 'info' ? (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={{ gap: rs(20) }}>

              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.headerTitleRow, { alignItems: 'center' }]}>
                    <View style={styles.iconCircle}><Ionicons name="storefront" size={rs(14)} color="#34B262" /></View>
                    <Text style={styles.headerTitle}>기본 정보</Text>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={openBasicEditModal}>
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                </View>
                <InfoRow icon="storefront" label="가게명"
                  content={
                    (`${storeInfo.name} ${storeInfo.branch || ''}`.trim())
                      ? <Text style={styles.bodyText}>{`${storeInfo.name} ${storeInfo.branch || ''}`.trim()}</Text>
                      : <Text style={styles.placeholderText}>정보 없음</Text>
                  }
                />
                <InfoRow icon="grid" label="가게 종류" content={<View style={styles.tagContainer}>{storeInfo.categories.length > 0 ? storeInfo.categories.map((cat, i) => <Tag key={i} text={cat} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>} />
                <InfoRow icon="sparkles" label="가게 분위기" content={<View style={styles.tagContainer}>{storeInfo.vibes.length > 0 ? storeInfo.vibes.map((v, i) => <Tag key={i} text={v} />) : <Text style={styles.placeholderText}>정보 없음</Text>}</View>} />
                <InfoRow icon="information-circle" label="가게 소개" content={storeInfo.intro ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{storeInfo.intro}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} />
                <View style={[styles.rowSection, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <View style={styles.fixedLabel}>
                    <Ionicons name="image" size={rs(12)} color="#828282" />
                    <Text style={styles.labelText}>가게 배너 이미지</Text>
                  </View>
                  <View style={{ width: '100%', marginTop: rs(10) }}>
                    {/* Banner Image Slider (1.7:1) */}
                    {storeInfo.bannerImages && storeInfo.bannerImages.length > 0 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: rs(10), paddingRight: rs(10) }}
                      >
                        {storeInfo.bannerImages.map((imgUri, index) => (
                          <TouchableOpacity key={index} onPress={() => setIsFullScreenBannerVisible(true)} activeOpacity={0.9}>
                            <Image
                              source={{ uri: imgUri }}
                              style={{ width: rs(153), height: rs(90), borderRadius: rs(8), borderWidth: 1, borderColor: '#E0E0E0' }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={{ width: rs(153), height: rs(90), backgroundColor: '#F5F5F5', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEEEEE', borderStyle: 'dashed' }}>
                        <Text style={{ color: '#AAAAAA', fontSize: rs(11), fontFamily: 'Pretendard' }}>배너를 추가해주세요</Text>
                      </View>
                    )}
                  </View>
                </View>
                <InfoRow icon="location" label="주소" content={<View style={{ marginTop: rs(2) }}>{storeInfo.address ? (<><Text style={styles.bodyText}>{storeInfo.address}</Text>{storeInfo.detailAddress ? <Text style={[styles.bodyText, { color: '#828282', marginTop: rs(2) }]}>{storeInfo.detailAddress}</Text> : null}</>) : <Text style={[styles.placeholderText, { marginTop: 0 }]}>정보 없음</Text>}</View>} />
                <InfoRow icon="call" label="전화번호" content={storeInfo.phone ? <Text style={[styles.bodyText, { marginTop: rs(2) }]}>{formatPhoneNumber(storeInfo.phone)}</Text> : <Text style={styles.placeholderText}>정보 없음</Text>} style={{ marginBottom: 0 }} />
              </View>

              {/* 영업시간 */}
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerTitleRow}>
                    <View style={styles.timeIconCircle}><Ionicons name="time" size={rs(18)} color="#34B262" /></View>
                    <View><Text style={styles.headerTitle}>영업시간/브레이크타임</Text><Text style={styles.subTitle}>상단: 영업시간, <Text style={{ color: '#FF6200' }}>하단: 브레이크타임</Text></Text></View>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={openHoursEditModal}><Text style={styles.editButtonText}>수정</Text></TouchableOpacity>
                </View>
                <View style={{ gap: rs(8) }}>
                  {operatingHours.map((item, index) => (
                    <View key={index} style={[styles.hourRow, item.isClosed && { opacity: 0.3 }]}>
                      <Text style={styles.dayText}>{item.day}</Text>
                      {item.isClosed ? (
                        <View style={styles.closedBadge}><Text style={styles.timeText}>휴무</Text></View>
                      ) : (
                        item.open && item.close ? (
                          <View style={{ flexDirection: 'column', gap: rs(4) }}>
                            <View style={styles.timeDisplayContainer}>
                              <Text style={styles.timeText}>{item.open}</Text>
                              <Text style={styles.hyphen}>-</Text>
                              <Text style={styles.timeText}>{item.close}</Text>
                            </View>
                            {(item.breakStart && item.breakEnd) ? (
                              <View style={styles.timeDisplayContainer}>
                                <Text style={styles.breakTimeText}>{item.breakStart}</Text>
                                <Text style={styles.hyphenOrange}>-</Text>
                                <Text style={styles.breakTimeText}>{item.breakEnd}</Text>
                              </View>
                            ) : (
                              <Text style={{ fontSize: rs(11), color: '#828282', fontFamily: 'Pretendard', fontWeight: '500' }}>브레이크타임 없음</Text>
                            )}
                          </View>
                        ) : (
                          <Text style={styles.placeholderText}>정보 없음</Text>
                        )
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* 매장 소식 (Placeholder) */}
              <TouchableOpacity style={[styles.infoCard, { paddingVertical: rs(22) }]} activeOpacity={0.7} onPress={() => navigation.navigate('StoreNews', { storeId: myStoreId })}>
                <View style={styles.newsContentRow}>
                  <View style={styles.newsLeftSection}>
                    <View style={styles.timeIconCircle}><Ionicons name="megaphone" size={rs(18)} color="#34B262" /></View>
                    <View><Text style={styles.headerTitle}>매장 소식</Text><Text style={styles.subTitle}>고객에게 전할 공지사항</Text></View>
                  </View>
                  <Ionicons name="chevron-forward" size={rs(18)} color="#34B262" />
                </View>
              </TouchableOpacity>

              {/* 휴무일 캘린더 */}
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerTitleRow}>
                    <View style={styles.timeIconCircle}><Ionicons name="calendar" size={rs(18)} color="#34B262" /></View>
                    <View><Text style={styles.headerTitle}>휴무일</Text><Text style={styles.subTitle}>임시 휴무일을 지정합니다</Text></View>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={openHolidayEditModal}><Text style={styles.editButtonText}>수정</Text></TouchableOpacity>
                </View>
                <View style={styles.calendarControl}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}><Ionicons name="chevron-back" size={rs(20)} color="#ccc" /></TouchableOpacity>
                  <Text style={styles.calendarTitle}>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}><Ionicons name="chevron-forward" size={rs(20)} color="#ccc" /></TouchableOpacity>
                </View>
                <View style={styles.weekHeader}>
                  {WEEKDAYS.map((day, index) => (<Text key={index} style={[styles.weekText, index === 0 && { color: '#FF3E41' }, index === 6 && { color: '#007AFF' }]}>{day}</Text>))}
                </View>
                <View style={styles.daysGrid}>
                  {generateCalendar().map((date, index) => {
                    if (!date) return <View key={index} style={styles.dayCell} />;
                    const dateStr = getFormatDate(date);
                    const isSelected = selectedHolidays.includes(dateStr);
                    const isPast = dateStr < getFormatDate(new Date());
                    const dayOfWeek = date.getDay();

                    const cellStyle = [styles.dayBtn];
                    const textStyle = [styles.dayTextNum];
                    if (dayOfWeek === 0) textStyle.push({ color: '#FF3E41' }); else if (dayOfWeek === 6) textStyle.push({ color: '#007AFF' });
                    if (isSelected) {
                      cellStyle.push(styles.dayBtnSelected); textStyle.push({ color: 'white', fontWeight: '700' });
                    }
                    if (isPast) textStyle.push({ color: '#E0E0E0' });

                    return (<View key={index} style={styles.dayCell}><TouchableOpacity style={cellStyle} disabled={true} activeOpacity={1}><Text style={textStyle}>{date.getDate()}</Text></TouchableOpacity></View>);
                  })}
                </View>
              </View>

              {/* 영업 일시 중지 */}
              <View style={[styles.infoCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rs(15), gap: rs(10) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(10), flex: 1 }}>
                  <View style={styles.alertIconCircle}><Ionicons name="warning" size={rs(18)} color="#DC2626" /></View>
                  <View style={{ flex: 1 }}><Text style={styles.headerTitle}>영업 일시 중지</Text><Text style={styles.subTitle}>급한 사정 시 가게를 잠시 닫습니다</Text></View>
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => handlePauseToggle(!isPaused)}>
                  <View style={[styles.customSwitch, isPaused ? styles.switchOn : styles.switchOff]}><View style={styles.switchKnob} /></View>
                </TouchableOpacity>
              </View>
              <View style={{ height: rs(20) }} />
            </View>
          </ScrollView>
        ) : (
          /* ==================== 메뉴 관리 탭 ==================== */
          <View style={{ flex: 1, paddingHorizontal: rs(20) }}>
            {/* 고정된 카테고리 헤더 */}
            <View style={styles.categoryScrollContainer}>
              <View style={[styles.categoryTabsContainer, { flex: 1 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: rs(20) }}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.categoryTab, selectedCategoryId === category.id ? styles.categoryTabSelected : styles.categoryTabUnselected]}
                      onPress={() => setSelectedCategoryId(category.id)}
                    >
                      <Text style={[styles.categoryText, selectedCategoryId === category.id ? styles.categoryTextSelected : styles.categoryTextUnselected]}>{category.name}</Text>
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
            {isItemsLoading ? (
              <View style={{ flex: 1 }}>
                <ActivityIndicator size="small" color="#34B262" style={{ marginVertical: 20 }} />
              </View>
            ) : (
              <DraggableFlatList
                data={menuList}
                onDragEnd={handleMenuDragEnd}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <View style={{ height: rs(200), justifyContent: 'center', alignItems: 'center', gap: rs(10) }}>
                    <Ionicons name="restaurant-outline" size={rs(40)} color="#ccc" />
                    <Text style={{ color: '#ccc' }}>등록된 메뉴가 없습니다.</Text>
                  </View>
                }
                contentContainerStyle={styles.menuListContainer}
                renderItem={({ item, drag, isActive }) => (
                  <View style={[styles.menuCard, isActive && { opacity: 0.8, elevation: 8 }]}>
                    <TouchableOpacity onLongPress={drag} activeOpacity={0.8} style={styles.dragHandle}>
                      <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                      <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                      <View style={styles.dragDotRow}><View style={styles.dragDot} /><View style={styles.dragDot} /></View>
                    </TouchableOpacity>
                    <View style={[styles.menuContent, item.isSoldOut && { opacity: 0.5 }]}>
                      <View style={styles.menuImageContainer}>
                        {item.image ? (
                          <Image source={{ uri: item.image }} style={styles.menuImage} resizeMode="cover" />
                        ) : (
                          <View style={styles.menuImagePlaceholder} />
                        )}
                        {item.isSoldOut && <View style={styles.soldOutOverlay} />}
                        {item.isRepresentative && <View style={styles.imageStarBadge}><Ionicons name="star" size={rs(8)} color="white" /></View>}
                      </View>
                      <View style={styles.menuInfo}>
                        <View style={styles.menuTitleRow}>
                          <Text style={styles.menuName}>{item.name}</Text>
                          {item.badge && <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>}
                        </View>
                        <Text style={styles.menuPrice}>{Number(item.price).toLocaleString()}원</Text>
                        <Text style={styles.menuDesc} numberOfLines={1}>{item.desc}</Text>
                      </View>
                    </View>
                    <View style={styles.menuActions}>
                      {/* 대표메뉴 토글 */}
                      <TouchableOpacity onPress={() => handleQuickUpdate(item, 'isRecommended', !item.isRepresentative)}>
                        <View style={[styles.actionCircle, item.isRepresentative ? { backgroundColor: '#FFFACA' } : { backgroundColor: '#F5F5F5' }]}>
                          <Ionicons name="star" size={rs(12)} color={item.isRepresentative ? "#EAB308" : "#DADADA"} />
                        </View>
                      </TouchableOpacity>
                      {/* 품절 토글 */}
                      <View style={styles.soldOutContainer}>
                        <Text style={styles.soldOutLabel}>품절</Text>
                        <TouchableOpacity onPress={() => handleQuickUpdate(item, 'isSoldOut', !item.isSoldOut)}>
                          <View style={[styles.soldOutSwitch, item.isSoldOut ? styles.soldOutOn : styles.soldOutOff]}><View style={styles.soldOutKnob} /></View>
                        </TouchableOpacity>
                      </View>
                      {/* 수정 */}
                      <TouchableOpacity onPress={() => openEditMenuModal(item)}>
                        <Ionicons name="pencil" size={rs(16)} color="#828282" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}

            {/* + 메뉴 추가하기 버튼 (Floating) */}
            <View style={{ height: rs(80) }} />

            {/* 카테고리 관리 모달 (Redesigned & Repositioned) */}
            <Modal transparent={true} visible={categoryModalVisible} animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
              <TouchableOpacity
                style={styles.catModalOverlay}
                activeOpacity={1}
                onPress={() => {
                  setCategoryModalVisible(false);
                  setCategoryOptionsId(null);
                  setEditingCategoryId(null);
                }}
              >
                <View style={[styles.catModalContent, { width: rs(230) }]}>
                  <ScrollView style={{ maxHeight: rs(300) }} nestedScrollEnabled={true}>
                    {categories.map((cat, idx) => {
                      const isActive = selectedCategoryId === cat.id;
                      const isEditing = editingCategoryId === cat.id;

                      return (
                        <View key={cat.id} style={{ position: 'relative', zIndex: categories.length - idx }}>
                          <TouchableOpacity
                            style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setSelectedCategoryId(cat.id);
                              setCategoryModalVisible(false);
                              setCategoryOptionsId(null);
                            }}
                          >
                            {isEditing ? (
                              <View style={styles.inlineEditContainer}>
                                <TextInput
                                  style={styles.inlineInput}
                                  value={editingCategoryName}
                                  onChangeText={setEditingCategoryName}
                                  autoFocus={true}
                                  onSubmitEditing={() => handleUpdateCategory(cat.id)}
                                />
                                <TouchableOpacity style={styles.inlineDoneBtn} onPress={() => handleUpdateCategory(cat.id)}>
                                  <Text style={styles.inlineDoneText}>완료</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(5) }}>
                                  <View style={{ width: rs(18), alignItems: 'center' }}>
                                    {isActive && <Ionicons name="checkmark" size={rs(14)} color="#FFA100" />}
                                  </View>
                                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.name}</Text>
                                </View>

                                {/* Options Button (...) */}
                                <TouchableOpacity
                                  style={styles.dotsButton}
                                  onPress={() => setCategoryOptionsId(categoryOptionsId === cat.id ? null : cat.id)}
                                >
                                  <Text style={styles.dotsText}>···</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </TouchableOpacity>

                          {/* Options Popover (Vertical Redesign - Image Reflected) */}
                          {categoryOptionsId === cat.id && !isEditing && (
                            <View style={styles.optionsPopover}>
                              <TouchableOpacity
                                style={styles.optionBtn}
                                onPress={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                  setCategoryOptionsId(null);
                                }}
                              >
                                <Text style={styles.optionBtnText}>수정</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.optionBtn}
                                onPress={() => {
                                  // 팝업 닫고 삭제 함수 호출
                                  setCategoryOptionsId(null);
                                  handleDeleteCategory(cat);
                                }}
                              >
                                <Text style={styles.optionBtnText}>삭제</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* 인라인 카테고리 추가 입력 Area (Cleaned Up) */}
                  <View style={styles.newCatInputArea}>
                    {isAddingCategory ? (
                      <View style={styles.newCategoryInputBox}>
                        <TextInput
                          style={[styles.newCategoryInput, { flex: 1, fontSize: rs(11) }]}
                          placeholder="새 카테고리 추가"
                          placeholderTextColor="#DADADA"
                          value={newCategoryName}
                          onChangeText={setNewCategoryName}
                          maxLength={20}
                          autoFocus={true}
                          onSubmitEditing={handleCreateCategory}
                        />
                        <TouchableOpacity style={[styles.inlineDoneBtn, { height: rs(23), borderRadius: rs(6) }]} onPress={handleCreateCategory}>
                          <Text style={styles.inlineDoneText}>완료</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.newCategoryInputBox, { opacity: 0.7 }]}
                        onPress={() => setIsAddingCategory(true)}
                      >
                        <Ionicons name="add" size={rs(14)} color="#828282" />
                        <Text style={{ color: '#828282', fontSize: rs(11), marginLeft: rs(4) }}>카테고리 추가</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>

            {/* 카테고리에 메뉴가 있어요 (Delete Blocked Popover) */}
            <Modal transparent={true} visible={isDeleteErrorVisible} animationType="fade" onRequestClose={() => setIsDeleteErrorVisible(false)}>
              <View style={styles.deleteErrorModalOverlay}>
                <View style={styles.deleteErrorModalContainer}>
                  <Text style={styles.deleteErrorTitle}>카테고리에 메뉴가 있어요</Text>
                  <Text style={styles.deleteErrorDesc}>해당 카테고리에 메뉴가 있어 삭제할 수 없어요</Text>
                  <TouchableOpacity
                    style={styles.deleteErrorConfirmBtn}
                    onPress={() => setIsDeleteErrorVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteErrorConfirmText}>확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View >
        )}

        {/* =================================================================
          # Modal: Menu Add/Edit (메뉴 추가/수정) - API 연결됨
          ================================================================= */}
        < Modal animationType="slide" transparent={true} visible={menuModalVisible} onRequestClose={() => setMenuModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.menuModalHeader}>
                <Text style={styles.modalTitle}>{isEditMode ? '메뉴 수정' : '메뉴 추가'}</Text>
                <TouchableOpacity onPress={() => setMenuModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={rs(24)} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* 1. 기본 정보 */}
                <Text style={styles.sectionTitle}>기본 정보</Text>

                {/* 사진 추가 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>메뉴 사진(1:1 비율 권장)</Text>
                  {menuForm.image ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(15) }}>
                      <Image source={{ uri: menuForm.image }} style={{ width: rs(80), height: rs(80), borderRadius: rs(8) }} resizeMode="cover" />
                      <TouchableOpacity style={styles.changePhotoBtn} onPress={pickMenuImage}>
                        <Text style={styles.changePhotoBtnText}>사진 변경</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.photoUploadBox} onPress={pickMenuImage}>
                      <Ionicons name="camera" size={rs(30)} color="rgba(130, 130, 130, 0.70)" />
                      <Text style={styles.photoUploadText}>사진 추가</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 메뉴명 */}
                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row' }}><Text style={styles.inputLabel}>메뉴명 </Text><Text style={styles.requiredStar}>*</Text></View>
                  <View style={styles.textInputBox}>
                    <TextInput style={styles.textInput} placeholder="예: 마늘간장치킨" placeholderTextColor="#999" value={menuForm.name} onChangeText={(t) => setMenuForm({ ...menuForm, name: t })} />
                    <Text style={styles.charCount}>{menuForm.name.length}/20</Text>
                  </View>
                </View>

                {/* 가격 */}
                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row' }}><Text style={styles.inputLabel}>가격 </Text><Text style={styles.requiredStar}>*</Text></View>
                  <View style={styles.textInputBox}>
                    <TextInput style={styles.textInput} keyboardType="numeric" placeholder="0" placeholderTextColor="#999" value={menuForm.price} onChangeText={(t) => setMenuForm({ ...menuForm, price: t })} />
                    <Text style={styles.unitText}>원</Text>
                  </View>
                </View>

                {/* 설명 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>메뉴 설명</Text>
                  <View style={[styles.textInputBox, { height: rs(60), alignItems: 'flex-start', paddingVertical: rs(10) }]}>
                    <TextInput style={[styles.textInput, { height: '100%' }]} multiline placeholder="메뉴 설명을 입력해주세요" placeholderTextColor="#999" value={menuForm.desc} onChangeText={(t) => setMenuForm({ ...menuForm, desc: t })} />
                  </View>
                </View>

                <View style={styles.divider} />

                {/* 2. 카테고리 및 속성 */}
                <Text style={styles.sectionTitle}>카테고리 및 속성</Text>

                {/* 메뉴 카테고리 (dropdown) */}
                <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                  <Text style={styles.inputLabel}>메뉴 카테고리</Text>
                  <View style={{ position: 'relative' }}>
                    <TouchableOpacity
                      style={[styles.dropdownBox, isCategoryDropdownOpen && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}
                      onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dropdownText}>
                        {categories.find(c => c.id === menuForm.categoryId)?.name || '카테고리 선택'}
                      </Text>
                      <Ionicons name={isCategoryDropdownOpen ? "caret-up" : "caret-down"} size={rs(10)} color="#333" />
                    </TouchableOpacity>

                    {/* 드롭다운 리스트 */}
                    {isCategoryDropdownOpen && (
                      <View style={styles.dropdownList}>
                        {categories.length > 0 ? (
                          <>
                            <ScrollView style={{ maxHeight: rs(200) }} nestedScrollEnabled={true}>
                              {categories.map((cat, idx) => {
                                const isCurrent = menuForm.categoryId === cat.id;
                                return (
                                  <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                      styles.categoryItem,
                                      isCurrent && styles.categoryItemActive,
                                      { height: rs(35) } // Slightly taller for dropdown
                                    ]}
                                    onPress={() => {
                                      setMenuForm({ ...menuForm, category: cat.name, categoryId: cat.id });
                                      setIsCategoryDropdownOpen(false);
                                    }}
                                  >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(5) }}>
                                      <View style={{ width: rs(20), alignItems: 'center' }}>
                                        {isCurrent && <Ionicons name="checkmark" size={rs(16)} color="#FFA100" />}
                                      </View>
                                      <Text style={[styles.categoryText, isCurrent && styles.categoryTextActive]}>{cat.name}</Text>
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}

                              {/* 인라인 카테고리 추가 입력 */}
                              {isAddingCategory ? (
                                <View style={{ paddingHorizontal: rs(10), paddingVertical: rs(8) }}>
                                  <View style={styles.newCategoryInputBox}>
                                    <TextInput
                                      style={[styles.newCategoryInput, { flex: 1, fontSize: rs(11) }]}
                                      placeholder="새 카테고리 입력"
                                      value={newCategoryName}
                                      onChangeText={setNewCategoryName}
                                      maxLength={20}
                                      autoFocus={true}
                                      onSubmitEditing={handleCreateCategory}
                                    />
                                    <TouchableOpacity style={[styles.inlineDoneBtn, { height: rs(23) }]} onPress={handleCreateCategory}>
                                      <Text style={styles.inlineDoneText}>완료</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ) : null}
                            </ScrollView>

                            {/* + 카테고리 추가 버튼 */}
                            {!isAddingCategory && (
                              <TouchableOpacity
                                style={[styles.categoryItem, { justifyContent: 'center', opacity: 0.7 }]}
                                onPress={() => setIsAddingCategory(true)}
                              >
                                <Ionicons name="add" size={rs(14)} color="#828282" />
                                <Text style={{ color: '#828282', fontSize: rs(11) }}>카테고리 추가</Text>
                              </TouchableOpacity>
                            )}
                          </>
                        ) : (
                          <View style={{ padding: rs(20), alignItems: 'center', gap: rs(10) }}>
                            <Text style={{ fontSize: rs(12), color: 'black', textAlign: 'center', lineHeight: rs(18) }}>카테고리가 없습니다.{'\n'}추가로 생성해주세요</Text>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: rs(4), marginTop: rs(5) }} onPress={() => setIsAddingCategory(true)}>
                              <Ionicons name="add" size={rs(14)} color="#828282" />
                              <Text style={{ fontSize: rs(12), color: '#828282', fontWeight: '500' }}>카테고리 생성</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* 대표 메뉴 설정 */}
                {(() => {
                  const isLimitReached = representativeCount >= 5 && !menuForm.isRepresentative;
                  return (
                    <TouchableOpacity
                      style={[styles.optionRow, isLimitReached && { backgroundColor: '#F0F0F0' }]}
                      onPress={() => {
                        if (!isLimitReached) {
                          setMenuForm({ ...menuForm, isRepresentative: !menuForm.isRepresentative });
                        }
                      }}
                      activeOpacity={isLimitReached ? 1 : 0.7}
                    >
                      <View style={[
                        styles.checkBoxSquare,
                        menuForm.isRepresentative && { backgroundColor: '#34B262', borderColor: '#34B262' },
                        isLimitReached && { backgroundColor: '#BDBDBD', borderColor: '#BDBDBD', borderRadius: rs(8) }
                      ]}>
                        {(menuForm.isRepresentative || isLimitReached) && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                      </View>
                      <View>
                        <Text style={[styles.optionTitle, isLimitReached && { color: '#828282' }]}>우리 가게 대표 메뉴로 설정</Text>
                        <Text style={styles.optionDesc}>
                          {isLimitReached ? "이미 5개의 대표 메뉴를 설정했어요" : "고객 앱 최상단 '사장님 추천' 영역에 우선 노출됩니다"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })()}

                {/* 배지 설정 (badge 필드 가정) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>배지설정</Text>
                  <View style={{ flexDirection: 'row', gap: rs(8) }}>
                    {BADGE_TYPES.map((badge) => (
                      <TouchableOpacity
                        key={badge}
                        style={[styles.badgeChip, menuForm.badge === badge ? styles.badgeChipSelected : styles.badgeChipUnselected]}
                        onPress={() => setMenuForm({ ...menuForm, badge: menuForm.badge === badge ? null : badge })}
                      >
                        <Text style={[styles.badgeText, menuForm.badge === badge ? { color: 'white', fontWeight: '600' } : { color: 'black' }]}>{badge}</Text>
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
                  <TouchableOpacity onPress={() => setMenuForm({ ...menuForm, isSoldOut: !menuForm.isSoldOut })}>
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
                  <TouchableOpacity onPress={() => setMenuForm({ ...menuForm, isHidden: !menuForm.isHidden })}>
                    <View style={[styles.menuToggleSwitch, menuForm.isHidden ? styles.menuToggleOn : styles.menuToggleOff]}>
                      <View style={styles.menuToggleKnob} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={{ height: rs(5) }} />
              </ScrollView>

              {/* 하단 고정 버튼 (수정 모드: 삭제 / 수정,  추가 모드: 추가하기) */}
              <View style={[styles.modalFooter, { flexDirection: 'row', gap: rs(10), justifyContent: 'flex-end' }]}>
                {isEditMode ? (
                  <>
                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', width: rs(120) }]}
                      onPress={handleDeleteMenu}
                    >
                      <Text style={[styles.modalSubmitText, { color: '#828282' }]}>삭제하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { flex: 1, backgroundColor: '#34B262' }]}
                      onPress={handleMenuSave}
                    >
                      <Text style={styles.modalSubmitText}>수정하기</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalSubmitBtn, { flex: 1, backgroundColor: '#34B262' }]}
                    onPress={handleMenuSave}
                  >
                    <Text style={styles.modalSubmitText}>추가하기</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal >

        {/* Basic Modal & Hours Modal */}
        < Modal animationType="slide" transparent={true} visible={basicModalVisible} onRequestClose={() => setBasicModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>기본 정보</Text>
                  <View style={{ flexDirection: 'row', gap: rs(8) }}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setBasicModalVisible(false)}><Text style={styles.cancelButtonText}>취소</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleBasicSave}><Text style={styles.saveButtonText}>완료</Text></TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.editSection, { flexDirection: 'row', alignItems: 'flex-start' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: rs(55), marginTop: rs(6) }}>
                    <Ionicons name="storefront" size={rs(12)} color="#828282" />
                    <Text style={styles.labelText}>가게명</Text>
                  </View>
                  <View style={{ flex: 1, gap: rs(8) }}>
                    <View style={styles.inputWrapper}>
                      <TextInput style={styles.textInput} placeholder="가게명을 입력해주세요" placeholderTextColor="#666" value={editBasicData.name} onChangeText={(text) => setEditBasicData({ ...editBasicData, name: text })} />
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput style={styles.textInput} placeholder="가게 지점명을 입력해주세요(선택)" placeholderTextColor="#666" value={editBasicData.branch} onChangeText={(text) => setEditBasicData({ ...editBasicData, branch: text })} />
                    </View>
                  </View>
                </View>
                <EditSection icon="grid" label="가게 종류"><View style={styles.selectionGrid}>{ALL_CATEGORIES.map((cat) => (<TouchableOpacity key={cat} style={[styles.selectChip, editBasicData.categories.includes(cat) ? styles.selectChipActive : styles.selectChipInactive]} onPress={() => toggleSelection(cat, 'categories')}><Text style={[styles.chipText, editBasicData.categories.includes(cat) ? styles.chipTextActive : styles.chipTextInactive]}>{cat}</Text></TouchableOpacity>))}</View></EditSection>
                <EditSection icon="sparkles" label="가게 분위기"><View style={styles.selectionGrid}>{ALL_VIBES.map((vibe) => (<TouchableOpacity key={vibe} style={[styles.selectChip, editBasicData.vibes.includes(vibe) ? styles.selectChipActive : styles.selectChipInactive]} onPress={() => toggleSelection(vibe, 'vibes')}><Text style={[styles.chipText, editBasicData.vibes.includes(vibe) ? styles.chipTextActive : styles.chipTextInactive]}>{vibe}</Text></TouchableOpacity>))}</View></EditSection>
                <EditSection icon="information-circle" label="가게 소개"><View style={styles.inputWrapper}><TextInput style={styles.textInput} placeholder="가게를 소개하는 글을 적어주세요" value={editBasicData.intro} onChangeText={(text) => setEditBasicData({ ...editBasicData, intro: text })} /><Text style={styles.charCount}>{editBasicData.intro.length}/50</Text></View></EditSection>
                <EditSection icon="image" label="가게 이미지(최대 3장)">
                  <View style={{ gap: rs(10), width: '100%' }}>
                    {/* 1. 이미지 슬라이더 (1.7:1 비율) */}
                    {editBasicData.bannerImages && editBasicData.bannerImages.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: rs(10), paddingRight: rs(10), paddingTop: rs(8) }}
                      >
                        {editBasicData.bannerImages.map((imgUri, index) => (
                          <View key={index} style={{ width: rs(153), height: rs(90) }}>
                            <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%', borderRadius: rs(8) }} resizeMode="cover" />
                            <TouchableOpacity
                              style={{ position: 'absolute', top: rs(-8), right: rs(-8), backgroundColor: 'white', borderRadius: rs(10) }}
                              onPress={() => {
                                const newImages = [...editBasicData.bannerImages];
                                newImages.splice(index, 1);
                                setEditBasicData({ ...editBasicData, bannerImages: newImages });
                              }}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons name="close-circle" size={rs(20)} color="#FF3E41" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}

                    {/* 2. 와이드 추가 버튼 */}
                    <TouchableOpacity
                      style={[styles.editBannerAddBtn, editBasicData.bannerImages?.length >= 3 && { opacity: 0.5 }]}
                      onPress={pickImage}
                      activeOpacity={0.8}
                      disabled={editBasicData.bannerImages?.length >= 3}
                    >
                      <Ionicons name="camera" size={rs(16)} color="#828282" />
                      <Text style={styles.editBannerAddText}>배너 추가하기({editBasicData.bannerImages?.length || 0}/3)</Text>
                    </TouchableOpacity>
                  </View>
                </EditSection>

                <EditSection icon="location" label="주소">
                  <TouchableOpacity
                    style={[styles.inputWrapper, { marginBottom: rs(8), height: rs(29), backgroundColor: '#FCFCFC' }]}
                    onPress={() => {
                      console.log("📍 [Address Search] Triggered");
                      setPostcodeVisible(true);
                    }}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.textInput, { color: editBasicData.address ? 'black' : '#999', fontSize: rs(12) }]}>
                      {editBasicData.address || "건물명, 도로명 또는 지번 검색"}
                    </Text>
                    <Ionicons name="search" size={rs(18)} color="#34B262" style={{ marginRight: rs(10) }} />
                  </TouchableOpacity>
                  <View style={[styles.inputWrapper, { backgroundColor: 'rgba(218, 218, 218, 0.50)' }]}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="상세주소를 입력해주세요."
                      placeholderTextColor="#999"
                      value={editBasicData.detailAddress}
                      onChangeText={(text) => setEditBasicData({ ...editBasicData, detailAddress: text })}
                    />
                  </View>
                </EditSection>

                <EditSection icon="call" label="전화번호">
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="숫자만 입력해주세요"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      value={editBasicData.phone}
                      onChangeText={(text) => {
                        setEditBasicData({ ...editBasicData, phone: formatPhoneNumber(text) });
                      }}
                    />
                  </View>
                </EditSection>
              </ScrollView>
            </View>

            {/* 주소 검색 모달을 메인 팝업 내부로 이동 (Android 스태킹 이슈 해결) */}
            <PostcodeModal
              visible={postcodeVisible}
              onClose={() => setPostcodeVisible(false)}
              onSelected={(data) => {
                console.log("📍 [Address Search] Received data:", data);

                // 도로명 주소 조합 로직 (RN에서 처리하여 안정성 확보)
                let fullRoadAddr = data.roadAddress || data.address;
                let extraRoadAddr = '';

                if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                  extraRoadAddr += data.bname;
                }
                if (data.buildingName !== '' && data.apartment === 'Y') {
                  extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if (extraRoadAddr !== '') {
                  fullRoadAddr += ' (' + extraRoadAddr + ')';
                }

                console.log("📍 [Address Search] Result:", fullRoadAddr);

                setEditBasicData(prev => ({ ...prev, address: fullRoadAddr }));

                // 모달 닫기
                setTimeout(() => {
                  setPostcodeVisible(false);
                }, 300);
              }}
            />
          </KeyboardAvoidingView>
        </Modal >

        {/* 네트워크 에러 팝업 */}
        <ErrorPopup
          visible={isErrorPopupVisible}
          type="NETWORK"
          isRefreshing={isRefreshing}
          onRefresh={handleErrorRefresh}
          onClose={() => setIsErrorPopupVisible(false)}
        />
        <Modal animationType="slide" transparent={true} visible={hoursModalVisible} onRequestClose={() => setHoursModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { height: 'auto', maxHeight: rs(700) }]}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8) }}>
                    <View style={styles.timeIconCircleSmall}>
                      <Ionicons name="time" size={rs(22)} color="#34B262"></Ionicons>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>영업시간/브레이크타임</Text>
                      <Text style={[styles.subTitle, { marginTop: rs(1) }]}>상단: 영업시간, <Text style={{ color: '#FF7F00' }}>하단: 브레이크타임</Text></Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: rs(8) }}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setHoursModalVisible(false)}>
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.completeBtn} onPress={handleHoursSave}>
                      <Text style={styles.completeBtnText}>완료</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 브레이크타임 있음 체크박스 */}
                <TouchableOpacity
                  style={styles.breakTimeCheckRow}
                  onPress={() => {
                    const nextVal = !hasBreakTime;
                    setHasBreakTime(nextVal);
                    if (nextVal) {
                      // 전역 토글을 켰을 때, 모든 요일이 null이면 전체에 기본값 부여
                      // 하나라도 값이 있다면 그 요일들만 체크 상태로 유지됨
                      const hasAnyValue = editHoursData.some(h => h.breakStart && h.breakEnd);
                      if (!hasAnyValue) {
                        const updated = editHoursData.map(h => ({
                          ...h,
                          breakStart: '15:00',
                          breakEnd: '17:00'
                        }));
                        setEditHoursData(updated);
                      }
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, hasBreakTime && styles.checkboxCheckedBlue]}>
                    {hasBreakTime && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                  </View>
                  <Text style={styles.breakTimeCheckLabel}>브레이크타임 있음</Text>
                </TouchableOpacity>

                {editHoursData.map((item, index) => {
                  const open12 = convert24to12(item.open); const close12 = convert24to12(item.close);
                  const breakStart12 = convert24to12(item.breakStart);
                  const breakEnd12 = convert24to12(item.breakEnd);

                  return (
                    <View key={index} style={styles.editHourRow}>
                      <View style={{ flex: 1, gap: rs(8) }}>
                        {/* 1. 영업시간 (기본) - 요일 레이블과 나란히 배치 */}
                        <View style={[styles.timeInputGroup, item.isClosed && { opacity: 0.3 }]}>
                          <View style={{ width: rs(35), alignItems: 'center' }}>
                            <Text style={[styles.editHourDay, { width: 'auto', marginTop: 0 }]}>{item.day}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.timeInputBox}
                            onPress={() => !item.isClosed && openTimePicker(index, 'open')}
                            activeOpacity={0.7}
                            disabled={item.isClosed}
                          >
                            <Text style={styles.timeLabel}>{open12.ampm}</Text>
                            <Text style={styles.timeValue}>{open12.time}</Text>
                            <Ionicons name="caret-down" size={rs(10)} color="black" />
                          </TouchableOpacity>
                          <Text style={{ marginHorizontal: 5, color: 'black' }}>~</Text>
                          <TouchableOpacity
                            style={styles.timeInputBox}
                            onPress={() => !item.isClosed && openTimePicker(index, 'close')}
                            activeOpacity={0.7}
                            disabled={item.isClosed}
                          >
                            <Text style={styles.timeLabel}>{close12.ampm}</Text>
                            <Text style={styles.timeValue}>{close12.time}</Text>
                            <Ionicons name="caret-down" size={rs(10)} color="black" />
                          </TouchableOpacity>
                        </View>

                        {/* 2. 브레이크 타임 (주황색) - 개별 체크박스와 나란히 배치 */}
                        <View style={[styles.timeInputGroup, (!hasBreakTime || item.isClosed || (!item.breakStart && !item.breakEnd)) && { opacity: 0.3 }]}>
                          <View style={{ width: rs(35), alignItems: 'center' }}>
                            {hasBreakTime && !item.isClosed && (
                              <TouchableOpacity
                                onPress={() => {
                                  setEditHoursData(prev => {
                                    const next = [...prev];
                                    const isCurrentlyActive = !!(next[index].breakStart || next[index].breakEnd);
                                    next[index] = {
                                      ...next[index],
                                      breakStart: isCurrentlyActive ? null : '15:00',
                                      breakEnd: isCurrentlyActive ? null : '17:00'
                                    };
                                    return next;
                                  });
                                }}
                              >
                                <View style={[styles.checkbox, (item.breakStart || item.breakEnd) && { backgroundColor: '#FF7F00', borderColor: '#FF7F00' }]}>
                                  {(item.breakStart || item.breakEnd) && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.timeInputBox,
                              (!hasBreakTime || item.isClosed || (!item.breakStart && !item.breakEnd)) && { backgroundColor: '#F5F5F5' }
                            ]}
                            onPress={() => hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && openTimePicker(index, 'breakStart')}
                            activeOpacity={0.7}
                            disabled={!hasBreakTime || item.isClosed || (!item.breakStart && !item.breakEnd)}
                          >
                            <Text style={[styles.timeLabel, hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && { color: '#FF7F00' }]}>{breakStart12.ampm}</Text>
                            <Text style={[styles.timeValue, hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && { color: '#FF7F00' }]}>{breakStart12.time}</Text>
                            <Ionicons name="caret-down" size={rs(10)} color={hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) ? "#FF7F00" : "black"} />
                          </TouchableOpacity>
                          <Text style={{ marginHorizontal: 5, color: hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) ? '#FF7F00' : 'black' }}>~</Text>
                          <TouchableOpacity
                            style={[
                              styles.timeInputBox,
                              (!hasBreakTime || item.isClosed || (!item.breakStart && !item.breakEnd)) && { backgroundColor: '#F5F5F5' }
                            ]}
                            onPress={() => hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && openTimePicker(index, 'breakEnd')}
                            activeOpacity={0.7}
                            disabled={!hasBreakTime || item.isClosed || (!item.breakStart && !item.breakEnd)}
                          >
                            <Text style={[styles.timeLabel, hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && { color: '#FF7F00' }]}>{breakEnd12.ampm}</Text>
                            <Text style={[styles.timeValue, hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) && { color: '#FF7F00' }]}>{breakEnd12.time}</Text>
                            <Ionicons name="caret-down" size={rs(10)} color={hasBreakTime && !item.isClosed && (item.breakStart || item.breakEnd) ? "#FF7F00" : "black"} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleHoliday(index)}>
                        <View style={[styles.checkbox, item.isClosed && styles.checkboxCheckedBlue]}>
                          {item.isClosed && <Ionicons name="checkmark" size={rs(10)} color="white" />}
                        </View>
                        <Text style={[styles.checkboxLabel, { fontWeight: '700' }]}>휴무</Text>
                      </TouchableOpacity>
                    </View>
                  )
                })}
                <View style={{ height: rs(20) }} />
              </ScrollView>
              {pickerVisible && (
                <View style={styles.bottomSheetOverlay}>
                  <TouchableOpacity style={styles.bottomSheetBackdrop} activeOpacity={1} onPress={() => setPickerVisible(false)} />
                  <View style={styles.bottomSheetContainer}>
                    <View style={styles.bottomSheetHeader}><Text style={styles.bottomSheetTitle}>시간 선택</Text><TouchableOpacity onPress={confirmTimePicker}><Text style={styles.confirmText}>확인</Text></TouchableOpacity></View>
                    <View style={styles.pickerBody}>
                      <View style={styles.pickerColumn}><Text style={styles.pickerColumnTitle}>오전/오후</Text><ScrollView style={{ height: rs(150) }} showsVerticalScrollIndicator={false}>{['오전', '오후'].map(ampm => (<TouchableOpacity key={ampm} style={[styles.pickerItem, tempAmpm === ampm && styles.pickerItemSelected]} onPress={() => setTempAmpm(ampm)}><Text style={[styles.pickerItemText, tempAmpm === ampm && styles.pickerItemTextSelected]}>{ampm}</Text>{tempAmpm === ampm && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}</TouchableOpacity>))}</ScrollView></View>
                      <View style={{ width: 1, height: '80%', backgroundColor: '#eee' }} />
                      <View style={styles.pickerColumn}><Text style={styles.pickerColumnTitle}>시간 (5분 단위)</Text><ScrollView style={{ height: rs(150) }} showsVerticalScrollIndicator={false}>{TIME_12H.map(time => (<TouchableOpacity key={time} style={[styles.pickerItem, tempTime === time && styles.pickerItemSelected]} onPress={() => setTempTime(time)}><Text style={[styles.pickerItemText, tempTime === time && styles.pickerItemTextSelected]}>{time}</Text>{tempTime === time && <Ionicons name="checkmark" size={rs(16)} color="#34B262" />}</TouchableOpacity>))}</ScrollView></View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Holiday Edit Modal */}
        <Modal animationType="slide" transparent={true} visible={holidayModalVisible} onRequestClose={() => setHolidayModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { height: rs(400) }]}>
              <View style={styles.modalScroll}>
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8) }}>
                    <View style={styles.timeIconCircleSmall}>
                      <Ionicons name="calendar" size={rs(22)} color="#34B262"></Ionicons>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>휴무일 설정</Text>
                      <Text style={styles.subTitle}>휴무 날짜를 선택해주세요</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: rs(8) }}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setHolidayModalVisible(false)}><Text style={styles.cancelButtonText}>취소</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={() => handleHolidaySave(tempSelectedHolidays)}><Text style={styles.saveButtonText}>완료</Text></TouchableOpacity>
                  </View>
                </View>

                <View style={styles.calendarControl}>
                  <TouchableOpacity onPress={() => changeModalMonth(-1)} style={styles.navButton}><Ionicons name="chevron-back" size={rs(20)} color="#ccc" /></TouchableOpacity>
                  <Text style={styles.calendarTitle}>{MONTH_NAMES[modalDate.getMonth()]} {modalDate.getFullYear()}</Text>
                  <TouchableOpacity onPress={() => changeModalMonth(1)} style={styles.navButton}><Ionicons name="chevron-forward" size={rs(20)} color="#ccc" /></TouchableOpacity>
                </View>
                <View style={styles.weekHeader}>
                  {WEEKDAYS.map((day, index) => (<Text key={index} style={[styles.weekText, index === 0 && { color: '#FF3E41' }, index === 6 && { color: '#007AFF' }]}>{day}</Text>))}
                </View>
                <View style={styles.daysGrid}>
                  {generateCalendar(modalDate).map((date, index) => {
                    if (!date) return <View key={index} style={styles.dayCell} />;
                    const dateStr = getFormatDate(date);
                    const isSelected = tempSelectedHolidays.includes(dateStr);

                    const today = new Date();
                    const twoMonthsLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);
                    const isPast = dateStr < getFormatDate(today);
                    const isOutRange = dateStr > getFormatDate(twoMonthsLater);
                    const isDisabled = isPast || isOutRange;

                    const dayOfWeek = date.getDay();

                    const cellStyle = [styles.dayBtn];
                    const textStyle = [styles.dayTextNum];
                    if (dayOfWeek === 0) textStyle.push({ color: '#FF3E41' }); else if (dayOfWeek === 6) textStyle.push({ color: '#007AFF' });
                    if (isSelected) {
                      cellStyle.push(styles.dayBtnSelected); textStyle.push({ color: 'white', fontWeight: '700' });
                    }
                    if (isDisabled) textStyle.push({ color: '#E0E0E0' });

                    return (<View key={index} style={styles.dayCell}><TouchableOpacity style={cellStyle} onPress={() => handleTempDatePress(dateStr)} disabled={isDisabled} activeOpacity={0.8}><Text style={textStyle}>{date.getDate()}</Text></TouchableOpacity></View>);
                  })}
                </View>
                <View style={{ height: rs(20) }} />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Full Screen Banner Modal with Slider */}
        <Modal visible={isFullScreenBannerVisible} transparent={true} animationType="fade" onRequestClose={() => setIsFullScreenBannerVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: rs(40), right: rs(20), zIndex: 1 }} onPress={() => setIsFullScreenBannerVisible(false)}>
              <Ionicons name="close" size={rs(30)} color="white" />
            </TouchableOpacity>

            {storeInfo.bannerImages && storeInfo.bannerImages.length > 0 ? (
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width: Dimensions.get('window').width, height: '100%' }}>
                {storeInfo.bannerImages.map((imgUri, index) => (
                  <View key={index} style={{ width: Dimensions.get('window').width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </Modal>

        {/* Floating Action Button (Outside ScrollView) */}
        {activeTab === 'management' && (
          <View style={styles.floatingButtonArea}>
            <TouchableOpacity style={styles.floatingAddBtn} onPress={openAddMenuModal} activeOpacity={0.8}>
              <Ionicons name="add" size={rs(20)} color="white" />
              <Text style={styles.floatingAddBtnText}>메뉴 추가하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Sub-Components
const InfoRow = ({ icon, label, content, style }) => (<View style={[styles.rowSection, style]}><View style={styles.fixedLabel}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View><View style={styles.contentArea}>{content}</View></View>);
const EditSection = ({ icon, label, children }) => (<View style={styles.editSection}><View style={styles.labelRow}><Ionicons name={icon} size={rs(12)} color="#828282" /><Text style={styles.labelText}>{label}</Text></View>{children}</View>);
const Tag = ({ text }) => <View style={styles.tagBox}><Text style={styles.tagText}>{text}</Text></View>;
const ImagePlaceholder = ({ label, size = 90 }) => (<View style={styles.uploadBoxWrapper}><Text style={styles.uploadLabel}>{label}</Text><View style={[styles.uploadBox, { width: rs(size), height: rs(size) }]}><Ionicons name={label === '로고' ? 'camera' : 'image'} size={rs(24)} color="#aaa" /><Text style={styles.uploadPlaceholder}>{label} 업로드</Text></View></View>);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, },
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
  timeIconCircleSmall: { width: rs(30), height: rs(30), borderRadius: rs(15), backgroundColor: '#E0EDE4', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  headerTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', fontFamily: 'Pretendard', marginBottom: rs(3) },
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
  hourRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: rs(4) },
  dayText: { width: rs(30), fontSize: rs(13), fontWeight: '500', color: 'black', fontFamily: 'Pretendard', marginTop: rs(1) },
  timeDisplayContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  timeText: { fontSize: rs(11), fontWeight: '500', color: 'black', fontFamily: 'Pretendard' },
  breakTimeText: { fontSize: rs(11), fontWeight: '500', color: '#FF8940', fontFamily: 'Pretendard' },
  hyphen: { fontSize: rs(13), fontWeight: '500', color: 'black' },
  hyphenOrange: { fontSize: rs(13), fontWeight: '500', color: '#FF8940' },
  closedBadge: { paddingHorizontal: rs(10), paddingVertical: rs(4), backgroundColor: '#E0EDE4', borderRadius: rs(8), justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: rs(335), height: rs(650), backgroundColor: 'white', borderRadius: rs(8), overflow: 'hidden' },
  modalScroll: { padding: rs(20) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(20) },
  menuModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(20), marginBottom: rs(5), paddingBottom: rs(15), paddingHorizontal: rs(20), borderBottomWidth: 1, borderBottomColor: '#eee', },
  modalTitle: { fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  saveButton: { width: rs(41), height: rs(23), backgroundColor: '#34B262', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
  cancelButton: { width: rs(41), height: rs(23), backgroundColor: '#A0A0A0', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
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
  editHourRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: rs(20) },
  editHourDay: { width: rs(25), fontSize: rs(13), fontWeight: '500', fontFamily: 'Pretendard', marginTop: rs(6) },
  timeInputGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-start', position: 'relative' },
  timeInputBox: { width: rs(101), height: rs(26), borderRadius: rs(8), borderWidth: 1, borderColor: '#DADADA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(8), gap: rs(4) },
  timeLabel: { fontSize: rs(11), fontWeight: '300', color: 'black', fontFamily: 'Pretendard' },
  timeValue: { fontSize: rs(11), fontWeight: '300', color: 'black', fontFamily: 'Pretendard' },
  blurOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.60)', zIndex: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: rs(5), marginLeft: rs(10), marginTop: rs(6) },
  checkbox: { width: rs(14), height: rs(14), borderRadius: rs(2), borderWidth: 1, borderColor: '#DADADA', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#34B262', borderColor: '#34B262' },
  checkboxCheckedBlue: { backgroundColor: '#2D6EFF', borderColor: '#2D6EFF' },
  // Category Modal Styles
  catModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: rs(100), paddingRight: rs(30) },
  catModalContent: { backgroundColor: 'white', borderRadius: rs(12), padding: rs(12), shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 10 },
  categoryItem: { alignSelf: 'stretch', height: rs(28), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(5), borderRadius: rs(8), marginVertical: rs(1) },
  categoryItemActive: { backgroundColor: '#FFEFB9' },
  categoryText: { fontSize: rs(11), fontFamily: 'Pretendard', fontWeight: '400', lineHeight: rs(24), color: 'black' },
  categoryTextActive: { color: '#FFA100', fontWeight: '500', fontFamily: 'Inter' },
  dotsButton: { width: rs(25), height: rs(25), justifyContent: 'center', alignItems: 'center' },
  dotsText: { fontSize: rs(11), color: '#A4A4A4', fontFamily: 'Pretendard' },

  // Options Popover (Vertical Redesign)
  optionsPopover: {
    position: 'absolute',
    right: rs(35),
    top: rs(0),
    backgroundColor: 'white',
    borderRadius: rs(8),
    padding: rs(5),
    zIndex: 100,
    flexDirection: 'column',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: rs(60),
    paddingHorizontal: rs(10),
    paddingVertical: rs(8)
  },
  optionBtn: { paddingVertical: rs(6), justifyContent: 'center' },
  optionBtnText: { fontSize: rs(13), color: '#828282', fontFamily: 'Pretendard' },

  // Inline Edit
  inlineEditContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: rs(5) },
  inlineInput: { flex: 1, height: rs(26), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(6), paddingHorizontal: rs(8), fontSize: rs(11), color: 'black' },
  inlineDoneBtn: { backgroundColor: '#F6A823', borderRadius: rs(6), paddingHorizontal: rs(10), height: rs(26), justifyContent: 'center', alignItems: 'center' },
  inlineDoneText: { color: 'white', fontSize: rs(11), fontWeight: '700' },

  // New Category Input (Cleaned Up)
  newCatInputArea: { marginTop: rs(10), paddingTop: rs(5) },
  newCatInputBox: { height: rs(32), flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(5) },

  // Custom Delete Error Modal
  deleteErrorModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  deleteErrorModalContainer: { width: rs(280), backgroundColor: 'white', borderRadius: rs(16), padding: rs(24), alignItems: 'center' },
  deleteErrorTitle: { fontSize: rs(16), fontWeight: '700', color: 'black', marginBottom: rs(10), fontFamily: 'Pretendard' },
  deleteErrorDesc: { fontSize: rs(13), color: '#666', textAlign: 'center', marginBottom: rs(24), fontFamily: 'Pretendard', lineHeight: rs(20) },
  deleteErrorConfirmBtn: { backgroundColor: '#34B262', borderRadius: rs(12), paddingVertical: rs(12), paddingHorizontal: rs(40) },
  deleteErrorConfirmText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Pretendard' },
  completeBtn: { width: rs(58), height: rs(23), backgroundColor: '#34B262', borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  completeBtnText: { color: 'white', fontSize: rs(11), fontWeight: '700', fontFamily: 'Pretendard' },
  breakTimeCheckRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(20), paddingLeft: rs(5) },
  breakTimeCheckLabel: { fontSize: rs(13), fontWeight: '700', color: 'black', fontFamily: 'Pretendard' },
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
  // Floating Button Style
  floatingButtonArea: { position: 'absolute', bottom: rs(20), left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  floatingAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34B262', paddingVertical: rs(12), paddingHorizontal: rs(24), borderRadius: rs(30), shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  floatingAddBtnText: { color: 'white', fontSize: rs(14), fontWeight: '700', marginLeft: rs(6), fontFamily: 'Pretendard' },

  catModalOverlay: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)', paddingTop: rs(250) },
  catModalContent: { width: rs(287), backgroundColor: 'white', borderRadius: rs(12), padding: rs(5), shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.05, elevation: 5 },
  catModalItem: { flexDirection: 'row', alignItems: 'center', gap: rs(5), paddingVertical: rs(3), paddingHorizontal: rs(5), height: rs(26), borderRadius: rs(8) },
  catModalIconBox: { width: rs(16), height: rs(16), borderRadius: rs(8), overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  catModalIconBoxWhite: { width: rs(16), height: rs(16), borderRadius: rs(8), overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderColor: 'transparent' },
  catModalTextWhite: { color: 'white', fontSize: rs(11), fontFamily: 'Inter', fontWeight: '600' },
  catModalTextBlack: { color: 'black', fontSize: rs(11), fontFamily: 'Inter', fontWeight: '400' },
  catModalTextGray: { color: '#828282', fontSize: rs(10), fontFamily: 'Inter', fontWeight: '400' },
  menuListContainer: { paddingBottom: rs(80) },
  menuCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(11), paddingVertical: rs(22), backgroundColor: 'white', borderRadius: rs(12), shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2, marginBottom: rs(12) },
  dragHandle: { width: rs(20), alignItems: 'center', justifyContent: 'center', gap: rs(3), marginRight: rs(10) },
  dragDotRow: { flexDirection: 'row', gap: rs(3) },
  dragDot: { width: rs(3), height: rs(3), borderRadius: rs(1.5), backgroundColor: '#757575' },
  menuContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: rs(10) },
  menuImageContainer: { position: 'relative' },
  menuImagePlaceholder: { width: rs(56), height: rs(56), borderRadius: rs(12), backgroundColor: '#EDF3EF' },
  menuImage: { width: rs(56), height: rs(56), borderRadius: rs(12) },
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
  textInput: { flex: 1, fontSize: rs(10), color: 'black', padding: 0, fontFamily: 'Pretendard' },
  charCount: { fontSize: rs(10), color: '#828282', fontFamily: 'Inter' },
  unitText: { fontSize: rs(11), color: '#828282', fontFamily: 'Inter' },
  divider: { height: rs(1), backgroundColor: '#E5E5E5', marginVertical: rs(20) },
  dropdownBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: rs(36), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), paddingHorizontal: rs(10) },
  dropdownText: { fontSize: rs(11), fontFamily: 'Inter', color: 'black', marginTop: rs(2) },
  changePhotoBtn: { paddingHorizontal: rs(12), paddingVertical: rs(8), borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), backgroundColor: 'white' },
  changePhotoBtnText: { fontSize: rs(11), color: '#333', fontWeight: '500', fontFamily: 'Pretendard' },
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
  modalSubmitText: { color: 'white', fontSize: rs(14), fontWeight: '700', fontFamily: 'Inter' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, borderColor: '#DADADA', borderTopWidth: 0, borderBottomLeftRadius: rs(8), borderBottomRightRadius: rs(8), zIndex: 1000, elevation: 5, overflow: 'hidden', paddingBottom: rs(5) },
  dropdownItem: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: rs(12), paddingVertical: rs(10), marginHorizontal: rs(5), borderRadius: rs(8) },
  dropdownItemChecked: { backgroundColor: '#F6A823' },
  dropdownItemText: { fontSize: rs(11), color: '#333', fontFamily: 'Inter' },
  dropdownItemTextChecked: { color: 'white', fontWeight: '700' },
  newCategoryInputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#DADADA', borderRadius: rs(8), paddingHorizontal: rs(10), height: rs(36), backgroundColor: 'white' },
  newCategoryInput: { flex: 1, fontSize: rs(11), color: 'black', padding: 0, fontFamily: 'Pretendard' },
  editBannerAddBtn: { width: '100%', height: rs(32), backgroundColor: '#F0F0F0', borderRadius: rs(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), marginTop: rs(5) },
  editBannerAddText: { fontSize: rs(11), color: '#828282', fontWeight: '500', fontFamily: 'Pretendard' },
  registrationAlertContainer: {
    marginHorizontal: rs(20),
    marginBottom: rs(10),
    paddingVertical: rs(10),
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  registrationAlertText: {
    color: '#DC2626',
    fontSize: rs(14),
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
  },
});