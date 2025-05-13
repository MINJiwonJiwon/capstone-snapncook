import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login, signup, loading, error } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordCheck, setSignupPasswordCheck] = useState(''); // 비밀번호 확인 필드 추가
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
  
  // 로그인 오류 메시지 매핑 함수
  const getLoginErrorMessage = (error, status) => {
    // 자주 발생하는 오류 패턴 매핑
    if (typeof error === 'string') {
      if (error.includes('Invalid credentials') || error.includes('not found')) {
        return '존재하지 않는 이메일입니다.';
      }
      if (error.includes('Incorrect password')) {
        return '비밀번호가 올바르지 않습니다.';
      }
      if (error.includes('Not authenticated') || error.includes('Invalid token')) {
        return '인증에 실패했습니다. 다시 로그인해주세요.';
      }
      if (error.includes('disabled') || error.includes('inactive')) {
        return '비활성화된 계정입니다. 관리자에게 문의하세요.';
      }
      if (error.includes('too many') || error.includes('limit')) {
        return '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.';
      }
      if (error.includes('banned') || error.includes('suspended')) {
        return '계정이 일시 정지되었습니다. 관리자에게 문의하세요.';
      }
      
      // 그 외 알 수 있는 오류는 그대로 표시
      return error;
    }
    
    // HTTP 상태 코드 기반 메시지
    if (status) {
      switch (status) {
        case 400:
          return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
        case 401:
          return '이메일 또는 비밀번호가 올바르지 않습니다.';
        case 403:
          return '접근이 거부되었습니다. 권한을 확인해주세요.';
        case 404:
          return '해당 계정을 찾을 수 없습니다.';
        case 429:
          return '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
        case 500:
        case 502:
        case 503:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return '로그인 중 오류가 발생했습니다.';
      }
    }
    
    return '로그인에 실패했습니다. 다시 시도해주세요.';
  };
  
  // 회원가입 오류 메시지 매핑 함수
  const getSignupErrorMessage = (error, status) => {
    // 자주 발생하는 회원가입 오류 패턴 매핑
    if (typeof error === 'string') {
      if (error.includes('already registered') || error.includes('already exists')) {
        return '이미 등록된 이메일입니다.';
      }
      if (error.includes('nickname') && (error.includes('already') || error.includes('taken'))) {
        return '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.';
      }
      if (error.includes('password') && error.includes('match')) {
        return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      }
      if (error.includes('password') && error.includes('weak')) {
        return '보안에 취약한 비밀번호입니다. 더 강력한 비밀번호를 사용해주세요.';
      }
      if (error.includes('password') && error.includes('common')) {
        return '너무 흔한 비밀번호입니다. 더 독특한 비밀번호를 사용해주세요.';
      }
      if (error.includes('password') && (error.includes('character') || error.includes('digit') || error.includes('letter'))) {
        return '비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.';
      }
      if (error.includes('email') && error.includes('valid')) {
        return '유효한 이메일 주소를 입력해주세요.';
      }
      if (error.includes('nickname') && error.includes('length')) {
        return '닉네임은 2자 이상, 20자 이하로 입력해주세요.';
      }
      if (error.includes('nickname') && error.includes('character')) {
        return '닉네임에 허용되지 않는 문자가 포함되어 있습니다.';
      }
      
      // 그 외 알 수 있는 오류는 그대로 표시
      return error;
    }
    
    // HTTP 상태 코드 기반 메시지
    if (status) {
      switch (status) {
        case 400:
          return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
        case 409:
          return '이미 등록된 이메일 또는 닉네임입니다.';
        case 422:
          return '입력한 정보가 유효하지 않습니다. 양식을 확인해주세요.';
        case 500:
        case 502:
        case 503:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return '회원가입 중 오류가 발생했습니다.';
      }
    }
    
    return '회원가입에 실패했습니다. 다시 시도해주세요.';
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
      // 향상된 오류 메시지 처리
      if (err.response && err.response.data) {
        const { status, data } = err.response;
        const errorDetail = data.detail;
        
        // 응답 형식에 따른 다양한 처리
        if (typeof errorDetail === 'string') {
          setFormError(getLoginErrorMessage(errorDetail, status));
        } else if (Array.isArray(errorDetail)) {
          // 배열 형태의 오류 메시지
          const errorMessages = errorDetail.map(error => 
            typeof error === 'string' ? error : error.msg || JSON.stringify(error)
          ).join('\n');
          setFormError(errorMessages);
        } else if (typeof errorDetail === 'object') {
          // 객체 형태의 오류 메시지
          const errorMessages = Object.entries(errorDetail)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          setFormError(errorMessages);
        } else {
          // 기타 상태 코드 기반 메시지
          setFormError(getLoginErrorMessage(null, status));
        }
      } else {
        // 네트워크 오류 등
        setFormError('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }
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
      // 향상된 오류 메시지 처리
      if (err.response && err.response.data) {
        const { status, data } = err.response;
        const errorDetail = data.detail;
        
        // 이메일 중복 오류 특별 처리 (400)
        if (status === 400 && typeof errorDetail === 'string' && 
            errorDetail.includes('Email already registered')) {
          setFormError('이미 등록된 이메일입니다.');
          return;
        }
        
        // 응답 형식에 따른 다양한 처리
        if (typeof errorDetail === 'string') {
          setFormError(getSignupErrorMessage(errorDetail, status));
        } else if (Array.isArray(errorDetail)) {
          // 배열 형태의 오류 메시지 (주로 유효성 검사)
          const errorMessages = errorDetail.map(error => 
            typeof error === 'string' ? error : error.msg || JSON.stringify(error)
          ).join('\n');
          setFormError(errorMessages);
        } else if (typeof errorDetail === 'object') {
          // 객체 형태의 오류 메시지
          const errorMessages = Object.entries(errorDetail)
            .map(([key, value]) => {
              // 필드명을 한글로 변환
              const fieldNameMap = {
                'email': '이메일',
                'password': '비밀번호',
                'password_check': '비밀번호 확인',
                'nickname': '닉네임'
              };
              const fieldName = fieldNameMap[key] || key;
              return `${fieldName}: ${value}`;
            })
            .join('\n');
          setFormError(errorMessages);
        } else {
          // 기타 상태 코드 기반 메시지
          setFormError(getSignupErrorMessage(null, status));
        }
      } else {
        // 네트워크 오류 등
        setFormError('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }
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
                {/* 소셜 로그인 링크 방식으로 변경 */}
                <a href="/api/oauth/google/login" className={styles.oauthLink}>
                  <button 
                    className={`${styles.oauthButton} ${styles.google}`}
                    type="button"
                    disabled={loading}
                  >
                    G
                  </button>
                </a>
                <a href="/api/oauth/kakao/login" className={styles.oauthLink}>
                  <button 
                    className={`${styles.oauthButton} ${styles.kakao}`}
                    type="button"
                    disabled={loading}
                  >
                    K
                  </button>
                </a>
                <a href="/api/oauth/naver/login" className={styles.oauthLink}>
                  <button 
                    className={`${styles.oauthButton} ${styles.naver}`}
                    type="button"
                    disabled={loading}
                  >
                    N
                  </button>
                </a>
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