import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // 임시 계정 확인 (admin/1111)
    if (loginUsername === 'admin' && loginPassword === '1111') {
      // 로그인 성공 처리
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', loginUsername);
      alert('로그인 성공!');
      navigate('/');
    } else {
      // 로그인 실패 처리
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };
  
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
    // 회원가입 처리 (서버가 없으므로 메시지만 표시)
    alert(`회원가입 정보가 전송되었습니다:\n이메일: ${signupEmail}\n아이디: ${signupUsername}`);
    
    // 로그인 탭으로 전환
    setActiveTab('login');
  };
  
  const handleOAuthClick = (provider) => {
    alert(`${provider} 계정으로 로그인을 시도합니다. (서버 연동 필요)`);
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
          
          <div className={styles.authForm} style={{ display: activeTab === 'login' ? 'block' : 'none' }}>
            <h2>로그인</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="login-username">아이디</label>
                <input 
                  type="text" 
                  id="login-username" 
                  name="username" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required 
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
                />
              </div>
              <button type="submit" className={styles.authButton}>로그인</button>
            </form>
            
            <div className={styles.oauthContainer}>
              <p>또는 소셜 계정으로 로그인</p>
              <div className={styles.oauthButtons}>
                <button 
                  className={`${styles.oauthButton} ${styles.google}`}
                  onClick={() => handleOAuthClick('Google')}
                >
                  G
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.facebook}`}
                  onClick={() => handleOAuthClick('Facebook')}
                >
                  f
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.naver}`}
                  onClick={() => handleOAuthClick('Naver')}
                >
                  N
                </button>
                <button 
                  className={`${styles.oauthButton} ${styles.kakao}`}
                  onClick={() => handleOAuthClick('Kakao')}
                >
                  K
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
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="signup-username">아이디</label>
                <input 
                  type="text" 
                  id="signup-username" 
                  name="username" 
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required 
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
                />
              </div>
              <button type="submit" className={styles.authButton}>회원가입</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;