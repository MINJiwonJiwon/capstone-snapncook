import client from './client';
import { BOOKMARK } from './endpoints';

/**
 * 북마크 추가 API
 * @param {Object} bookmarkData - 북마크 정보
 * @param {number} bookmarkData.recipe_id - 레시피 ID
 * @returns {Promise} 생성된 북마크 정보
 */
export const createBookmark = async (bookmarkData) => {
  try {
    const response = await client.post(BOOKMARK.CREATE, bookmarkData);
    return response.data;
  } catch (error) {
    console.error('Create bookmark error:', error);
    throw error;
  }
};

/**
 * 내 북마크 목록 조회 API
 * @returns {Promise} 사용자의 북마크 목록
 */
export const getMyBookmarks = async () => {
  try {
    const response = await client.get(BOOKMARK.LIST_ME);
    return response.data;
  } catch (error) {
    console.error('Get my bookmarks error:', error);
    throw error;
  }
};

/**
 * 북마크 삭제 API
 * @param {number} bookmarkId - 북마크 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteBookmark = async (bookmarkId) => {
  try {
    const response = await client.delete(BOOKMARK.DELETE(bookmarkId));
    return response.data;
  } catch (error) {
    console.error(`Delete bookmark ${bookmarkId} error:`, error);
    throw error;
  }
};