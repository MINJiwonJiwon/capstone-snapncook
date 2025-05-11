import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProfileImage from '../../components/ProfileImage/ProfileImage';
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
  
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // 파일 입력을 위한 ref
  const fileInputRef = useRef(null);
  
  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setProfileImageUrl(user.profile_image_url || null);
      setPreviewImageUrl(user.profile_image_url || null);
    }
  }, [isLoggedIn, user, navigate]);

  // 에러 및 성공 메시지 초기화
  const resetMessages = () => {
    setFormError('');
    setFormSuccess('');
    clearMessages();
  };
  
  // 프로필 이미지 클릭 시 파일 선택 다이얼로그 열기
  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };
  
  // 프로필 이미지 변경
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setFormError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    // 파일 미리보기 생성
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setPreviewImageUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
    
    // TODO: 파일 업로드 API 연동
    // 실제 구현 시에는 FormData를 사용하여 서버에 업로드하고, 
    // 반환된 URL을 setProfileImageUrl에 설정해야 함
    // 이 예제에서는 미리보기 URL을 사용
  };
  
  // 폼 제출 시 API 호출
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    
    // 프로필 정보와 비밀번호 변경 처리 분리
    const hasProfileChanges = 
      nickname !== user?.nickname || 
      email !== user?.email || 
      previewImageUrl !== user?.profile_image_url;
    
    const hasPasswordChanges = password && newPassword && confirmPassword;
    
    // 비밀번호 변경이 있는 경우 검증
    if (hasPasswordChanges) {
      await handlePasswordSubmit();
    }

    // 프로필 정보 변경이 있는 경우 처리
    if (hasProfileChanges) {
      await handleProfileSubmit();
    }

    // 변경사항이 없는 경우
    if (!hasProfileChanges && !hasPasswordChanges) {
      setFormError('변경할 내용이 없습니다.');
    }
  };

  // 프로필 정보 변경 처리
  const handleProfileSubmit = async () => {
    try {
      // 사용자 정보 업데이트
      const updatedInfo = {};
      
      // 사용자 이름이 변경되었는지 확인
      if (nickname !== user?.nickname) {
        updatedInfo.nickname = nickname;
      }
      
      // 이메일이 변경되었는지 확인
      if (email !== user?.email) {
        updatedInfo.email = email;
      }
      
      // 프로필 이미지가 변경되었는지 확인
      if (previewImageUrl !== user?.profile_image_url) {
        // 실제 구현 시에는 이미 업로드된 이미지의 URL을 사용
        updatedInfo.profile_image_url = previewImageUrl;
      }
      
      // 변경된 정보가 있을 경우에만 업데이트
      if (Object.keys(updatedInfo).length > 0) {
        await updateUserInfo(updatedInfo);
        
        // 사용자 정보 새로고침
        await refreshUserInfo();
        setFormSuccess('프로필 정보가 성공적으로 업데이트되었습니다.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setFormError(err.message || '프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 변경 처리
  const handlePasswordSubmit = async () => {
    // 유효성 검사
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
    if (newPassword) {
      // 최소 8자, 하나 이상의 문자와 숫자 포함 검사
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setFormError('비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.');
        return;
      }
    }
    
    try {
      // 비밀번호 변경 API 호출 - new_password_check 추가
      await changePassword({
        current_password: password,
        new_password: newPassword,
        new_password_check: confirmPassword // 새 비밀번호 확인 필드 추가
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
        
        {formError && (
          <div className={styles.errorMessage}>
            {formError}
          </div>
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {(formSuccess || success) && (
          <div className={styles.successMessage}>
            {formSuccess || success}
          </div>
        )}
        
        <div className={styles.profileImageSection}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleProfileImageChange}
            style={{ display: 'none' }}
          />
          <ProfileImage 
            imageUrl={previewImageUrl}
            alt={nickname || '사용자'}
            size="large"
            onClick={handleProfileImageClick}
          />
          <p className={styles.imageHint}>
            클릭하여 프로필 이미지 변경
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              disabled={loading}
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
      </div>
      
      <Footer />
    </>
  );
};

export default ProfileEdit;