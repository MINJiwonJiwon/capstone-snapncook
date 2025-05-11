import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import styles from './RecipeSuggest.module.css';
import useIngInput from '../../hooks/useIngInput';
import useIngInputRecipe from '../../hooks/useIngInputRecipe';

const RecipeSuggest = () => {
  // 재료 입력 관련 훅
  const {
    currentInput,
    submitIngredientInput,
    loading: inputLoading,
    error: inputError
  } = useIngInput();

  // 추천 레시피 관련 훅
  const {
    inputRecipes,
    fetchInputRecipesByInputId,
    loading: recipeLoading,
    error: recipeError
  } = useIngInputRecipe();

  // 입력창 상태
  const [inputIngredients, setInputIngredients] = useState('');
  // 최근 검색어(입력값)
  const [searchedIngredients, setSearchedIngredients] = useState('');

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputIngredients.trim()) return;
    setSearchedIngredients(inputIngredients);
    try {
      // 재료 입력 저장 (서버에 입력 기록 생성)
      const result = await submitIngredientInput({ ingredient_text: inputIngredients });
      // 입력 기록 ID로 추천 레시피 조회
      if (result && result.id) {
        fetchInputRecipesByInputId(result.id);
      }
    } catch (err) {
      // 에러는 훅에서 처리됨
    }
  };

  // currentInput이 바뀔 때마다 자동으로 추천 레시피 조회 (중복 방지)
  useEffect(() => {
    if (currentInput && currentInput.id) {
      fetchInputRecipesByInputId(currentInput.id);
    }
    // eslint-disable-next-line
  }, [currentInput]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className={styles.inputGroup}>
          <input
            type="text"
            placeholder="예시) 감자, 당근"
            value={inputIngredients}
            onChange={(e) => setInputIngredients(e.target.value)}
            className={styles.ingredientInput}
            disabled={inputLoading || recipeLoading}
          />
          <button
            type="submit"
            className={styles.searchButton}
            disabled={inputLoading || recipeLoading}
          >
            {(inputLoading || recipeLoading) ? '검색 중...' : '레시피 찾기'}
          </button>
        </form>

        {/* 에러 메시지 */}
        {(inputError || recipeError) && (
          <div className={styles.error}>
            {inputError || recipeError}
          </div>
        )}

        {/* 결과 영역 */}
        <div className={styles.resultSection}>
          <h1>
            {searchedIngredients
              ? `"${searchedIngredients}"로 만들 수 있는 요리 🍳`
              : '재료를 입력해보세요'}
          </h1>
          <div className={styles.recipeGrid}>
            {recipeLoading ? (
              <div className={styles.loading}>레시피를 찾고 있습니다...</div>
            ) : (
              inputRecipes && inputRecipes.length > 0 ? (
                inputRecipes.map((recipe) => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <img src={recipe.image_url || '/default-food.jpg'} alt={recipe.title} />
                    <h3>{recipe.title}</h3>
                    <p className={styles.ingredients}>
                      <b>재료:</b> {recipe.ingredients}
                    </p>
                    <p className={styles.instructions}>
                      <b>조리법:</b> {recipe.instructions}
                    </p>
                  </div>
                ))
              ) : (
                searchedIngredients && (
                  <p className={styles.noResults}>
                    검색 결과가 없습니다. 다른 재료를 입력해보세요.
                  </p>
                )
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RecipeSuggest;
