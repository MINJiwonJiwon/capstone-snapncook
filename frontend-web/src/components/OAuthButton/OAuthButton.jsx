import React from 'react';
import styles from './OAuthButton.module.css';

// src/assets/images/ 폴더의 이미지들을 import
import googleIcon from '../../assets/images/google-icon.png';
import kakaoIcon from '../../assets/images/kakao-icon.png';
import naverIcon from '../../assets/images/naver-icon.png';

/**
 * OAuth 소셜 로그인 버튼 컴포넌트
 * @param {string} provider - 소셜 로그인 제공자 (google, kakao, naver)
 * @param {function} onClick - 클릭 이벤트 핸들러
 * @param {boolean} disabled - 버튼 비활성화 상태
 * @param {boolean} loading - 로딩 상태
 * @param {string} size - 버튼 크기 (small, medium, large)
 */
const OAuthButton = ({ 
  provider, 
  onClick, 
  disabled = false, 
  loading = false,
  size = 'medium'
}) => {
  // 제공자별 설정 (import한 이미지 사용)
  const buttonConfig = {
    google: {
      className: styles.googleButton,
      icon: googleIcon,
      text: 'Google로 계속하기',
      ariaLabel: 'Google 계정으로 로그인',
      fallbackText: 'G'
    },
    kakao: {
      className: styles.kakaoButton,
      icon: kakaoIcon,
      text: '카카오로 계속하기',
      ariaLabel: '카카오 계정으로 로그인',
      fallbackText: 'K'
    },
    naver: {
      className: styles.naverButton,
      icon: naverIcon,
      text: '네이버로 계속하기',
      ariaLabel: '네이버 계정으로 로그인',
      fallbackText: 'N'
    }
  };

  const config = buttonConfig[provider];
  
  if (!config) {
    console.error(`지원하지 않는 OAuth 제공자: ${provider}`);
    return null;
  }

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(provider, e);
  };

  const buttonClasses = [
    styles.oauthButton,
    config.className,
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={config.ariaLabel}
      title={config.text}
    >
      {loading ? (
        <div className={styles.spinner} aria-hidden="true" />
      ) : (
        <img 
          src={config.icon} 
          alt={`${provider} icon`}
          className={styles.buttonIcon}
          onLoad={() => {
            console.log(`✅ ${provider} 이미지 로드 성공`);
          }}
          onError={(e) => {
            console.warn(`❌ ${provider} 이미지 로드 실패, fallback 사용`);
            e.target.style.display = 'none';
            const fallback = e.target.nextElementSibling;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      )}
      
      {/* 이미지 로드 실패 시 fallback 텍스트 */}
      <span 
        className={styles.fallbackText}
        style={{ display: 'none' }}
      >
        {config.fallbackText}
      </span>
    </button>
  );
};

export default OAuthButton;