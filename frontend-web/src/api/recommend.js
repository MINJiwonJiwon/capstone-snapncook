import client from './client';
import { RECOMMEND } from './endpoints';

/**
 * 공개 - 탐지 결과 기반 추천 API
 * 로그인 없이도 AI 탐지 결과 ID를 기반으로 레시피를 추천받습니다.
 *
 * @param {number} detectionId - 탐지 결과 ID
 * @returns {Promise} 추천된 레시피 목록
 */
export const getPublicRecommendationByDetection = async (detectionId) => {
  try {
    const response = await client.get(RECOMMEND.PUBLIC_BY_DETECTION(detectionId));
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log('No recommendations found, returning empty array');
      return [];
    }
    console.error('Get public recommendation by detection error:', error);
    throw error;
  }
};

/**
 * 공개 - 재료 입력 기반 추천 API
 * 로그인 없이도 재료 입력 ID를 기반으로 레시피를 추천받습니다.
 *
 * @param {number} inputId - 재료 입력 ID
 * @returns {Promise} 추천된 레시피 목록
 */
export const getPublicRecommendationByIngredient = async (inputId) => {
  try {
    const response = await client.get(RECOMMEND.PUBLIC_BY_INGREDIENT(inputId));
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log('No recommendations found, returning empty array');
      return [];
    }
    console.error('Get public recommendation by ingredient error:', error);
    throw error;
  }
};

/**
 * 개인 - 탐지 결과 기반 추천 API (로그인 필요)
 * 로그인된 사용자 본인의 탐지 결과 ID로만 사용 가능합니다.
 *
 * @param {number} detectionId - 탐지 결과 ID
 * @returns {Promise} 추천된 레시피 목록
 */
export const getPrivateRecommendationByDetection = async (detectionId) => {
  try {
    const response = await client.get(RECOMMEND.PRIVATE_BY_DETECTION(detectionId));
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log('No recommendations found, returning empty array');
      return [];
    }
    console.error('Get private recommendation by detection error:', error);
    throw error;
  }
};

/**
 * 개인 - 재료 입력 기반 추천 API (로그인 필요)
 * 사용자 본인이 입력한 재료 ID로만 추천 가능합니다.
 *
 * @param {number} inputId - 재료 입력 ID
 * @returns {Promise} 추천된 레시피 목록
 */
export const getPrivateRecommendationByIngredient = async (inputId) => {
  try {
    const response = await client.get(RECOMMEND.PRIVATE_BY_INGREDIENT(inputId));
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log('No recommendations found, returning empty array');
      return [];
    }
    console.error('Get private recommendation by ingredient error:', error);
    throw error;
  }
};