import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import useAuth from '../../hooks/useAuth';
import { redirectToSocialLogin } from '../../api/oauth';
import OAuthButton from '../../components/OAuthButton/OAuthButton';

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
  const [socialLoading, setSocialLoading] = useState(null); // 소셜 로그인 로딩 상태
  
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
  
  // 소셜 로그인 핸들러
  const handleSocialLogin = (provider) => {
    try {
      clearErrors();
      setSocialLoading(provider); // 해당 버튼만 로딩 상태로
      console.log(`${provider} 로그인 시도...`);
      
      // 직접 리디렉션 방식 사용
      redirectToSocialLogin(provider);
      
    } catch (err) {
      console.error(`${provider} 로그인 오류:`, err);
      setFormError(err.message || `${provider} 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.`);
      setSocialLoading(null); // 로딩 상태 해제
    }
  };

  // 에러 메시지 정제 함수
  const cleanErrorMessage = (message) => {
    if (!message) return '';
    
    // "Value error," 제거 (대소문자 구분 없이)
    let cleanedMessage = message.replace(/^Value\s+error,?\s*/i, '');
    
    // "validation error," 제거
    cleanedMessage = cleanedMessage.replace(/^Validation\s+error,?\s*/i, '');
    
    // "pydantic" 관련 기술적 용어 제거
    cleanedMessage = cleanedMessage.replace(/pydantic[^:]*:\s*/i, '');
    
    // FastAPI 관련 기술적 용어 제거
    cleanedMessage = cleanedMessage.replace(/FastAPI[^:]*:\s*/i, '');
    
    // 첫 글자 대문자로 변환
    if (cleanedMessage.length > 0) {
      cleanedMessage = cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);
    }
    
    return cleanedMessage || message; // 정제 후 빈 문자열이면 원본 반환
  };

  // 로그인 에러 구체화 함수
  const getSpecificLoginError = (originalError, email) => {
    const message = originalError.message || '';
    
    // "이메일 또는 비밀번호가 올바르지 않습니다" 메시지를 더 구체적으로 분기
    if (message === '이메일 또는 비밀번호가 올바르지 않습니다.' ||
        message.includes('Invalid credentials') ||
        message.includes('Invalid email or password')) {
      
      // 이메일 형식이 올바르지 않으면 이메일 문제로 간주
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return '올바른 이메일 형식이 아닙니다.';
      }
      
      // 일반적인 이메일 도메인이 아니면 이메일 문제 가능성 높음
      const commonDomains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];
      const emailDomain = email.split('@')[1]?.toLowerCase();
      
      if (emailDomain && !commonDomains.includes(emailDomain)) {
        // 일반적이지 않은 도메인이면 더 자세한 안내
        return '이메일 또는 비밀번호를 확인해주세요. 이메일이 정확한지 다시 한번 확인해보세요.';
      }
      
      // 기본적으로는 원래 메시지 유지하되 좀 더 친화적으로
      return '이메일 또는 비밀번호가 일치하지 않습니다. 다시 확인해주세요.';
    }
    
    // 다른 에러는 그대로 반환
    return message;
  };
  
  /**
   * 통합 오류 처리 함수
   */
  const handleAuthError = (err, context = '', userEmail = '') => {
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
      let message = err.message;
      
      // 기술적 용어 제거 및 메시지 정제
      message = cleanErrorMessage(message);
      
      // 로그인 에러의 경우 구체화
      if (context === 'login' && userEmail) {
        message = getSpecificLoginError(err, userEmail);
      }
      
      // 메시지가 너무 기술적이거나 길면 사용자 친화적으로 변환
      if (message.includes('HTTP') || message.includes('API') || message.includes('axios') || message.length > 200) {
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
      handleAuthError(err, 'login', loginEmail);
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
    
    // 비밀번호 강도 검사 메시지 개선
    if (signupPassword.length < 8) {
      setFormError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }
    
    const hasLetter = /[A-Za-z]/.test(signupPassword);
    const hasNumber = /\d/.test(signupPassword);
    
    if (!hasLetter) {
      setFormError('비밀번호에는 최소 1개의 문자가 포함되어야 합니다.');
      return;
    }
    
    if (!hasNumber) {
      setFormError('비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.');
      return;
    }
    
    // 특수문자 검사 (백엔드에서 요구하는 경우)
    const hasSpecialChar = /[@$!%*#?&]/.test(signupPassword);
    if (!hasSpecialChar) {
      setFormError('비밀번호에는 최소 1개의 특수문자(@$!%*#?&)가 포함되어야 합니다.');
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
                <OAuthButton
                  provider="google"
                  onClick={handleSocialLogin}
                  disabled={loading || socialLoading !== null}
                  loading={socialLoading === 'google'}
                  size="medium"
                />
                <OAuthButton
                  provider="kakao"
                  onClick={handleSocialLogin}
                  disabled={loading || socialLoading !== null}
                  loading={socialLoading === 'kakao'}
                  size="medium"
                />
                <OAuthButton
                  provider="naver"
                  onClick={handleSocialLogin}
                  disabled={loading || socialLoading !== null}
                  loading={socialLoading === 'naver'}
                  size="medium"
                />
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
                <small className={styles.fieldHint}>8자 이상, 문자, 숫자, 특수문자(@$!%*#?&)를 포함해야 합니다.</small>
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