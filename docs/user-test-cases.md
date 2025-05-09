# 🧪 SnapNCook 사용자 테스트 시나리오
> 최종 수정일: 2025-05-09  
> 작성 대상: 기능 개발자, 프론트 개발자, 테스트 담당자  
> 작성 기준: FastAPI 기반 백엔드 + 사용자 관점 흐름

---

## 📋 시나리오 목록 (총 6개 그룹, 30+ 테스트)

| 그룹 | 시나리오 수 | 설명 |
|------|--------------|------|
| 1. 회원가입/로그인/비밀번호 | 15 | 회원가입, 로그인, 비밀번호 변경, 토큰 재발급 등 |
| 2. 유저 정보/탈퇴/소셜 연결 | 5 | 내 정보 조회, 수정, 소셜 연동 해제 등 |
| 3. 음식/레시피/조리 등록 | 5 | 음식 추가, 레시피 및 조리 단계 등록 |
| 4. 음식 탐지/레시피 추천 | 4 | 음식 탐지 결과 저장 및 추천 연결 |
| 5. 재료 입력/추천 매핑 | 3 | 재료 입력 저장 및 추천 결과 연결 |
| 6. 리뷰/북마크/마이페이지 | 6 | 리뷰 생성/조회/수정/삭제, 즐겨찾기, 마이페이지 요약 |

---


## ✅ 1. 회원가입 / 로그인 / 비밀번호 관련 시나리오

### 1-1. 회원가입 성공
- **요청** `POST /auth/signup`
```json
{
  "email": "test@example.com",
  "password": "test@1234",
  "nickname": "테스터"
}
```
- **기대 응답**: 200 OK, user ID 및 정보 포함

### 1-2. 회원가입 실패 - 이메일 중복
- 기존에 등록된 이메일로 요청 시
- **기대 응답**: 400, `"Email already registered"`

### 1-3. 회원가입 실패 - 비밀번호 조건 불충족
- 숫자/특수문자 미포함
- **기대 응답**: 422 or 400, `"비밀번호에는 최소 1개의 숫자가 포함되어야 합니다."`

### 1-4. 로그인 성공
- `POST /auth/login`로 로그인
```json
{
  "email": "test@example.com",
  "password": "test@1234"
}
```
- **기대 응답**: access_token, refresh_token

### 1-5. 로그인 실패 - 잘못된 비밀번호
- **기대 응답**: 401, `"Incorrect password"`

### 1-6. 로그인 실패 - 존재하지 않는 이메일
- **기대 응답**: 401, `"Invalid credentials"`

### 1-7. 내 정보 조회
- **요청**: `GET /auth/me`, 토큰 포함
- **기대 응답**: email, nickname 등 사용자 정보

### 1-8. 비밀번호 변경 성공
- **요청** `PATCH /users/me/password`
```json
{
  "current_password": "test@1234",
  "new_password": "newpass@123"
}
```
- **기대 응답**: 200, `"Password updated successfully"`

### 1-9. 비밀번호 변경 실패 - 현재 비밀번호 오류
- **기대 응답**: 400, `"현재 비밀번호가 일치하지 않습니다."`

### 1-10. 비밀번호 변경 실패 - 새 비밀번호 조건 불충족
- **기대 응답**: 422, `"비밀번호에는 최소 1개의 숫자가 포함되어야 합니다."`

### 1-11. 로그아웃 성공
- **요청**: `POST /auth/logout` + refresh token
- **기대 응답**: 200, `"Logged out successfully"`

### 1-12. 토큰 재발급 성공
- **요청**: `POST /auth/refresh`
```json
{ "refresh_token": "..." }
```
- **기대 응답**: 새 access_token

### 1-13. 토큰 재발급 실패 - 만료/폐기됨
- **기대 응답**: 401, `"Invalid or expired refresh token"`


---

## ✅ 2. 유저 정보 / 탈퇴 / 소셜 연결 시나리오

### 2-1. 내 정보 조회
- `GET /users/me` with token
- 기대 응답: 이메일, 닉네임, 프로필 URL 등

### 2-2. 프로필 수정
```json
PATCH /users/me
{
  "nickname": "새닉네임",
  "profile_image_url": "http://example.com/newimg.jpg"
}
```
- 기대 응답: 변경된 닉네임/이미지

### 2-3. 회원 탈퇴
- `DELETE /users/me`
- 기대 응답: 204 No Content

### 2-4. 소셜 연동 상태 확인
- `GET /users/me/social`
- 기대 응답: provider, oauth_id

### 2-5. 소셜 연동 해제
- `DELETE /users/me/social/google` 등
- 기대 응답: `"google 연동이 해제되었습니다."`

---

## ✅ 3. 음식 / 레시피 / 조리 단계 등록 시나리오

### 3-1. 음식 등록
```json
POST /foods
{
  "name": "된장찌개",
  "description": "전통 한식 찌개",
  "image_url": "http://example.com/img.jpg"
}
```

### 3-2. 레시피 등록
```json
POST /recipes
{
  "food_id": 1,
  "source_type": "User",
  "title": "간단 된장찌개",
  "ingredients": "된장, 두부, 호박",
  "instructions": "재료를 넣고 끓입니다."
}
```

### 3-3. 조리 단계 등록
```json
POST /recipe-steps
{
  "recipe_id": 1,
  "step_order": 1,
  "description": "된장 푼 물에 재료 투입",
  "image_url": "http://example.com/step1.jpg"
}
```

### 3-4. 레시피 상세 통합 조회
- `GET /recipes/{recipe_id}/detail`

---

## ✅ 4. 음식 탐지 → 레시피 추천 흐름

### 4-1. 탐지 결과 저장
```json
POST /detection-results
{
  "food_id": 1,
  "image_path": "uploads/image1.jpg",
  "confidence": 0.94
}
```

### 4-2. 내 탐지 결과 조회
- `GET /detection-results/me`

### 4-3. 탐지 기반 추천 (개인)
- `GET /recommend/private/by-detection/{detection_id}`

### 4-4. 탐지 기반 추천 (공개)
- `GET /recommend/public/by-detection/{detection_id}`

---

## ✅ 5. 재료 입력 기반 추천 시나리오

### 5-1. 재료 입력 저장
```json
POST /user-ingredient-inputs
{
  "input_text": "돼지고기, 김치"
}
```

### 5-2. 추천 레시피 매핑 저장
```json
POST /user-ingredient-input-recipes
{
  "input_id": 1,
  "recipe_id": 2,
  "rank": 1
}
```

### 5-3. 추천 목록 조회
- `GET /user-ingredient-input-recipes/input/{input_id}`

---

## ✅ 6. 리뷰 / 북마크 / 마이페이지 시나리오

### 6-1. 리뷰 등록
```json
POST /reviews
{
  "food_id": 1,
  "content": "너무 맛있어요!",
  "rating": 5
}
```

### 6-2. 내 리뷰 조회
- `GET /reviews/me`

### 6-3. 음식별 리뷰 조회
- `GET /reviews/food/{food_id}`

### 6-4. 즐겨찾기 추가
```json
POST /bookmarks
{
  "recipe_id": 2
}
```

### 6-5. 즐겨찾기 조회
- `GET /bookmarks/me`

### 6-6. 마이페이지 요약
- `GET /mypage/summary`
