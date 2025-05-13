// API 서버 기본 URL - 환경에 따라 자동 전환
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api'
  : 'https://api.snapncook.com/api';

// 인증 관련 엔드포인트
export const AUTH = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

// 소셜 로그인 관련 엔드포인트
export const OAUTH = {
  GOOGLE_LOGIN: '/oauth/google/login',
  GOOGLE_CALLBACK: '/oauth/google/callback',
  KAKAO_LOGIN: '/oauth/kakao/login',
  KAKAO_CALLBACK: '/oauth/kakao/callback',
  NAVER_LOGIN: '/oauth/naver/login',
  NAVER_CALLBACK: '/oauth/naver/callback',
};

// 음식 관련 엔드포인트
export const FOOD = {
  CREATE: '/foods/',
  LIST: '/foods/',
  GET: (id) => `/foods/${id}`,
};

// 레시피 관련 엔드포인트
export const RECIPE = {
  CREATE: '/recipes/',
  LIST: '/recipes/',
  GET: (id) => `/recipes/${id}`,
  GET_BY_FOOD: (foodId) => `/recipes/food/${foodId}`,
  GET_DETAIL: (id) => `/recipes/${id}/detail`,
};

// 레시피 단계 관련 엔드포인트
export const RECIPE_STEP = {
  CREATE: '/recipe-steps/',
  LIST_BY_RECIPE: (recipeId) => `/recipe-steps/recipe/${recipeId}`,
};

// 탐지 결과 관련 엔드포인트
export const DETECTION = {
  CREATE: '/detection-results/',
  LIST_ME: '/detection-results/me',
};

// 사용자 관련 엔드포인트
export const USER = {
  CREATE: '/users/',
  ME: '/users/me',
  SOCIAL: '/users/me/social',
  DELETE_SOCIAL: (provider) => `/users/me/social/${provider}`,
  UPDATE: '/users/me',
  DELETE: '/users/me',
  CHANGE_PASSWORD: '/users/me/password',
};

// 북마크 관련 엔드포인트
export const BOOKMARK = {
  CREATE: '/bookmarks/',
  LIST_ME: '/bookmarks/me',
  DELETE: (id) => `/bookmarks/${id}`,
};

// 마이페이지 관련 엔드포인트
export const MYPAGE = {
  SUMMARY: '/mypage/summary',
};

// 홈 화면 관련 엔드포인트
export const HOME = {
  POPULAR_SEARCHES: '/popular-searches',
  RECOMMENDED_FOOD: '/recommended-food',
};

// 추천 관련 엔드포인트
export const RECOMMEND = {
  PUBLIC_BY_DETECTION: (detectionId) => `/recommend/public/by-detection/${detectionId}`,
  PUBLIC_BY_INGREDIENT: (inputId) => `/recommend/public/by-ingredient/${inputId}`,
  PRIVATE_BY_DETECTION: (detectionId) => `/recommend/private/by-detection/${detectionId}`,
  PRIVATE_BY_INGREDIENT: (inputId) => `/recommend/private/by-ingredient/${inputId}`,
};

// 리뷰 관련 엔드포인트 (추가)
export const REVIEW = {
  CREATE: '/reviews/',
  GET: (foodId) => `/reviews/food/${foodId}`,
  ME: '/reviews/me',
  PATCH: (reviewId) => `/reviews/${reviewId}`,
  DELETE: (reviewId) => `/reviews/${reviewId}`,
};

// 재료 입력 관련 엔드포인트 (추가)
export const INGINPUT = {
  CREATE: '/user-ingredient-inputs/',
  GET: (inputId) => `/user-ingredient-inputs/${inputId}`,
};

// 재료 입력 레시피 관련 엔드포인트 (추가)
export const INGINPUTRECIPE = {
  CREATE: '/user-ingredient-input-recipes/',
  GET: (inputId) => `/user-ingredient-input-recipes/input/${inputId}`,
};

export { BASE_URL };