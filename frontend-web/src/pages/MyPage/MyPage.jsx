import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarWithAPI from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './MyPage.module.css';
import useAuth from '../../hooks/useAuth';
import useBookmark from '../../hooks/useBookmark';
import { getMypageSummary } from '../../api/mypage';

const MyPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { removeBookmark } = useBookmark();
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
      // 마이페이지 요약 정보 가져오기 - API 명세서의 /mypage/summary 엔드포인트
      const summaryData = await getMypageSummary();
      setPageData(summaryData);
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
      
      // 북마크 제거 후 데이터 다시 로드
      await loadMyPageData();
    } catch (err) {
      console.error('Toggle bookmark error:', err);
    }
  };
  
  // 이미지 클릭 핸들러
  const handleImageClick = (imageUrl, foodName, foodId) => {
    // 선택한 이미지를 현재 이미지로 설정
    sessionStorage.setItem('currentImage', imageUrl);
    
    // 음식 이름이 있으면 설정
    if (foodName) {
      sessionStorage.setItem('selectedFood', foodName);
    }
    
    // 음식 ID가 있으면 설정
    if (foodId) {
      sessionStorage.setItem('selectedFoodId', foodId.toString());
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
          <h2>즐겨찾기한 레시피</h2>
          <div className={styles.galleryContainer}>
            {!pageData || !pageData.bookmarks || pageData.bookmarks.length === 0 ? (
              <div className={styles.emptyGallery}>즐겨찾기한 레시피가 없습니다.</div>
            ) : (
              pageData.bookmarks.map((bookmark) => (
                <div key={`bookmark-${bookmark.id}`} className={styles.galleryItem}>
                  <img 
                    src={bookmark.recipe_thumbnail || '/placeholder-image.jpg'} 
                    alt={bookmark.recipe_title} 
                    onClick={() => handleImageClick(
                      bookmark.recipe_thumbnail || '/placeholder-image.jpg',
                      bookmark.recipe_title,
                      bookmark.recipe_id
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
              pageData.detection_results.map((item) => {
                // 북마크 여부 확인
                const isBookmarked = pageData.bookmarks.some(
                  bookmark => bookmark.recipe_id === item.food_id
                );
                
                return (
                  <div key={`detection-${item.id}`} className={styles.galleryItem}>
                    <img 
                      src={item.image_path || '/placeholder-image.jpg'} 
                      alt={item.food_name} 
                      onClick={() => handleImageClick(
                        item.image_path || '/placeholder-image.jpg',
                        item.food_name,
                        item.food_id
                      )} 
                    />
                    {isBookmarked && (
                      <button 
                        className={`${styles.favoriteButton} ${styles.active}`}
                      >
                        ♥
                      </button>
                    )}
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
        
        {/* 리뷰 섹션 추가 */}
        {pageData && pageData.reviews && pageData.reviews.length > 0 && (
          <div className={styles.reviewsSection}>
            <h2>내가 작성한 리뷰</h2>
            <div className={styles.reviewContainer}>
              {pageData.reviews.map((review) => (
                <div key={`review-${review.id}`} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <h4>{review.food_name}</h4>
                    <div className={styles.rating}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={index} className={index < review.rating ? styles.filledStar : styles.emptyStar}>
                          {index < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p>{review.content}</p>
                  {review.food_image_url && (
                    <div className={styles.reviewImageContainer}>
                      <img 
                        src={review.food_image_url} 
                        alt={review.food_name} 
                        className={styles.reviewImage}
                        onClick={() => handleImageClick(
                          review.food_image_url,
                          review.food_name
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default MyPage;