import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './Recipe.module.css';
import useRecipe from '../../hooks/useRecipe';
import useBookmark from '../../hooks/useBookmark';
import useRecommend from '../../hooks/useRecommend';
import useAuth from '../../hooks/useAuth';
import { getFoodById } from '../../api/food';
import { getRecipesByFoodId } from '../../api/recipe';

const Recipe = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [currentImage, setCurrentImage] = useState('');
  const [foodName, setFoodName] = useState('음식 이름');
  const [foodId, setFoodId] = useState(null);
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [errorRecipes, setErrorRecipes] = useState(null);
  const [detectionId, setDetectionId] = useState(null);

  const {
    recommendedRecipes,
    loading: loadingRecommendations,
    error: errorRecommendations,
    getRecommendationByDetection
  } = useRecommend();

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
      const image = sessionStorage.getItem('currentImage');
      if (image) {
        setCurrentImage(image);
      } else {
        navigate('/');
        return;
      }

      const selectedFood = sessionStorage.getItem('selectedFood');
      const selectedFoodId = sessionStorage.getItem('selectedFoodId');
      const selectedDetectionId = sessionStorage.getItem('detectionId');

      if (selectedFood) {
        setFoodName(selectedFood);
      }

      if (selectedDetectionId) {
        setDetectionId(parseInt(selectedDetectionId));
        try {
          const recommendations = await getRecommendationByDetection(
            parseInt(selectedDetectionId),
            !isLoggedIn
          );
          if (recommendations && recommendations.length > 0) {
            setRecipes(recommendations);
            setActiveRecipeId(recommendations[0].id);
            await fetchRecipeDetail(recommendations[0].id);
          } else {
            setErrorRecipes('추천된 레시피가 없습니다.');
          }
        } catch (err) {
          setErrorRecipes('추천 레시피를 불러오는 데 실패했습니다.');
        }
      } else if (selectedFoodId) {
        setFoodId(parseInt(selectedFoodId));
        await loadRecipesByFoodId(parseInt(selectedFoodId));
      } else if (selectedFood) {
        // 이름 기반 검색이 필요하다면 여기서 구현
        setFoodId(1); // 예시용
        await loadRecipesByFoodId(1);
      }

      if (isLoggedIn) {
        await fetchMyBookmarks();
      }
    };

    loadRecipeData();
  }, [navigate, fetchMyBookmarks, isLoggedIn, getRecommendationByDetection, fetchRecipeDetail]);

  const loadRecipesByFoodId = async (foodId) => {
    setIsLoadingRecipes(true);
    setErrorRecipes(null);

    try {
      const recipeList = await getRecipesByFoodId(foodId);
      setRecipes(recipeList);
      if (recipeList && recipeList.length > 0) {
        setActiveRecipeId(recipeList[0].id);
        await fetchRecipeDetail(recipeList[0].id);
      }
      setIsLoadingRecipes(false);
    } catch (err) {
      setErrorRecipes('레시피 목록을 불러오는 데 실패했습니다.');
      setIsLoadingRecipes(false);
    }
  };

  const handleRecipeClick = async (recipeId) => {
    setActiveRecipeId(recipeId);
    await fetchRecipeDetail(recipeId);
  };

  const handleToggleBookmark = async (recipeId) => {
    if (!isLoggedIn) {
      alert('북마크를 이용하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    const bookmark = isBookmarked(recipeId);

    try {
      if (bookmark) {
        await removeBookmark(bookmark.id);
      } else {
        await addBookmark(recipeId);
      }
      await fetchMyBookmarks();
    } catch (err) {
      // 북마크 토글 오류 처리
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const renderSkeleton = () => (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonTitle}></div>
      <div className={styles.skeletonText}></div>
      <div className={styles.skeletonText}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );

  const renderRecipeCards = () => {
    if (isLoadingRecipes || loadingRecommendations) {
      return (
        <div className={styles.cardsContainer}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
      );
    }
    if (errorRecipes || errorRecommendations) {
      return <p className={styles.errorMessage}>{errorRecipes || errorRecommendations}</p>;
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
              <button 
                className={`${styles.bookmarkButton} ${isLoggedIn && isBookmarked(recipe.id) ? styles.bookmarked : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(recipe.id);
                }}
              >
                {isLoggedIn && isBookmarked(recipe.id) ? '★' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
        <div className={styles.foodInfo}>
          <div className={styles.foodImage}>
            <img id="detected-food-image" src={currentImage} alt="추출된 음식" />
          </div>
          <h2 id="food-name">{foodName}</h2>
          {!isLoggedIn && (
            <div className={styles.publicModeNotice}>
              <p>👉 로그인하지 않아도 공개 레시피 추천을 이용할 수 있습니다.</p>
            </div>
          )}
        </div>
        <div className={styles.recipeCards}>
          <h3>레시피 소스 선택</h3>
          {renderRecipeCards()}
        </div>
        <div className={styles.recipeDisplay}>
          {renderRecipeContent()}
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.backButton} onClick={handleBackClick}>다른 사진 업로드하기</button>
          {!isLoggedIn && (
            <button className={styles.loginButton} onClick={() => navigate('/login')}>
              로그인하여 더 많은 기능 이용하기
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Recipe;