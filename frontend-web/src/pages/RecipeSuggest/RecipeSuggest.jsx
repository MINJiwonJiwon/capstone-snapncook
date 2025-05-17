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

  // 추천 레시피 관련 훅 - 5-3 개선: 빈 결과 상태와 메시지 추가
  const {
    inputRecipes,
    fetchInputRecipesByInputId,
    loading: recipeLoading,
    error: recipeError,
    emptyResult, // 5-3 개선: 빈 결과 상태
    resultMessage, // 5-3 개선: 결과 관련 메시지
    clearError: clearRecipeError,
    clearAllStates: clearRecipeStates
  } = useIngInputRecipe();

  // 입력창 상태
  const [inputIngredients, setInputIngredients] = useState('');
  // 최근 검색어(입력값)
  const [searchedIngredients, setSearchedIngredients] = useState('');
  // 로컬 에러 상태
  const [error, setError] = useState(null);
  // 레시피 데이터 부족 상태
  const [recipeDataLack, setRecipeDataLack] = useState(false);

  // 폼 제출 - 5-3 개선
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 상태 초기화
    setError(null);
    setRecipeDataLack(false);
    clearInputError && clearInputError();
    clearRecipeStates && clearRecipeStates();
    
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
        try {
          await fetchInputRecipesByInputId(result.id);
          // 5-3 개선: emptyResult 상태로 데이터 부족 판단
          if (emptyResult) {
            setRecipeDataLack(true);
          }
        } catch (recipeErr) {
          console.error('Recipe fetch error:', recipeErr);
          // 실제 서버 오류만 에러로 처리
          setError(recipeErr.message || '레시피 추천 중 오류가 발생했습니다.');
        }
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
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('재료 입력 저장 중 오류가 발생했습니다.');
      }
    }
  };

  // currentInput이 바뀔 때마다 자동으로 추천 레시피 조회 (중복 방지)
  useEffect(() => {
    if (currentInput && currentInput.id) {
      fetchInputRecipesByInputId(currentInput.id)
        .then(() => {
          // 5-3 개선: emptyResult 상태로 데이터 부족 판단
          if (emptyResult) {
            setRecipeDataLack(true);
          } else {
            setRecipeDataLack(false);
          }
        })
        .catch(err => {
          console.error('Error fetching recipes:', err);
          // 실제 오류만 처리
          setError(err.message || '레시피 조회 중 오류가 발생했습니다.');
        });
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

        {/* 5-3 개선: 실제 오류일 경우에만 에러 메시지 표시 */}
        {(error || inputError || 
          (recipeError && !emptyResult)) && (
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
          
          {/* 5-3 개선: 빈 결과일 때의 알림 메시지 */}
          {emptyResult && searchedIngredients && !error && !recipeError && (
            <div className={styles.emptyResultNotice}>
              <p>{resultMessage || '입력하신 재료로 만들 수 있는 추천 레시피가 없습니다.'}</p>
            </div>
          )}
          
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
                  <div className={styles.noResults}>
                    {/* 5-3 개선: 다양한 조건에 따른 개선된 메시지 */}
                    <p>
                      {emptyResult && resultMessage
                        ? resultMessage
                        : '검색 결과가 없습니다. 다른 재료를 입력해보세요.'}
                    </p>
                    
                    {/* 레시피 데이터 부족 시 안내 메시지 추가 */}
                    {recipeDataLack && (
                      <div className={styles.dataLackInfo}>
                        <p>
                          <strong>현재 시스템에 레시피 데이터가 충분하지 않습니다.</strong>
                        </p>
                        <p className={styles.additionalInfo}>
                          • 레시피 데이터베이스가 지속적으로 업데이트되고 있습니다.<br />
                          • 다양한 재료를 조합해 보거나 다른 기능을 이용해보세요.<br />
                          • 지속적인 문제 발생 시 관리자에게 문의해주세요.
                        </p>
                      </div>
                    )}
                  </div>
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