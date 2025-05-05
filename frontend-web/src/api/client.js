import axios from 'axios';
import { BASE_URL } from './endpoints';

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃 설정
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('access_token');
    
    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // 리프레시 토큰 가져오기
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          // 토큰 갱신 요청
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          // 새 토큰 저장
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // 리프레시 토큰이 있다면 함께 저장
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }
          
          // 원래 요청의 인증 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // 요청 재시도
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('user');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;