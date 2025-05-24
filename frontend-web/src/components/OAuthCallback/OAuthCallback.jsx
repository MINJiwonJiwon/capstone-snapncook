import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleCallback, handleKakaoCallback, handleNaverCallback } from "../../api/oauth";
import styles from './OAuthCallback.module.css';

/**
 * 소셜 로그인 콜백 처리 컴포넌트
 * 각 소셜 로그인 제공자(구글, 카카오, 네이버)로부터의 콜백을 처리합니다.
 */
const OAuthCallback = () => {
  const { provider } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOAuth = async () => {
      try {
        // URL 쿼리 파라미터 가져오기
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        let result;

        // 소셜 로그인 제공자별 처리
        switch (provider) {
          case 'google':
            result = await handleGoogleCallback(code, state);
            break;
          case 'kakao':
            result = await handleKakaoCallback(code);
            break;
          case 'naver':
            result = await handleNaverCallback(code, state);
            break;
          default:
            throw new Error('지원하지 않는 소셜 로그인 제공자입니다.');
        }

        setLoading(false);
        
        // 정상 처리되면 홈으로 리다이렉트
        navigate('/');
      } catch (err) {
        console.error(`OAuth ${provider} callback error:`, err);
        setError(err.message || `${provider} 로그인 처리 중 오류가 발생했습니다.`);
        setLoading(false);
      }
    };

    processOAuth();
  }, [provider, location.search, navigate]);

  return (
    <div className={styles.container}>
      <h1>{provider.toUpperCase()} 로그인 처리 중</h1>
      
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>로그인 처리 중입니다. 잠시만 기다려주세요...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          <h2>로그인 오류</h2>
          <p>{error}</p>
          <button 
            className={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;