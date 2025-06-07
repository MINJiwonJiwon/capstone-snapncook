import { useState, useCallback } from 'react';
import { createBookmark, getMyBookmarks, deleteBookmark } from '../api/bookmark';

/**
 * 북마크 관련 기능을 제공하는 커스텀 훅 - 6-3 수정: 무한 호출 문제 해결
 * @returns {Object} 북마크 관련 상태 및 함수들
 */
const useBookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * 북마크 추가하기
   * @param {number} recipeId - 북마크할 레시피 ID
   */
  const addBookmark = useCallback(async (recipeId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await createBookmark({ recipe_id: recipeId });
      setSuccess('북마크가 추가되었습니다.');
      setLoading(false);
      
      // 북마크 목록 갱신
      await fetchMyBookmarks();
      
      return result;
    } catch (err) {
      setError('북마크 추가 중 오류가 발생했습니다.');
      setLoading(false);
      console.error(`Add bookmark for recipe ${recipeId} error:`, err);
      throw err;
    }
  }, []); // 6-3 수정: useCallback으로 함수 메모이제이션

  /**
   * 내 북마크 목록 가져오기 - 6-3 수정: useCallback 적용
   */
  const fetchMyBookmarks = useCallback(async () => {
    console.log('fetchMyBookmarks: starting fetch'); // 디버깅 로그
    setLoading(true);
    setError(null);
    
    try {
      const result = await getMyBookmarks();
      console.log('fetchMyBookmarks: success, bookmarks count:', (result || []).length); // 디버깅 로그
      setBookmarks(result || []); // null/undefined 방어
      setLoading(false);
      return result || [];
    } catch (err) {
      console.error('fetchMyBookmarks: error:', err); // 디버깅 로그
      setError('북마크 목록을 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      setBookmarks([]); // 에러 시 빈 배열로 초기화
      throw err;
    }
  }, []); // 6-3 핵심 수정: 의존성 배열을 빈 배열로 하여 함수가 항상 동일하게 유지

  /**
   * 북마크 삭제하기
   * @param {number} bookmarkId - 삭제할 북마크 ID
   */
  const removeBookmark = useCallback(async (bookmarkId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await deleteBookmark(bookmarkId);
      setSuccess('북마크가 삭제되었습니다.');
      
      // 북마크 목록에서 해당 ID 제거
      setBookmarks(prevBookmarks => 
        prevBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
      );
      
      setLoading(false);
      return result;
    } catch (err) {
      setError('북마크 삭제 중 오류가 발생했습니다.');
      setLoading(false);
      console.error(`Remove bookmark ${bookmarkId} error:`, err);
      throw err;
    }
  }, []); // 6-3 수정: useCallback으로 함수 메모이제이션

  /**
   * 레시피의 북마크 여부 확인
   * @param {number} recipeId - 확인할 레시피 ID
   * @returns {Object|null} 북마크 정보 또는 null
   */
  const isBookmarked = useCallback((recipeId) => {
    return bookmarks.find(bookmark => bookmark.recipe_id === recipeId) || null;
  }, [bookmarks]); // bookmarks 변경 시에만 함수 재생성

  /**
   * 메시지 초기화
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []); // 6-3 수정: useCallback으로 함수 메모이제이션

  return {
    bookmarks,
    loading,
    error,
    success,
    addBookmark,
    fetchMyBookmarks,
    removeBookmark,
    isBookmarked,
    clearMessages
  };
};

export default useBookmark;