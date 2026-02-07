# 백엔드 API 요청사항 — 점주 리뷰 답글 기능

## 요약

점주(STORE_OWNER)가 리뷰에 답글을 달 수 있는 기능이 필요합니다.
현재 openapi.json에 리뷰 답글 관련 API가 없어 신규 개발이 필요합니다.

---

## 1. 점주 리뷰 답글 작성 API (신규)

| 항목 | 내용 |
|------|------|
| **Method** | `POST` |
| **Endpoint** | `/api/reviews/{reviewId}/reply` |
| **Summary** | [점주] 리뷰 답글 작성 |
| **권한** | STORE_OWNER (해당 매장 소유자만) |

### Path Parameters

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| reviewId | int64 | Y | 리뷰 ID |

### Request Body

```json
{
  "content": "감사합니다! 또 방문해주세요 😊"
}
```

| 필드 | 타입 | 필수 | 제약조건 | 설명 |
|------|------|------|---------|------|
| content | string | Y | minLength: 1, maxLength: 500 | 답글 내용 |

### Response

- **201 Created** — 답글 작성 성공
- **403 Forbidden** — 해당 매장 소유자가 아닌 경우
- **404 Not Found** — 리뷰 없음
- **409 Conflict** — 이미 답글이 존재하는 경우

---

## 2. 점주 리뷰 답글 수정 API (신규)

| 항목 | 내용 |
|------|------|
| **Method** | `PATCH` |
| **Endpoint** | `/api/reviews/{reviewId}/reply` |
| **Summary** | [점주] 리뷰 답글 수정 |
| **권한** | STORE_OWNER (해당 매장 소유자만) |

### Request Body

```json
{
  "content": "수정된 답글 내용입니다."
}
```

### Response

- **200 OK** — 수정 성공
- **403 Forbidden** — 해당 매장 소유자가 아닌 경우
- **404 Not Found** — 리뷰 또는 답글 없음

---

## 3. 점주 리뷰 답글 삭제 API (신규)

| 항목 | 내용 |
|------|------|
| **Method** | `DELETE` |
| **Endpoint** | `/api/reviews/{reviewId}/reply` |
| **Summary** | [점주] 리뷰 답글 삭제 |
| **권한** | STORE_OWNER (해당 매장 소유자만) |

### Response

- **204 No Content** — 삭제 성공
- **403 Forbidden** — 해당 매장 소유자가 아닌 경우
- **404 Not Found** — 리뷰 또는 답글 없음

---

## 4. ReviewResponse 스키마 변경 요청

현재 `ReviewResponse`에 답글 관련 필드가 없습니다. 다음 필드 추가가 필요합니다:

### 현재 스키마

```json
{
  "reviewId": 1,
  "storeId": 1,
  "username": "배고프당",
  "content": "떡볶이가 정말 맛있어요!",
  "rating": 5,
  "createdAt": "2026-01-08T12:00:00",
  "likeCount": 3,
  "imageUrls": ["https://..."]
}
```

### 추가 요청 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `reply` | object \| null | 점주 답글 (없으면 null) |
| `reply.content` | string | 답글 내용 |
| `reply.createdAt` | string (date-time) | 답글 작성일시 |
| `reply.updatedAt` | string (date-time) | 답글 수정일시 |

### 변경 후 스키마 예시

```json
{
  "reviewId": 1,
  "storeId": 1,
  "username": "배고프당",
  "content": "떡볶이가 정말 맛있어요!",
  "rating": 5,
  "createdAt": "2026-01-08T12:00:00",
  "likeCount": 3,
  "imageUrls": ["https://..."],
  "reply": {
    "content": "감사합니다! 또 방문해주세요 😊",
    "createdAt": "2026-01-09T10:00:00",
    "updatedAt": "2026-01-09T10:00:00"
  }
}
```

---

## 프론트 사용 시나리오

1. **리뷰 목록 조회** (`GET /api/stores/{storeId}/reviews`)
   - `reply`가 null → "미답변" 뱃지 표시 + "답글 달기" 버튼
   - `reply`가 있음 → "답변완료" 뱃지 표시 + 사장님 답글 박스

2. **답글 작성** (`POST /api/reviews/{reviewId}/reply`)
   - 점주가 "답글 달기" → 모달에서 작성 → API 호출 → 목록 새로고침

3. **리뷰 신고** (`POST /api/reviews/{reviewId}/reports`)
   - 이미 구현됨, 프론트 연동 완료

---

## 우선순위

| 순위 | 항목 | 사유 |
|------|------|------|
| **P0** | ReviewResponse에 reply 필드 추가 | 미답변/답변완료 구분이 불가 |
| **P0** | 답글 작성 API | 핵심 기능 |
| P1 | 답글 수정 API | 오타 수정 등 |
| P2 | 답글 삭제 API | 부가 기능 |
