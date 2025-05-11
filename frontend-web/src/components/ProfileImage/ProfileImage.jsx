import React from 'react';
import styles from './ProfileImage.module.css';

/**
 * 프로필 이미지 컴포넌트
 * @param {Object} props
 * @param {string|null} props.imageUrl - 프로필 이미지 URL (없으면 기본 이미지 사용)
 * @param {string} props.alt - 이미지 대체 텍스트
 * @param {string} props.size - 이미지 크기 ('small', 'medium', 'large')
 * @param {Function} props.onClick - 이미지 클릭 핸들러
 * @returns {JSX.Element}
 */
const ProfileImage = ({ 
  imageUrl = null, 
  alt = '프로필 이미지', 
  size = 'medium',
  onClick = null
}) => {
  // 기본 프로필 이미지 경로
  const defaultImagePath = '/assets/images/default-profile.png';
  
  // 이미지 로드 오류 처리
  const handleImageError = (e) => {
    console.warn('프로필 이미지 로드 중 오류 발생:', e);
    e.target.src = defaultImagePath;
  };
  
  // 이미지 URL이 없거나 유효하지 않은 경우 기본 이미지 사용
  const imageSrc = imageUrl || defaultImagePath;

  return (
    <div 
      className={`${styles.profileImageContainer} ${styles[size]}`}
      onClick={onClick}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={styles.profileImage}
        onError={handleImageError}
      />
    </div>
  );
};

export default ProfileImage;