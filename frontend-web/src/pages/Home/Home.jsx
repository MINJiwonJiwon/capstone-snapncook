import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import RankingRecommendation from '../../components/RankingRecommendation/RankingRecommendation';
import ImageCard from '../../components/ImageCard/ImageCard';
import styles from './Home.module.css';
import useAuth from '../../hooks/useAuth';
import { saveDetectionResult, getMyDetectionResults } from '../../api/detection';
import { getFoodById } from '../../api/food';
import { uploadImage, predictImage } from '../../api/aiDetection';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recentImages, setRecentImages] = useState([]); // API 기반으로 변경
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadRecentImages();
    } else {
      setImageHistory([]);
      setFile(null);
      setPreviewUrl('');
    }
  }, [isLoggedIn]);

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      sessionStorage.setItem('currentImage', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl || !file) return;

    setIsLoading(true);
    setError(null);

    try {
      await uploadImage(file); // 파일 업로드만 진행
      const predictRes = await predictImage(file); // 예측 수행

      const detected = predictRes.detected?.[0];
      if (!detected) throw new Error("예측 결과가 비어 있습니다.");

      const { food_id, name, confidence, image_filename } = detected;

      const foodRes = await getFoodById(food_id);
      const food = foodRes;

      if (!food?.id) throw new Error("음식 ID를 찾을 수 없습니다.");

      const detectionResult = await saveDetectionResult({
        food_id: food.id,
        image_path: image_filename,
        confidence
      });

      if (detectionResult?.id) {
        sessionStorage.setItem("detectionId", detectionResult.id.toString());
        sessionStorage.setItem("selectedFood", food.name);
        sessionStorage.setItem("selectedFoodId", food.id.toString());
      }

      saveImageToHistory(previewUrl);
      setIsLoading(false);
      navigate('/recipe');
    } catch (err) {
      setError('이미지 분석 중 오류가 발생했습니다.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl('');
  };

  const saveImageToHistory = (imageUrl) => {
    if (!imageHistory.includes(imageUrl)) {
      const newHistory = [imageUrl, ...imageHistory].slice(0, 10);
      setImageHistory(newHistory);
      localStorage.setItem('imageHistory', JSON.stringify(newHistory));
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('imageHistory');
    setImageHistory([]);
    alert('업로드 기록이 삭제되었습니다.');
  };

  const handleHistoryItemClick = (imageUrl) => {
    sessionStorage.setItem('currentImage', imageUrl);
    if (foodName && foodName !== '이전 업로드 이미지') {
      sessionStorage.setItem('selectedFood', foodName);
    }
    navigate('/recipe');
  };

  // 전체 히스토리 보기 (마이페이지로 이동)
  const handleViewAllHistory = () => {
    if (isLoggedIn) {
      navigate('/mypage');
    } else {
      alert('전체 히스토리를 보려면 로그인이 필요합니다.');
      navigate('/login');
    }
  };

  return (
    <>
      <Navbar />
      <RankingRecommendation />

      <div className={styles.container}>
        <h1>음식 레시피 찾기</h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.mainContainer}>
          <div className={styles.uploadContainer}>
            <h2>음식 사진 업로드</h2>

            {!previewUrl ? (
              <div
                className={`${styles.uploadArea} ${dragOver ? styles.dragover : ''}`}
                onClick={() => document.getElementById('file-input').click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div>
                  <p>이미지를 여기에 드래그하거나 클릭하여 업로드하세요</p>
                  {!isLoggedIn && (
                    <p className={styles.nonLoginMessage}>💡 로그인하지 않아도 이미지 분석이 가능합니다</p>
                  )}
                </div>
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="미리보기" className={styles.previewImage} />
                <div className={styles.buttonGroup}>
                  <button onClick={handleUpload} disabled={isLoading}>
                    {isLoading ? '분석중...' : '분석하기'}
                  </button>
                  <button onClick={resetUpload} className={styles.cancelButton} disabled={isLoading}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.historyContainer}>
            <div className={styles.historyHeader}>
              <h2>최근 업로드 이미지</h2>
              {isLoggedIn && recentImages.length > 0 && (
                <button 
                  className={styles.viewAllButton}
                  onClick={handleViewAllHistory}
                >
                  전체보기
                </button>
              )}
            </div>
            
            <div className={styles.recentImagesGrid}>
              {historyLoading ? (
                <div className={styles.historyLoading}>
                  <p>이미지 목록을 불러오는 중...</p>
                </div>
              ) : historyError ? (
                <div className={styles.historyError}>
                  <p>{historyError}</p>
                </div>
              ) : !isLoggedIn && recentImages.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <p>이미지 히스토리를 보려면 로그인이 필요합니다.</p>
                  <button 
                    className={styles.loginPromptButton}
                    onClick={() => navigate('/login')}
                  >
                    로그인하기
                  </button>
                </div>
              ) : recentImages.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <p>아직 업로드한 이미지가 없습니다.</p>
                  <p>첫 번째 음식 사진을 업로드해보세요!</p>
                </div>
              ) : (
                recentImages.map((item, index) => (
                  <ImageCard
                    key={item.id || index}
                    imageUrl={item.imageUrl}
                    foodName={item.foodName}
                    confidence={item.confidence}
                    onClick={handleRecentImageClick}
                    showConfidence={!!item.confidence}
                    size="medium"
                  />
                ))
              )}
            </div>
            {isLoggedIn && imageHistory.length > 0 && (
              <button onClick={clearHistory} className={styles.clearHistory} disabled={isLoading}>
                기록 삭제
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
