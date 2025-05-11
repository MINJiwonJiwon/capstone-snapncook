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
    console.error('Get ingredient input recipe error:', error);
    throw error;
  }
};
