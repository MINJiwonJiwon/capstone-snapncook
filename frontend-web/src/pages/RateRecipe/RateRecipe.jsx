import React, { useState, useEffect, useCallback } from 'react';
import { getAllFoods } from '../../api/food';
import useReview from '../../hooks/useReview';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './RateRecipe.module.css';

// 6-3 추가: 안전한 이미지 컴포넌트
const SafeImage = ({ src, alt, className, onLoad, onError, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || '/assets/images/default-food.svg');
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    console.warn('이미지 로드 실패:', e.target.src);
    setImgSrc('/assets/images/default-food.svg');
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  useEffect(() => {
    setImgSrc(src || '/assets/images/default-food.svg');
    setIsLoading(true);
  }, [src]);

  return (
    <div className={`${styles.imageContainer} ${className || ''}`} {...props}>
      {isLoading && <div className={styles.imageLoader}>이미지 로딩 중...</div>}
      <img 
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
};

const FoodReviewPage = () => {
  // API로부터 받아온 음식 데이터 상태
  const [foodList, setFoodList] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // 리뷰 관련 상태
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 6-3 추가: 전체 UI 로딩 상태 관리
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 커스텀 훅 사용
  const {
    reviews,
    loading,
    error,
    submitReview,
    fetchReviewsByFood,
    editReview,
    removeReview,
    clearError,
    clearReviews
  } = useReview();

  // 음식 데이터 초기 로드
  useEffect(() => {
    const loadFoodData = async () => {
      setIsInitialLoading(true);
      try {
        const response = await getAllFoods();
        if (Array.isArray(response)) {
          const formattedData = response.map(food => ({
            id: food.id,
            name: food.name,
            imageUrl: food.image_url || '/assets/images/default-food.svg',
            description: food.description || ''
          }));
          setFoodList(formattedData);
        } else {
          console.error('음식 데이터 형식 오류:', response);
        }
      } catch (err) {
        console.error('음식 데이터 로딩 오류:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadFoodData();
  }, []);

  // 6-3 수정: 선택된 음식이 변경될 때만 리뷰 데이터 로드 (단순화)
  useEffect(() => {
    if (selectedFood?.id) {
      clearError(); // 이전 오류 상태 초기화
      fetchReviewsByFood(selectedFood.id);
    } else {
      clearReviews(); // 선택된 음식이 없으면 리뷰 목록 초기화
    }
  }, [selectedFood?.id, fetchReviewsByFood, clearError, clearReviews]);

  // 음식 선택 핸들러
  const handleFoodSelect = useCallback((food) => {
    setSelectedFood(food);
    setIsEditMode(false);
    setSelectedReview(null);
    resetForm();
  }, []);

  // 리뷰 선택 핸들러
  const handleReviewSelect = useCallback((review) => {
    setSelectedReview(review);
    setRating(review.rating);
    setReviewText(review.content);
    setIsEditMode(true);
    
    if (review.photo_url) {
      setPreviewPhoto(review.photo_url);
    } else {
      setPreviewPhoto('');
      setReviewPhoto(null);
    }
  }, []);

  // 폼 초기화
  const resetForm = useCallback(() => {
    setRating(0);
    setReviewText('');
    setReviewPhoto(null);
    setPreviewPhoto('');
    setIsEditMode(false);
    setSelectedReview(null);
  }, []);

  // 사진 업로드 핸들러
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하로 업로드해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result);
    reader.readAsDataURL(file);
    setReviewPhoto(file);
  }, []);

  // 리뷰 제출 핸들러 (6-3 수정: 안전성 강화)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFood) {
      alert('음식을 선택해주세요!');
      return;
    }
    
    if (rating === 0) {
      alert('별점을 선택해주세요!');
      return;
    }
    
    if (!reviewText.trim()) {
      alert('리뷰 내용을 입력해주세요!');
      return;
    }

    try {
      if (isEditMode && selectedReview) {
        // 리뷰 수정
        await editReview(selectedReview.id, {
          content: reviewText,
          rating: rating
        });
        alert('리뷰가 수정되었습니다.');
      } else {
        // 새 리뷰 등록
        const reviewData = {
          food_id: selectedFood.id,
          rating: rating,
          content: reviewText
        };

        // 6-3 수정: FormData는 파일 업로드가 있을 때만 사용
        if (reviewPhoto) {
          const formData = new FormData();
          Object.keys(reviewData).forEach(key => {
            formData.append(key, reviewData[key]);
          });
          formData.append('photo', reviewPhoto);
          await submitReview(formData);
        } else {
          await submitReview(reviewData);
        }
        
        alert('리뷰가 정상 등록되었습니다!');
      }
      
      resetForm();
    } catch (err) {
      console.error('리뷰 처리 오류:', err);
      alert(isEditMode ? 
        '리뷰 수정에 실패했습니다. 다시 시도해주세요.' : 
        '리뷰 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await removeReview(reviewId);
      alert('리뷰가 삭제되었습니다.');
      resetForm();
    } catch (err) {
      console.error('리뷰 삭제 오류:', err);
      alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 6-3 추가: 초기 로딩 중 화면
  if (isInitialLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loadingMessage}>
            음식 목록을 불러오는 중입니다...
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
        <h1>요리 리뷰 관리 시스템 🍽️</h1>

        {/* 음식 선택 갤러리 */}
        <section className={styles.gallerySection}>
          <h2>리뷰할 음식 선택</h2>
          <div className={styles.photoGrid}>
            {foodList.length === 0 ? (
              <p className={styles.emptyMessage}>등록된 음식이 없습니다</p>
            ) : (
              foodList.map(food => (
                <article 
                  key={food.id}
                  className={`${styles.foodCard} ${
                    selectedFood?.id === food.id ? styles.selected : ''
                  }`}
                  onClick={() => handleFoodSelect(food)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* 6-3 수정: SafeImage 컴포넌트 사용 */}
                  <SafeImage
                    src={food.imageUrl}
                    alt={food.name}
                    className={styles.foodThumbnail}
                  />
                  <h3 className={styles.foodTitle}>{food.name}</h3>
                </article>
              ))
            )}
          </div>
        </section>

        {/* 리뷰 작성 영역 */}
        {selectedFood && (
          <form onSubmit={handleSubmit} className={styles.reviewForm}>
            <h2>{isEditMode ? '리뷰 수정' : `${selectedFood.name} 리뷰 작성`}</h2>
            
            <div className={styles.selectedFoodPreview}>
              {/* 6-3 수정: SafeImage 컴포넌트 사용 */}
              <SafeImage
                src={selectedFood.imageUrl}
                alt={`선택된 음식: ${selectedFood.name}`}
                className={styles.mainFoodImage}
              />
            </div>

            <div className={styles.ratingSystem}>
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <span
                    key={ratingValue}
                    className={`${styles.star} ${
                      ratingValue <= rating ? styles.filled : ''
                    }`}
                    onClick={() => setRating(ratingValue)}
                    style={{ cursor: 'pointer' }}
                  >
                    ★
                  </span>
                );
              })}
            </div>

            <div className={styles.photoUploadArea}>
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className={styles.hiddenInput}
                />
                {previewPhoto ? (
                  /* 6-3 수정: SafeImage 컴포넌트 사용 */
                  <SafeImage
                    src={previewPhoto}
                    alt="리뷰 사진 미리보기"
                    className={styles.photoPreview}
                  />
                ) : (
                  <div className={styles.uploadPrompt}>
                    <span>📸 리뷰 사진 업로드</span>
                  </div>
                )}
              </label>
            </div>

            <textarea
              placeholder="음식에 대한 상세 평가를 작성해주세요..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className={styles.reviewInput}
              required
            />

            <div className={styles.formButtons}>
              {isEditMode && (
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={resetForm}
                >
                  취소
                </button>
              )}
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? '처리 중...' : isEditMode ? '리뷰 수정하기' : '리뷰 등록하기'}
              </button>
            </div>
          </form>
        )}

        {/* 리뷰 목록 표시 */}
        <section className={styles.reviewList}>
          <h2>
            {selectedFood ? `${selectedFood.name}의 리뷰` : '등록된 리뷰 현황'} ({reviews.length}건)
          </h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          {loading ? (
            <p className={styles.loadingMessage}>리뷰를 불러오는 중...</p>
          ) : reviews.length === 0 ? (
            <p className={styles.emptyMessage}>
              {selectedFood ? '이 음식에 대한 리뷰가 없습니다' : '등록된 리뷰가 없습니다'}
            </p>
          ) : (
            reviews.map(review => (
              <article 
                key={review.id} 
                className={`${styles.reviewCard} ${selectedReview?.id === review.id ? styles.selectedReview : ''}`}
                onClick={() => handleReviewSelect(review)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.reviewHeader}>
                  <div className={styles.ratingDisplay}>
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`${styles.star} ${
                          index < review.rating ? styles.filled : ''
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className={styles.reviewActions}>
                    <time className={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReview(review.id);
                      }}
                      title="리뷰 삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className={styles.reviewContent}>
                  {/* 6-3 수정: 리뷰 이미지도 SafeImage 컴포넌트 사용 */}
                  {review.photo_url && (
                    <figure className={styles.reviewImage}>
                      <SafeImage
                        src={review.photo_url}
                        alt="리뷰 첨부 이미지"
                      />
                    </figure>
                  )}
                  <p className={styles.reviewText}>{review.content}</p>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default FoodReviewPage;