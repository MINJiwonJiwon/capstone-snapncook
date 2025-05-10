import client from './client';
import { INGINPUT } from './endpoints';

/**
 * 재료 입력 저장
 * @param {Object} inputData
 * @returns {Promise}
 */
export const createUserIngredientInput = async (inputData) => {
  try {
    const response = await client.post(INGINPUT.CREATE, inputData);
    return response.data;
  } catch (error) {
    console.error('Create ingredient input error:', error);
    throw error;
  }
};

/**
 * 입력한 재료 기록 조회
 * @param {number} inputId
 * @returns {Promise}
 */
export const getUserIngredientInput = async (inputId) => {
  try {
    const response = await client.get(INGINPUT.GET(inputId));
    return response.data;
  } catch (error) {
    console.error('Get ingredient input error:', error);
    throw error;
  }
};
