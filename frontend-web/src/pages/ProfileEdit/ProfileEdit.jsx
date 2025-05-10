import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './ProfileEdit.module.css';
import useAuth from '../../hooks/useAuth';
import useUser from '../../hooks/useUser';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, refreshUserInfo } = useAuth();
  const { 
    updateUserInfo, 
    changePassword, 
    loading, 
    error, 
    success,
    clearMessages
  } = useUser();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'password'
  
  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setUsername(user.nickname || '');
      setEmail(user.email || '');
    }
  }, [isLoggedIn, user, navigate]);
  
  // 성공/에러 메시지 클리어
  const resetMessages = () => {
    setFormError('');
    setFormSuccess('');
    clearMessages();
  };
  
  // 프로필 수정 폼 제출
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    
    // 기본적인 유효성 검사
    if (!username.trim()) {
      setFormError('닉네임을 입력해주세요.');
      return;
    }
    
    try {
      // 사용자 정보 업데이트
      const updatedInfo = {};
      
      // 사용자 이름이 변경되었는지 확인
      if (username !== user?.nickname) {
        updatedInfo.nickname = username;
      }
      
      // 변경된 정보가 있을 경우에만 업데이트
      if (Object.keys(updatedInfo).length > 0) {
        // 프로필 이미지 URL 포함
        updatedInfo.profile_image_url = user?.profile_image_url;
        
        await updateUserInfo(updatedInfo);
        
        // 사용자 정보 새로고침
        await refreshUserInfo();
        
        setFormSuccess('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        setFormSuccess('변경된 정보가 없습니다.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setFormError(err.message || '프로필 업데이트 중 오류가 발생했습니다.');
    }
  };
  
  // 비밀번호 변경 폼 제출
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    
    // 기본적인 유효성 검사
    if (!password) {
      setFormError('현재 비밀번호를 입력해주세요.');
      return;
    }
    
    if (!newPassword) {
      setFormError('새 비밀번호를 입력해주세요.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setFormError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 비밀번호 복잡성 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setFormError('비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.');
      return;
    }
    
    try {
      // 비밀번호 변경 API 호출
      await changePassword({
        current_password: password,
        new_password: newPassword
      });
      
      // 폼 초기화
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setFormSuccess('비밀번호가 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('Password change error:', err);
      setFormError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  };
  
  const handleCancel = () => {
    navigate('/mypage');
  };

  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <h1>내 정보 수정</h1>
        
        {/* 섹션 선택 탭 */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeSection === 'profile' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveSection('profile');
              resetMessages();
            }}
          >
            프로필 정보
          </button>
          <button 
            className={`${styles.tab} ${activeSection === 'password' ? styles.activeTab : ''}`}
            onClick={() => {
              setActiveSection('password');
              resetMessages();
            }}
          >
            비밀번호 변경
          </button>
        </div>
        
        {/* 오류 메시지 */}
        {(formError || error) && (
          <div className={styles.errorMessage}>
            {formError || error}
          </div>
        )}
        
        {/* 성공 메시지 */}
        {(formSuccess || success) && (
          <div className={styles.successMessage}>
            {formSuccess || success}
          </div>
        )}
        
        {/* 프로필 정보 섹션 */}
        {activeSection === 'profile' && (
          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                disabled={true}
                className={styles.disabledInput}
              />
              <small>이메일은 변경할 수 없습니다.</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="username">닉네임</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장하기'}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </button>
            </div>
          </form>
        )}
        
        {/* 비밀번호 변경 섹션 */}
        {activeSection === 'password' && (
          <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="current-password">현재 비밀번호</label>
              <input
                type="password"
                id="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="new-password">새 비밀번호</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              <small>비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.</small>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirm-password">새 비밀번호 확인</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
              >
                취소
              </button>
            </div>
          </form>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default ProfileEdit;