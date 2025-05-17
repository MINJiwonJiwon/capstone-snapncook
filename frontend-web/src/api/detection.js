import client from './client';
import { DETECTION } from './endpoints';

/**
 * 음식 탐지 결과 저장 API
 * @param {Object} detectionData - 탐지 결과 정보
 * @param {number} detectionData.food_id - 음식 ID
 * @param {string} detectionData.image_path - 이미지 경로
 * @param {number} detectionData.confidence - 신뢰도 (0~1 사이 값)
 * @returns {Promise} 저장된 탐지 결과
 */
export const saveDetectionResult = async (detectionData) => {
  try {
    const response = await client.post(DETECTION.CREATE, detectionData);
    return response.data;
  } catch (error) {
    console.error('Save detection result error:', error);
    throw error;
  }
};

/**
 * 내 탐지 결과 목록 조회 API
 * @returns {Promise} 사용자의 탐지 결과 목록 또는 빈 배열
 */
export const getMyDetectionResults = async () => {
  try {
    const response = await client.get(DETECTION.LIST_ME);
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log('No detection results found, returning empty array');
      return [];
    }
    
    // 다른 오류는 그대로 throw
    console.error('Get my detection results error:', error);
    throw error;
  }
};