# Project Instructions

## 참조 문서

- 반드시 `.claude/develop/SKILL.md`를 읽고 따를 것 (Expo/RN 스타일링 컨벤션)

## 디자인 규칙

- 텍스트는 `ThemedText` (`src/shared/common/themed-text.tsx`) 사용, 인라인 style 최소화
- 뷰 래퍼는 `ThemedView` (`src/shared/common/themed-view.tsx`) 활용
- 버튼은 `AppButton` (`src/shared/common/app-button.tsx`) 사용
- 뒤로가기 아이콘은 `ArrowLeft` (`src/shared/common/arrow-left.tsx`) 사용
- 색상은 반드시 `src/shared/theme/theme.ts`에 정의된 값 사용 (하드코딩 금지)
  - Brand, Primary, Gray, Text, System, Fonts 등
- 사이즈는 `rs()` (`src/shared/theme/scale.ts`) 기반
- gap 우선, margin 최소화
- px 단위는 4단위 (4, 8, 12, 16, 20, 24, 28)
- 컴포넌트명은 PascalCase
