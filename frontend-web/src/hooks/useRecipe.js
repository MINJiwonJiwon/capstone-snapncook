import { useState } from 'react';
import { 
  getAllRecipes, 
  getRecipeById, 
  getRecipesByFoodId, 
  getRecipeDetail 
} from '../api/recipe';

/**
 * 레시피 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 레시피 관련 상태 및 함수들
 */
const useRecipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 모든 레시피 가져오기
   */
  const fetchAllRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllRecipes();
      setRecipes(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('레시피 목록을 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Fetch all recipes error:', err);
      throw err;
    }
  };

  /**
   * 특정 레시피 가져오기
   * @param {number} recipeId - 레시피 ID
   */
  const fetchRecipeById = async (recipeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecipeById(recipeId);
      setCurrentRecipe(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`레시피 정보를 가져오는 중 오류가 발생했습니다. (ID: ${recipeId})`);
      setLoading(false);
      console.error(`Fetch recipe by ID ${recipeId} error:`, err);
      throw err;
    }
  };

  /**
   * 음식별 레시피 목록 가져오기
   * @param {number} foodId - 음식 ID
   */
  const fetchRecipesByFoodId = async (foodId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecipesByFoodId(foodId);
      setRecipes(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`음식 관련 레시피를 가져오는 중 오류가 발생했습니다. (음식 ID: ${foodId})`);
      setLoading(false);
      console.error(`Fetch recipes by food ID ${foodId} error:`, err);
      throw err;
    }
  };

  /**
   * 레시피 상세 정보 가져오기
   * @param {number} recipeId - 레시피 ID
   */
  const fetchRecipeDetail = async (recipeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecipeDetail(recipeId);
      setRecipeDetail(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(`레시피 상세 정보를 가져오는 중 오류가 발생했습니다. (ID: ${recipeId})`);
      setLoading(false);
      console.error(`Fetch recipe detail by ID ${recipeId} error:`, err);
      throw err;
    }
  };

  /**
   * 음식 이름으로 레시피 검색
   * @param {string} foodName - 검색할 음식 이름
   */
  const searchRecipesByFoodName = async (foodName) => {
    setLoading(true);
    setError(null);
    
    try {
      // 모든 레시피 가져오기
      const allRecipes = await getAllRecipes();
      
      // 이름으로 필터링 (서버 API에 검색 기능이 없을 경우)
      const filteredRecipes = allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(foodName.toLowerCase())
      );
      
      setRecipes(filteredRecipes);
      setLoading(false);
      return filteredRecipes;
    } catch (err) {
      setError(`레시피 검색 중 오류가 발생했습니다. (검색어: ${foodName})`);
      setLoading(false);
      console.error(`Search recipes by food name "${foodName}" error:`, err);
      throw err;
    }
  };

  return {
    recipes,
    currentRecipe,
    recipeDetail,
    loading,
    error,
    fetchAllRecipes,
    fetchRecipeById,
    fetchRecipesByFoodId,
    fetchRecipeDetail,
    searchRecipesByFoodName
  };
};

export default useRecipe;