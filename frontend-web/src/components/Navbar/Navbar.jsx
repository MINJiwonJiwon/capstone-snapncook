import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = ({ setIsLoggedIn }) => {  // props로 setIsLoggedIn 받기
  const [isLoggedInNav, setIsLoggedInNav] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    
    setIsLoggedInNav(loginStatus);
    if (setIsLoggedIn) {  // Home.jsx에서 전달받은 setIsLoggedIn이 있을 경우
      setIsLoggedIn(loginStatus);
    }
    
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [setIsLoggedIn]);
  
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // 로그아웃 시 이미지 히스토리 초기화
    localStorage.removeItem('imageHistory');
    sessionStorage.removeItem('currentImage');
    
    setIsLoggedInNav(false);
    setUsername('');
    
    // Home 컴포넌트의 상태도 업데이트
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink}>음식 레시피 찾기</Link>
      </div>
      <ul className={styles.navLinks}>
        {/* 로그인된 경우에만 '메뉴' 표시 */}
        {isLoggedInNav && (
          <li className={styles.navItem}>
            <Link to="/">메뉴</Link>
            <div className={styles.dropdown}>
              <Link to="/function1">기능1</Link>
              <Link to="/function2">기능2</Link>
              <Link to="/function3">기능3</Link>
            </div>
          </li>
        )}
        
        {isLoggedInNav ? (
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