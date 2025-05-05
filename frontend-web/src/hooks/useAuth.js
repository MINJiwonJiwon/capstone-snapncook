import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signup, login, logout, getMyInfo } from '../api/auth';

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
      setError(err.response?.data?.detail || '회원가입 중 오류가 발생했습니다.');
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
      setError(err.response?.data?.detail || '로그인 중 오류가 발생했습니다.');
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
      const refreshToken = localStorage.getItem('refresh_token');
      await logout(refreshToken);
      
      updateLoginStatus(false, null);
      setIsLoading(false);
      
      // 로그인 페이지로 리다이렉트
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.detail || '로그아웃 중 오류가 발생했습니다.');
      
      // 오류가 발생해도 로컬 상태 초기화
      updateLoginStatus(false, null);
      navigate('/');
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
      setError(err.response?.data?.detail || '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      
      // 인증 오류 발생 시 로그인 상태 초기화
      if (err.response?.status === 401) {
        updateLoginStatus(false, null);
        navigate('/login');
      }
      
      throw err;
    }
  };

  return {
    isLoggedIn,
    user,
    loading: loading || isLoading,
    error,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    refreshUserInfo,
  };
};

export default useAuth;