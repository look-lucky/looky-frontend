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

## API 코드 생성 (orval)

- API 코드 재생성 시 `npm run orval` 대신 반드시 `npm run generate` 사용
  - `scripts/patch-openapi.js`가 먼저 실행되어 openapi.json의 한글 태그를 영어로 변환함
  - 한글 파일명(예: `고객센터-api.ts`)은 EAS Build를 깨뜨리기 때문
- 한글 태그 → 영어 매핑은 `scripts/patch-openapi.js`의 `TAG_TRANSLATIONS`에서 관리
  - 백엔드에서 새 한글 태그가 추가되면 해당 파일에 항목 추가 필요
