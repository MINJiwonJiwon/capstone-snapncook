import { useState, useCallback } from 'react';
import {
  createReview,
  getReviewsByFood,
  getMyReviews,
  updateReview,
  deleteReview
} from '../api/review';

/**
 * 리뷰 관련 기능을 제공하는 커스텀 훅 - 개선된 버전
 * @returns {Object} 리뷰 관련 상태 및 함수들
 */
const useReview = () => {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFoodId, setLastFoodId] = useState(null); // 마지막으로 조회한 음식 ID 저장

  /**
   * 리뷰 작성
   * @param {Object} reviewData
   */
  const submitReview = async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createReview(reviewData);
      
      // 성공 시 리뷰 목록 갱신
      if (lastFoodId) {
        const updatedReviews = await getReviewsByFood(lastFoodId);
        setReviews(updatedReviews);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError('리뷰 작성 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Create review error:', err);
      throw err;
    }
  };

  /**
   * 음식별 리뷰 목록 가져오기 (useCallback으로 최적화)
   * @param {number} foodId
   */
  const fetchReviewsByFood = useCallback(async (foodId) => {
    // 이미 동일한 foodId로 요청 중이면 중복 요청 방지
    if (loading && lastFoodId === foodId) {
      return;
    }
    
    // 이미 조회한 동일한 foodId라면 API 호출 스킵
    if (lastFoodId === foodId && reviews.length > 0) {
      return reviews;
    }
    
    setLoading(true);
    setError(null);
    setLastFoodId(foodId);
    
    try {
      const result = await getReviewsByFood(foodId);
      setReviews(result);
      setLoading(false);
      return result;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 데이터가 없는 경우는 에러가 아닌 빈 배열로 처리
        setReviews([]);
      } else {
        setError(`리뷰를 가져오는 중 오류가 발생했습니다. (음식 ID: ${foodId})`);
        console.error(`Fetch reviews by food ID ${foodId} error:`, err);
      }
      setLoading(false);
      return [];
    }
  }, [loading, lastFoodId, reviews.length]);

  /**
   * 내가 작성한 리뷰 목록 가져오기
   */
  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyReviews();
      setMyReviews(result);
      setLoading(false);
      return result;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 데이터가 없는 경우는 에러가 아닌 빈 배열로 처리
        setMyReviews([]);
      } else {
        setError('내 리뷰를 가져오는 중 오류가 발생했습니다.');
        console.error('Fetch my reviews error:', err);
      }
      setLoading(false);
      return [];
    }
  }, []);

  /**
   * 리뷰 수정
   * @param {number} reviewId
   * @param {Object} reviewData
   */
  const editReview = async (reviewId, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateReview(reviewId, reviewData);
      
      // 성공 시 리뷰 목록 갱신
      if (lastFoodId) {
        const updatedReviews = await getReviewsByFood(lastFoodId);
        setReviews(updatedReviews);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError('리뷰 수정 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Update review error:', err);
      throw err;
    }
  };

  /**
   * 리뷰 삭제
   * @param {number} reviewId
   */
  const removeReview = async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteReview(reviewId);
      
      // 성공 시 목록에서 제거
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setMyReviews(prev => prev.filter(review => review.id !== reviewId));
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('리뷰 삭제 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Delete review error:', err);
      throw err;
    }
  };

  return {
    reviews,
    myReviews,
    loading,
    error,
    submitReview,
    fetchReviewsByFood,
    fetchMyReviews,
    editReview,
    removeReview
  };
};

export default useReview;