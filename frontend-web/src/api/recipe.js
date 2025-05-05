import apiClient from './client';
import { RECIPE, RECIPE_STEP } from './endpoints';

/**
 * 레시피 생성 API
 * @param {Object} recipeData - 레시피 정보
 * @param {number} recipeData.food_id - 음식 ID
 * @param {string} recipeData.source_type - 출처 유형 (User, API 등)
 * @param {string} recipeData.title - 레시피 제목
 * @param {string} recipeData.ingredients - 재료 정보
 * @param {string} recipeData.instructions - 조리 방법
 * @param {string|null} recipeData.source_detail - 출처 상세 정보
 * @returns {Promise} 생성된 레시피 정보
 */
export const createRecipe = async (recipeData) => {
  try {
    const response = await apiClient.post(RECIPE.CREATE, recipeData);
    return response.data;
  } catch (error) {
    console.error('Recipe creation error:', error);
    throw error;
  }
};

/**
 * 모든 레시피 조회 API
 * @returns {Promise} 레시피 목록
 */
export const getAllRecipes = async () => {
  try {
    const response = await apiClient.get(RECIPE.LIST);
    return response.data;
  } catch (error) {
    console.error('Get all recipes error:', error);
    throw error;
  }
};

/**
 * 특정 레시피 조회 API
 * @param {number} recipeId - 레시피 ID
 * @returns {Promise} 레시피 정보
 */
export const getRecipeById = async (recipeId) => {
  try {
    const response = await apiClient.get(RECIPE.GET(recipeId));
    return response.data;
  } catch (error) {
    console.error(`Get recipe by ID ${recipeId} error:`, error);
    throw error;
  }
};

/**
 * 음식별 레시피 목록 조회 API
 * @param {number} foodId - 음식 ID
 * @returns {Promise} 해당 음식의 레시피 목록
 */
export const getRecipesByFoodId = async (foodId) => {
  try {
    const response = await apiClient.get(RECIPE.GET_BY_FOOD(foodId));
    return response.data;
  } catch (error) {
    console.error(`Get recipes by food ID ${foodId} error:`, error);
    throw error;
  }
};

/**
 * 레시피 상세 정보 조회 API
 * @param {number} recipeId - 레시피 ID
 * @returns {Promise} 레시피 상세 정보 (음식 정보, 레시피, 조리 단계 포함)
 */
export const getRecipeDetail = async (recipeId) => {
  try {
    const response = await apiClient.get(RECIPE.GET_DETAIL(recipeId));
    return response.data;
  } catch (error) {
    console.error(`Get recipe detail by ID ${recipeId} error:`, error);
    throw error;
  }
};

// 레시피 단계 관련 함수들

/**
 * 조리 단계 추가 API
 * @param {Object} stepData - 조리 단계 정보
 * @param {number} stepData.recipe_id - 레시피 ID
 * @param {number} stepData.step_order - 단계 순서
 * @param {string} stepData.description - 단계 설명
 * @param {string|null} stepData.image_url - 단계 이미지 URL
 * @returns {Promise} 생성된 조리 단계 정보
 */
export const createRecipeStep = async (stepData) => {
  try {
    const response = await apiClient.post(RECIPE_STEP.CREATE, stepData);
    return response.data;
  } catch (error) {
    console.error('Recipe step creation error:', error);
    throw error;
  }
};

/**
 * 레시피별 조리 단계 조회 API
 * @param {number} recipeId - 레시피 ID
 * @returns {Promise} 조리 단계 목록
 */
export const getRecipeStepsByRecipeId = async (recipeId) => {
  try {
    const response = await apiClient.get(RECIPE_STEP.LIST_BY_RECIPE(recipeId));
    return response.data;
  } catch (error) {
    console.error(`Get recipe steps by recipe ID ${recipeId} error:`, error);
    throw error;
  }
};