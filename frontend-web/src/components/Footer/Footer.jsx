import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBottom}>
        &copy; 2025 음식 레시피 찾기 | 모든 권리 보유
      </div>
    </footer>
  );
};

export default Footer;