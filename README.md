# 🥘 SnapNCook

**SnapNCook**은 사용자가 업로드한 음식 사진을 기반으로 AI 객체 탐지 모델이 음식을 인식하고, 인식된 음식에 대한 레시피와 정보를 제공하는 스마트 요리 서비스입니다.

---

## 🚀 주요 기능

- 🔐 OAuth 기반 사용자 인증 및 관리
- 🍽️ 음식 정보 등록 및 조회
- 📖 음식별 레시피 및 조리 단계 제공
- 🤖 YOLO 기반 음식 객체 탐지 결과 저장
- ✍️ 음식에 대한 사용자 리뷰 작성 및 조회
- 📜 사용자 행동 로그 기록
- 🧾 사용자가 입력한 재료 기반 레시피 추천 기능

---

## 🏗️ 기술 스택

- **백엔드**:
  - FastAPI
  - PostgreSQL (Docker 기반 설정)
  - SQLAlchemy (ORM)
  - python-dotenv (환경 변수 관리)
  - Swagger UI (자동 API 문서 제공)

- **프론트엔드**:
  - React 19 + Vite SPA
  - React Router, TailwindCSS 예정

---

## 📂 프로젝트 구조

### 🛠 백엔드 (`backend/`)

> FastAPI 기반의 REST API 서버로, PostgreSQL + SQLAlchemy ORM을 기반으로 설계되어 있으며, 명확한 CRUD 라우터 구조를 갖추고 있습니다.

```
backend/
├── crud.py                        # CRUD 로직 함수들
├── db.py                          # DB 연결 및 세션 설정
├── main.py                        # FastAPI 애플리케이션 시작점
├── models.py                      # SQLAlchemy ORM 모델 정의
├── schemas.py                     # Pydantic 기반 요청/응답 스키마
├── create_tables.py               # DB 테이블 생성 스크립트
└── routers/                       # API 엔드포인트 라우터 모음
    ├── user.py                    # 사용자 가입/로그인 관리
    ├── food.py                    # 음식 정보 조회/등록
    ├── recipe.py                 # 레시피 정보
    ├── recipestep.py             # 요리 단계 내용
    ├── detectionresult.py        # AI 검출 결과 관리
    ├── review.py                 # 사용자 리뷰 기록
    ├── userlog.py                # 사용자 활동 로그
    ├── useringredientinput.py    # 사용자 입력 재료 관리
    └── useringredientinputrecipe.py # 재료-레시피 매핑 결과
```


### 💻 프론트엔드 (`frontend-web/`)

> React 19 + Vite 기반의 SPA 구조이며, 각 페이지는 `pages/` 디렉토리에, 공통 UI 컴포넌트는 `components/`에 위치합니다.

```
frontend-web/
├── public/                                  # 정적 복사 파일
├── src/
│   ├── assets/                              # 이미지, 아이콘 등 정적 자료
│   ├── components/                          # 공통 UI 컴포넌트
│   │   ├── Footer/                          # 하단 패널
│   │   ├── Navbar/                          # 상단 메뉴 & 로그인/로그아웃
│   │   └── RankingRecommendation/          # 인기 검색어, 추천 영역
│   ├── pages/
│   │   ├── Home/                            # 메인 페이지 (업로드, 추천 등)
│   │   ├── Login/                           # 로그인 페이지
│   │   ├── MyPage/                          # 마이페이지: 사용자 활동 기록
│   │   └── Recipe/                          # 분석된 레시피 결과 보기
│   ├── App.jsx                              # 라우팅 설정
│   └── main.jsx                             # React 진입점
├── package.json                             # 프로젝트 메타 및 의존성
└── vite.config.js                           # Vite 빌드 설정
```

---

## 🗂️ ERD (Entity Relationship Diagram)

> SnapNCook의 핵심 테이블 구조를 요약한 ERD입니다. `dbdiagram.io` 기반 또는 이미지로 추후 시각화 가능합니다.

```
User
 ├─ id (PK)
 ├─ email, password_hash, nickname
 ├─ profile_image_url, oauth_provider, oauth_id
 └─ has_many: DetectionResult, Review, UserLog, UserIngredientInput

Food
 ├─ id (PK)
 ├─ name, description, image_url
 └─ has_many: Recipe, Review, DetectionResult

Recipe
 ├─ id (PK), food_id (FK)
 ├─ title, ingredients, instructions
 └─ has_many: RecipeStep, UserIngredientInputRecipe

RecipeStep
 ├─ id (PK), recipe_id (FK)
 └─ step_order, description, image_url

DetectionResult
 ├─ id (PK), user_id (FK), food_id (FK)
 └─ image_path, confidence

Review
 ├─ id (PK), user_id (FK), food_id (FK)
 └─ content, rating

UserLog
 ├─ id (PK), user_id (FK)
 └─ action, target_id, target_type, meta

UserIngredientInput
 ├─ id (PK), user_id (FK)
 └─ input_text, matched_food_ids (JSON)

UserIngredientInputRecipe
 ├─ id (PK), input_id (FK), recipe_id (FK)
 └─ rank
```

---

## 🔗 배포 주소

- 웹 프론트엔드: (추후 추가 예정)
- 백엔드 API: (추후 추가 예정)

---

## 🧪 테스트 디렉토리 구조 안내

이 프로젝트는 GitHub Actions를 사용해 자동 테스트(CI)를 수행합니다.  
각 파트별 테스트는 다음 위치에 작성해 주세요.

| 파트 | 테스트 코드 위치 | 실행 명령 |
|------|------------------|-----------|
| 백엔드 | `backend/tests/` | `pytest` |
| AI 모델 | `ai-model/tests/` | `pytest` |
| 웹 프론트 | `frontend-web/__tests__/` | `npm test` |
| 앱 프론트 | `frontend-app/__tests__/` | `npm test` or `jest` |

> 각 테스트 폴더는 이미 생성되어 있으므로, 기능 단위로 `test_*.py`, `*.test.js(x)` 파일을 추가해 주세요.

### ✅ 예시

- `backend/tests/test_food.py`
- `ai-model/tests/test_inference.py`
- `frontend-web/__tests__/Header.test.jsx`
- `frontend-app/__tests__/MainScreen.test.js`

### 💡 규칙

- 모든 기능 개발 시 **테스트 코드도 함께 작성**해 주세요.
- PR 병합 전 GitHub Actions에서 테스트가 자동 실행되며, 실패 시 병합이 제한됩니다.

---

## 🧪 로컬 실행 방법 (개발자용)

1. `.env` 파일 설정

```env
POSTGRES_USER=capstone
POSTGRES_PASSWORD=capstone10
POSTGRES_DB=capstone_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

2. PostgreSQL 실행 (Docker 기준)

```bash
docker-compose up -d
```

3. 테이블 생성

```bash
python backend/create_tables.py
```

4. FastAPI 서버 실행

```bash
uvicorn backend.main:app --reload
```

---

## 👥 팀 정보

| 역할         | 담당자 수 | 비고                     |
|--------------|------------|---------------------------|
| 백엔드       | 2명        | FastAPI, DB 설계, AI 연동 |
| 프론트엔드   | 2명        | React + Vite SPA          |
| AI/모델링    | 1명        | YOLO 기반 객체 탐지       |

---

## 🎯 향후 계획

- Google/Kakao OAuth 로그인 연동
- 이미지 업로드 기능 및 백엔드 연동
- 추천 알고리즘 개선 및 정렬 로직 추가
- Railway 클라우드 배포 연동

---

