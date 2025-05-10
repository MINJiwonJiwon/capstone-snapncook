import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  handleGoogleCallback, 
  handleKakaoCallback, 
  handleNaverCallback 
} from '../../api/oauth';
import useAuth from '../../hooks/useAuth';
import styles from './OAuthCallback.module.css';

/**
 * 소셜 로그인 콜백 처리 컴포넌트
 * /oauth/:provider/callback 경로에서 사용
 */
const OAuthCallback = () => {
  const { refreshUserInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('처리 중...');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // URL에서 provider 추출 (예: /oauth/google/callback -> google)
        const pathParts = location.pathname.split('/');
        const provider = pathParts[2]; // 예상 경로: /oauth/[provider]/callback
        
        if (!provider) {
          throw new Error('알 수 없는 소셜 로그인 제공자입니다.');
        }
        
        // URL 쿼리 파라미터 가져오기
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }
        
        // 제공자에 따른 콜백 처리
        let result;
        
        switch (provider.toLowerCase()) {
          case 'google':
            setStatus('Google 계정으로 로그인 중...');
            result = await handleGoogleCallback(code, state);
            break;
            
          case 'kakao':
            setStatus('Kakao 계정으로 로그인 중...');
            result = await handleKakaoCallback(code);
            break;
            
          case 'naver':
            setStatus('Naver 계정으로 로그인 중...');
            result = await handleNaverCallback(code, state);
            break;
            
          default:
            throw new Error(`지원하지 않는 소셜 로그인 제공자: ${provider}`);
        }
        
        // 사용자 정보 가져오기
        setStatus('로그인 성공! 사용자 정보를 가져오는 중...');
        await refreshUserInfo();
        
        // 로그인 성공 후 리디렉션
        setStatus('로그인 성공! 메인 페이지로 이동합니다.');
        
        // 메인 페이지로 리디렉션
        setTimeout(() => {
          navigate('/');
        }, 1000);
        
      } catch (err) {
        console.error('OAuth callback processing error:', err);
        setError(err.message || '소셜 로그인을 완료할 수 없습니다.');
        
        // 에러 발생 시 3초 후 로그인 페이지로 리디렉션
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };
    
    processOAuthCallback();
  }, [location, navigate, refreshUserInfo]);
  
  return (
    <div className={styles.container}>
      <div className={styles.callbackCard}>
        <div className={styles.logoContainer}>
          <h2>음식 레시피 찾기</h2>
        </div>
        
        {!error ? (
          <>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.statusMessage}>{status}</p>
          </>
        ) : (
          <>
            <div className={styles.errorIcon}>!</div>
            <p className={styles.errorMessage}>{error}</p>
            <p className={styles.redirectMessage}>로그인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;