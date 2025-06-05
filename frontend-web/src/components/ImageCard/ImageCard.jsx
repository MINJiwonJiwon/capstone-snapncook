import React from 'react';
import styles from './ImageCard.module.css';

/**
 * 공통 이미지 카드 컴포넌트
 * Home.jsx와 MyPage.jsx에서 동일하게 사용
 */
const ImageCard = ({ 
  imageUrl, 
  foodName, 
  confidence, 
  onClick, 
  showFavorite = false, 
  isFavorite = false, 
  onFavoriteClick,
  showConfidence = false,
  size = 'medium' // 'medium', 'large'
}) => {
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(imageUrl, foodName);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (onFavoriteClick) {
      onFavoriteClick();
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/assets/images/default-food.svg';
  };

  return (
    <div 
      className={`${styles.imageCard} ${styles[size]}`}
      onClick={handleCardClick}
    >
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl || '/assets/images/default-food.svg'} 
          alt={foodName || '음식 이미지'} 
          onError={handleImageError}
        />
        
        {/* 즐겨찾기 버튼 */}
        {showFavorite && (
          <button 
            className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            ♥
          </button>
        )}
      </div>
      
      {/* 이미지 정보 */}
      <div className={styles.imageInfo}>
        <h4>{foodName || '음식 이미지'}</h4>
        {showConfidence && confidence && (
          <p>정확도: {Math.round(confidence * 100)}%</p>
        )}
      </div>
    </div>
  );
};

export default ImageCard;