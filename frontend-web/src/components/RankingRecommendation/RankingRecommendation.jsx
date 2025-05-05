import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RankingRecommendation.module.css';
import useHome from '../../hooks/useHome';

const RankingRecommendation = () => {
  const navigate = useNavigate();
  const { 
    popularSearches, 
    recommendedFood, 
    searchPeriod, 
    loading, 
    handlePeriodChange 
  } = useHome();
  
  const [activeTab, setActiveTab] = useState('day');
  
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

  const handleFoodClick = (foodName) => {
    // 음식 이름을 세션 스토리지에 저장
    sessionStorage.setItem('selectedFood', foodName);
    alert(`"${foodName}" 레시피 페이지로 이동합니다.`);
    navigate('/recipe');
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (period) => {
    setActiveTab(period);
    handlePeriodChange(period);
  };

  return (
    <div className={styles.rankingRecommendation}>
      <div className={styles.ranking}>
        <div className={styles.rankingHeader}>
          <h3>인기 검색 랭킹</h3>
          <div className={styles.periodTabs}>
            <button 
              className={`${styles.periodTab} ${activeTab === 'day' ? styles.active : ''}`}
              onClick={() => handleTabChange('day')}
            >
              일간
            </button>
            <button 
              className={`${styles.periodTab} ${activeTab === 'week' ? styles.active : ''}`}
              onClick={() => handleTabChange('week')}
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
                  handleFoodClick(recommendedFood.name);
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
              onClick={() => handleFoodClick(recommendedFood.name)}
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