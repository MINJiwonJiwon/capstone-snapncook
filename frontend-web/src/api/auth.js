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
    console.error('Signup API error:', error);
    
    // 응답이 있는 경우 상세 처리
    if (error.response) {
      const { status, data } = error.response;
      
      // 1-2 이슈 해결: 이메일 중복 오류 (400)
      if (status === 400) {
        if (data.detail) {
          const detail = data.detail;
          // 다양한 이메일 중복 메시지 패턴 처리
          if (typeof detail === 'string' && 
              (detail.includes('Email already registered') || 
               detail.includes('already registered') || 
               detail.includes('이미 등록된 이메일') ||
               detail.includes('already exists'))) {
            throw new Error('이미 등록된 이메일입니다.');
          }
          // 기타 400 오류는 백엔드 메시지 그대로 사용
          throw new Error(detail);
        }
        throw new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      }
      
      // 1-3 이슈 해결: 422 유효성 검증 오류 (비밀번호 조건 미달 등)
      if (status === 422) {
        if (data.detail) {
          // 배열 형태의 유효성 오류 메시지 처리
          if (Array.isArray(data.detail)) {
            const errorMessages = data.detail.map(err => {
              // FastAPI 유효성 검증 오류 형태: { msg: "...", type: "..." }
              if (err.msg) return err.msg;
              if (err.message) return err.message;
              if (typeof err === 'string') return err;
              return JSON.stringify(err);
            }).filter(Boolean);
            
            if (errorMessages.length > 0) {
              throw new Error(errorMessages.join('\n'));
            }
          }
          // 문자열 형태의 detail
          else if (typeof data.detail === 'string') {
            throw new Error(data.detail);
          }
          // 객체 형태의 detail (필드별 오류)
          else if (typeof data.detail === 'object') {
            const fieldErrors = Object.entries(data.detail)
              .map(([field, message]) => `${field}: ${message}`)
              .join('\n');
            if (fieldErrors) {
              throw new Error(fieldErrors);
            }
          }
        }
        throw new Error('입력한 정보가 유효하지 않습니다. 양식을 확인해주세요.');
      }
      
      // 409 충돌 오류 (이메일 중복의 다른 형태)
      if (status === 409) {
        if (data.detail && typeof data.detail === 'string') {
          if (data.detail.includes('email') || data.detail.includes('Email')) {
            throw new Error('이미 등록된 이메일입니다.');
          }
          if (data.detail.includes('nickname') || data.detail.includes('Nickname')) {
            throw new Error('이미 사용 중인 닉네임입니다.');
          }
          throw new Error(data.detail);
        }
        throw new Error('이미 존재하는 데이터입니다.');
      }
      
      // 기타 HTTP 오류 처리
      const statusMessages = {
        429: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
        500: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        502: '서버 게이트웨이 오류입니다. 잠시 후 다시 시도해주세요.',
        503: '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
      };
      
      if (statusMessages[status]) {
        throw new Error(statusMessages[status]);
      }
      
      // 백엔드에서 보낸 detail 메시지가 있으면 사용
      if (data.detail) {
        throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
      }
      
      throw new Error(`회원가입 중 오류가 발생했습니다. (${status})`);
    }
    
    // 네트워크 오류 등 (응답이 없는 경우)
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 기타 예상치 못한 오류
    throw new Error('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
    console.error('Login API error:', error);
    
    // 응답이 있는 경우 상세 처리
    if (error.response) {
      const { status, data } = error.response;
      
      // 1-5, 1-6 이슈 해결: 401 인증 실패 처리 개선
      if (status === 401) {
        // 디버깅을 위한 상세 로깅
        console.log('401 Unauthorized details:', { status, data, detail: data?.detail });
        
        if (data.detail) {
          const detail = data.detail;
          
          // 1-6 이슈 해결: 존재하지 않는 이메일 처리
          // 다양한 "잘못된 인증정보" 메시지 패턴 처리
          if (detail === "Invalid credentials" || 
              detail === "Invalid email or password" ||
              detail.includes('Invalid credentials') ||
              detail.includes('not found') ||
              detail.includes('does not exist') ||
              detail.includes('존재하지 않는')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
          }
          
          // 1-5 이슈 해결: 잘못된 비밀번호 처리
          // 다양한 "비밀번호 오류" 메시지 패턴 처리
          if (detail === "Incorrect password" ||
              detail === "Wrong password" ||
              detail.includes('Incorrect password') ||
              detail.includes('wrong password') ||
              detail.includes('비밀번호가 올바르지 않습니다') ||
              detail.includes('password is incorrect')) {
            throw new Error('비밀번호가 올바르지 않습니다.');
          }
          
          // 계정 상태 관련 오류
          if (detail.includes('account locked') || detail.includes('locked')) {
            throw new Error('계정이 잠겨있습니다. 관리자에게 문의하세요.');
          }
          
          if (detail.includes('disabled') || detail.includes('inactive')) {
            throw new Error('비활성화된 계정입니다. 관리자에게 문의하세요.');
          }
          
          if (detail.includes('suspended') || detail.includes('banned')) {
            throw new Error('계정이 일시 정지되었습니다. 관리자에게 문의하세요.');
          }
          
          // 기타 401 오류 - 백엔드 메시지를 그대로 사용하되, 너무 기술적이면 변환
          if (detail.includes('token') || detail.includes('authentication')) {
            throw new Error('인증에 실패했습니다. 다시 로그인해주세요.');
          }
          
          // 백엔드 메시지가 사용자 친화적이면 그대로 사용
          if (detail.length < 100 && !detail.includes('HTTP') && !detail.includes('API')) {
            throw new Error(detail);
          }
        }
        
        // 401 오류이지만 자세한 메시지가 없거나 부적절한 경우
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      
      // 400 Bad Request 처리
      if (status === 400) {
        if (data.detail) {
          throw new Error(typeof data.detail === 'string' ? data.detail : '잘못된 요청입니다.');
        }
        throw new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      }
      
      // 403 Forbidden 처리
      if (status === 403) {
        throw new Error('접근이 거부되었습니다. 권한을 확인해주세요.');
      }
      
      // 429 Too Many Requests 처리
      if (status === 429) {
        throw new Error('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
      }
      
      // 서버 오류 처리
      if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      
      // 기타 HTTP 오류
      if (data.detail) {
        throw new Error(typeof data.detail === 'string' ? data.detail : `로그인 중 오류가 발생했습니다. (${status})`);
      }
      
      throw new Error(`로그인 중 오류가 발생했습니다. (${status})`);
    }
    
    // 네트워크 오류 등 (응답이 없는 경우)
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 기타 예상치 못한 오류
    throw new Error('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
    
    // 응답이 있는 경우
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        if (data.detail && (data.detail.includes('Invalid') || data.detail.includes('expired'))) {
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw new Error('인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.');
      }
      
      if (data.detail) {
        throw new Error(typeof data.detail === 'string' ? data.detail : '토큰 갱신 중 오류가 발생했습니다.');
      }
    }
    
    // 네트워크 오류 등
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error('서버에 연결할 수 없습니다. 다시 로그인해주세요.');
    }
    
    throw new Error('토큰 갱신 중 오류가 발생했습니다. 다시 로그인해주세요.');
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
    
    // 로그아웃은 보통 오류가 있어도 성공으로 처리
    if (error.response && error.response.status < 500) {
      return { message: '로그아웃되었습니다.' };
    }
    
    throw new Error('로그아웃 중 오류가 발생했지만 로컬 데이터는 정리되었습니다.');
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
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      if (data.detail) {
        throw new Error(typeof data.detail === 'string' ? data.detail : '사용자 정보를 가져올 수 없습니다.');
      }
    }
    
    // 네트워크 오류 등
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
    }
    
    throw new Error('사용자 정보를 가져오는 중 오류가 발생했습니다.');
  }
};