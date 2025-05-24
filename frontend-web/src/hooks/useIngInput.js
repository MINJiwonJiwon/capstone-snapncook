import { useState } from 'react';
import {
  createUserIngredientInput,
  getUserIngredientInput
} from '../api/ingInput';

/**
 * 재료 입력 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 재료 입력 관련 상태 및 함수들
 */
const useInginput = () => {
  const [currentInput, setCurrentInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 재료 입력 저장
   * @param {Object} inputData - {ingredient_text: string}
   */
  const submitIngredientInput = async (inputData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserIngredientInput(inputData);
      setCurrentInput(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('재료 입력 저장 실패');
      setLoading(false);
      console.error('Error submitting ingredient:', err);
      throw err;
    }
  };

  /**
   * 특정 입력 기록 조회
   * @param {number} inputId - 입력 기록 ID
   */
  const fetchIngredientInput = async (inputId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserIngredientInput(inputId);
      setCurrentInput(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('입력 기록 조회 실패');
      setLoading(false);
      console.error('Error fetching ingredient input:', err);
      throw err;
    }
  };

  return {
    currentInput,
    loading,
    error,
    submitIngredientInput,
    fetchIngredientInput
  };
};

export default useInginput;