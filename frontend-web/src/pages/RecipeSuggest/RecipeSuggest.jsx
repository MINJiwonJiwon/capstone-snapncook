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
    error: inputError,
    clearError: clearInputError
  } = useIngInput();

  // 추천 레시피 관련 훅
  const {
    inputRecipes,
    fetchInputRecipesByInputId,
    loading: recipeLoading,
    error: recipeError,
    clearError: clearRecipeError
  } = useIngInputRecipe();

  // 입력창 상태
  const [inputIngredients, setInputIngredients] = useState('');
  // 최근 검색어(입력값)
  const [searchedIngredients, setSearchedIngredients] = useState('');
  // 로컬 에러 상태
  const [error, setError] = useState(null);

  // 폼 제출 - 수정된 버전
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 에러 초기화
    setError(null);
    clearInputError && clearInputError();
    clearRecipeError && clearRecipeError();
    
    // 입력값 검증 추가
    if (!inputIngredients || !inputIngredients.trim()) {
      setError('재료를 입력해주세요.');
      return;
    }
    
    // 검색어로 설정
    setSearchedIngredients(inputIngredients);
    
    try {
      // 재료 입력 저장 - input_text 필드명으로 수정
      const result = await submitIngredientInput({ 
        input_text: inputIngredients.trim() 
      });
      
      // 입력 기록 ID로 추천 레시피 조회
      if (result && result.id) {
        fetchInputRecipesByInputId(result.id);
      }
    } catch (err) {
      // API 에러 분석
      if (err.response && err.response.data) {
        // validation 오류 (422)
        if (err.response.status === 422) {
          const data = err.response.data;
          if (Array.isArray(data.detail)) {
            const errorMsg = data.detail.map(e => e.msg).join(', ');
            setError(errorMsg);
          } else {
            setError(data.detail || '재료 입력 저장 실패');
          }
        } else {
          setError(err.response.data.detail || '재료 입력 저장 실패');
        }
      } else {
        setError('재료 입력 저장 중 오류가 발생했습니다.');
      }
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
        {(error || inputError || recipeError) && (
          <div className={styles.error}>
            {error || inputError || recipeError}
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
            {recipeLoading || inputLoading ? (
              <div className={styles.loading}>레시피를 찾고 있습니다...</div>
            ) : (
              inputRecipes && inputRecipes.length > 0 ? (
                inputRecipes.map((recipe) => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <img 
                      src={recipe.image_url || '/assets/images/default-recipe.svg'} 
                      alt={recipe.title}
                      onError={(e) => {
                        e.target.src = '/assets/images/default-recipe.svg';
                      }}
                    />
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