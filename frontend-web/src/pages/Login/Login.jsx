import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import useAuth from '../../hooks/useAuth';
import { startGoogleLogin, startKakaoLogin, startNaverLogin } from '../../api/oauth';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login, signup, loading, error } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [formError, setFormError] = useState('');
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setFormError('');
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      // API 명세서에 따라 이메일과 비밀번호로 로그인 시도
      await login({ 
        email: loginEmail, 
        password: loginPassword 
      });
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.detail || '로그인에 실패했습니다.');
    }
  };
  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      // API 명세서에 따라 회원가입 데이터 형식 맞춤
      await signup({ 
        email: signupEmail,
        password: signupPassword, 
        nickname: signupNickname,
        profile_image_url: null
      });
      
      // 회원가입 성공 시 로그인 탭으로 전환하고 메시지 표시
      setActiveTab('login');
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      
      // 로그인 필드에 이메일 자동 입력
      setLoginEmail(signupEmail);
    } catch (err) {
      setFormError(err.response?.data?.detail || '회원가입에 실패했습니다.');
    }
  };
  
  const handleOAuthLogin = async (provider) => {
    try {
      let response;
      
      switch (provider.toLowerCase()) {
        case 'google':
          response = await startGoogleLogin();
          break;
        case 'kakao':
          response = await startKakaoLogin();
          break;
        case 'naver':
          response = await startNaverLogin();
          break;
        default:
          throw new Error('지원하지 않는 소셜 로그인입니다.');
      }
      
      // 리다이렉트 URL로 이동
      if (response && response.redirect_url) {
        window.location.href = response.redirect_url;
      } else {
        throw new Error('리다이렉트 URL이 없습니다.');
      }
    } catch (err) {
      setFormError(`${provider} 로그인 시작 중 오류가 발생했습니다.`);
      console.error(`${provider} login error:`, err);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link to="/">음식 레시피 찾기</Link>
        </div>
      </nav>
      
      <div className={styles.container}>
        <div className={styles.authContainer}>
          <div className={styles.authTabs}>
            <button 
              className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`} 
              onClick={() => handleTabClick('login')}
            >
              로그인
            </button>
            <button 
              className={`${styles.authTab} ${activeTab === 'signup' ? styles.active : ''}`} 
              onClick={() => handleTabClick('signup')}
            >
              회원가입
            </button>
          </div>
          
          {/* 에러 메시지 표시 */}
          {(formError || error) && (
            <div className={styles.errorMessage}>
              {formError || error}
            </div>
          )}
          
          {/* 로딩 표시 */}
          {loading && (
            <div className={styles.loadingMessage}>
              처리 중입니다...
            </div>
          )}
          
          <div className={styles.authForm} style={{ display: activeTab === 'login' ? 'block' : 'none' }}>
            <h2>로그인</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="login-email">이메일</label>
                <input 
                  type="email" 
                  id="login-email" 
                  name="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="login-password">비밀번호</label>
                <input 
                  type="password" 
                  id="login-password" 
                  name="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className={styles.authButton}
                disabled={loading}
              >
                로그인
              </button>
            </form>
            
            <div className={styles.oauthContainer}>
              <p>또는 소셜 계정으로 로그인</p>
              <div className={styles.oauthButtons}>
                <button 
                  className={`${styles.oauthButton} ${styles.google}`}
                  onClick={() => handleOAuthLogin('Google')}
                  disabled={loading}
                >
                  G
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.kakao}`}
                  onClick={() => handleOAuthLogin('Kakao')}
                  disabled={loading}
                >
                  K
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.naver}`}
                  onClick={() => handleOAuthLogin('Naver')}
                  disabled={loading}
                >
                  N
                </button>
              </div>
            </div>
          </div>
          
          <div className={styles.authForm} style={{ display: activeTab === 'signup' ? 'block' : 'none' }}>
            <h2>회원가입</h2>
            <form onSubmit={handleSignupSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="signup-email">이메일</label>
                <input 
                  type="email" 
                  id="signup-email" 
                  name="email" 
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-nickname">닉네임</label>
                <input 
                  type="text" 
                  id="signup-nickname" 
                  name="nickname" 
                  value={signupNickname}
                  onChange={(e) => setSignupNickname(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-password">비밀번호</label>
                <input 
                  type="password" 
                  id="signup-password" 
                  name="password" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required 
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className={styles.authButton}
                disabled={loading}
              >
                회원가입
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;