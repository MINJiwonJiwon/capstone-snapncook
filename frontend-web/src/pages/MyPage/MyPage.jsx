import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarWithAPI from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './MyPage.module.css';
import useAuth from '../../hooks/useAuth';
import useBookmark from '../../hooks/useBookmark';
import { getMyDetectionResults } from '../../api/detection';
import { getMypageSummary } from '../../api/mypage';

const MyPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { bookmarks, fetchMyBookmarks, removeBookmark } = useBookmark();
  
  const [detectionResults, setDetectionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState(null);
  
  // 로그인 상태 확인 및 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    loadMyPageData();
  }, [isLoggedIn, navigate]);
  
  // 마이페이지 데이터 로드
  const loadMyPageData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 마이페이지 요약 정보 가져오기
      const summaryData = await getMypageSummary();
      setPageData(summaryData);
      
      // 북마크 목록 가져오기
      await fetchMyBookmarks();
      
      // 탐지 결과 목록 가져오기
      const detectionData = await getMyDetectionResults();
      setDetectionResults(detectionData);
      
      setLoading(false);
    } catch (err) {
      setError('마이페이지 데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Load mypage data error:', err);
    }
  };
  
  // 북마크 토글 핸들러
  const handleToggleFavorite = async (bookmarkId) => {
    try {
      await removeBookmark(bookmarkId);
    } catch (err) {
      console.error('Toggle bookmark error:', err);
    }
  };
  
  // 이미지 클릭 핸들러
  const handleImageClick = (imageUrl, foodName) => {
    // 선택한 이미지를 현재 이미지로 설정
    sessionStorage.setItem('currentImage', imageUrl);
    
    // 음식 이름이 있으면 설정
    if (foodName) {
      sessionStorage.setItem('selectedFood', foodName);
    }
    
    navigate('/recipe');
  };
  
  // 로딩 중 표시
  if (loading) {
    return (
      <>
        <NavbarWithAPI />
        <div className={styles.container}>
          <h1>마이페이지</h1>
          <div className={styles.loadingMessage}>데이터를 불러오는 중...</div>
        </div>
        <Footer />
      </>
    );
  }
  
  // 에러 표시
  if (error) {
    return (
      <>
        <NavbarWithAPI />
        <div className={styles.container}>
          <h1>마이페이지</h1>
          <div className={styles.errorMessage}>{error}</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavbarWithAPI />
      
      <div className={styles.container}>
        <h1>마이페이지</h1>
        
        {/* 즐겨찾기 섹션 */}
        <div className={styles.favoritesSection}>
          <h2>즐겨찾기한 사진</h2>
          <div className={styles.galleryContainer}>
            {!pageData || !pageData.bookmarks || pageData.bookmarks.length === 0 ? (
              <div className={styles.emptyGallery}>즐겨찾기한 사진이 없습니다.</div>
            ) : (
              pageData.bookmarks.map((bookmark, index) => (
                <div key={`bookmark-${index}`} className={styles.galleryItem}>
                  <img 
                    src={bookmark.recipe_thumbnail || 'https://via.placeholder.com/200x150'} 
                    alt={bookmark.recipe_title} 
                    onClick={() => handleImageClick(
                      bookmark.recipe_thumbnail || 'https://via.placeholder.com/200x150',
                      bookmark.recipe_title
                    )} 
                  />
                  <button 
                    className={`${styles.favoriteButton} ${styles.active}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark.id);
                    }}
                  >
                    ♥
                  </button>
                  <div className={styles.imageInfo}>
                    <h4>{bookmark.recipe_title}</h4>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* 모든 업로드 사진 섹션 */}
        <div className={styles.uploadsSection}>
          <h2>내가 업로드한 모든 사진</h2>
          <div className={styles.galleryContainer}>
            {!pageData || !pageData.detection_results || pageData.detection_results.length === 0 ? (
              <div className={styles.emptyGallery}>업로드한 사진이 없습니다.</div>
            ) : (
              pageData.detection_results.map((item, index) => {
                const isFavorite = pageData.bookmarks.some(
                  bookmark => bookmark.id === item.id
                );
                
                return (
                  <div key={`detection-${index}`} className={styles.galleryItem}>
                    <img 
                      src={item.image_path || 'https://via.placeholder.com/200x150'} 
                      alt={item.food_name} 
                      onClick={() => handleImageClick(
                        item.image_path || 'https://via.placeholder.com/200x150',
                        item.food_name
                      )} 
                    />
                    <button 
                      className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                    >
                      ♥
                    </button>
                    <div className={styles.imageInfo}>
                      <h4>{item.food_name || '음식 이미지'}</h4>
                      <p>정확도: {Math.round(item.confidence * 100)}%</p>
                    </div>
                  </div>
                );
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