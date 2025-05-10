import client from './client';
import { USER } from './endpoints';

/**
 * 사용자 정보 조회 API
 * @returns {Promise} 현재 로그인된 사용자 정보
 */
export const getUserInfo = async () => {
  try {
    const response = await client.get(USER.ME);
    return response.data;
  } catch (error) {
    console.error('Get user info error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    throw new Error('사용자 정보를 가져오는 중 오류가 발생했습니다.');
  }
};

/**
 * 소셜 연동 상태 확인 API
 * @returns {Promise} 소셜 연동 상태 정보
 */
export const getSocialStatus = async () => {
  try {
    const response = await client.get(USER.SOCIAL);
    return response.data;
  } catch (error) {
    console.error('Get social status error:', error);
    throw new Error('소셜 연동 상태를 확인하는 중 오류가 발생했습니다.');
  }
};

/**
 * 소셜 연동 해제 API
 * @param {string} provider - 해제할 소셜 로그인 제공자 (google, kakao, naver)
 * @returns {Promise} 해제 결과
 */
export const disconnectSocial = async (provider) => {
  try {
    const response = await client.delete(USER.DELETE_SOCIAL(provider));
    return response.data;
  } catch (error) {
    console.error(`Disconnect social ${provider} error:`, error);
    throw new Error(`${provider} 연동 해제 중 오류가 발생했습니다.`);
  }
};

/**
 * 사용자 정보 수정 API
 * @param {Object} userData - 수정할 사용자 정보
 * @param {string} userData.nickname - 닉네임
 * @param {string|null} userData.profile_image_url - 프로필 이미지 URL
 * @returns {Promise} 수정된 사용자 정보
 */
export const updateUserInfo = async (userData) => {
  try {
    const response = await client.patch(USER.UPDATE, userData);
    
    // 사용자 정보 수정 후 로컬 스토리지 업데이트
    if (userData.nickname) {
      localStorage.setItem('username', userData.nickname);
    }
    
    // 사용자 객체 업데이트
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Error updating user in localStorage:', e);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Update user info error:', error);
    
    if (error.response?.status === 400) {
      throw new Error('잘못된 요청입니다. 입력한 정보를 확인해주세요.');
    }
    
    throw new Error('사용자 정보 업데이트 중 오류가 발생했습니다.');
  }
};

/**
 * 사용자 계정 삭제 API
 * @returns {Promise} 삭제 결과
 */
export const deleteAccount = async () => {
  try {
    const response = await client.delete(USER.DELETE);
    
    // 계정 삭제 후 로컬 스토리지 정리
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    localStorage.removeItem('imageHistory');
    sessionStorage.removeItem('currentImage');
    sessionStorage.removeItem('selectedFood');
    sessionStorage.removeItem('selectedFoodId');
    
    return response.data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw new Error('계정 삭제 중 오류가 발생했습니다.');
  }
};

/**
 * 비밀번호 변경 API
 * @param {Object} passwordData - 비밀번호 정보
 * @param {string} passwordData.current_password - 현재 비밀번호
 * @param {string} passwordData.new_password - 새 비밀번호
 * @returns {Promise} 변경 결과
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await client.post(USER.CHANGE_PASSWORD, passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password error:', error);
    
    // 오류 메시지 상세화
    if (error.response) {
      const { status, data } = error.response;
      
      // 현재 비밀번호 오류
      if (status === 400 && data.detail && data.detail.includes('Current password is incorrect')) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }
      
      // 비밀번호 조건 불충족
      if (status === 400 || status === 422) {
        if (data.detail && data.detail.includes('password')) {
          throw new Error('새 비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.');
        }
      }
    }
    
    throw new Error('비밀번호 변경 중 오류가 발생했습니다.');
  }
};