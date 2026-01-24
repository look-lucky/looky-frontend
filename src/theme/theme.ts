/**
 * 니어딜 디자인 시스템 색상
 */


// ============================================
// Brand Colors
// ============================================
export const Brand = {
  primary: '#40CE2B',
  primaryLighten: '#9CFF8D',
  primaryDarken: '#309821',
  primaryDisabled: '#5D9D50',
} as const;

// Primary 단계별 (학생용)
export const Primary = {
  300: '#8AD97E',
  400: '#7ACE6D',
  500: '#40CE2B',
  textBg: '#F7F7F7',
} as const;

// 점주용 색상
export const Owner = {
  primary: '#34B262',
  textBg: '#F4F7F4',
  iconBg: '#EAF6EE',
  background: '#E0EDE4',
  disabled: '#82B282',
} as const;

// ============================================
// System Colors
// ============================================
export const System = {
  snack: '#AC7F5E',
  error: '#FF6200',
  hotSoldOut: '#FF0000',
  star: '#FFCC00',
  storeStar: '#FACC15',
  phoneNumber: '#007AFF',
  phoneNumberAlt: '#F6A823',
  reportOptionOuter: '#FFBE9B',
} as const;

// 알림 색상
export const Notify = {
  review: '#2563EB',
  importHeart: '#FF3E41',
  coupon: '#D97706',
  bgInfo: '#FEE2E2',
  bgReview: '#DBEAFE',
  bgCoupon: '#FFEABC',
} as const;

// 쿠폰 색상
export const Coupon = {
  red: '#FFDDDE',
  yellow: '#FFEABC',
  green: '#8EFFD1',
} as const;

// ============================================
// Text Colors
// ============================================
export const Text = {
  primary: '#111111',
  secondary: '#666666',
  tertiary: '#999999',
  placeholder: '#828282',
} as const;

// ============================================
// Grayscale
// ============================================
export const Gray = {
  white: '#FFFFFF',
  gray1: '#F8F8F6',
  gray2: '#F5F5F5',
  gray3: '#EEEEEE',
  gray4: '#E0E0E4',
  gray5: '#BDBDBD',
  gray6: '#9D9D9D',
  gray7: '#C4C4C4',
  gray8: '#A6A6A6',
  gray9: '#828282',
  popupBg: 'rgba(0, 0, 0, 0.5)',
  black: '#000000',
} as const;

// ============================================
// Theme Colors (기존 호환)
// ============================================
export const Colors = {
  light: {
    text: Gray.black,
    background: Gray.white,
    tint: Brand.primary,
    icon: Gray.gray9,
    tabIconDefault: Gray.gray9,
    tabIconSelected: Brand.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Gray.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Gray.white,
  },
};

export const Fonts = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semiBold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
} as const;
