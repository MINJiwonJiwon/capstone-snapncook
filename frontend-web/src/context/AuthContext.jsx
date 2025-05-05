import React, { createContext, useEffect, useState } from 'react';
import { getMyInfo } from '../api/auth';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

/**
 * 인증 상태 관리를 위한 Provider 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 */
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const checkLoginStatus = async () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus);

      if (loginStatus) {
        try {
          // 로컬 스토리지에서 사용자 정보 가져오기 시도
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Invalid user data in localStorage');
            }
          }
          
          // 사용자 정보 API 호출로 갱신
          const userInfo = await getMyInfo();
          setUser(userInfo);
          
          // 사용자 정보 저장
          localStorage.setItem('user', JSON.stringify(userInfo));
          if (userInfo.nickname) {
            localStorage.setItem('username', userInfo.nickname);
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          
          // 인증 오류 발생 시 로그인 상태 초기화
          if (error.response?.status === 401) {
            setIsLoggedIn(false);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            localStorage.removeItem('user');
          }
        }
      }
      
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // 로그인 상태 업데이트 함수
  const updateLoginStatus = (status, userData = null) => {
    setIsLoggedIn(status);
    setUser(userData);
    
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.nickname) {
        localStorage.setItem('username', userData.nickname);
      }
    }
  };

  // 제공할 컨텍스트 값
  const value = {
    isLoggedIn,
    user,
    loading,
    updateLoginStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};