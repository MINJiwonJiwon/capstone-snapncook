import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './Recipe.module.css';
import useRecipe from '../../hooks/useRecipe';
import useBookmark from '../../hooks/useBookmark';
import { getFoodById } from '../../api/food';
import { getRecipesByFoodId } from '../../api/recipe';

const Recipe = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState('');
  const [foodName, setFoodName] = useState('음식 이름');
  const [foodId, setFoodId] = useState(null);
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [errorRecipes, setErrorRecipes] = useState(null);
  
  const { 
    recipeDetail,
    loading: loadingDetail,
    error: errorDetail,
    fetchRecipeDetail
  } = useRecipe();
  
  const {
    bookmarks,
    loading: loadingBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    fetchMyBookmarks
  } = useBookmark();
  
  useEffect(() => {
    const loadRecipeData = async () => {
      // 세션 스토리지에서 현재 이미지 가져오기
      const image = sessionStorage.getItem('currentImage');
      if (image) {
        setCurrentImage(image);
      } else {
        // 이미지가 없으면 홈으로 리다이렉트
        navigate('/');
        return;
      }
      
      // 세션 스토리지에서 선택된 음식 정보 가져오기
      const selectedFood = sessionStorage.getItem('selectedFood');
      const selectedFoodId = sessionStorage.getItem('selectedFoodId');
      
      if (selectedFood) {
        setFoodName(selectedFood);
      }
      
      if (selectedFoodId) {
        // 음식 ID를 세션 스토리지에서 가져왔다면 그대로 사용
        setFoodId(parseInt(selectedFoodId));
        await loadRecipesByFoodId(parseInt(selectedFoodId));
      } else if (selectedFood) {
        // 음식 이름만 있는 경우, 이름으로 음식 정보 조회
        try {
          // 실제 구현에서는 이름으로 검색하는 API가 필요
          // 여기서는 예시로 음식 ID 1을 사용
          const foodId = 1;
          setFoodId(foodId);
          await loadRecipesByFoodId(foodId);
        } catch (err) {
          console.error('Failed to find food by name:', err);
          setErrorRecipes('음식 정보를 불러오는 데 실패했습니다.');
        }
      }
      
      // 북마크 목록 가져오기
      await fetchMyBookmarks();
    };
    
    loadRecipeData();
  }, [navigate, fetchMyBookmarks]);
  
  // 음식 ID로 레시피 목록 가져오기
  const loadRecipesByFoodId = async (foodId) => {
    setIsLoadingRecipes(true);
    setErrorRecipes(null);
    
    try {
      // 음식 ID로 레시피 목록 조회
      const recipeList = await getRecipesByFoodId(foodId);
      setRecipes(recipeList);
      
      // 첫 번째 레시피가 있으면 선택
      if (recipeList && recipeList.length > 0) {
        setActiveRecipeId(recipeList[0].id);
        await fetchRecipeDetail(recipeList[0].id);
      }
      
      setIsLoadingRecipes(false);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setErrorRecipes('레시피 목록을 불러오는 데 실패했습니다.');
      setIsLoadingRecipes(false);
    }
  };
  
  // 레시피 카드 클릭 시 처리
  const handleRecipeClick = async (recipeId) => {
    setActiveRecipeId(recipeId);
    await fetchRecipeDetail(recipeId);
  };
  
  // 북마크 토글 처리
  const handleToggleBookmark = async (recipeId) => {
    const bookmark = isBookmarked(recipeId);
    
    try {
      if (bookmark) {
        // 북마크 제거
        await removeBookmark(bookmark.id);
      } else {
        // 북마크 추가
        await addBookmark(recipeId);
      }
      // 북마크 목록 새로고침
      await fetchMyBookmarks();
    } catch (err) {
      console.error('Toggle bookmark error:', err);
    }
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
  
  // 레시피 카드 렌더링
  const renderRecipeCards = () => {
    if (isLoadingRecipes) {
      return (
        <div className={styles.cardsContainer}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
      );
    }
    
    if (errorRecipes) {
      return <p className={styles.errorMessage}>{errorRecipes}</p>;
    }
    
    if (!recipes || recipes.length === 0) {
      return <p className={styles.emptyMessage}>이 음식에 대한 레시피가 없습니다.</p>;
    }
    
    return (
      <div className={styles.cardsContainer}>
        {recipes.map(recipe => (
          <div 
            key={recipe.id}
            className={`${styles.card} ${activeRecipeId === recipe.id ? styles.active : ''}`} 
            onClick={() => handleRecipeClick(recipe.id)}
          >
            <div className={styles.cardContent}>
              <h4>{recipe.title}</h4>
              <p>소스: {recipe.source_detail || recipe.source_type}</p>
              {/* 북마크 버튼 추가 */}
              <button 
                className={`${styles.bookmarkButton} ${isBookmarked(recipe.id) ? styles.bookmarked : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(recipe.id);
                }}
              >
                {isBookmarked(recipe.id) ? '★' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 레시피 상세 내용 렌더링
  const renderRecipeContent = () => {
    if (loadingDetail) {
      return renderSkeleton();
    }
    
    if (errorDetail) {
      return <p className={styles.errorMessage}>{errorDetail}</p>;
    }
    
    if (!activeRecipeId) {
      return <p className={styles.recipePlaceholder}>카드를 선택하면 레시피가 여기에 표시됩니다.</p>;
    }
    
    if (!recipeDetail) {
      return <p className={styles.recipePlaceholder}>레시피 상세 정보를 불러오는 중 오류가 발생했습니다.</p>;
    }
    
    // API 응답에서 필요한 정보 추출
    const { food, recipe, steps } = recipeDetail;
    
    return (
      <div className={styles.recipeContent}>
        <h3>{recipe.title} - {food.name}</h3>
        
        <h4>재료</h4>
        <p>{recipe.ingredients}</p>
        
        <h4>조리 방법</h4>
        <div className={styles.instructionsContainer}>
          {recipe.instructions}
        </div>
        
        {steps && steps.length > 0 && (
          <>
            <h4>상세 조리 단계</h4>
            <ol>
              {steps.map(step => (
                <li key={step.step_order}>
                  {step.description}
                  {step.image_url && (
                    <img 
                      src={step.image_url} 
                      alt={`단계 ${step.step_order}`} 
                      className={styles.stepImage} 
                    />
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    );
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