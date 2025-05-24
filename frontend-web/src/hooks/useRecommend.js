import { useState } from 'react';
import {
  getPublicRecommendationByDetection,
  getPublicRecommendationByIngredient,
  getPrivateRecommendationByDetection,
  getPrivateRecommendationByIngredient
} from '../api/recommend';
import useAuth from './useAuth';

/**
 * 추천 기능을 관리하는 커스텀 훅
 * @returns {Object} 추천 관련 상태 및 함수들
 */
const useRecommend = () => {
  const { isLoggedIn } = useAuth();
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 탐지 결과 기반 추천
   * 로그인 상태에 따라 적절한 API를 자동 선택
   * 
   * @param {number} detectionId - 탐지 결과 ID
   * @param {boolean} forcePublic - 강제로 공개 API 사용 여부
   * @returns {Promise} 추천 결과
   */
  const getRecommendationByDetection = async (detectionId, forcePublic = false) => {
    if (!detectionId) {
      setError('탐지 결과 ID가 필요합니다.');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // 로그인 상태 또는 강제 공개 API 사용 여부에 따라 API 선택
      if (isLoggedIn && !forcePublic) {
        // 로그인 상태면 개인 추천 API 사용 시도
        try {
          result = await getPrivateRecommendationByDetection(detectionId);
        } catch (privateError) {
          // 개인 추천 API 실패 시 (권한 없음 등) 공개 API로 대체
          console.log('Private recommendation failed, falling back to public:', privateError);
          result = await getPublicRecommendationByDetection(detectionId);
        }
      } else {
        // 비로그인 상태는 무조건 공개 API 사용
        result = await getPublicRecommendationByDetection(detectionId);
      }
      
      setRecommendedRecipes(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('레시피 추천을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Get recommendation by detection error:', err);
      return [];
    }
  };

  /**
   * 재료 입력 기반 추천
   * 로그인 상태에 따라 적절한 API를 자동 선택
   * 
   * @param {number} inputId - 재료 입력 ID
   * @param {boolean} forcePublic - 강제로 공개 API 사용 여부
   * @returns {Promise} 추천 결과
   */
  const getRecommendationByIngredient = async (inputId, forcePublic = false) => {
    if (!inputId) {
      setError('재료 입력 ID가 필요합니다.');
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      // 로그인 상태 또는 강제 공개 API 사용 여부에 따라 API 선택
      if (isLoggedIn && !forcePublic) {
        // 로그인 상태면 개인 추천 API 사용 시도
        try {
          result = await getPrivateRecommendationByIngredient(inputId);
        } catch (privateError) {
          // 개인 추천 API 실패 시 (권한 없음 등) 공개 API로 대체
          console.log('Private recommendation failed, falling back to public:', privateError);
          result = await getPublicRecommendationByIngredient(inputId);
        }
      } else {
        // 비로그인 상태는 무조건 공개 API 사용
        result = await getPublicRecommendationByIngredient(inputId);
      }
      
      setRecommendedRecipes(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError('레시피 추천을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Get recommendation by ingredient error:', err);
      return [];
    }
  };

  /**
   * 오류 초기화
   */
  const clearError = () => {
    setError(null);
  };

  return {
    recommendedRecipes,
    loading,
    error,
    getRecommendationByDetection,
    getRecommendationByIngredient,
    clearError
  };
};

export default useRecommend;