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
    clearMessages
  } = useUser();
  
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  
  // 1-9, 1-10 이슈 해결: 전역 메시지와 필드별 오류를 명확히 분리
  const [globalMessage, setGlobalMessage] = useState({ type: null, text: '' }); // success, error, null
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    nickname: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: ''
  });
  
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

  // 1-9, 1-10 이슈 해결: 메시지 초기화 함수 개선
  const resetMessages = () => {
    setGlobalMessage({ type: null, text: '' });
    setFieldErrors({
      email: '',
      nickname: '',
      password: '',
      newPassword: '',
      confirmPassword: '',
      profileImage: ''
    });
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
    
    // 필드 오류 초기화
    setFieldErrors(prev => ({
      ...prev,
      profileImage: ''
    }));
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setFieldErrors(prev => ({
        ...prev,
        profileImage: '이미지 파일만 업로드할 수 있습니다.'
      }));
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(prev => ({
        ...prev,
        profileImage: '이미지 크기는 5MB 이하여야 합니다.'
      }));
      return;
    }
    
    // 파일 미리보기 생성
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      setPreviewImageUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
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
    
    // 변경사항이 없는 경우
    if (!hasProfileChanges && !hasPasswordChanges) {
      setGlobalMessage({ type: 'error', text: '변경할 내용이 없습니다.' });
      return;
    }

    let profileSuccess = false;
    let passwordSuccess = false;

    // 비밀번호 변경 처리
    if (hasPasswordChanges) {
      passwordSuccess = await handlePasswordSubmit();
    }

    // 프로필 정보 변경 처리
    if (hasProfileChanges) {
      profileSuccess = await handleProfileSubmit();
    }

    // 성공 메시지 표시
    if (profileSuccess && passwordSuccess) {
      setGlobalMessage({ type: 'success', text: '프로필 정보와 비밀번호가 성공적으로 변경되었습니다.' });
    } else if (profileSuccess) {
      setGlobalMessage({ type: 'success', text: '프로필 정보가 성공적으로 업데이트되었습니다.' });
    } else if (passwordSuccess) {
      setGlobalMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
    }
  };

  // 프로필 정보 변경 처리
  const handleProfileSubmit = async () => {
    // 필드별 유효성 검사
    let hasErrors = false;
    const newFieldErrors = { ...fieldErrors };
    
    // 이메일 형식 검사
    if (email && email !== user?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newFieldErrors.email = '올바른 이메일 형식이 아닙니다.';
        hasErrors = true;
      }
    }
    
    // 닉네임 길이 검사
    if (nickname && nickname !== user?.nickname) {
      if (nickname.length < 2 || nickname.length > 20) {
        newFieldErrors.nickname = '닉네임은 2자 이상, 20자 이하로 입력해주세요.';
        hasErrors = true;
      }
    }
    
    // 오류가 있으면 상태 업데이트 후 중단
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return false;
    }
    
    try {
      // 사용자 정보 업데이트
      const updatedInfo = {};
      
      if (nickname !== user?.nickname) {
        updatedInfo.nickname = nickname;
      }
      
      if (email !== user?.email) {
        updatedInfo.email = email;
      }
      
      if (previewImageUrl !== user?.profile_image_url) {
        updatedInfo.profile_image_url = previewImageUrl;
      }
      
      // 변경된 정보가 있을 경우에만 업데이트
      if (Object.keys(updatedInfo).length > 0) {
        await updateUserInfo(updatedInfo);
        await refreshUserInfo();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Profile update error:', err);
      
      // 오류 응답에 따른 메시지 구분 처리
      if (err.response) {
        const { status, data } = err.response;
        
        // 필드별 오류 메시지 처리
        if (data.detail && typeof data.detail === 'object') {
          const newErrors = { ...fieldErrors };
          
          if (data.detail.email) {
            newErrors.email = data.detail.email;
          }
          
          if (data.detail.nickname) {
            newErrors.nickname = data.detail.nickname;
          }
          
          if (data.detail.profile_image_url) {
            newErrors.profileImage = data.detail.profile_image_url;
          }
          
          setFieldErrors(newErrors);
        } else if (typeof data.detail === 'string') {
          // 전역 오류로 표시 (필드 구분이 어려운 경우)
          setGlobalMessage({ type: 'error', text: data.detail });
        } else {
          setGlobalMessage({ type: 'error', text: '프로필 업데이트 중 오류가 발생했습니다.' });
        }
      } else {
        setGlobalMessage({ type: 'error', text: '서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.' });
      }
      
      return false;
    }
  };

  // 1-9, 1-10 이슈 해결: 비밀번호 변경 처리 개선
  const handlePasswordSubmit = async () => {
    // 필드별 유효성 검사
    let hasErrors = false;
    const newFieldErrors = { ...fieldErrors };
    
    // 현재 비밀번호 입력 확인
    if (!password.trim()) {
      newFieldErrors.password = '현재 비밀번호를 입력해주세요.';
      hasErrors = true;
    }
    
    // 새 비밀번호 입력 확인
    if (!newPassword.trim()) {
      newFieldErrors.newPassword = '새 비밀번호를 입력해주세요.';
      hasErrors = true;
    }
    
    // 새 비밀번호 확인 입력 확인
    if (!confirmPassword.trim()) {
      newFieldErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
      hasErrors = true;
    }
    
    // 비밀번호 일치 확인
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newFieldErrors.confirmPassword = '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
      hasErrors = true;
    }
    
    // 현재 비밀번호와 새 비밀번호가 같은 경우
    if (password && newPassword && password === newPassword) {
      newFieldErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
      hasErrors = true;
    }
    
    // 비밀번호 복잡성 검사
    if (newPassword.trim() !== '') {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        newFieldErrors.newPassword = '비밀번호는 최소 8자 이상이며, 문자와 숫자를 포함해야 합니다.';
        hasErrors = true;
      }
    }
    
    // 오류가 있으면 상태 업데이트 후 중단
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return false;
    }
    
    try {
      // 비밀번호 변경 API 호출
      await changePassword({
        current_password: password,
        new_password: newPassword,
        new_password_check: confirmPassword
      });
      
      // 폼 초기화
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      return true;
    } catch (err) {
      console.error('Password change error:', err);
      
      // 1-9, 1-10 이슈 해결: 필드별 오류 메시지만 표시, 전역 오류는 사용하지 않음
      if (err.message) {
        // 1-9 이슈: 현재 비밀번호 불일치
        if (err.message.includes('현재 비밀번호가 일치하지 않습니다')) {
          setFieldErrors(prev => ({
            ...prev,
            password: '현재 비밀번호가 일치하지 않습니다.'
          }));
          return false;
        }
        
        // 1-10 이슈: 비밀번호 조건 미달
        if (err.message.includes('비밀번호는 8자 이상이며')) {
          setFieldErrors(prev => ({
            ...prev,
            newPassword: '비밀번호는 8자 이상이며, 숫자와 특수문자(@$!%*#?&)를 포함해야 합니다.'
          }));
          return false;
        }
        
        // 새 비밀번호 불일치
        if (err.message.includes('새 비밀번호가 일치하지 않습니다')) {
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.'
          }));
          return false;
        }
        
        // 기타 오류는 전역 메시지로 표시 (필드 구분이 어려운 경우만)
        if (err.message.includes('로그인') || err.message.includes('서버') || err.message.includes('네트워크')) {
          setGlobalMessage({ type: 'error', text: err.message });
          return false;
        }
        
        // 필드를 특정할 수 없는 비밀번호 관련 오류는 새 비밀번호 필드에 표시
        setFieldErrors(prev => ({
          ...prev,
          newPassword: err.message
        }));
      } else {
        // 예상치 못한 오류
        setGlobalMessage({ type: 'error', text: '비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
      }
      
      return false;
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
        
        {/* 1-9, 1-10 이슈 해결: 전역 메시지 표시 개선 */}
        {globalMessage.text && (
          <div className={globalMessage.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {globalMessage.text}
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
          {fieldErrors.profileImage && (
            <p className={styles.fieldError}>{fieldErrors.profileImage}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldErrors.email ? styles.inputError : ''}
              required
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={fieldErrors.nickname ? styles.inputError : ''}
              required
              disabled={loading}
            />
            {fieldErrors.nickname && (
              <p className={styles.fieldError}>{fieldErrors.nickname}</p>
            )}
            <small className={styles.fieldHint}>2~20자 사이로 입력해주세요.</small>
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
              className={fieldErrors.password ? styles.inputError : ''}
              disabled={loading}
            />
            {/* 1-9 이슈 해결: 현재 비밀번호 오류는 필드 하단에만 표시 */}
            {fieldErrors.password && (
              <p className={styles.fieldError}>{fieldErrors.password}</p>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="new-password">새 비밀번호</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={fieldErrors.newPassword ? styles.inputError : ''}
              disabled={loading}
            />
            {/* 1-10 이슈 해결: 새 비밀번호 조건 오류는 필드 하단에만 표시 */}
            {fieldErrors.newPassword && (
              <p className={styles.fieldError}>{fieldErrors.newPassword}</p>
            )}
            <small className={styles.fieldHint}>비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.</small>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={fieldErrors.confirmPassword ? styles.inputError : ''}
              disabled={loading}
            />
            {fieldErrors.confirmPassword && (
              <p className={styles.fieldError}>{fieldErrors.confirmPassword}</p>
            )}
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