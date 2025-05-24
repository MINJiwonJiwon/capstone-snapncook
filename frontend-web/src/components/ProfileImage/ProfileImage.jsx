import React, { useState } from 'react';
import styles from './ProfileImage.module.css';

/**
 * 프로필 이미지 컴포넌트 - 개선된 버전
 * @param {Object} props
 * @param {string|null} props.imageUrl - 프로필 이미지 URL (없으면 이니셜 표시)
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
  
  // 이미지 로드 상태 관리
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageSrc, setImageSrc] = useState(imageUrl || defaultImagePath);
  
  // 이미지 로드 성공 처리
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  // 이미지 로드 오류 처리
  const handleImageError = () => {
    console.warn('프로필 이미지 로드 실패:', imageSrc);
    setImageLoaded(false);
    
    // 기본 이미지로 재시도하지 않음 (무한 로드 방지)
    if (imageSrc !== defaultImagePath) {
      setImageSrc(defaultImagePath);
    } else {
      // 기본 이미지마저 로드 실패하면 이미지 표시 중단
      setImageLoaded(false);
    }
  };
  
  // 사용자 이니셜 생성 (이름이 없으면 '?'를 사용)
  const getInitials = () => {
    if (!alt || alt === '프로필 이미지' || typeof alt !== 'string') {
      return '?';
    }
    
    // 공백으로 분리하여 각 단어의 첫 글자 추출
    return alt
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2); // 최대 2글자까지만 사용
  };

  return (
    <div 
      className={`${styles.profileImageContainer} ${styles[size]}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {imageLoaded && imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className={styles.profileImage}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className={styles.initialsContainer}>
          <span className={styles.initials}>{getInitials()}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;