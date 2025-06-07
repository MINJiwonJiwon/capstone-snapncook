import { useState, useCallback } from 'react';
import {
  createReview,
  getReviewsByFood,
  getMyReviews,
  updateReview,
  deleteReview
} from '../api/review';

/**
 * 리뷰 관련 기능을 제공하는 커스텀 훅 - 6-3 수정: 무한 호출 문제 해결
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
      
      return result;
    } catch (err) {
      setError('리뷰 작성 중 오류가 발생했습니다.');
      console.error('Create review error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 음식별 리뷰 목록 가져오기 (6-3 수정: 의존성 배열에서 reviews.length 제거)
   * @param {number} foodId
   */
  const fetchReviewsByFood = useCallback(async (foodId) => {
    // 6-3 수정: 중복 요청 방지 로직 개선
    if (!foodId) {
      return;
    }
    
    // 현재 로딩 중이고 동일한 foodId 요청이면 중복 방지
    if (loading && lastFoodId === foodId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setLastFoodId(foodId);
    
    try {
      const result = await getReviewsByFood(foodId);
      setReviews(result || []); // 6-3 수정: null/undefined 방어 코드 추가
      return result || [];
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 데이터가 없는 경우는 에러가 아닌 빈 배열로 처리
        setReviews([]);
        return [];
      } else {
        setError(`리뷰를 가져오는 중 오류가 발생했습니다. (음식 ID: ${foodId})`);
        console.error(`Fetch reviews by food ID ${foodId} error:`, err);
        setReviews([]);
        return [];
      }
    } finally {
      setLoading(false);
    }
  }, [loading, lastFoodId]); // 6-3 수정: reviews.length 의존성 제거

  /**
   * 내가 작성한 리뷰 목록 가져오기
   */
  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyReviews();
      setMyReviews(result || []); // 6-3 수정: null/undefined 방어 코드 추가
      return result || [];
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // 데이터가 없는 경우는 에러가 아닌 빈 배열로 처리
        setMyReviews([]);
        return [];
      } else {
        setError('내 리뷰를 가져오는 중 오류가 발생했습니다.');
        console.error('Fetch my reviews error:', err);
        setMyReviews([]);
        return [];
      }
    } finally {
      setLoading(false);
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
        setReviews(updatedReviews || []);
      }
      
      return result;
    } catch (err) {
      setError('리뷰 수정 중 오류가 발생했습니다.');
      console.error('Update review error:', err);
      throw err;
    } finally {
      setLoading(false);
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
      
      return { success: true };
    } catch (err) {
      setError('리뷰 삭제 중 오류가 발생했습니다.');
      console.error('Delete review error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 6-3 추가: 상태 초기화 함수
  const clearError = () => {
    setError(null);
  };

  const clearReviews = () => {
    setReviews([]);
    setLastFoodId(null);
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
    removeReview,
    clearError,
    clearReviews
  };
};

export default useReview;