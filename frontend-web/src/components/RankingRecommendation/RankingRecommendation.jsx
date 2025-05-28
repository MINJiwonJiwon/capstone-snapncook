import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RankingRecommendation.module.css';
import { getPopularSearches, getRecommendedFood } from '../../api/home';

const RankingRecommendation = () => {
  const navigate = useNavigate();
  const [popularSearches, setPopularSearches] = useState([]);
  const [recommendedFood, setRecommendedFood] = useState(null);
  const [searchPeriod, setSearchPeriod] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchPopularSearches(searchPeriod),
          fetchRecommendedFood()
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Data loading error:', err);
      }
    };
    
    loadData();
  }, []);
  
  // 인기 검색어 가져오기
  const fetchPopularSearches = async (period) => {
    try {
      const response = await getPopularSearches(period);
      setPopularSearches(response.rankings || []);
      setSearchPeriod(response.period || period);
    } catch (err) {
      console.error('Fetch popular searches error:', err);
      throw err;
    }
  };
  
  // 추천 메뉴 가져오기
  const fetchRecommendedFood = async () => {
    try {
      const response = await getRecommendedFood();
      setRecommendedFood(response.food || null);
    } catch (err) {
      console.error('Fetch recommended food error:', err);
      throw err;
    }
  };
  
  // 탭 변경 핸들러
  const handlePeriodChange = async (period) => {
    if (period !== searchPeriod) {
      setSearchPeriod(period);
      setLoading(true);
      
      try {
        await fetchPopularSearches(period);
        setLoading(false);
      } catch (err) {
        setError('인기 검색어를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    }
  };
  
  // 로딩 중이거나 데이터가 없을 때 표시할 스켈레톤 UI
  const renderSkeleton = () => (
    <div className={styles.skeleton}>
      <div className={styles.skeletonItem}></div>
      <div className={styles.skeletonItem}></div>
      <div className={styles.skeletonItem}></div>
    </div>
  );
  
  // 순위 변동에 따른 아이콘 표시
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up':
        return <span className={styles.trendUp}>🔼</span>;
      case 'down':
        return <span className={styles.trendDown}>🔽</span>;
      case 'same':
        return <span className={styles.trendSame}>→</span>;
      case 'new':
        return <span className={styles.trendNew}>NEW</span>;
      default:
        return null;
    }
  };

  const handleFoodClick = (foodName, foodId) => {
    // 음식 이름과 ID를 세션 스토리지에 저장
    sessionStorage.setItem('selectedFood', foodName);
    if (foodId) {
      sessionStorage.setItem('selectedFoodId', foodId.toString());
    }
    
    navigate('/recipe');
  };

  return (
    <div className={styles.rankingRecommendation}>
      <div className={styles.ranking}>
        <div className={styles.rankingHeader}>
          <h3>인기 검색 랭킹</h3>
          <div className={styles.periodTabs}>
            <button 
              className={`${styles.periodTab} ${searchPeriod === 'day' ? styles.active : ''}`}
              onClick={() => handlePeriodChange('day')}
            >
              일간
            </button>
            <button 
              className={`${styles.periodTab} ${searchPeriod === 'week' ? styles.active : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              주간
            </button>
          </div>
        </div>
        
        {loading ? (
          renderSkeleton()
        ) : (
          <ol>
            {popularSearches && popularSearches.length > 0 ? (
              popularSearches.map((item, index) => (
                <li key={index}>
                  <a href="#"
                    className={styles.rankingItem}
                    onClick={(e) => {
                      e.preventDefault();
                      handleFoodClick(item.keyword);
                    }}>
                    {item.keyword} {getTrendIcon(item.trend)}
                  </a>
                </li>
              ))
            ) : (
              <p className={styles.emptyMessage}>인기 검색어가 없습니다.</p>
            )}
          </ol>
        )}
      </div>

      <div className={styles.recommendation}>
        <div className={styles.recommendationText}>
          <h3>오늘의 메뉴 추천</h3>
          {loading ? (
            <div className={styles.skeletonRecommend}></div>
          ) : recommendedFood ? (
            <p>
              <a href="#"
                className={styles.recommendationItem}
                onClick={(e) => {
                  e.preventDefault();
                  handleFoodClick(recommendedFood.name, recommendedFood.id);
                }}>
                오늘의 추천 메뉴: {recommendedFood.name}
              </a>
            </p>
          ) : (
            <p className={styles.emptyMessage}>오늘의 추천 메뉴가 없습니다.</p>
          )}
        </div>
        <div className={styles.recommendationImage}>
          {loading ? (
            <div className={styles.skeletonImage}></div>
          ) : recommendedFood && recommendedFood.image_url ? (
            <img
              src={recommendedFood.image_url}
              alt={recommendedFood.name}
              className={`${styles.recommendationImg} ${styles.recommendationItem}`}
              onClick={() => handleFoodClick(recommendedFood.name, recommendedFood.id)}
            />
          ) : (
            <div className={styles.emptyImage}>이미지 없음</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingRecommendation;