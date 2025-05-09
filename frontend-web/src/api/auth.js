import client from './client';
import { AUTH } from './endpoints';

/**
 * 회원가입 API
 * @param {Object} userData - 사용자 정보 객체
 * @param {string} userData.email - 이메일
 * @param {string} userData.password - 비밀번호
 * @param {string} userData.nickname - 닉네임
 * @param {string|null} userData.profile_image_url - 프로필 이미지 URL (선택적)
 * @returns {Promise} 회원가입 결과
 */
export const signup = async (userData) => {
  try {
    const response = await client.post(AUTH.SIGNUP, userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * 로그인 API
 * @param {Object} credentials - 로그인 정보
 * @param {string} credentials.email - 이메일
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise} 로그인 결과 (토큰 포함)
 */
export const login = async (credentials) => {
  try {
    const response = await client.post(AUTH.LOGIN, credentials);
    
    // 로그인 성공 시 토큰 저장
    const { access_token, refresh_token, token_type } = response.data;
    
    localStorage.setItem('access_token', access_token);
    
    // 리프레시 토큰이 있으면 저장
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * 토큰 갱신 API
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise} 갱신된 토큰 정보
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await client.post(AUTH.REFRESH, { refresh_token: refreshToken });
    
    // 토큰 갱신 성공 시 저장
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * 로그아웃 API
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise} 로그아웃 결과
 */
export const logout = async (refreshToken) => {
  try {
    const response = await client.post(AUTH.LOGOUT, { refresh_token: refreshToken });
    
    // 로그아웃 시 로컬 스토리지 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // 이미지 히스토리 초기화
    localStorage.removeItem('imageHistory');
    sessionStorage.removeItem('currentImage');
    sessionStorage.removeItem('selectedFood');
    sessionStorage.removeItem('selectedFoodId');
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // 에러가 발생해도 로컬 데이터 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('imageHistory');
    sessionStorage.removeItem('currentImage');
    sessionStorage.removeItem('selectedFood');
    sessionStorage.removeItem('selectedFoodId');
    
    throw error;
  }
};

/**
 * 사용자 정보 조회 API
 * @returns {Promise} 현재 로그인된 사용자의 정보
 */
export const getMyInfo = async () => {
  try {
    const response = await client.get(AUTH.ME);
    
    // 사용자 정보 저장
    if (response.data.nickname) {
      localStorage.setItem('username', response.data.nickname);
    }
    
    // 사용자 정보 객체 저장
    localStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};