import client from './client';
import { OAUTH, BASE_URL } from './endpoints';
import { getMyInfo } from './auth';

/**
 * 소셜 로그인 URL 생성 함수들
 * 직접 리디렉션 방식으로 변경
 */

/**
 * Google 로그인 URL 반환
 * @returns {string} Google OAuth 로그인 URL
 */
export const getGoogleLoginUrl = () => {
  return `${BASE_URL}${OAUTH.GOOGLE_LOGIN}`;
};

/**
 * Kakao 로그인 URL 반환
 * @returns {string} Kakao OAuth 로그인 URL
 */
export const getKakaoLoginUrl = () => {
  return `${BASE_URL}${OAUTH.KAKAO_LOGIN}`;
};

/**
 * Naver 로그인 URL 반환
 * @returns {string} Naver OAuth 로그인 URL
 */
export const getNaverLoginUrl = () => {
  return `${BASE_URL}${OAUTH.NAVER_LOGIN}`;
};

/**
 * 통합 소셜 로그인 URL 생성 함수
 * @param {string} provider - 소셜 로그인 제공자 (google, kakao, naver)
 * @returns {string} 소셜 로그인 URL
 */
export const getSocialLoginUrl = (provider) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return getGoogleLoginUrl();
    case 'kakao':
      return getKakaoLoginUrl();
    case 'naver':
      return getNaverLoginUrl();
    default:
      throw new Error(`지원하지 않는 소셜 로그인 제공자입니다: ${provider}`);
  }
};

/**
 * 소셜 로그인 직접 리디렉션 함수
 * @param {string} provider - 소셜 로그인 제공자
 */
export const redirectToSocialLogin = (provider) => {
  try {
    const loginUrl = getSocialLoginUrl(provider);
    
    // 소셜 로그인 진행 중 표시 저장
    localStorage.setItem('social_login_pending', provider);
    localStorage.setItem('social_login_time', new Date().getTime());
    
    // 직접 리디렉션
    window.location.href = loginUrl;
  } catch (error) {
    console.error(`${provider} 로그인 리디렉션 오류:`, error);
    throw error;
  }
};

// ===== 기존 API 호출 방식 함수들 (더 이상 사용하지 않음) =====
// 하위 호환성을 위해 남겨두되, 내부적으로는 직접 리디렉션 방식 사용

/**
 * Google 로그인 시작 API (더 이상 사용하지 않음 - 직접 리디렉션 권장)
 * @deprecated 직접 리디렉션 방식(redirectToSocialLogin) 사용 권장
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startGoogleLogin = async () => {
  try {
    const response = await client.get(OAUTH.GOOGLE_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Google login error:', error);
    throw new Error('Google 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * Kakao 로그인 시작 API (더 이상 사용하지 않음 - 직접 리디렉션 권장)
 * @deprecated 직접 리디렉션 방식(redirectToSocialLogin) 사용 권장
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startKakaoLogin = async () => {
  try {
    const response = await client.get(OAUTH.KAKAO_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Kakao login error:', error);
    throw new Error('Kakao 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * Naver 로그인 시작 API (더 이상 사용하지 않음 - 직접 리디렉션 권장)
 * @deprecated 직접 리디렉션 방식(redirectToSocialLogin) 사용 권장
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startNaverLogin = async () => {
  try {
    const response = await client.get(OAUTH.NAVER_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Naver login error:', error);
    throw new Error('Naver 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
};

// ===== 콜백 처리 함수들 (기존 유지) =====

/**
 * Google OAuth 콜백 처리 API
 * @param {string} code - 인증 코드
 * @param {string} state - 상태 값
 * @returns {Promise} 인증 토큰 정보
 */
export const handleGoogleCallback = async (code, state) => {
  try {
    // 쿼리 파라미터를 URL에 포함
    const response = await client.get(`${OAUTH.GOOGLE_CALLBACK}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Google callback error:', error);
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    throw new Error('Google 로그인을 완료할 수 없습니다. 권한 설정을 확인하거나 다른 로그인 방식을 시도해주세요.');
  }
};

/**
 * Kakao OAuth 콜백 처리 API
 * @param {string} code - 인증 코드
 * @returns {Promise} 인증 토큰 정보
 */
export const handleKakaoCallback = async (code) => {
  try {
    // 쿼리 파라미터를 URL에 포함
    const response = await client.get(`${OAUTH.KAKAO_CALLBACK}?code=${encodeURIComponent(code)}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Kakao callback error:', error);
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    throw new Error('Kakao 로그인을 완료할 수 없습니다. 권한 설정을 확인하거나 다른 로그인 방식을 시도해주세요.');
  }
};

/**
 * Naver OAuth 콜백 처리 API
 * @param {string} code - 인증 코드
 * @param {string} state - 상태 값
 * @returns {Promise} 인증 토큰 정보
 */
export const handleNaverCallback = async (code, state) => {
  try {
    // 쿼리 파라미터를 URL에 포함
    const response = await client.get(`${OAUTH.NAVER_CALLBACK}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Naver callback error:', error);
    
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    throw new Error('Naver 로그인을 완료할 수 없습니다. 권한 설정을 확인하거나 다른 로그인 방식을 시도해주세요.');
  }
};

// ===== 유틸리티 함수들 (기존 유지) =====

/**
 * OAuth 콜백 URL 설정 함수
 * 소셜 로그인 콜백 URL을 브라우저 URL 기준으로 자동 생성
 * @param {string} provider - 소셜 로그인 제공자 (google, kakao, naver)
 * @returns {string} 현재 도메인을 기반으로 한 콜백 URL
 */
export const getCallbackUrl = (provider) => {
  const origin = window.location.origin;
  return `${origin}/oauth/${provider}/callback`;
};

/**
 * 소셜 로그인 상태 확인
 * 소셜 로그인 진행 중인지 확인하고 타임아웃 처리
 * @returns {Object} 로그인 상태 정보
 */
export const checkSocialLoginStatus = () => {
  const provider = localStorage.getItem('social_login_pending');
  const timeString = localStorage.getItem('social_login_time');
  
  if (!provider || !timeString) {
    return { pending: false };
  }
  
  const loginTime = parseInt(timeString, 10);
  const currentTime = new Date().getTime();
  const timeDiff = (currentTime - loginTime) / 1000; // 초 단위
  
  // 3분(180초) 이상 경과하면 타임아웃으로 간주
  if (timeDiff > 180) {
    // 소셜 로그인 진행중 표시 제거
    localStorage.removeItem('social_login_pending');
    localStorage.removeItem('social_login_time');
    
    return { 
      pending: false, 
      timedOut: true,
      provider 
    };
  }
  
  return { 
    pending: true,
    provider,
    elapsedTime: Math.round(timeDiff)
  };
};