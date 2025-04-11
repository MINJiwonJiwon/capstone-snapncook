import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './MyPage.module.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [imageHistory, setImageHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    // 로컬 스토리지에서 이미지 히스토리 가져오기
    const storedHistory = JSON.parse(localStorage.getItem('imageHistory')) || [];
    setImageHistory(storedHistory);
    
    // 로컬 스토리지에서 즐겨찾기 목록 가져오기
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);
  
  const toggleFavorite = (imageUrl) => {
    let newFavorites;
    
    if (favorites.includes(imageUrl)) {
      // 즐겨찾기 제거
      newFavorites = favorites.filter(url => url !== imageUrl);
    } else {
      // 즐겨찾기 추가
      newFavorites = [...favorites, imageUrl];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  
  const handleImageClick = (imageUrl) => {
    // 선택한 이미지를 현재 이미지로 설정
    sessionStorage.setItem('currentImage', imageUrl);
    navigate('/recipe');
  };
  
  const createGalleryItem = (imageUrl, isFavorite) => {
    // 날짜 생성 (실제로는 이미지 업로드 시점의 날짜를 저장해야 함)
    const date = new Date().toLocaleDateString();
    
    return (
      <div key={imageUrl} className={styles.galleryItem}>
        <img 
          src={imageUrl} 
          alt="업로드 이미지" 
          onClick={() => handleImageClick(imageUrl)} 
        />
        <button 
          className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(imageUrl);
          }}
        >
          ♥
        </button>
        <div className={styles.imageInfo}>
          <h4>음식 이미지</h4>
          <p>{date}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <h1>마이페이지</h1>
        
        {/* 즐겨찾기 섹션 */}
        <div className={styles.favoritesSection}>
          <h2>즐겨찾기한 사진</h2>
          <div className={styles.galleryContainer}>
            {favorites.length === 0 ? (
              <div className={styles.emptyGallery}>즐겨찾기한 사진이 없습니다.</div>
            ) : (
              favorites.map(imageUrl => {
                if (imageHistory.includes(imageUrl)) {
                  return createGalleryItem(imageUrl, true);
                }
                return null;
              })
            )}
          </div>
        </div>
        
        {/* 모든 업로드 사진 섹션 */}
        <div className={styles.uploadsSection}>
          <h2>내가 업로드한 모든 사진</h2>
          <div className={styles.galleryContainer}>
            {imageHistory.length === 0 ? (
              <div className={styles.emptyGallery}>업로드한 사진이 없습니다.</div>
            ) : (
              imageHistory.map(imageUrl => {
                const isFavorite = favorites.includes(imageUrl);
                return createGalleryItem(imageUrl, isFavorite);
              })
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default MyPage;