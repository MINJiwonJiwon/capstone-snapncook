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
    
    // 인증 실패 (401)
    if (error.response?.status === 401) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    // 서버 응답이 있는 경우 (HTTP 에러)
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    // 네트워크 오류 또는 클라이언트 오류
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
    
    // 인증 실패 (401)
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 서버 응답이 있는 경우 (HTTP 에러)
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    // 네트워크 오류 또는 클라이언트 오류
    throw new Error('소셜 연동 상태 확인 중 오류가 발생했습니다.');
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
    
    // 인증 실패 (401)
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 서버 응답이 있는 경우 (HTTP 에러)
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    // 네트워크 오류 또는 클라이언트 오류
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
    
    return response.data;
  } catch (error) {
    console.error('Update user info error:', error);
    
    // 인증 실패 (401)
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 서버 응답이 있는 경우 (HTTP 에러)
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    // 네트워크 오류 또는 클라이언트 오류
    throw new Error('사용자 정보 수정 중 오류가 발생했습니다.');
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
    
    // 인증 실패 (401)
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    }
    
    // 서버 응답이 있는 경우 (HTTP 에러)
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    
    // 네트워크 오류 또는 클라이언트 오류
    throw new Error('계정 삭제 중 오류가 발생했습니다.');
  }
};

/**
 * 비밀번호 변경 API
 * @param {Object} passwordData - 비밀번호 정보
 * @param {string} passwordData.current_password - 현재 비밀번호
 * @param {string} passwordData.new_password - 새 비밀번호
 * @param {string} passwordData.new_password_check - 새 비밀번호 확인
 * @returns {Promise} 변경 결과
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await client.patch(USER.CHANGE_PASSWORD, passwordData);
    return response.data;
  } catch (error) {
    // 상세 로깅을 통한 디버깅 강화
    console.error('Change password error:', error);
    
    // 1-9, 1-10 이슈 해결: 비밀번호 변경 오류 처리 개선
    if (error.response) {
      const { status, data } = error.response;
      
      // 상세 로깅 추가 - 정확한 에러 정보 파악
      console.log('Password change error details:', {
        status,
        data,
        detail: data.detail,
        detailType: typeof data.detail,
        axios_error: error.toString()
      });
      
      // 400 Bad Request 처리
      if (status === 400) {
        // 현재 비밀번호 불일치 - 1-9 이슈
        if (data.detail && typeof data.detail === 'string' && 
            (data.detail.includes('현재 비밀번호가 일치하지 않습니다') || 
             data.detail.includes('Current password does not match'))) {
          throw new Error('현재 비밀번호가 일치하지 않습니다.');
        }
        
        // 비밀번호 조건 미달 - 1-10 이슈
        if (data.detail && typeof data.detail === 'string' && 
            (data.detail.includes('비밀번호는 8자 이상이며') || 
             data.detail.includes('숫자와 특수문자') ||
             data.detail.includes('Password must be'))) {
          throw new Error('비밀번호는 8자 이상이며, 숫자와 특수문자(@$!%*#?&)를 포함해야 합니다.');
        }
        
        // 새 비밀번호 불일치
        if (data.detail && typeof data.detail === 'string' && 
            (data.detail.includes('새 비밀번호가 일치하지 않습니다') || 
             data.detail.includes('New passwords do not match'))) {
          throw new Error('새 비밀번호가 일치하지 않습니다.');
        }
        
        // 기타 400 오류 - detail이 문자열인 경우
        if (data.detail && typeof data.detail === 'string') {
          throw new Error(data.detail);
        }
        
        // detail이 객체나 배열인 경우
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            const errorMessages = data.detail.map(err => 
              err.msg || (typeof err === 'string' ? err : JSON.stringify(err))
            ).join('\n');
            throw new Error(errorMessages);
          } else if (typeof data.detail === 'object') {
            const errorMessages = Object.values(data.detail)
              .map(msg => typeof msg === 'string' ? msg : JSON.stringify(msg))
              .join('\n');
            throw new Error(errorMessages);
          } else {
            throw new Error(String(data.detail));
          }
        }
      }
      
      // 422 Validation Error
      if (status === 422) {
        // 배열 형태의 유효성 오류 메시지 처리
        if (Array.isArray(data.detail)) {
          const errorMessages = data.detail.map(err => err.msg).join('\n');
          throw new Error(errorMessages);
        }
        
        // 기타 422 오류
        if (data.detail) {
          throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
        }
      }
      
      // 401 Unauthorized
      if (status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // 기타 HTTP 오류
      if (data.detail) {
        throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      } else {
        throw new Error(`비밀번호 변경 중 오류가 발생했습니다. (코드: ${status})`);
      }
    }
    
    // 네트워크 오류 또는 클라이언트 오류
    throw new Error('비밀번호 변경 중 오류가 발생했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
  }
};