import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import InquiryCompleteScreen from '../../shared/screens/inquiry/InquiryCompleteScreen';
import InquiryScreen from '../../shared/screens/inquiry/InquiryScreen';
import CouponListScreen from './coupon-patron/CouponListScreen';
import CouponScreen from './coupon-patron/CouponScreen';
import HomeScreen from './home/HomeScreen';
import NotificationScreen from './home/NotificationScreen';
import ChangeIdScreen from './mypage/ChangeIdScreen';
import ChangePasswordScreen from './mypage/ChangePasswordScreen';
import EasyLoginScreen from './mypage/EasyLoginScreen';
import EditProfileScreen from './mypage/EditProfileScreen';
import MyPageScreen from './mypage/MyPageScreen';
import SettingScreen from './mypage/SettingScreen';
import StoreAddScreen from './mypage/StoreAddScreen';
import StoreDeleteScreen from './mypage/StoreDeleteScreen';
import StoreManagementScreen from './mypage/StoreManagementScreen';
import TermsScreen from './mypage/TermsScreen';
import VersionScreen from './mypage/VersionScreen';
import WithdrawCompleteScreen from './mypage/WithdrawCompleteScreen';
import WithdrawScreen from './mypage/WithdrawScreen';
import EditReviewScreen from './patron/studentReview/EditReviewScreen';
import MyReviewScreen from './patron/studentReview/MyReviewScreen';
import ReportCompleteScreen from './review/ReportCompleteScreen';
import ReportScreen from './review/ReportScreen';
import ReviewScreen from './review/ReviewScreen';
import StoreScreen from './store/StoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 기존 탭 네비게이터를 별도 함수로 분리 MainTabNavigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#34B262', 
        
        tabBarInactiveTintColor: '#444444',
        headerShown: false, 
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: '홈' }} 
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewScreen} 
        options={{ tabBarLabel: '리뷰관리' }} 
      />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen} 
        options={{ tabBarLabel: '가게관리' }} 
      />
      <Tab.Screen 
        name="Coupon" 
        component={CouponScreen} 
        options={{ tabBarLabel: '쿠폰/단골' }} 
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen} 
        options={{ tabBarLabel: '내 정보' }} 
      />
    </Tab.Navigator>
  );
}

export default function ShopOwnerNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyReview" component={MyReviewScreen} />
      {/* 1. 기본 화면 탭 네비게이터 */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      {/* 2. 알림 화면 스택 화면 */}
      <Stack.Screen name="Notification" component={NotificationScreen} />
      {/* 3. 마이페이지-가게 관리 스택 화면 */}
      <Stack.Screen name="StoreManagement" component={StoreManagementScreen} options={{ headerShown: false }} />
      {/* 4. 마이페이지-가게 관리-가게 추가 화면 스택 화면 */}
      <Stack.Screen name="StoreAdd" component={StoreAddScreen} options={{ headerShown: false }} />
      {/* 5. 마이페이지-가게 관리-가게 삭제 화면 스택 화면 */}
      <Stack.Screen name="StoreDelete" component={StoreDeleteScreen} options={{ headerShown: false }} />
      {/* 6. 마이페이지-내 정보 수정 스택 화면 */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
      {/* 7. 마이페이지-내 정보 수정-아이디 변경 화면 스택 화면 */}
      <Stack.Screen name="ChangeId" component={ChangeIdScreen} options={{ headerShown: false }} />
      {/* 8. 마이페이지-내 정보 수정-비밀번호 변경 화면 스택 화면 */}
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
      {/* 9. 마이페이지-내 정보 수정-간편 로그인 화면 스택 화면 */}
      <Stack.Screen name="EasyLogin" component={EasyLoginScreen} options={{ headerShown: false }} />
      {/* 10. 마이페이지-내 정보 수정-회원탈퇴 화면 스택 화면 */}
      <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
      {/* 11. 마이페이지-내 정보 수정-회원탈퇴-탈퇴확인 화면 스택 화면 */}
      <Stack.Screen name="WithdrawComplete" component={WithdrawCompleteScreen} options={{ headerShown: false }}/>
      {/* 12. 마이페이지-고객센터 스택 화면 */}
      <Stack.Screen name="Inquiry" component={InquiryScreen} options={{ headerShown: false }} />
      {/* 13. 마이페이지-고객센터-문의접수 화면 스택 화면 */}
      <Stack.Screen name="InquiryComplete" component={InquiryCompleteScreen} options={{ headerShown: false }} />
      {/* 14. 마이페이지-설정 스택 화면 */}
      <Stack.Screen name="Setting" component={SettingScreen} options={{ headerShown: false }} />
      {/* 15. 마이페이지-이용약관 스택 화면 */}
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
      {/* 16. 마이페이지-버전 스택 화면 */}
      <Stack.Screen name="Version" component={VersionScreen} options={{ headerShown: false }} />
      {/* 17. 쿠폰/단골 페이지- 전체 쿠폰 스택 화면 */}
      <Stack.Screen name="CouponList" component={CouponListScreen} options={{ headerShown: false }} />
      {/* 18. 리뷰관리-신고 화면 스택 화면 */}
      <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: false }} />
      {/* 19. 리뷰관리-신고완료 화면 스택 화면 */}
      <Stack.Screen name="ReportComplete" component={ReportCompleteScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditReview" component={EditReviewScreen} />
    </Stack.Navigator>
  );
}