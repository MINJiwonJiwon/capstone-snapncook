import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './Recipe.module.css';
import useRecipe from '../../hooks/useRecipe';

const Recipe = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState('');
  const [foodName, setFoodName] = useState('음식 이름');
  const [activeSource, setActiveSource] = useState('');
  
  const { 
    recipeDetail,
    loading,
    error,
    fetchRecipeDetail
  } = useRecipe();
  
  useEffect(() => {
    // 세션 스토리지에서 현재 이미지 가져오기
    const image = sessionStorage.getItem('currentImage');
    if (image) {
      setCurrentImage(image);
    } else {
      // 이미지가 없으면 홈으로 리다이렉트
      navigate('/');
      return;
    }
    
    // 세션 스토리지에서 선택된 음식 이름 가져오기
    const selectedFood = sessionStorage.getItem('selectedFood');
    if (selectedFood) {
      setFoodName(selectedFood);
      
      // TODO: 음식 이름으로 음식 ID를 가져와서 해당 음식의 레시피를 조회해야 함
      // 현재 API 연결 전이므로 임시로 첫 번째 레시피를 가져옴
      fetchRecipeDetail(1).catch(error => {
        console.error('Failed to fetch recipe detail:', error);
      });
    } else {
      // 기본 음식 이름 설정
      setFoodName("김치찌개"); // 예시 음식 이름
    }
  }, [navigate, fetchRecipeDetail]);
  
  const handleCardClick = (source) => {
    setActiveSource(source);
  };
  
  const handleBackClick = () => {
    navigate('/');
  };
  
  // 로딩 중이거나 데이터가 없을 때 표시할 스켈레톤 UI
  const renderSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonText}></div>
      <div className={styles.skeletonText}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );
  
  const renderRecipeCards = () => {
    // API 연결 전이므로 임시 데이터 사용
    const sources = [
      { id: 'source1', name: '레시피 1', source: '만개의 레시피' },
      { id: 'source2', name: '레시피 2', source: '백종원 레시피' },
      { id: 'source3', name: '레시피 3', source: '해외 레시피' }
    ];
    
    return (
      <div className={styles.cardsContainer}>
        {sources.map(source => (
          <div 
            key={source.id}
            className={`${styles.card} ${activeSource === source.id ? styles.active : ''}`} 
            onClick={() => handleCardClick(source.id)}
          >
            <div className={styles.cardContent}>
              <h4>{source.name}</h4>
              <p>소스: {source.source}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderRecipeContent = () => {
    if (loading) {
      return renderSkeleton();
    }
    
    if (error) {
      return <p className={styles.errorMessage}>{error}</p>;
    }
    
    if (!activeSource) {
      return <p className={styles.recipePlaceholder}>카드를 선택하면 레시피가 여기에 표시됩니다.</p>;
    }
    
    // 실제 API 연동 후에는 recipeDetail 데이터를 사용하도록 수정 필요
    switch (activeSource) {
      case 'source1':
        return (
          <div className={styles.recipeContent}>
            <h3>만개의 레시피 - {foodName}</h3>
            <h4>재료</h4>
            <ul>
              <li>김치 300g</li>
              <li>돼지고기 목살 150g</li>
              <li>두부 1/2모</li>
              <li>대파 1대</li>
              <li>양파 1/2개</li>
              <li>청양고추 2개</li>
              <li>물 3컵</li>
              <li>고춧가루 1큰술</li>
              <li>간장 1큰술</li>
              <li>다진 마늘 1큰술</li>
            </ul>
            <h4>조리 방법</h4>
            <ol>
              <li>김치는 적당한 크기로 썰어주세요.</li>
              <li>돼지고기는 먹기 좋은 크기로 썰어주세요.</li>
              <li>두부, 대파, 양파, 청양고추도 적당한 크기로 썰어주세요.</li>
              <li>냄비에 김치와 돼지고기를 넣고 볶아주세요.</li>
              <li>김치가 투명해지면 물을 붓고 끓여주세요.</li>
              <li>물이 끓으면 두부, 양파, 고춧가루, 간장, 다진 마늘을 넣어주세요.</li>
              <li>중간 불로 10분 정도 더 끓인 후 대파와 청양고추를 넣어주세요.</li>
              <li>2분 더 끓인 후 불을 끄고 완성입니다.</li>
            </ol>
          </div>
        );
      case 'source2':
        return (
          <div className={styles.recipeContent}>
            <h3>백종원 레시피 - {foodName}</h3>
            <h4>재료</h4>
            <ul>
              <li>묵은지 400g</li>
              <li>삼겹살 200g</li>
              <li>두부 1모</li>
              <li>대파 1대</li>
              <li>양파 1개</li>
              <li>고추 2개</li>
              <li>물 2.5컵</li>
              <li>고춧가루 2큰술</li>
              <li>된장 1작은술</li>
              <li>다진 마늘 2큰술</li>
              <li>식용유 2큰술</li>
            </ul>
            <h4>조리 방법</h4>
            <ol>
              <li>팬에 식용유를 두르고 삼겹살을 먼저 볶아 기름을 빼주세요.</li>
              <li>삼겹살이 노릇해지면 김치를 넣고 5분간 볶아주세요.</li>
              <li>김치가 볶아지면 물을 붓고 된장, 고춧가루를 넣어 끓여주세요.</li>
              <li>국물이 끓어오르면 두부, 양파, 다진 마늘을 넣고 중불로 15분간 끓여주세요.</li>
              <li>마지막에 대파와 고추를 넣고 2분 더 끓여 완성합니다.</li>
            </ol>
          </div>
        );
      case 'source3':
        return (
          <div className={styles.recipeContent}>
            <h3>해외 레시피 - {foodName}</h3>
            <h4>재료</h4>
            <ul>
              <li>김치 250g</li>
              <li>베이컨 100g</li>
              <li>두부 1모</li>
              <li>버섯 100g</li>
              <li>파 2대</li>
              <li>물 4컵</li>
              <li>김치 국물 1/4컵</li>
              <li>고추장 1큰술</li>
              <li>간장 1큰술</li>
              <li>설탕 1작은술</li>
              <li>참기름 1작은술</li>
            </ul>
            <h4>조리 방법</h4>
            <ol>
              <li>냄비에 베이컨을 넣고 기름이 나올 때까지 볶아주세요.</li>
              <li>김치를 넣고 3분간 볶아주세요.</li>
              <li>물과 김치 국물을 붓고 끓여주세요.</li>
              <li>끓어오르면 고추장, 간장, 설탕을 넣고 저어주세요.</li>
              <li>두부와 버섯을 넣고 5분간 더 끓여주세요.</li>
              <li>마지막에 파를 넣고 참기름을 둘러 완성합니다.</li>
            </ol>
          </div>
        );
      default:
        return <p className={styles.recipePlaceholder}>레시피를 찾을 수 없습니다.</p>;
    }
  };

  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <h1>음식 레시피 결과</h1>
        
        {/* 상단: 추출된 음식 정보 */}
        <div className={styles.foodInfo}>
          <div className={styles.foodImage}>
            <img id="detected-food-image" src={currentImage} alt="추출된 음식" />
          </div>
          <h2 id="food-name">{foodName}</h2>
        </div>
        
        {/* 레시피 카드 선택 영역 */}
        <div className={styles.recipeCards}>
          <h3>레시피 소스 선택</h3>
          {renderRecipeCards()}
        </div>
        
        {/* 선택된 레시피 표시 영역 */}
        <div className={styles.recipeDisplay}>
          {renderRecipeContent()}
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={handleBackClick}>다른 사진 업로드하기</button>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Recipe;