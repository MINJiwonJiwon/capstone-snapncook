import { useState } from 'react';
import {
  createReview,
  getReviewsByFood,
  getMyReviews,
  updateReview,
  deleteReview
} from '../api/review';

/**
 * 리뷰 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 리뷰 관련 상태 및 함수들
 */
const useReview = () => {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 리뷰 작성
   * @param {Object} reviewData
   */
  const submitReview = async (reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createReview(reviewData);
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
   * 음식별 리뷰 목록 가져오기
   * @param {number} foodId
   */
  const fetchReviewsByFood = async (foodId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReviewsByFood(foodId);
      setReviews(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`리뷰를 가져오는 중 오류가 발생했습니다. (음식 ID: ${foodId})`);
      setLoading(false);
      console.error(`Fetch reviews by food ID ${foodId} error:`, err);
      throw err;
    }
  };

  /**
   * 내가 작성한 리뷰 목록 가져오기
   */
  const fetchMyReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyReviews();
      setMyReviews(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('내 리뷰를 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Fetch my reviews error:', err);
      throw err;
    }
  };

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
      const result = await deleteReview(reviewId);
      setLoading(false);
      return result;
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
