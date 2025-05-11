import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProfileImage from '../../components/ProfileImage/ProfileImage';
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
  
  // 프로필 수정 페이지로 이동
  const handleEditProfile = () => {
    navigate('/mypage/profile');
  };
  
  // 로딩 중 표시
  if (loading) {
    return (
      <>
        <Navbar />
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
        <Navbar />
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
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.profileSection}>
          <div className={styles.profileCard}>
            <ProfileImage 
              imageUrl={user?.profile_image_url}
              alt={user?.nickname || '사용자'}
              size="large"
            />
            <div className={styles.profileInfo}>
              <h2>{user?.nickname || '사용자'}</h2>
              <p className={styles.email}>{user?.email}</p>
              <button 
                className={styles.editProfileButton}
                onClick={handleEditProfile}
              >
                프로필 수정
              </button>
            </div>
          </div>
        </div>
        
        {/* 즐겨찾기 섹션 */}
        <div className={styles.favoritesSection}>
          <h2>즐겨찾기한 레시피</h2>
          <div className={styles.galleryContainer}>
            {!pageData || !pageData.bookmarks || pageData.bookmarks.length === 0 ? (
              <div className={styles.emptyGallery}>즐겨찾기한 레시피가 없습니다.</div>
            ) : (
              pageData.bookmarks.map((bookmark, index) => (
                <div key={`bookmark-${index}`} className={styles.galleryItem}>
                  <img 
                    src={bookmark.recipe_thumbnail || '/assets/images/default-recipe.jpg'} 
                    alt={bookmark.recipe_title} 
                    onClick={() => handleImageClick(
                      bookmark.recipe_thumbnail || '/assets/images/default-recipe.jpg',
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
                      src={item.image_path || '/assets/images/default-food.jpg'} 
                      alt={item.food_name} 
                      onClick={() => handleImageClick(
                        item.image_path || '/assets/images/default-food.jpg',
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
        
        {/* 리뷰 섹션 추가 */}
        {pageData && pageData.reviews && pageData.reviews.length > 0 && (
          <div className={styles.reviewsSection}>
            <h2>내가 작성한 리뷰</h2>
            <div className={styles.reviewsList}>
              {pageData.reviews.map((review, index) => (
                <div key={`review-${index}`} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <h4>{review.food_name}</h4>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={i < review.rating ? styles.starFilled : styles.starEmpty}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.reviewContent}>
                    {review.food_image_url && (
                      <div className={styles.reviewImageContainer}>
                        <img 
                          src={review.food_image_url} 
                          alt={review.food_name} 
                          className={styles.reviewImage}
                        />
                      </div>
                    )}
                    <p className={styles.reviewText}>{review.content}</p>
                  </div>
                  
                  <div className={styles.reviewFooter}>
                    <span className={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      className={styles.editReviewButton}
                      onClick={() => navigate(`/function2?review=${review.id}`)}
                    >
                      수정하기
                    </button>
                  </div>
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