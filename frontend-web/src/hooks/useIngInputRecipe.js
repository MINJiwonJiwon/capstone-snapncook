import { useState } from 'react';
import {
  createUserIngredientInputRecipe,
  getUserIngredientInputRecipesByInput
} from '../api/ingInputRecipe';

/**
 * 재료 입력-레시피 매핑 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 매핑 관련 상태 및 함수들
 */
const useInginputrecipe = () => {
  const [inputRecipes, setInputRecipes] = useState([]);
  const [currentInputRecipe, setCurrentInputRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 추천 결과 매핑 저장
   * @param {Object} data
   */
  const submitInputRecipe = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserIngredientInputRecipe(data);
      setCurrentInputRecipe(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('추천 결과 매핑 저장 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Create ingredient input-recipe error:', err);
      throw err;
    }
  };

  /**
   * 입력 ID 기준 추천 레시피 목록 조회
   * @param {number} inputId
   */
  const fetchInputRecipesByInputId = async (inputId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserIngredientInputRecipesByInput(inputId);
      setInputRecipes(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('추천 레시피 목록 조회 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Get ingredient input-recipe list error:', err);
      throw err;
    }
  };

  return {
    inputRecipes,
    currentInputRecipe,
    loading,
    error,
    submitInputRecipe,
    fetchInputRecipesByInputId
  };
};

export default useInginputrecipe;
