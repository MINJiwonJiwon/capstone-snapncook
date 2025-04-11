import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username');
    
    setIsLoggedIn(loginStatus);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    alert('로그아웃 되었습니다.');
    navigate('/');
  };
  
  const handleClearLoginData = (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    alert('로그인 데이터가 삭제되었습니다.');
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logoLink}>음식 레시피 찾기</Link>
      </div>
      <ul className={styles.navLinks}>
        <li className={styles.navItem}>
          <Link to="/">메뉴</Link>
          <div className={styles.dropdown}>
            <Link to="/function1">기능1</Link>
            <Link to="/function2">기능2</Link>
            <Link to="/function3">기능3</Link>
          </div>
        </li>
        
        {isLoggedIn ? (
          <>
            <li className={styles.navItem}>
              <Link to="/mypage">마이페이지</Link>
              <div className={styles.dropdown}>
                <Link to="/mypage/favorites">즐겨찾기</Link>
                <Link to="/mypage/uploads">업로드 내역</Link>
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
        
        <li className={styles.navItem}>
          <Link to="/" onClick={handleClearLoginData}>로그인 데이터 삭제</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;