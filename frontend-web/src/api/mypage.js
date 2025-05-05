import apiClient from './client';
import { MYPAGE } from './endpoints';

/**
 * 마이페이지 요약 정보 조회 API
 * 북마크, 탐지결과, 리뷰를 한 번에 조회합니다.
 * @returns {Promise} 마이페이지 요약 정보
 */
export const getMypageSummary = async () => {
  try {
    const response = await apiClient.get(MYPAGE.SUMMARY);
    return response.data;
  } catch (error) {
    console.error('Get mypage summary error:', error);
    throw error;
  }
};