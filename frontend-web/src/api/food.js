import apiClient from './client';
import { FOOD } from './endpoints';

/**
 * 음식 등록 API
 * @param {Object} foodData - 음식 정보
 * @param {string} foodData.name - 음식 이름
 * @param {string} foodData.description - 음식 설명
 * @param {string|null} foodData.image_url - 음식 이미지 URL
 * @returns {Promise} 등록된 음식 정보
 */
export const createFood = async (foodData) => {
  try {
    const response = await apiClient.post(FOOD.CREATE, foodData);
    return response.data;
  } catch (error) {
    console.error('Food creation error:', error);
    throw error;
  }
};

/**
 * 음식 목록 조회 API
 * @returns {Promise} 음식 목록
 */
export const getAllFoods = async () => {
  try {
    const response = await apiClient.get(FOOD.LIST);
    return response.data;
  } catch (error) {
    console.error('Get all foods error:', error);
    throw error;
  }
};

/**
 * 특정 음식 조회 API
 * @param {number} foodId - 음식 ID
 * @returns {Promise} 음식 정보
 */
export const getFoodById = async (foodId) => {
  try {
    const response = await apiClient.get(FOOD.GET(foodId));
    return response.data;
  } catch (error) {
    console.error(`Get food by ID ${foodId} error:`, error);
    throw error;
  }
};