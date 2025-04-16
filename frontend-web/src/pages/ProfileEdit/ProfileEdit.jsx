import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './ProfileEdit.module.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 가져오기
    const storedUsername = localStorage.getItem('username');
    
    if (storedUsername) {
      setUsername(storedUsername);
      
      // 실제 백엔드 연동 시에는 API 호출로 이메일 등의 정보를 가져와야 함
      // 현재는 임시로 localStorage에서 가져오거나 기본값 설정
      setEmail(localStorage.getItem('userEmail') || `${storedUsername}@example.com`);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // 기본적인 유효성 검사
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 변경 없이 기본 정보만 변경하는 경우
    if (!newPassword && !password) {
      updateUserInfo();
      return;
    }
    
    // 비밀번호 변경을 포함한 경우 현재 비밀번호 확인 필요
    if (!password) {
      setErrorMessage('현재 비밀번호를 입력해주세요.');
      return;
    }
    
    // 현재 비밀번호 검증 (실제 구현 시 백엔드 API 호출 필요)
    // 임시로 비밀번호는 'password'로 가정
    if (password === 'password') {
      updateUserInfo();
    } else {
      setErrorMessage('현재 비밀번호가 올바르지 않습니다.');
    }
  };
  
  const updateUserInfo = () => {
    setIsLoading(true);
    
    // 실제 구현 시 이 부분은 백엔드 API 호출로 대체
    // 현재는 localStorage만 업데이트
    setTimeout(() => {
      localStorage.setItem('username', username);
      localStorage.setItem('userEmail', email);
      
      if (newPassword) {
        // 실제 구현 시 비밀번호 업데이트 로직 필요
        console.log('비밀번호가 변경되었습니다.');
      }
      
      setIsLoading(false);
      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
      
      // 폼 초기화
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000); // 백엔드 API 호출을 시뮬레이션하기 위한 지연
  };
  
  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <h1>내 정보 수정</h1>
        
        {errorMessage && (
          <div className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <hr className={styles.divider} />
          
          <h2>비밀번호 변경</h2>
          <p className={styles.helperText}>비밀번호를 변경하지 않으려면 아래 필드를 비워두세요.</p>
          
          <div className={styles.formGroup}>
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              type="password"
              id="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => navigate('/mypage')}
              disabled={isLoading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
      
      <Footer />
    </>
  );
};

export default ProfileEdit;