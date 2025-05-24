import { useState, useEffect } from 'react';
import { getPopularSearches, getRecommendedFood } from '../api/home';

/**
 * 홈 화면 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 홈 화면 관련 상태 및 함수들
 */
const useHome = () => {
  const [popularSearches, setPopularSearches] = useState([]);
  const [recommendedFood, setRecommendedFood] = useState(null);
  const [searchPeriod, setSearchPeriod] = useState('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 인기 검색어 가져오기
   * @param {string} period - 집계 기준 ('day' 또는 'week')
   */
  const fetchPopularSearches = async (period = 'day') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getPopularSearches(period);
      setPopularSearches(result.rankings || []);
      setSearchPeriod(result.period || period);
      setLoading(false);
    } catch (err) {
      setError('인기 검색어를 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Popular searches error:', err);
    }
  };

  /**
   * 추천 메뉴 가져오기
   */
  const fetchRecommendedFood = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRecommendedFood();
      setRecommendedFood(result.food || null);
      setLoading(false);
    } catch (err) {
      setError('오늘의 추천 메뉴를 가져오는 중 오류가 발생했습니다.');
      setLoading(false);
      console.error('Recommended food error:', err);
    }
  };

  /**
   * 집계 기준 변경 핸들러
   * @param {string} period - 변경할 집계 기준 ('day' 또는 'week')
   */
  const handlePeriodChange = (period) => {
    if (period !== searchPeriod) {
      setSearchPeriod(period);
      fetchPopularSearches(period);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      
      try {
        // 병렬로 두 API 호출
        await Promise.all([
          fetchPopularSearches(searchPeriod),
          fetchRecommendedFood()
        ]);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Initial data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return {
    popularSearches,
    recommendedFood,
    searchPeriod,
    loading,
    error,
    fetchPopularSearches,
    fetchRecommendedFood,
    handlePeriodChange
  };
};

export default useHome;