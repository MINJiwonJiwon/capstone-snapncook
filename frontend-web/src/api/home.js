import apiClient from './client';
import { HOME } from './endpoints';

/**
 * 인기 검색어 랭킹 조회 API
 * @param {string} period - 집계 기준 ('day' 또는 'week')
 * @returns {Promise} 인기 검색어 랭킹 및 순위 변동 정보
 */
export const getPopularSearches = async (period = 'day') => {
  try {
    const response = await apiClient.get(`${HOME.POPULAR_SEARCHES}?period=${period}`);
    return response.data;
  } catch (error) {
    console.error(`Get popular searches (${period}) error:`, error);
    throw error;
  }
};

/**
 * 오늘의 추천 메뉴 조회 API
 * @returns {Promise} 오늘의 추천 메뉴 정보
 */
export const getRecommendedFood = async () => {
  try {
    const response = await apiClient.get(HOME.RECOMMENDED_FOOD);
    return response.data;
  } catch (error) {
    console.error('Get recommended food error:', error);
    throw error;
  }
};