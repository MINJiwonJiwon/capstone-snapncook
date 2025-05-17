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
    // 오류 메시지 한글화 및 상세화
    if (error.response) {
      const { status, data } = error.response;
      
      // 이메일 중복 오류
      if (status === 400 && data.detail && data.detail.includes('Email already registered')) {
        throw new Error('이미 등록된 이메일입니다.');
      }
      
      // 비밀번호 유효성 오류
      if (status === 400 || status === 422) {
        if (data.detail && data.detail.includes('password')) {
          throw new Error('비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.');
        }
      }
      
      // 1-3 이슈 해결: 422 유효성 검증 오류 (비밀번호 조건 미달 등)
      if (status === 422) {
        // 배열 형태의 유효성 오류 메시지 처리
        if (Array.isArray(data.detail)) {
          const errorMessages = data.detail.map(err => err.msg).join('\n');
          throw new Error(errorMessages);
        }
      }
    }
    
    console.error('Signup error:', error);
    throw error.response?.data?.detail ? new Error(error.response.data.detail) : error;
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
    
    // 오류 메시지 한글화 및 상세화
    if (error.response) {
      const { status, data } = error.response;
      
      // 1-5, 1-6 이슈 해결: 401 인증 실패 처리 개선
      if (status === 401) {
        // 디버깅을 위한 상세 로깅
        console.log('401 Unauthorized error details:', data);
        console.log('Detail message exact value:', data.detail);
        
        // 1-6 이슈 해결: 존재하지 않는 이메일 - "Invalid credentials" 메시지 명확히 처리
        if (data.detail === "Invalid credentials") {
          throw new Error('존재하지 않는 이메일입니다.');
        }
        
        // 1-5 이슈 해결: 잘못된 비밀번호
        if (data.detail === "Incorrect password") {
          throw new Error('비밀번호가 올바르지 않습니다.');
        }
        
        // 기타 401 오류 - 백엔드 메시지를 그대로 사용
        if (data.detail) {
          throw new Error(data.detail);
        }
        
        // 401 오류이지만 자세한 메시지가 없는 경우
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
      
      // 그 외 HTTP 오류
      if (data.detail) {
        throw new Error(data.detail);
      }
    }
    
    // 서버 연결 실패 등의 네트워크 오류
    throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
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
    // 오류 메시지 한글화
    if (error.response?.status === 401 && error.response?.data?.detail?.includes('Invalid or expired refresh token')) {
      throw new Error('만료되거나 유효하지 않은 리프레시 토큰입니다. 다시 로그인해주세요.');
    }
    
    console.error('Token refresh error:', error);
    throw error.response?.data?.detail ? new Error(error.response.data.detail) : error;
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
    localStorage.removeItem('user');
    
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
    localStorage.removeItem('user');
    localStorage.removeItem('imageHistory');
    sessionStorage.removeItem('currentImage');
    sessionStorage.removeItem('selectedFood');
    sessionStorage.removeItem('selectedFoodId');
    
    throw error.response?.data?.detail ? new Error('로그아웃 중 오류가 발생했습니다.') : error;
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
    
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    throw error.response?.data?.detail ? new Error(error.response.data.detail) : error;
  }
};