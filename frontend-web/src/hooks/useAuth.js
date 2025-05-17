import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signup, login, logout, getMyInfo, refreshToken } from '../api/auth';

/**
 * 인증 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 인증 관련 상태 및 함수들
 */
const useAuth = () => {
  const { isLoggedIn, user, loading, updateLoginStatus } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * 회원가입 처리 함수
   * @param {Object} userData - 사용자 정보
   */
  const handleSignup = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signup(userData);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      
      // 1-2번 이슈 해결: Error 객체로 전달된 메시지를 우선적으로 사용
      if (err instanceof Error) {
        setError(err.message);
      } else if (err.response?.data?.detail) {
        // 백엔드에서 직접 전달된 detail 메시지 사용
        setError(err.response.data.detail);
      } else {
        // 기본 오류 메시지
        setError('회원가입 중 오류가 발생했습니다.');
      }
      
      throw err;
    }
  };

  /**
   * 로그인 처리 함수
   * @param {Object} credentials - 로그인 정보
   */
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await login(credentials);
      
      // 리프레시 토큰이 있다면 저장
      if (result.refresh_token) {
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      
      // 사용자 정보 가져오기
      const userInfo = await getMyInfo();
      updateLoginStatus(true, userInfo);
      
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || err.response?.data?.detail || '로그인 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 로그아웃 처리 함수
   */
  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      await logout(refreshTokenValue);
      
      updateLoginStatus(false, null);
      setIsLoading(false);
      
      // 로그인 페이지로 리다이렉트
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      setError(err.message || err.response?.data?.detail || '로그아웃 중 오류가 발생했습니다.');
      
      // 오류가 발생해도 로컬 상태 초기화
      updateLoginStatus(false, null);
      navigate('/');
    }
  };

  /**
   * 토큰 갱신 함수
   */
  const handleRefreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token');
      if (!refreshTokenValue) {
        throw new Error('리프레시 토큰이 없습니다.');
      }
      
      const result = await refreshToken(refreshTokenValue);
      return result;
    } catch (err) {
      console.error('Token refresh error:', err);
      
      // 토큰 갱신 실패 시 로그아웃 처리
      updateLoginStatus(false, null);
      
      // 세션 만료 메시지와 함께 로그인 페이지로 리다이렉트
      setError(err.message || '세션이 만료되었습니다. 다시 로그인해주세요.');
      navigate('/login');
      throw err;
    }
  };

  /**
   * 사용자 정보 새로고침 함수
   */
  const refreshUserInfo = async () => {
    if (!isLoggedIn) return;
    
    setIsLoading(true);
    
    try {
      const userInfo = await getMyInfo();
      updateLoginStatus(true, userInfo);
      setIsLoading(false);
      return userInfo;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || err.response?.data?.detail || '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      
      // 인증 오류 발생 시 토큰 갱신 시도
      if (err.response?.status === 401) {
        try {
          await handleRefreshToken();
          // 갱신 성공 시 다시 사용자 정보 요청
          const userInfo = await getMyInfo();
          updateLoginStatus(true, userInfo);
          return userInfo;
        } catch (refreshErr) {
          // 갱신 실패 시 로그아웃 처리
          updateLoginStatus(false, null);
          navigate('/login');
        }
      }
      
      throw err;
    }
  };
  
  /**
   * 오류 메시지 초기화 함수
   */
  const clearError = () => {
    setError(null);
  };

  return {
    isLoggedIn,
    user,
    loading: loading || isLoading,
    error,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    refreshUserInfo,
    clearError
  };
};

export default useAuth;