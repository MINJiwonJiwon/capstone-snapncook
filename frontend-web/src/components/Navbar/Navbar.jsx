import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    // 인증 컨텍스트에서 사용자 이름 가져오기
    if (isLoggedIn && user) {
      setUsername(user.nickname || '사용자');
    }
  }, [isLoggedIn, user]);
  
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

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink}>음식 레시피 찾기</Link>
      </div>
      <ul className={styles.navLinks}>
        {/* 로그인된 경우에만 '메뉴' 표시 */}
        {isLoggedIn && (
          <li className={styles.navItem}>
            <Link to="/">메뉴</Link>
            <div className={styles.dropdown}>
              <Link to="/function1">재료로 찾기</Link>
              <Link to="/function2">리뷰 관리</Link>
              <Link to="/function3">기능3</Link>
            </div>
          </li>
        )}
        
        {isLoggedIn ? (
          <>
            <li className={styles.navItem}>
              <Link to="/mypage">마이페이지</Link>
              <div className={styles.dropdown}>
                <Link to="/mypage/favorites">즐겨찾기</Link>
                <Link to="/mypage/uploads">업로드 내역</Link>
                <Link to="/mypage/profile">내 정보 수정</Link>
              </div>
            </li>
            <li className={styles.navItem}>
              <span>안녕하세요, {username}님</span>
            </li>
            <li className={styles.navItem}>
              <a href="#" onClick={handleLogout}>로그아웃</a>
            </li>
          </>
        ) : (
          <li className={styles.navItem}>
            <Link to="/login">로그인</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
