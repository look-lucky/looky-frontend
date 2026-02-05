# 지도 기능 아키텍처

## 파일 구조

| 파일 | 역할 |
|---|---|
| `src/app/(student)/(tabs)/map.tsx` | 지도 탭 화면 (NaverMap + BottomSheet + 검색/필터 UI) |
| `src/app/(student)/components/map/naver-map-view.tsx` | NaverMap 래퍼 컴포넌트 (마커 렌더링) |
| `src/app/(student)/components/map/selected-store-detail.tsx` | 마커 클릭 시 바텀시트에 표시되는 가게 상세 |
| `src/app/(student)/components/map/store-filter-modal.tsx` | 가게 종류/분위기/이벤트 필터 모달 |
| `src/shared/hooks/use-map-search.ts` | 지도 핵심 훅 (API 호출, 필터링, 마커 생성, 상태 관리) |
| `src/shared/utils/store-transform.ts` | API 응답(StoreResponse) → UI 모델(Store) 변환, 거리 계산 |
| `src/shared/types/store.ts` | Store 인터페이스 정의 |
| `src/shared/constants/map.ts` | 카테고리 탭, 정렬/거리/분위기 옵션, 바텀시트 snap 상수 |
| `src/api/mutator.ts` | customFetch (BASE_URL 기본값: `http://localhost:4010`) |
| `mock-server.js` | 테스트용 Mock API 서버 (포트 4010) |

## 데이터 흐름

```
[GET /api/stores] ─→ customFetch ─→ rawData
                                        │
                    rawData.data.data.content  (StoreResponse[])
                                        │
                    transformStoreResponses()  (Store[])
                                        │
                    거리 필터 (selectedDistance)  (filteredStores)
                                        │
                    .map(store → MarkerData)  (markers)
                                        │
                    <NaverMapMarkerOverlay />  (지도에 렌더링)
```

### 응답 구조 (3단 중첩)

```
customFetch 반환값 (rawData)
├── data          ← HTTP body (JSON.parse 결과)
│   ├── isSuccess
│   └── data      ← 페이지 응답
│       ├── content: StoreResponse[]
│       ├── pageNumber, pageSize, totalElements, totalPages
│       └── last
├── status
└── headers
```

코드에서 접근: `rawData?.data?.data?.content` (`use-map-search.ts:139`)

### 타입 변환

```
StoreResponse (API)          Store (UI)              MarkerData (지도)
─────────────────           ──────────              ─────────────────
id: number           →      id: string              id: string
name: string         →      name: string            title: string
latitude: number     →      lat: number       →     lat: number
longitude: number    →      lng: number       →     lng: number
imageUrls: string[]  →      image: string
operatingHours       →      openHours: string
                            distance: string (계산)
                            rating, reviewCount (TODO)
```

변환 함수: `transformStoreResponse()` (`store-transform.ts:35`)

## 좌표 기준

- **지도 기본 중심**: 전북대학교 `{ lat: 35.8448, lng: 127.1294 }` (`use-map-search.ts:79`)
- **NaverMap 기본 center**: `{ lat: 35.8358, lng: 127.1294 }` (`naver-map-view.tsx:29`)
- **초기 줌 레벨**: 15 (`naver-map-view.tsx:67`)
- **Mock 서버 가게 좌표**: 전북대 주변 (lat: 35.833~35.850, lng: 127.122~127.138)

> **주의**: Mock 서버 가게 좌표가 지도 기본 중심과 다른 지역이면 마커가 뷰포트 밖에 렌더링되어 안 보임

## 필터링

### 서버 사이드 (API 쿼리 파라미터)
- `keyword`: 가게명 검색
- `categories`: 가게 종류 (RESTAURANT, BAR, CAFE, ENTERTAINMENT 등)
- `moods`: 분위기 (SOLO_DINING, GROUP_GATHERING, LATE_NIGHT, ROMANTIC)
- `page`, `size`: 페이징

### 클라이언트 사이드 (`use-map-search.ts:147`)
- **거리 필터**: `selectedDistance`가 0이 아니고 `myLocation`이 있으면, Haversine 거리 계산으로 필터링
- 거리 옵션: 0km(전체), 1km, 3km, 5km (`constants/map.ts:31`)

## 마커 인터랙션

1. **마커 클릭** → `onMarkerClick` → `handleMarkerClick` → `setSelectedStoreId` + 바텀시트 HALF로 열림
2. **지도 클릭** → `onMapClick` → `handleMapClick` → `setSelectedStoreId(null)` + 바텀시트 접힘
3. **리스트에서 가게 선택** → `handleStoreSelect` → 지도 모드로 전환 + 해당 좌표로 `setMapCenter` + `animateCameraTo`

## 바텀시트 snap 상태

| 인덱스 | 상수 | 높이 | 탭바 |
|---|---|---|---|
| 0 | `SNAP_INDEX.COLLAPSED` | 220px | 보임 |
| 1 | `SNAP_INDEX.HALF` | 50% | 숨김 |
| 2 | `SNAP_INDEX.FULL` | 80% | 숨김 |

## Mock 서버 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/stores` | 가게 목록 (keyword 필터만 지원, categories/moods 미지원) |
| GET | `/api/stores/:id` | 가게 상세 |
| GET | `/api/stores/:id/items` | 메뉴 목록 |
| GET | `/api/stores/:id/reviews` | 리뷰 목록 (페이징) |
| GET | `/api/stores/:id/reviews/stats` | 리뷰 통계 |
| GET | `/api/stores/:id/favorites/count` | 즐겨찾기 수 |
| GET | `/api/stores/:id/coupons` | 쿠폰 목록 |
| GET | `/api/stores/:id/news` | 소식 목록 (페이징) |
| POST | `/api/auth/login` | 더미 로그인 |
