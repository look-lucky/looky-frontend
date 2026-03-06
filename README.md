# Looky - 대학생 제휴혜택 플랫폼

> 우리대학 제휴혜택이 궁금할 땐? Looky!

Expo 기반의 React Native 크로스플랫폼 모바일 애플리케이션입니다.

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [개발 가이드](#개발-가이드)
- [환경 변수](#환경-변수)
- [스크립트](#스크립트)
- [협업 가이드](#협업-가이드)

---

## 프로젝트 개요

Looky는 대학생들을 위한 제휴혜택 플랫폼입니다. 학교 이메일 인증을 통해 다양한 학생 혜택을 제공하며, 점주(ShopOwner)와 학생(Student) 두 가지 사용자 역할을 지원합니다.

### 주요 특징

- **Expo SDK 54** 기반 개발
- **TypeScript** 완전 적용 (strict mode)
- **Expo Router** 파일 기반 라우팅
- **React Query** 서버 상태 관리 (AsyncStorage 영속화)
- **Zustand** 클라이언트 상태 관리
- **Naver Map** 지도 기반 매장 탐색
- **Light/Dark 테마** 지원
- **반응형 디자인** (375px 기준 `rs()` 스케일링)
- **SVG 컴포넌트** 방식 사용
- **Secure Store** 토큰 보안 저장
- **소셜 로그인** (카카오, 구글, 애플)
- **EAS Build** 기반 배포

---

## 기술 스택

### Core

- **React** 19.1.0
- **React Native** 0.81.5
- **Expo** ~54.0.31
- **TypeScript** ~5.3.0

### Navigation & Routing

- **expo-router** ~6.0.21 (파일 기반 라우팅)
- **@react-navigation/native** ^7.1.8
- **@react-navigation/bottom-tabs** ^7.4.0
- **react-native-screens** ~4.16.0

### State Management

- **zustand** ^5.0.10 (클라이언트 상태)
- **@tanstack/react-query** ^5.90.19 (서버 상태)
- **@tanstack/react-query-persist-client** (AsyncStorage 영속화)
- **@react-native-async-storage/async-storage** 2.2.0

### Network & API

- **axios** ^1.13.2
- **orval** ^8.0.2 (OpenAPI 코드 자동 생성)

### Map

- **@mj-studio/react-native-naver-map** ^2.7.0
- **supercluster** ^8.0.1 (마커 클러스터링)
- **expo-location** ~19.0.8

### UI & Styling

- **react-native-svg** 15.12.1 (SVG 지원)
- **@expo/vector-icons** ^15.0.3
- **expo-image** ~3.0.11
- **expo-linear-gradient** ~15.0.8
- **@gorhom/bottom-sheet** ^5.2.8

### Auth

- **expo-apple-authentication** ^55.0.8
- **@react-native-google-signin/google-signin** ^16.1.1
- **@react-native-seoul/kakao-login** ^5.4.2
- **expo-secure-store** ~15.0.8

### Native Modules

- **expo-haptics** ~15.0.8
- **expo-image-picker** ~17.0.10
- **expo-document-picker** ~14.0.8
- **expo-font** ~14.0.10
- **expo-updates** ~29.0.16

### Animation

- **react-native-reanimated** ~4.1.1
- **react-native-gesture-handler** ~2.28.0
- **react-native-worklets** 0.5.1

---

## 시작하기

### 필수 요구사항

- **Node.js** 18 이상
- **npm**
- **Expo CLI** (글로벌 설치 권장)
- **Android Studio** (Android 개발 시)
- **Xcode** (iOS 개발 시, macOS만 가능)

### 설치 및 실행

1. **의존성 설치**

   ```bash
   npm install
   ```

2. **환경 변수 설정**

   프로젝트 루트에 `.env` 파일 생성 (`.env.example` 참고):

   ```env
   EXPO_PUBLIC_API_URL=https://api.example.com
   EXPO_PUBLIC_ASSET_URL=https://assets.example.com
   ```

3. **개발 서버 시작**

   ```bash
   # Expo Go (제한적 기능)
   npm start

   # Development Build (전체 기능)
   npm run start:dev
   ```

4. **플랫폼별 실행**

   ```bash
   npm run android
   npm run ios
   ```

---

## 프로젝트 구조

```
looky-frontend/
├── src/
│   ├── api/                          # orval 자동 생성 API 코드
│   │
│   ├── app/                          # 라우팅 및 화면 (Expo Router)
│   │   ├── _layout.tsx               # 루트 레이아웃
│   │   ├── index.tsx                 # 진입점 (역할별 리다이렉트)
│   │   ├── landing.tsx               # 스플래시/랜딩 화면
│   │   ├── onboarding/               # 온보딩 화면
│   │   ├── (student)/                # 학생 사용자 화면 그룹
│   │   │   ├── (tabs)/               # 하단 탭 네비게이션
│   │   │   │   ├── index.tsx         # 홈
│   │   │   │   ├── map.tsx           # 지도
│   │   │   │   ├── benefits.tsx      # 혜택
│   │   │   │   └── mypage.tsx        # 마이페이지
│   │   │   ├── auth/                 # 학생 인증 화면
│   │   │   │   ├── index.tsx         # 로그인/회원가입 선택
│   │   │   │   ├── sign-in.tsx       # 로그인
│   │   │   │   ├── sign-up-form.tsx  # 회원가입 폼
│   │   │   │   ├── sign-up-verify.tsx # 이메일 인증
│   │   │   │   ├── sign-up-done.tsx  # 회원가입 완료
│   │   │   │   ├── sign-up-social.tsx # 소셜 회원가입 선택
│   │   │   │   ├── sign-up-social-form.tsx # 소셜 회원가입 폼
│   │   │   │   ├── find-id.tsx       # 아이디 찾기
│   │   │   │   ├── find-id-result.tsx # 아이디 찾기 결과
│   │   │   │   ├── find-password.tsx # 비밀번호 찾기
│   │   │   │   ├── reset-password.tsx # 비밀번호 재설정
│   │   │   │   ├── store-register.tsx # 점주 매장 등록
│   │   │   │   ├── store-search.tsx  # 매장 검색
│   │   │   │   └── store-select.tsx  # 매장 선택
│   │   │   ├── store/[id]/           # 매장 상세
│   │   │   │   ├── news/             # 소식 탭
│   │   │   │   └── review/           # 리뷰 탭
│   │   │   ├── event/[id]/           # 이벤트 상세
│   │   │   ├── mypage/               # 마이페이지 하위 화면
│   │   │   │   ├── edit-profile.tsx
│   │   │   │   ├── favorite.tsx
│   │   │   │   ├── my-review.tsx
│   │   │   │   ├── edit-review.tsx
│   │   │   │   ├── change-id.tsx
│   │   │   │   ├── change-password.tsx
│   │   │   │   ├── change-university.tsx
│   │   │   │   ├── settings.tsx
│   │   │   │   ├── terms.tsx
│   │   │   │   ├── version.tsx
│   │   │   │   └── withdraw.tsx
│   │   │   └── components/           # 학생 화면 전용 컴포넌트
│   │   │       ├── home/
│   │   │       ├── map/
│   │   │       ├── store/            # 매장 상세 UI
│   │   │       │   └── tabs/
│   │   │       ├── event/
│   │   │       └── input/
│   │   │
│   │   └── (shopowner)/              # 점주 사용자 화면 그룹
│   │       ├── auth/                 # 점주 인증
│   │       ├── home/                 # 점주 홈
│   │       ├── store/                # 매장 관리
│   │       ├── coupon-patron/        # 쿠폰 고객 관리
│   │       ├── patron/               # 고객 관리
│   │       ├── review/               # 리뷰 관리
│   │       ├── mypage/               # 점주 마이페이지
│   │       └── login/                # 점주 로그인
│   │
│   └── shared/                       # 공유 레이어
│       ├── common/                   # 공용 UI 컴포넌트
│       │   ├── app-button.tsx
│       │   ├── app-popup.tsx
│       │   ├── arrow-left.tsx
│       │   ├── divider.tsx
│       │   ├── error-popup.tsx
│       │   ├── linkable-text.tsx
│       │   ├── select-modal.tsx
│       │   ├── themed-text.tsx
│       │   └── themed-view.tsx
│       ├── constants/                # 앱 상수
│       ├── contexts/                 # React Context
│       ├── data/                     # 데이터 레이어
│       │   └── mock/                 # 목업 데이터
│       ├── hooks/                    # 공용 커스텀 Hooks
│       │   ├── use-events.ts
│       │   ├── use-map-cluster.ts
│       │   ├── use-map-search.ts
│       │   └── use-theme-color.ts
│       ├── lib/
│       │   └── auth/                 # 인증 로직
│       │       ├── auth-context.tsx
│       │       ├── auth-events.ts
│       │       ├── token.ts
│       │       └── use-*-login.ts    # 소셜 로그인 훅
│       ├── screens/
│       │   └── inquiry/              # 고객센터 화면
│       ├── stores/                   # Zustand 스토어
│       │   ├── map-navigation-store.ts
│       │   └── signup-store.ts
│       ├── theme/
│       │   ├── theme.ts              # 컬러 팔레트 및 폰트
│       │   └── scale.ts             # 반응형 스케일링 (rs())
│       ├── types/                    # TypeScript 타입 정의
│       └── utils/                   # 유틸리티 함수
│
├── assets/
│   ├── images/                       # 이미지 및 아이콘
│   └── font/                         # 커스텀 폰트
│
├── scripts/
│   ├── fetch-openapi.js              # OpenAPI 스펙 다운로드
│   ├── patch-openapi.js              # 한글 태그 → 영어 변환
│   ├── patch-generated.js            # 생성 코드 후처리
│   └── reset-project.js             # 프로젝트 초기화
│
├── app.json                          # Expo 앱 설정
├── eas.json                          # EAS Build 설정
├── package.json
├── tsconfig.json
└── metro.config.js                   # Metro 번들러 (SVG 변환 포함)
```

---

## 개발 가이드

### 디자인 규칙

- 텍스트: `ThemedText` (`src/shared/common/themed-text.tsx`)
- 뷰 래퍼: `ThemedView` (`src/shared/common/themed-view.tsx`)
- 버튼: `AppButton` (`src/shared/common/app-button.tsx`)
- 뒤로가기: `ArrowLeft` (`src/shared/common/arrow-left.tsx`)
- 색상: `src/shared/theme/theme.ts` 정의값만 사용 (하드코딩 금지)
- 사이즈: `rs()` (`src/shared/theme/scale.ts`) — 터치 영역, 주요 컴포넌트 높이, 큰 간격(20+)에 사용
- px 단위: 4단위 (4, 8, 12, 16, 20, 24, 28)
- 컴포넌트명: PascalCase

### rs() 사용 기준

| 사용 O | 사용 X |
|--------|--------|
| 터치 영역 (width/height) | fontSize |
| 주요 컴포넌트 높이 | borderWidth, borderRadius |
| 아이콘 크기 | 작은 간격 (padding 8, gap 12) |
| 큰 간격 (20 이상) | 그림자 값 |

### API 코드 생성 (orval)

```bash
# 반드시 이 명령어 사용 (npm run orval 사용 금지)
npm run generate
```

이 명령어는 순서대로:
1. `fetch-openapi.js`: 서버에서 OpenAPI 스펙 다운로드
2. `patch-openapi.js`: 한글 태그를 영어로 변환 (EAS Build 호환)
3. `npx orval`: API 코드 생성
4. `patch-generated.js`: 생성 코드 후처리

한글 태그 → 영어 매핑은 `scripts/patch-openapi.js`의 `TAG_TRANSLATIONS`에서 관리합니다. 백엔드에서 새 한글 태그가 추가되면 해당 파일에 항목을 추가하세요.

### 새로운 화면 추가하기

```
src/app/(student)/새화면.tsx          # 학생 화면
src/app/(shopowner)/새화면.tsx        # 점주 화면
```

### 소셜 로그인

인증 로직은 `src/shared/lib/auth/`에 집중되어 있습니다:

- `auth-context.tsx`: 앱 전역 인증 상태 관리
- `token.ts`: SecureStore 기반 토큰 저장/조회/삭제
- `use-kakao-login.ts`, `use-google-login.ts`, `use-apple-login.ts`: 플랫폼별 소셜 로그인
- `auth-events.ts`: 토큰 만료 등 인증 이벤트 버스

### SVG 아이콘 사용하기

```typescript
import LogoIcon from '@/assets/images/logo/looky-logo.svg';

<LogoIcon width={120} height={40} />
```

---

## 환경 변수

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ASSET_URL=https://assets.example.com
```

> Expo에서는 클라이언트에서 접근할 환경 변수에 `EXPO_PUBLIC_` 접두사가 필요합니다.

---

## 스크립트

```bash
npm start              # Expo 개발 서버 (Expo Go)
npm run start:dev      # Development Build 서버
npm run android        # Android 실행
npm run ios            # iOS 실행 (macOS만)
npm run web            # 웹 브라우저 실행
npm run lint           # ESLint 검사
npm run generate       # API 코드 재생성 (orval)
```

---

## 협업 가이드

### Git 브랜치 전략

```
main            # 배포 브랜치
develop         # 개발 통합 브랜치
feature/xxx     # 기능 개발
bugfix/xxx      # 버그 수정
hotfix/xxx      # 긴급 수정
release/xxx     # 릴리즈 준비
```

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 리팩토링
chore: 빌드, 패키지 설정 등

예시:
feat(map): 마커 클러스터링 추가
fix(auth): 토큰 갱신 실패 시 로그아웃 처리
```

### PR 체크리스트

- [ ] ESLint 오류 없음 (`npm run lint`)
- [ ] TypeScript 타입 오류 없음
- [ ] 새 한글 API 태그 추가 시 `scripts/patch-openapi.js` 업데이트
- [ ] 환경 변수 추가 시 팀원 공유

---

## 문제 해결

### Metro Bundler 캐시 삭제

```bash
npx expo start -c
```

### node_modules 재설치

```bash
rm -rf node_modules && npm install
```

### Android 빌드 오류

```bash
cd android && ./gradlew clean && cd .. && npm run android
```

---

## 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [React Native 문서](https://reactnative.dev/)
- [Expo Router 문서](https://docs.expo.dev/router/introduction/)
- [React Query 문서](https://tanstack.com/query/latest)
- [Naver Map SDK](https://github.com/mj-studio-library/react-native-naver-map)
- [orval](https://orval.dev/)

---

**마지막 업데이트**: 2026-03-06
