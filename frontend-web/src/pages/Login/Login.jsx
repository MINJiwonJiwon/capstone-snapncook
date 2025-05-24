import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import useAuth from '../../hooks/useAuth';
import { redirectToSocialLogin } from '../../api/oauth';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login, signup, loading, error } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordCheck, setSignupPasswordCheck] = useState('');
  const [formError, setFormError] = useState('');
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);
  
  // 에러 메시지 초기화
  const clearErrors = () => {
    setFormError('');
  };
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    clearErrors();
  };
  
  // 1-14 이슈 해결: 소셜 로그인 핸들러 (직접 리디렉션)
  const handleSocialLogin = (provider) => {
    try {
      clearErrors();
      console.log(`${provider} 로그인 시도...`);
      
      // 직접 리디렉션 방식 사용
      redirectToSocialLogin(provider);
      
    } catch (err) {
      console.error(`${provider} 로그인 오류:`, err);
      setFormError(err.message || `${provider} 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.`);
    }
  };
  
  /**
   * 1-2, 1-3, 1-5, 1-6 통합 해결: 통합 오류 처리 함수
   * auth.js에서 이미 적절한 Error 객체로 변환된 메시지를 처리
   */
  const handleAuthError = (err, context = '') => {
    // 개발 환경에서 디버깅 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`${context} error details:`, {
        error: err,
        message: err.message,
        response: err.response,
        stack: err.stack
      });
    }
    
    // 1순위: auth.js에서 이미 처리된 Error 객체의 메시지 사용
    if (err instanceof Error && err.message) {
      // 메시지가 너무 기술적이거나 길면 사용자 친화적으로 변환
      const message = err.message;
      
      // 일반적인 기술적 용어를 사용자 친화적으로 변환
      if (message.includes('HTTP') || message.includes('API') || message.includes('axios')) {
        setFormError(context === 'signup' 
          ? '회원가입 중 오류가 발생했습니다. 입력 정보를 확인해주세요.'
          : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }
      
      // 메시지가 적절하면 그대로 사용
      setFormError(message);
      return;
    }
    
    // 2순위: 네트워크 오류 등 (err.response가 없는 경우)
    if (!err.response) {
      setFormError('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      return;
    }
    
    // 3순위: 예상치 못한 오류 형태 (auth.js에서 처리되지 않은 경우)
    setFormError(context === 'signup' 
      ? '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      : '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  };
  
  // 로그인 폼 제출 핸들러
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    // 필드 검증
    if (!loginEmail.trim()) {
      setFormError('이메일을 입력해주세요.');
      return;
    }
    
    if (!loginPassword.trim()) {
      setFormError('비밀번호를 입력해주세요.');
      return;
    }
    
    // 이메일 형식 기본 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setFormError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    try {
      await login({ 
        email: loginEmail, 
        password: loginPassword 
      });
      navigate('/');
    } catch (err) {
      // 1-5, 1-6 이슈 해결: 로그인 오류 통합 처리
      handleAuthError(err, 'login');
    }
  };
  
  // 회원가입 폼 제출 핸들러
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    
    // 유효성 검사 - 각 필드 개별 검사
    if (!signupEmail.trim()) {
      setFormError('이메일을 입력해주세요.');
      return;
    }
    
    if (!signupNickname.trim()) {
      setFormError('닉네임을 입력해주세요.');
      return;
    }
    
    if (!signupPassword.trim()) {
      setFormError('비밀번호를 입력해주세요.');
      return;
    }
    
    if (!signupPasswordCheck.trim()) {
      setFormError('비밀번호 확인을 입력해주세요.');
      return;
    }
    
    // 비밀번호 확인 검사
    if (signupPassword !== signupPasswordCheck) {
      setFormError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setFormError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    
    // 닉네임 길이 검사
    if (signupNickname.length < 2 || signupNickname.length > 20) {
      setFormError('닉네임은 2자 이상, 20자 이하로 입력해주세요.');
      return;
    }
    
    // 비밀번호 강도 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(signupPassword)) {
      setFormError('비밀번호는 최소 8자 이상이며, 문자와 숫자를 포함해야 합니다.');
      return;
    }
    
    try {
      await signup({ 
        email: signupEmail,
        password: signupPassword,
        password_check: signupPasswordCheck,
        nickname: signupNickname,
        profile_image_url: null
      });
      
      // 회원가입 성공 시 로그인 탭으로 전환
      setActiveTab('login');
      setLoginEmail(signupEmail);
      setLoginPassword('');
      
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (err) {
      // 1-2, 1-3 이슈 해결: 회원가입 오류 통합 처리
      handleAuthError(err, 'signup');
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
                {/* 1-14 이슈 해결: 직접 리디렉션 방식으로 변경 */}
                <button 
                  className={`${styles.oauthButton} ${styles.google}`}
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                >
                  G
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.kakao}`}
                  type="button"
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={loading}
                >
                  K
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.naver}`}
                  type="button"
                  onClick={() => handleSocialLogin('naver')}
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
                <small className={styles.fieldHint}>2~20자 사이로 입력해주세요.</small>
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
                <small className={styles.fieldHint}>8자 이상, 문자와 숫자를 포함해야 합니다.</small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-password-check">비밀번호 확인</label>
                <input 
                  type="password" 
                  id="signup-password-check" 
                  name="password_check" 
                  value={signupPasswordCheck}
                  onChange={(e) => setSignupPasswordCheck(e.target.value)}
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