import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './home/HomeScreen'; 
import StoreScreen from './store/StoreScreen';
import ReviewScreen from './review/ReviewScreen';
import CouponScreen from './coupon-patron/CouponScreen';
import MyPageScreen from './mypage/MyPageScreen';
import NotificationScreen from './home/NotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 기존 탭 네비게이터를 별도 함수로 분리 MainTabNavigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#34B262', 
        tabBarInactiveTintColor: 'gray',
        headerShown: false, 
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: '홈' }} 
      />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen} 
        options={{ tabBarLabel: '가게관리' }} 
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewScreen} 
        options={{ tabBarLabel: '리뷰관리' }} 
      />
      <Tab.Screen 
        name="Coupon" 
        component={CouponScreen} 
        options={{ tabBarLabel: '쿠폰/단골' }} 
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen} 
        options={{ tabBarLabel: '내정보' }} 
      />
    </Tab.Navigator>
  );
}

export default function ShopOwnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. 기본 화면 탭 네비게이터 */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      {/* 2. 알림 화면 스택 화면 */}
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>
  );
}