import client from './client';
import { INGINPUTRECIPE } from './endpoints';

/**
 * 추천 결과 매핑 저장
 * @param {Object} data
 * @returns {Promise}
 */
export const createUserIngredientInputRecipe = async (data) => {
  try {
    const response = await client.post(INGINPUTRECIPE.CREATE, data);
    return response.data;
  } catch (error) {
    // 레시피 데이터 관련 오류 처리 개선
    if (error.response) {
      // 404 Not Found - 리소스 부재 (레시피 없음)
      if (error.response.status === 404) {
        console.log('Recipe not found for mapping, returning empty response');
        throw new Error('매핑할 레시피 데이터가 없습니다.');
      } 
      // 422 Validation Error
      else if (error.response.status === 422) {
        console.error('Validation error:', error.response.data);
        if (error.response.data.detail) {
          const detail = error.response.data.detail;
          const message = Array.isArray(detail) 
            ? detail.map(err => err.msg).join(', ') 
            : detail;
          throw new Error(message);
        }
      }
      // 500 서버 오류 - 데이터 처리 중 오류
      else if (error.response.status === 500) {
        console.error('Server error during recipe mapping:', error);
        throw new Error('서버에서 레시피 매핑 중 오류가 발생했습니다.');
      }
    }
    
    console.error('Create ingredient input recipe error:', error);
    throw error;
  }
};

/**
 * 입력 ID 기준 추천 레시피 목록 조회
 * @param {number} inputId
 * @returns {Promise}
 */
export const getUserIngredientInputRecipesByInput = async (inputId) => {
  try {
    const response = await client.get(INGINPUTRECIPE.GET(inputId));
    return response.data;
  } catch (error) {
    // 404 에러는 결과가 없는 경우로 처리 - 빈 배열 반환
    if (error.response && error.response.status === 404) {
      console.log(`No recipe recommendations found for input ID ${inputId}, returning empty array`);
      // 5-3 개선: 실제 값 없음 상태임을 표시하는 특수 빈 배열 객체 반환
      return {
        isEmpty: true,
        data: [],
        message: '입력하신 재료로 만들 수 있는 추천 레시피가 없습니다.'
      };
    }
    
    console.error('Get ingredient input recipe error:', error);
    throw error;
  }
};