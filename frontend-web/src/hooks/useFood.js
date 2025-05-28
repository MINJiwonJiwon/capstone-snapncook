import { useState } from 'react';
import { createFood, getAllFoods, getFoodById } from '../api/food';

/**
 * 음식 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 음식 관련 상태 및 함수들
 */
const useFood = () => {
  const [foods, setFoods] = useState([]);
  const [currentFood, setCurrentFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 음식 등록 API
   * @param {Object} foodData - 음식 정보
   */
  const addFood = async (foodData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createFood(foodData);
      setLoading(false);
      return result;
    } catch (err) {
      setError('음식 등록 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Add food error:', err);
      throw err;
    }
  };

  /**
   * 모든 음식 목록 가져오기
   */
  const fetchAllFoods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllFoods();
      setFoods(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('음식 목록을 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Fetch all foods error:', err);
      throw err;
    }
  };

  /**
   * 특정 음식 정보 가져오기
   * @param {number} foodId - 음식 ID
   */
  const fetchFoodById = async (foodId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFoodById(foodId);
      setCurrentFood(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`음식 정보를 가져오는 중 오류가 발생했습니다. (ID: ${foodId})`);
      setLoading(false);
      console.error(`Fetch food by ID ${foodId} error:`, err);
      throw err;
    }
  };

  /**
   * 음식 이름으로 검색
   * @param {string} name - 검색할 음식 이름
   */
  const searchFoodByName = async (name) => {
    setLoading(true);
    setError(null);
    
    try {
      // 모든 음식 가져오기
      const allFoods = await getAllFoods();
      
      // 이름으로 필터링 (서버 API에 검색 기능이 없을 경우)
      const filteredFoods = allFoods.filter(food => 
        food.name.toLowerCase().includes(name.toLowerCase())
      );
      
      setFoods(filteredFoods);
      setLoading(false);
      return filteredFoods;
    } catch (err) {
      setError(`음식 검색 중 오류가 발생했습니다. (검색어: ${name})`);
      setLoading(false);
      console.error(`Search food by name "${name}" error:`, err);
      throw err;
    }
  };

  return {
    foods,
    currentFood,
    loading,
    error,
    addFood,
    fetchAllFoods,
    fetchFoodById,
    searchFoodByName
  };
};

export default useFood;