import client from './client';
import { MYPAGE } from './endpoints';

/**
 * 마이페이지 요약 정보 조회 API
 * 북마크, 탐지결과, 리뷰를 한 번에 조회합니다.
 * 
 * 6-6 개선: 각 섹션별 404 응답을 빈 배열로 처리
 * @returns {Promise} 마이페이지 요약 정보
 */
export const getMypageSummary = async () => {
  try {
    const response = await client.get(MYPAGE.SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Get mypage summary error:', error);
    
    // 6-6 개선: API 실패 시 기본 구조 제공
    if (error.response) {
      // 404 응답은 데이터가 없는 경우로 처리
      if (error.response.status === 404) {
        console.log('No mypage data found, returning empty structure');
        return {
          bookmarks: [],
          detection_results: [],
          reviews: []
        };
      }
      
      // 401 Unauthorized (로그인 필요)
      if (error.response.status === 401) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // 다른 상태 코드에 대한 처리
      if (error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
    }
    
    // 일반 오류
    throw error;
  }
};