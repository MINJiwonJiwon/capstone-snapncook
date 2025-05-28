import { useState } from 'react';
import {
  createUserIngredientInputRecipe,
  getUserIngredientInputRecipesByInput
} from '../api/ingInputRecipe';

/**
 * 재료 입력-레시피 매핑 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 매핑 관련 상태 및 함수들
 */
const useIngInputRecipe = () => {
  const [inputRecipes, setInputRecipes] = useState([]);
  const [currentInputRecipe, setCurrentInputRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 5-3 개선: 빈 결과 상태를 별도로 관리
  const [emptyResult, setEmptyResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  /**
   * 오류 메시지 초기화
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * 모든 상태 초기화
   */
  const clearAllStates = () => {
    setError(null);
    setEmptyResult(false);
    setResultMessage('');
  };

  /**
   * 추천 결과 매핑 저장
   * @param {Object} data
   */
  const submitInputRecipe = async (data) => {
    setLoading(true);
    clearAllStates();
    
    try {
      // 데이터 유효성 사전 검증
      if (!data.recipe_id) {
        setLoading(false);
        setError('매핑할 레시피 ID가 필요합니다.');
        return null;
      }
      
      const result = await createUserIngredientInputRecipe(data);
      setCurrentInputRecipe(result);
      setLoading(false);
      return result;
    } catch (err) {
      // 오류 메시지 처리 개선
      if (err.message) {
        // 레시피 데이터 부재 특화 메시지
        if (err.message.includes('레시피 데이터가 없습니다')) {
          setEmptyResult(true);
          setResultMessage('현재 추천 가능한 레시피 데이터가 없습니다. 다른 재료로 시도하거나 관리자에게 문의하세요.');
        } else {
          // 기타 오류 메시지 그대로 사용
          setError(err.message);
        }
      } else {
        // 기본 오류 메시지
        setError('추천 결과 매핑 저장 중 오류가 발생했습니다.');
      }
      
      setLoading(false);
      console.error('Create ingredient input-recipe error:', err);
      return null;
    }
  };

  /**
   * 입력 ID 기준 추천 레시피 목록 조회
   * @param {number} inputId
   */
  const fetchInputRecipesByInputId = async (inputId) => {
    setLoading(true);
    clearAllStates();
    
    try {
      const result = await getUserIngredientInputRecipesByInput(inputId);
      
      // 5-3 개선: 특수 빈 배열 객체 처리
      if (result && result.isEmpty) {
        setInputRecipes([]);
        setEmptyResult(true);
        setResultMessage(result.message || '입력하신 재료로 만들 수 있는 추천 레시피가 없습니다.');
        setLoading(false);
        return [];
      }
      
      // 일반 배열 처리
      const recipes = Array.isArray(result) ? result : [];
      setInputRecipes(recipes);
      
      // 데이터가 비어있으면 빈 결과 상태 설정
      if (recipes.length === 0) {
        setEmptyResult(true);
        setResultMessage('입력하신 재료로 추천할 수 있는 레시피가 없습니다. 다른 재료를 입력해보세요.');
      } else {
        setEmptyResult(false);
        setResultMessage('');
      }
      
      setLoading(false);
      return recipes;
    } catch (err) {
      // 5-3 개선: 실제 서버 오류만 에러로 처리
      setError('추천 레시피 목록 조회 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Get ingredient input-recipe list error:', err);
      return [];
    }
  };

  return {
    inputRecipes,
    currentInputRecipe,
    loading,
    error,
    // 5-3 개선: 빈 결과 상태와 메시지 추가
    emptyResult,
    resultMessage,
    clearError,
    clearAllStates,
    submitInputRecipe,
    fetchInputRecipesByInputId
  };
};

export default useIngInputRecipe;