import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import ProfileImage from '../ProfileImage/ProfileImage';
import useAuth from '../../hooks/useAuth';
import logoImage from '../../assets/images/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  
  useEffect(() => {
    // 인증 컨텍스트에서 사용자 이름 가져오기
    if (isLoggedIn && user) {
      setUsername(user.nickname || '사용자');
    }
  }, [isLoggedIn, user]);
  
  // 프로필 메뉴 토글
  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };
  
  // 프로필 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      await logout();
      alert('로그아웃 되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };
  
  // 프로필 수정 페이지로 이동
  const handleEditProfile = () => {
    setShowProfileMenu(false);
    navigate('/mypage/profile');
  };
  
  // 마이페이지로 이동
  const handleMyPage = () => {
    setShowProfileMenu(false);
    navigate('/mypage');
  };

  return (
    <nav className={styles.navbar}>
      {/* 좌측: 로고 + 메뉴 */}
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logoLink}>
            <img 
              src={logoImage}
              alt="로고" 
              className={styles.logoImage}
              onLoad={() => console.log('로고 이미지 로드 성공')}
              onError={(e) => {
                console.log('로고 이미지 로드 실패');
              }}
            />
            경기 요리왕
          </Link>
        </div>
        
        {/* 로그인된 경우에만 메뉴 표시 */}
        {isLoggedIn && (
          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <Link to="/">메뉴</Link>
              <div className={styles.dropdown}>
                <Link to="/">음식 분석하기</Link>
                <Link to="/recipe-suggest">재료로 찾기</Link>
                <Link to="/rate-recipe">리뷰 관리</Link>
              </div>
            </li>
          </ul>
        )}
      </div>

      {/* 우측: 사용자 메뉴 */}
      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <div className={styles.navItem}>
            <div className={styles.profileContainer} ref={profileMenuRef}>
              <div className={styles.profileButton} onClick={toggleProfileMenu}>
                <div className={styles.profileImageWrapper}>
                  <ProfileImage 
                    imageUrl={user?.profile_image_url}
                    alt={username}
                    size="small"
                  />
                </div>
                <span className={styles.username}>{username}</span>
                <span className={styles.dropdownArrow}>▼</span>
              </div>
              
              {showProfileMenu && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileMenuHeader}>
                    <div className={styles.profileMenuImageWrapper}>
                      <ProfileImage 
                        imageUrl={user?.profile_image_url}
                        alt={username}
                        size="medium"
                      />
                    </div>
                    <div className={styles.profileMenuInfo}>
                      <p className={styles.profileName}>{username}</p>
                      <p className={styles.profileEmail}>{user?.email}</p>
                    </div>
                  </div>
                  <div className={styles.profileMenuItems}>
                    <button className={styles.profileMenuItem} onClick={handleMyPage}>
                      <i className={styles.icon}>👤</i> 마이페이지
                    </button>
                    <button className={styles.profileMenuItem} onClick={handleEditProfile}>
                      <i className={styles.icon}>⚙️</i> 프로필 수정
                    </button>
                    <button className={styles.profileMenuItem} onClick={handleLogout}>
                      <i className={styles.icon}>🚪</i> 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.navItem}>
            <Link to="/login">로그인</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;