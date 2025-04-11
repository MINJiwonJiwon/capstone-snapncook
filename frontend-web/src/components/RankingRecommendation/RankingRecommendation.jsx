import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RankingRecommendation.module.css';
import samgyeopsalImg from '../../assets/samgyeopsal.jpg'; // 이미지 경로는 실제 이미지 위치에 맞게 수정해주세요

const RankingRecommendation = () => {
  const navigate = useNavigate();

  const handleFoodClick = (foodName) => {
    // 음식 이름을 세션 스토리지에 저장
    sessionStorage.setItem('selectedFood', foodName);
    alert(`"${foodName}" 레시피 페이지로 이동합니다.`);
    navigate('/recipe');
  };

  return (
    <div className={styles.rankingRecommendation}>
      <div className={styles.ranking}>
        <h3>인기 검색 랭킹</h3>
        <ol>
          <li>
            <a href="#"
              className={styles.rankingItem}
              onClick={(e) => {
                e.preventDefault();
                handleFoodClick('김치찌개');
              }}>
              김치찌개
            </a>
          </li>
          <li>
            <a href="#"
              className={styles.rankingItem}
              onClick={(e) => {
                e.preventDefault();
                handleFoodClick('된장찌개');
              }}>
              된장찌개
            </a>
          </li>
          <li>
            <a href="#"
              className={styles.rankingItem}
              onClick={(e) => {
                e.preventDefault();
                handleFoodClick('비빔밥');
              }}>
              비빔밥
            </a>
          </li>
        </ol>
      </div>

      <div className={styles.recommendation}>
        <div className={styles.recommendationText}>
          <h3>오늘의 메뉴 추천</h3>
          <p>
            <a href="#"
              className={styles.recommendationItem}
              onClick={(e) => {
                e.preventDefault();
                handleFoodClick('삼겹살');
              }}>
              오늘의 추천 메뉴: 삼겹살
            </a>
          </p>
        </div>
        <div className={styles.recommendationImage}>
          <img
            src={samgyeopsalImg}
            alt="삼겹살"
            className={`${styles.recommendationImg} ${styles.recommendationItem}`}
            onClick={() => handleFoodClick('삼겹살')}
          />
        </div>
      </div>
    </div>
  );
};

export default RankingRecommendation;