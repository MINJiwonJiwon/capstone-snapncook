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
  const { bookmarks, fetchMyBookmarks, removeBookmark, isBookmarked } = useBookmark();
  
  const [detectionResults, setDetectionResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState({
    bookmarks: [],
    detection_results: [],
    reviews: []
  });
  
  // 6-6 개선: 각 섹션별 상태 관리 강화
  const [sectionStatus, setSectionStatus] = useState({
    bookmarks: { loading: false, error: null, dataLoaded: false },
    detections: { loading: false, error: null, dataLoaded: false },
    reviews: { loading: false, error: null, dataLoaded: false }
  });
  
  // 로그인 상태 확인 및 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    loadMyPageData();
  }, [isLoggedIn, navigate]);
  
  // 마이페이지 데이터 로드 - 6-6 개선 버전
  const loadMyPageData = async () => {
    setLoading(true);
    setError(null);
    
    // 각 섹션의 초기 로딩 상태 설정
    setSectionStatus({
      bookmarks: { loading: true, error: null, dataLoaded: false },
      detections: { loading: true, error: null, dataLoaded: false },
      reviews: { loading: true, error: null, dataLoaded: false }
    });
    
    try {
      // 6-6 개선: 요약 API 먼저 가져오기
      let summary;
      try {
        summary = await getMypageSummary();
        setPageData(summary || {
          bookmarks: [],
          detection_results: [],
          reviews: []
        });
        
        // 각 섹션에 데이터가 있는지 확인
        const hasBookmarks = summary && Array.isArray(summary.bookmarks) && summary.bookmarks.length > 0;
        const hasDetections = summary && Array.isArray(summary.detection_results) && summary.detection_results.length > 0;
        const hasReviews = summary && Array.isArray(summary.reviews) && summary.reviews.length > 0;
        
        // 섹션 상태 업데이트
        setSectionStatus(prev => ({
          bookmarks: { loading: false, error: null, dataLoaded: hasBookmarks },
          detections: { loading: false, error: null, dataLoaded: hasDetections },
          reviews: { loading: false, error: null, dataLoaded: hasReviews }
        }));
      } catch (summaryError) {
        console.error('Summary fetch error:', summaryError);
        
        // 요약 API 실패 시 개별 API 호출로 대체
        await fetchFallbackData();
      }
      
      setLoading(false);
    } catch (err) {
      // 전체적인 오류 처리
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Load mypage data error:', err);
    }
  };
  
  // 6-6 개선: 요약 API 실패 시 개별 API 호출
  const fetchFallbackData = async () => {
    console.log('Falling back to individual API calls');
    
    // Promise.allSettled를 사용하여 모든 API 요청을 독립적으로 처리
    const [bookmarksResult, detectionsResult] = await Promise.allSettled([
      // 북마크 목록 가져오기
      fetchMyBookmarks().catch(err => {
        console.error('Fetch bookmarks error:', err);
        setSectionStatus(prev => ({
          ...prev,
          bookmarks: { loading: false, error: '북마크를 불러오는 중 오류가 발생했습니다.', dataLoaded: false }
        }));
        return []; // 빈 배열 반환
      }),
      
      // 탐지 결과 목록 가져오기
      getMyDetectionResults().catch(err => {
        console.error('Get detection results error:', err);
        // 404 에러는 데이터 없음으로 처리
        if (err.response && err.response.status === 404) {
          setSectionStatus(prev => ({
            ...prev,
            detections: { loading: false, error: null, dataLoaded: false }
          }));
          return []; // 데이터 없음 - 빈 배열 반환
        }
        
        setSectionStatus(prev => ({
          ...prev,
          detections: { loading: false, error: '탐지 결과를 불러오는 중 오류가 발생했습니다.', dataLoaded: false }
        }));
        return [];
      })
    ]);
    
    // 결과 처리 및 로딩 상태 업데이트
    if (bookmarksResult.status === 'fulfilled') {
      const hasBookmarks = bookmarksResult.value && bookmarksResult.value.length > 0;
      setSectionStatus(prev => ({
        ...prev,
        bookmarks: { loading: false, error: null, dataLoaded: hasBookmarks }
      }));
      
      // 페이지 데이터 업데이트
      setPageData(prev => ({
        ...prev,
        bookmarks: bookmarksResult.value || []
      }));
    }
    
    if (detectionsResult.status === 'fulfilled') {
      const hasDetections = detectionsResult.value && detectionsResult.value.length > 0;
      setDetectionResults(detectionsResult.value || []);
      setSectionStatus(prev => ({
        ...prev,
        detections: { loading: false, error: null, dataLoaded: hasDetections }
      }));
      
      // 페이지 데이터 업데이트
      setPageData(prev => ({
        ...prev,
        detection_results: detectionsResult.value || []
      }));
    }
    
    // 리뷰는 개별 API가 없으므로 빈 배열로 설정
    setSectionStatus(prev => ({
      ...prev,
      reviews: { loading: false, error: null, dataLoaded: false }
    }));
  };
  
  // 북마크 토글 핸들러
  const handleToggleFavorite = async (bookmarkId) => {
    try {
      await removeBookmark(bookmarkId);
      // 데이터 새로고침
      loadMyPageData();
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
  
  // 전체 로딩 중 표시
  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h1>마이페이지</h1>
          <div className={styles.loadingMessage}>
            <div className={styles.loadingSpinner}></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // 전체 에러 표시
  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <h1>마이페이지</h1>
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={loadMyPageData}
            >
              다시 시도
            </button>
          </div>
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
          {sectionStatus.bookmarks.loading ? (
            <div className={styles.sectionLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>즐겨찾기 목록을 불러오는 중...</p>
            </div>
          ) : sectionStatus.bookmarks.error ? (
            <div className={styles.sectionError}>
              <p>{sectionStatus.bookmarks.error}</p>
              <button 
                className={styles.retryButton}
                onClick={loadMyPageData}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className={styles.galleryContainer}>
              {!pageData.bookmarks || pageData.bookmarks.length === 0 ? (
                <div className={styles.emptyGallery}>즐겨찾기한 레시피가 없습니다.</div>
              ) : (
                pageData.bookmarks.map((bookmark, index) => (
                  <div key={`bookmark-${index}`} className={styles.galleryItem}>
                    <img 
                      src={bookmark.recipe_thumbnail || '/assets/images/default-recipe.svg'} 
                      alt={bookmark.recipe_title} 
                      onClick={() => handleImageClick(
                        bookmark.recipe_thumbnail || '/assets/images/default-recipe.svg',
                        bookmark.recipe_title
                      )} 
                      onError={(e) => {
                        e.target.src = '/assets/images/default-recipe.svg';
                      }}
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
          )}
        </div>
        
        {/* 모든 업로드 사진 섹션 */}
        <div className={styles.uploadsSection}>
          <h2>내가 업로드한 모든 사진</h2>
          {sectionStatus.detections.loading ? (
            <div className={styles.sectionLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>업로드 사진을 불러오는 중...</p>
            </div>
          ) : sectionStatus.detections.error ? (
            <div className={styles.sectionError}>
              <p>{sectionStatus.detections.error}</p>
              <button 
                className={styles.retryButton}
                onClick={loadMyPageData}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className={styles.galleryContainer}>
              {!pageData.detection_results || pageData.detection_results.length === 0 ? (
                <div className={styles.emptyGallery}>
                  <p>업로드한 사진이 없습니다.</p>
                  <button 
                    className={styles.uploadButton}
                    onClick={() => navigate('/')}
                  >
                    사진 업로드하기
                  </button>
                </div>
              ) : (
                pageData.detection_results.map((item, index) => {
                  const isFavorite = pageData.bookmarks && pageData.bookmarks.some(
                    bookmark => bookmark.id === item.id
                  );
                  
                  return (
                    <div key={`detection-${index}`} className={styles.galleryItem}>
                      <img 
                        src={item.image_path || '/assets/images/default-food.svg'} 
                        alt={item.food_name} 
                        onClick={() => handleImageClick(
                          item.image_path || '/assets/images/default-food.svg',
                          item.food_name
                        )} 
                        onError={(e) => {
                          e.target.src = '/assets/images/default-food.svg';
                        }}
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
          )}
        </div>
        
        {/* 리뷰 섹션 */}
        <div className={styles.reviewsSection}>
          <h2>내가 작성한 리뷰</h2>
          {sectionStatus.reviews.loading ? (
            <div className={styles.sectionLoading}>
              <div className={styles.loadingSpinner}></div>
              <p>리뷰를 불러오는 중...</p>
            </div>
          ) : sectionStatus.reviews.error ? (
            <div className={styles.sectionError}>
              <p>{sectionStatus.reviews.error}</p>
              <button 
                className={styles.retryButton}
                onClick={loadMyPageData}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className={styles.reviewsList}>
              {!pageData.reviews || pageData.reviews.length === 0 ? (
                <div className={styles.emptyGallery}>
                  <p>작성한 리뷰가 없습니다.</p>
                  <button 
                    className={styles.uploadButton}
                    onClick={() => navigate('/rate-recipe')}
                  >
                    리뷰 작성하기
                  </button>
                </div>
              ) : (
                pageData.reviews.map((review, index) => (
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
                            onError={(e) => {
                              e.target.src = '/assets/images/default-food.svg';
                            }}
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
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default MyPage;