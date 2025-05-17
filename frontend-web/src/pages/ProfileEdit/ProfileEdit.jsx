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
  
  // 필드별 오류 메시지 상태
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

  // 에러 및 성공 메시지 초기화
  const resetMessages = () => {
    setFormError('');
    setFormSuccess('');
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
  
  // 오류 메시지 변환 함수 - 비밀번호 변경
  const getPasswordErrorMessage = (error, status) => {
    // 문자열 패턴 매칭
    if (typeof error === 'string') {
      if (error.includes('Current password is incorrect')) {
        return '현재 비밀번호가 올바르지 않습니다.';
      }
      if (error.includes('same as')) {
        return '새 비밀번호는 이전 비밀번호와 달라야 합니다.';
      }
      if (error.includes('password') && error.includes('match')) {
        return '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
      }
      if (error.includes('password') && (error.includes('character') || error.includes('digit') || error.includes('letter'))) {
        return '비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.';
      }
      if (error.includes('password') && error.includes('weak')) {
        return '보안에 취약한 비밀번호입니다. 더 강력한 비밀번호를 사용해주세요.';
      }
      if (error.includes('password') && error.includes('common')) {
        return '너무 흔한 비밀번호입니다. 더 독특한 비밀번호를 사용해주세요.';
      }
      
      // 그 외 알 수 있는 오류는 그대로 표시
      return error;
    }
    
    // HTTP 상태 코드 기반 메시지
    if (status) {
      switch (status) {
        case 400:
          return '비밀번호 변경 요청이 올바르지 않습니다.';
        case 401:
          return '인증에 실패했습니다. 다시 로그인해주세요.';
        case 403:
          return '비밀번호 변경 권한이 없습니다.';
        case 422:
          return '비밀번호가 유효하지 않습니다. 입력한 정보를 확인해주세요.';
        case 500:
        case 502:
        case 503:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return '비밀번호 변경 중 오류가 발생했습니다.';
      }
    }
    
    return '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
  };
  
  // 오류 메시지 변환 함수 - 프로필 정보 수정
  const getProfileErrorMessage = (error, status) => {
    // 문자열 패턴 매칭
    if (typeof error === 'string') {
      if (error.includes('email') && error.includes('already')) {
        return '이미 등록된 이메일입니다.';
      }
      if (error.includes('nickname') && error.includes('already')) {
        return '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.';
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
      if (error.includes('image') && error.includes('size')) {
        return '이미지 크기가 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.';
      }
      if (error.includes('image') && error.includes('format') || error.includes('type')) {
        return '지원되지 않는 이미지 형식입니다. JPG, PNG, GIF 형식을 사용해주세요.';
      }
      
      // 그 외 알 수 있는 오류는 그대로 표시
      return error;
    }
    
    // HTTP 상태 코드 기반 메시지
    if (status) {
      switch (status) {
        case 400:
          return '프로필 수정 요청이 올바르지 않습니다.';
        case 401:
          return '인증에 실패했습니다. 다시 로그인해주세요.';
        case 403:
          return '프로필 수정 권한이 없습니다.';
        case 409:
          return '중복된 정보가 있습니다. 다른 이메일이나 닉네임을 사용해주세요.';
        case 413:
          return '파일 크기가 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.';
        case 415:
          return '지원되지 않는 파일 형식입니다.';
        case 422:
          return '입력한 정보가 유효하지 않습니다. 양식을 확인해주세요.';
        case 500:
        case 502:
        case 503:
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return '프로필 수정 중 오류가 발생했습니다.';
      }
    }
    
    return '프로필 수정에 실패했습니다. 다시 시도해주세요.';
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
      return;
    }
    
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
      
      // 오류 응답에 따른 메시지 구분 처리
      if (err.response) {
        const { status, data } = err.response;
        
        // 필드별 오류 메시지 처리
        if (data.detail && typeof data.detail === 'object') {
          // 필드별 오류 메시지가 있는 경우
          const newErrors = { ...fieldErrors };
          
          if (data.detail.email) {
            newErrors.email = getProfileErrorMessage(data.detail.email, status);
          }
          
          if (data.detail.nickname) {
            newErrors.nickname = getProfileErrorMessage(data.detail.nickname, status);
          }
          
          if (data.detail.profile_image_url) {
            newErrors.profileImage = getProfileErrorMessage(data.detail.profile_image_url, status);
          }
          
          setFieldErrors(newErrors);
          
          // 일반 오류 메시지도 표시
          setFormError('프로필 업데이트 중 오류가 발생했습니다. 입력 내용을 확인해주세요.');
        } else if (Array.isArray(data.detail)) {
          // 배열 형태의 오류 메시지
          const errorMessages = data.detail.map(error => 
            typeof error === 'string' ? error : error.msg || JSON.stringify(error)
          ).join('\n');
          setFormError(getProfileErrorMessage(errorMessages, status));
        } else if (typeof data.detail === 'string') {
          // 문자열 형태의 오류 메시지
          setFormError(getProfileErrorMessage(data.detail, status));
        } else {
          // 상태 코드 기반 메시지
          setFormError(getProfileErrorMessage(null, status));
        }
      } else {
        // 네트워크 오류 등
        setFormError('서버에 연결할 수 없습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.');
      }
    }
  };

  // 비밀번호 변경 처리
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
  if (newPassword !== confirmPassword) {
    newFieldErrors.confirmPassword = '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
    hasErrors = true;
  }
  
  // 비밀번호와 현재 비밀번호가 같은 경우 추가 검사
  if (password === newPassword && password.trim() !== '') {
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
    return;
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
    
    setFormSuccess('비밀번호가 성공적으로 변경되었습니다.');
  } catch (err) {
    console.error('Password change error:', err);
    
    // 1-10 이슈 해결: ProfileEdit 컴포넌트에서 오류 메시지 표시 개선
    // 이미 useUser.js에서 사용자 친화적인 메시지로 변환된 err.message만 사용
    // err.response 등의 기술적 메시지는 사용하지 않음
    
    // 직접적인 에러 메시지가 있는 경우 표시
    if (err.message) {
      // 현재 비밀번호 불일치 (1-9 이슈)
      if (err.message.includes('현재 비밀번호가 일치하지 않습니다')) {
        setFieldErrors(prev => ({
          ...prev,
          password: '현재 비밀번호가 일치하지 않습니다.'
        }));
        return;
      }
      
      // 비밀번호 조건 미달 (1-10 이슈)
      if (err.message.includes('비밀번호는 8자 이상이며')) {
        setFieldErrors(prev => ({
          ...prev,
          newPassword: '비밀번호는 8자 이상이며, 숫자와 특수문자(@$!%*#?&)를 포함해야 합니다.'
        }));
        return;
      }
      
      // 새 비밀번호 불일치
      if (err.message.includes('새 비밀번호가 일치하지 않습니다')) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.'
        }));
        return;
      }
      
      // 그 외 오류 메시지는 그대로 표시
      setFormError(err.message);
    } else {
      // 기본 오류 메시지
      setFormError('비밀번호 변경 중 오류가 발생했습니다. 입력 내용을 확인해주세요.');
    }
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