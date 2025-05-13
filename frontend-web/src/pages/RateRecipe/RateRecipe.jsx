import React, { useState, useEffect, useCallback } from 'react';
import { getAllFoods } from '../../api/food';
import useReview from '../../hooks/useReview';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './RateRecipe.module.css';

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
  
  // 커스텀 훅 사용
  const {
    reviews,
    loading,
    error,
    submitReview,
    fetchReviewsByFood,
    editReview,
    removeReview
  } = useReview();

  // 음식 데이터 초기 로드
  useEffect(() => {
    const loadFoodData = async () => {
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
      }
    };
    loadFoodData();
  }, []);

  // 이미지 로드 오류 처리 핸들러
  const handleImageError = (e) => {
    console.warn('이미지 로드 실패:', e.target.src);
    e.target.src = '/assets/images/default-food.svg';
  };

  // 리뷰 데이터 갱신 - useCallback으로 최적화
  const loadReviews = useCallback(async (foodId) => {
    if (foodId) {
      await fetchReviewsByFood(foodId);
    }
  }, [fetchReviewsByFood]);

  // 선택된 음식이 변경될 때 리뷰 데이터 로드
  useEffect(() => {
    if (selectedFood?.id) {
      loadReviews(selectedFood.id);
    }
  }, [selectedFood, loadReviews]);

  // 음식 선택 핸들러
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setIsEditMode(false);
    setSelectedReview(null);
    resetForm();
  };

  // 리뷰 선택 핸들러
  const handleReviewSelect = (review) => {
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
  };

  // 폼 초기화
  const resetForm = () => {
    setRating(0);
    setReviewText('');
    setReviewPhoto(null);
    setPreviewPhoto('');
    setIsEditMode(false);
    setSelectedReview(null);
  };

  // 사진 업로드 핸들러
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result);
    reader.readAsDataURL(file);
    setReviewPhoto(file);
  };

  // 리뷰 제출 핸들러
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
        const formData = new FormData();
        formData.append('food_id', selectedFood.id);
        formData.append('rating', rating);
        formData.append('content', reviewText);
        reviewPhoto && formData.append('photo', reviewPhoto);

        await submitReview(formData);
        alert('리뷰가 정상 등록되었습니다!');
      }
      
      resetForm();
      await loadReviews(selectedFood.id);
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
      await loadReviews(selectedFood.id);
    } catch (err) {
      console.error('리뷰 삭제 오류:', err);
      alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

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
                  <img 
                    src={food.imageUrl} 
                    alt={food.name}
                    className={styles.foodThumbnail}
                    onError={handleImageError}
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
              <img 
                src={selectedFood.imageUrl} 
                alt={`선택된 음식: ${selectedFood.name}`}
                className={styles.mainFoodImage}
                onError={handleImageError}
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
                  <img 
                    src={previewPhoto} 
                    alt="리뷰 사진 미리보기"
                    className={styles.photoPreview}
                    onError={handleImageError}
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
          <h2>등록된 리뷰 현황 ({reviews.length}건)</h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          {loading ? (
            <p className={styles.loadingMessage}>리뷰를 불러오는 중...</p>
          ) : reviews.length === 0 ? (
            <p className={styles.emptyMessage}>등록된 리뷰가 없습니다</p>
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
                  {review.photo_url && (
                    <figure className={styles.reviewImage}>
                      <img
                        src={review.photo_url}
                        alt="리뷰 첨부 이미지"
                        onError={handleImageError}
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