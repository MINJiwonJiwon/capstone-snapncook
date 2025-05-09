import apiClient from './client';
import { OAUTH } from './endpoints';
import { getMyInfo } from './auth';

/**
 * Google 로그인 시작 API
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startGoogleLogin = async () => {
  try {
    const response = await apiClient.get(OAUTH.GOOGLE_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Google login error:', error);
    throw error;
  }
};

/**
 * Google OAuth 콜백 처리 API
 * @param {string} code - 인증 코드
 * @param {string} state - 상태 값
 * @returns {Promise} 인증 토큰 정보
 */
export const handleGoogleCallback = async (code, state) => {
  try {
    // 쿼리 파라미터를 URL에 포함
    const response = await apiClient.get(`${OAUTH.GOOGLE_CALLBACK}?code=${code}&state=${state}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Google callback error:', error);
    throw error;
  }
};

/**
 * Kakao 로그인 시작 API
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startKakaoLogin = async () => {
  try {
    const response = await apiClient.get(OAUTH.KAKAO_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Kakao login error:', error);
    throw error;
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
    const response = await apiClient.get(`${OAUTH.KAKAO_CALLBACK}?code=${code}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Kakao callback error:', error);
    throw error;
  }
};

/**
 * Naver 로그인 시작 API
 * @returns {Promise} 리다이렉션 URL 정보
 */
export const startNaverLogin = async () => {
  try {
    const response = await apiClient.get(OAUTH.NAVER_LOGIN);
    return response.data;
  } catch (error) {
    console.error('Start Naver login error:', error);
    throw error;
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
    const response = await apiClient.get(`${OAUTH.NAVER_CALLBACK}?code=${code}&state=${state}`);
    
    // 토큰 저장
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('isLoggedIn', 'true');
    
    // 사용자 정보 가져오기
    await getMyInfo();
    
    return response.data;
  } catch (error) {
    console.error('Handle Naver callback error:', error);
    throw error;
  }
};