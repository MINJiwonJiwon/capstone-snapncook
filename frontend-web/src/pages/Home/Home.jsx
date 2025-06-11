import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import RankingRecommendation from '../../components/RankingRecommendation/RankingRecommendation';
import styles from './Home.module.css';
import useAuth from '../../hooks/useAuth';
import { saveDetectionResult } from '../../api/detection';
import { getFoodById } from '../../api/food';
import { uploadImage, predictImage } from '../../api/aiDetection';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageHistory, setImageHistory] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로그인 상태일 때만 이미지 히스토리 가져오기
    if (isLoggedIn) {
      const storedHistory = JSON.parse(localStorage.getItem('imageHistory')) || [];
      setImageHistory(storedHistory);
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
    if (!file) {
      setError("이미지 파일을 선택하세요.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const aiResponse = await client.post('/ai-detection/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { filename, detected } = aiResponse.data;

      if (!detected || detected.length === 0) {
        throw new Error('음식을 인식할 수 없습니다. 다른 이미지를 시도해주세요.');
      }

      const detectedFood = detected[0];
      const { name, confidence, food_id, image_filename } = detectedFood;

      if (confidence < 0.5) {
        console.warn(`낮은 신뢰도: ${confidence}`);
      }

      // 탐지 결과를 백엔드에 저장 (로그인 상태일 때만)
      let detectionResult = null;
      if (isLoggedIn) {
        try {
          detectionResult = await saveDetectionResult({
            food_id: food_id,
            image_path: image_filename,
            confidence: confidence
          });
          if (detectionResult && detectionResult.id) {
            sessionStorage.setItem('detectionId', detectionResult.id.toString());
          }
        } catch (saveError) {
          console.warn('탐지 결과 저장 실패:', saveError);
        }
      }

      // 이미지 히스토리 저장
      if (isLoggedIn) {
        saveImageToHistory(previewUrl);
      }

      // 음식 정보 가져오기
      let foodInfo;
      try {
        foodInfo = await getFoodById(food_id);
      } catch (foodError) {
        foodInfo = { name: name };
      }

      // 세션스토리지에 음식/분석 결과 저장
      sessionStorage.setItem('selectedFood', foodInfo.name);
      sessionStorage.setItem('selectedFoodId', food_id.toString());
      sessionStorage.setItem('analysisResult', JSON.stringify({
        food_name: foodInfo.name,
        confidence: confidence,
        food_id: food_id,
        image_filename: image_filename
      }));

      setIsLoading(false);
      navigate('/recipe');

    } catch (err) {
      let errorMessage = '이미지 분석 중 오류가 발생했습니다.';
      if (err.response) {
        const status = err.response.status;
        switch (status) {
          case 400:
            errorMessage = '지원하지 않는 이미지 형식입니다. JPG, PNG 파일을 사용해주세요.';
            break;
          case 502:
            errorMessage = 'AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 500:
            errorMessage = '서버에서 이미지 처리 중 오류가 발생했습니다.';
            break;
          default:
            errorMessage = `서버 오류가 발생했습니다. (코드: ${status})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl('');
    setError(null);
  };

  const saveImageToHistory = (imageUrl) => {
    if (!imageHistory.includes(imageUrl)) {
      const newHistory = [imageUrl, ...imageHistory];
      const limitedHistory = newHistory.slice(0, 10);
      setImageHistory(limitedHistory);
      localStorage.setItem('imageHistory', JSON.stringify(limitedHistory));
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('imageHistory');
    setImageHistory([]);
    alert('업로드 기록이 삭제되었습니다.');
  };

  const handleHistoryItemClick = (imageUrl) => {
    sessionStorage.setItem('currentImage', imageUrl);
    navigate('/recipe');
  };

  return (
    <>
      <Navbar />
      <RankingRecommendation />

      <div className={styles.container}>
        <h1>음식 레시피 찾기</h1>
        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}
        <div className={styles.mainContainer}>
          {/* 왼쪽: 이미지 업로드 */}
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
                  <button
                    onClick={resetUpload}
                    className={styles.cancelButton}
                    disabled={isLoading}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* 오른쪽: 이미지 히스토리 */}
          <div className={styles.historyContainer}>
            <h2>이전 업로드 이미지</h2>
            <div className={styles.historyGallery}>
              {!isLoggedIn ? (
                <p>이미지 히스토리를 보려면 로그인이 필요합니다.</p>
              ) : imageHistory.length === 0 ? (
                <p>이전에 업로드한 이미지가 없습니다.</p>
              ) : (
                imageHistory.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={styles.historyItem}
                    onClick={() => handleHistoryItemClick(imageUrl)}
                  >
                    <img src={imageUrl} alt={`이전 이미지 ${index + 1}`} />
                  </div>
                ))
              )}
            </div>
            {isLoggedIn && imageHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className={styles.clearHistory}
                disabled={isLoading}
              >
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
