
# 📚 SnapnCook API Documentation

> ⏱️ Last updated: 2025-04-16 03:55:30  
> 📎 Swagger UI: [`/docs`](http://localhost:8000/docs)  
> 📎 Redoc: [`/redoc`](http://localhost:8000/redoc) *(옵션)*

이 문서는 SnapnCook의 백엔드에서 제공하는 FastAPI 기반의 REST API 엔드포인트를 정리한 것입니다.  
Postman이나 Thunder Client 같은 도구를 통해 테스트하거나, 프론트엔드 연동 시 참고용으로 활용하세요.

---

## 📌 요약 정보

| 분류               | 설명                                      |
|--------------------|-------------------------------------------|
| 인증 방식          | OAuth2 + JWT (Bearer Token)               |
| 요청/응답 포맷     | `application/json`                        |
| Swagger 문서       | [`/docs`](http://localhost:8000/docs)     |
| 테스트 도구 추천   | Postman, Thunder Client 등                |
| Swagger 기반 자동화 | ✅ 적용 완료 (`summary`, `description` 반영) |

---

## ✅ 공통 요청 헤더

모든 인증이 필요한 API 요청 시 다음과 같은 헤더를 포함하세요:

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

## ✅ 인증 관련 (Auth)

### 🔐 일반 로그인 및 회원가입

- **POST** `/auth/signup`  
  일반 회원가입  
  **Body:** `email`, `password`, `nickname`

- **POST** `/auth/login`  
  일반 로그인  
  **Body:** `email`, `password`

- **POST** `/auth/refresh`  
  리프레시 토큰을 통해 액세스 토큰 갱신  
  **Body:** `refresh_token`

- **POST** `/auth/logout`  
  리프레시 토큰 만료 처리  
  **Body:** `refresh_token`

- **GET** `/auth/me`  
  로그인된 사용자 정보 조회  
  **Headers:** `Authorization: Bearer <access_token>`

---

## ☁️ 소셜 로그인 (OAuth)

- **GET** `/oauth/google/login`, `/oauth/kakao/login`, `/oauth/naver/login`  
  각 플랫폼별 로그인 시작 (프론트에서 리디렉션용으로 사용)

---

## 👤 유저 API

- **POST** `/users/`  
  유저 생성

- **GET** `/users/{user_id}`  
  특정 유저 조회

- **GET** `/users/`  
  모든 유저 목록 조회

---

## 🍽️ 음식 API

- **POST** `/foods/`  
  음식 등록

- **GET** `/foods/`  
  전체 음식 조회

- **GET** `/foods/{food_id}`  
  단일 음식 조회

---

## 📖 레시피 API

- **POST** `/recipes/`  
  레시피 등록

- **GET** `/recipes/`  
  전체 레시피 조회

- **GET** `/recipes/{recipe_id}`  
  단일 레시피 조회

---

## 🥄 조리 단계 API

- **POST** `/recipe-steps/`  
  조리 단계 등록

- **GET** `/recipe-steps/recipe/{recipe_id}`  
  특정 레시피에 대한 조리 단계 목록

---

## 🔍 탐지 결과 API

- **POST** `/detection-results/`  
  탐지 결과 저장

- **POST** `/detection-results/user/{user_id}`  
  특정 유저의 탐지 결과 저장

- **GET** `/detection-results/user/{user_id}`  
  특정 유저의 탐지 결과 조회

---

## ✍️ 리뷰 API

- **POST** `/reviews/`  
  리뷰 등록

- **GET** `/reviews/food/{food_id}`  
  음식별 리뷰 목록

- **GET** `/reviews/user/{user_id}`  
  유저별 리뷰 목록

---

## 📜 유저 로그 API

- **POST** `/user-logs/`  
  유저 로그 생성

- **GET** `/user-logs/user/{user_id}`  
  특정 유저의 로그 조회

---

## 🧾 재료 기반 입력 API

- **POST** `/user-ingredient-inputs/`  
  재료 입력 저장

- **GET** `/user-ingredient-inputs/{input_id}`  
  입력 ID로 재료 입력 조회

---

## 🧑‍🍳 재료 기반 추천 레시피 API

- **POST** `/user-ingredient-input-recipes/`  
  추천 레시피 매핑 저장

- **GET** `/user-ingredient-input-recipes/input/{input_id}`  
  특정 재료 입력에 대한 추천 레시피 목록

---

## 🧪 테스트용 엔드포인트

- **GET** `/`  
  DB 연결 확인용 (헬스체크)

---

## 🧪 인증 및 요청 샘플

### 🧾 Access Token 인증 예시

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 📝 샘플 요청 JSON

### 📌 회원가입 (POST `/auth/signup`)
```json
{
  "email": "test@example.com",
  "password": "Password123!",
  "nickname": "테스트유저"
}
```

### 📌 로그인 (POST `/auth/login`)
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### 📌 음식 등록 (POST `/foods/`)
```json
{
  "name": "김치찌개",
  "description": "매콤한 돼지고기 김치찌개",
  "image_url": "https://example.com/kimchi.jpg"
}
```

### 📌 레시피 등록 (POST `/recipes/`)
```json
{
  "food_id": 1,
  "source_type": "manual",
  "title": "김치찌개 만들기",
  "ingredients": "김치, 돼지고기, 대파, 마늘",
  "instructions": "1. 김치 썰기\n2. 고기 볶기\n3. 물 붓고 끓이기"
}
```

### 📌 조리 단계 등록 (POST `/recipe-steps/`)
```json
{
  "recipe_id": 1,
  "step_order": 1,
  "description": "김치를 썰어 준비합니다.",
  "image_url": "https://example.com/step1.jpg"
}
```

### 📌 탐지 결과 저장 (POST `/detection-results/`)
```json
{
  "user_id": 1,
  "food_id": 1,
  "image_path": "uploads/detection1.png",
  "confidence": 0.92
}
```

### 📌 리뷰 등록 (POST `/reviews/`)
```json
{
  "user_id": 1,
  "food_id": 1,
  "content": "정말 맛있어요!",
  "rating": 5
}
```

### 📌 유저 로그 등록 (POST `/user-logs/`)
```json
{
  "user_id": 1,
  "action": "view_recipe",
  "target_id": 1,
  "target_type": "recipe",
  "meta": {
    "from": "recommendation"
  }
}
```

### 📌 재료 입력 저장 (POST `/user-ingredient-inputs/`)
```json
{
  "user_id": 1,
  "input_text": "김치, 돼지고기"
}
```

### 📌 추천 레시피 매핑 (POST `/user-ingredient-input-recipes/`)
```json
{
  "input_id": 1,
  "recipe_id": 1,
  "rank": 1
}
```

---

## 📌 향후 추가 예정 항목

- [ ] 응답 JSON 예시 (`200 OK`, `401 Unauthorized`, `404 Not Found` 등)
- [ ] 상태 코드별 에러 설명 표
- [ ] Swagger 문서 외부 공개용 링크 설정
