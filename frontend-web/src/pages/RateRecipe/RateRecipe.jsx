import React, { useState, useEffect } from 'react';
import { getAllFoods } from '../../api/food'; // API 추가 임포트
import useReview from '../../hooks/useReview';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './RateRecipe.module.css';

const FoodReviewPage = () => {
  // API로부터 받아온 음식 데이터 상태
  const [foodList, setFoodList] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // 리뷰 관련 상태
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState('');
  
  // 커스텀 훅 사용
  const {
    reviews,
    loading,
    error,
    submitReview,
    fetchReviewsByFood,
  } = useReview();

  // 음식 데이터 초기 로드
  useEffect(() => {
    const loadFoodData = async () => {
      try {
        const response = await getAllFoods();
        const formattedData = response.map(food => ({
          id: food.id,
          name: food.name,
          imageUrl: food.image_url,
          description: food.description
        }));
        setFoodList(formattedData);
      } catch (err) {
        console.error('음식 데이터 로딩 오류:', err);
      }
    };
    loadFoodData();
  }, []);

  // 리뷰 데이터 갱신
  useEffect(() => {
    if (selectedFood?.id) {
      fetchReviewsByFood(selectedFood.id);
    }
  }, [selectedFood, fetchReviewsByFood]);

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
    
    if (!selectedFood) return alert('음식을 선택해주세요!');
    if (rating === 0) return alert('별점을 선택해주세요!');

    const formData = new FormData();
    formData.append('food_id', selectedFood.id);
    formData.append('rating', rating);
    formData.append('content', reviewText);
    reviewPhoto && formData.append('photo', reviewPhoto);

    try {
      await submitReview(formData);
      setRating(0);
      setReviewText('');
      setReviewPhoto(null);
      setPreviewPhoto('');
      alert('리뷰가 정상 등록되었습니다!');
    } catch (err) {
      alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
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
                  onClick={() => setSelectedFood(food)}
                >
                  <img 
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
            <h2>{selectedFood.name} 리뷰 작성</h2>
            
            <div className={styles.selectedFoodPreview}>
              <img 
                src={selectedFood.imageUrl} 
                alt="선택된 음식"
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
            />

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? '처리 중...' : '리뷰 등록하기'}
            </button>
          </form>
        )}

        {/* 리뷰 목록 표시 */}
        <section className={styles.reviewList}>
          <h2>등록된 리뷰 현황 ({reviews.length}건)</h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          {reviews.length === 0 ? (
            <p className={styles.emptyMessage}>등록된 리뷰가 없습니다</p>
          ) : (
            reviews.map(review => (
              <article key={review.id} className={styles.reviewCard}>
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
                  <time className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                
                <div className={styles.reviewContent}>
                  {review.photo_url && (
                    <figure className={styles.reviewImage}>
                      <img
                        src={review.photo_url}
                        alt="리뷰 첨부 이미지"
                      />
                      <figcaption>리뷰 이미지</figcaption>
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
