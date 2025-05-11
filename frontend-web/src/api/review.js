import client from './client';
import { REVIEW } from './endpoints';

/**
 * 리뷰 작성
 * @param {Object} reviewData
 * @param {number} reviewData.food_id
 * @param {string} reviewData.content
 * @param {number} reviewData.rating
 * @returns {Promise}
 */
export const createReview = async (reviewData) => {
  try {
    const response = await client.post(REVIEW.CREATE, reviewData);
    return response.data;
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
};

/**
 * 음식별 리뷰 보기
 * @param {number} foodId
 * @returns {Promise}
 */
export const getReviewsByFood = async (foodId) => {
  try {
    const response = await client.get(REVIEW.GET(foodId));
    return response.data;
  } catch (error) {
    console.error('Get reviews by food error:', error);
    throw error;
  }
};

/**
 * 내가 작성한 리뷰 목록 조회
 * @returns {Promise}
 */
export const getMyReviews = async () => {
  try {
    const response = await client.get(REVIEW.ME);
    return response.data;
  } catch (error) {
    console.error('Get my reviews error:', error);
    throw error;
  }
};

/**
 * 리뷰 수정
 * @param {number} reviewId
 * @param {Object} reviewData
 * @param {string} reviewData.content
 * @param {number} reviewData.rating
 * @returns {Promise}
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await client.patch(REVIEW.PATCH(reviewId), reviewData);
    return response.data;
  } catch (error) {
    console.error('Update review error:', error);
    throw error;
  }
};

/**
 * 리뷰 삭제
 * @param {number} reviewId
 * @returns {Promise}
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await client.delete(REVIEW.DELETE(reviewId));
    return response.data;
  } catch (error) {
    console.error('Delete review error:', error);
    throw error;
  }
};
