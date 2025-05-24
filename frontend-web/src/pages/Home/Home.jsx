import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import RankingRecommendation from '../../components/RankingRecommendation/RankingRecommendation';
import styles from './Home.module.css';
import useAuth from '../../hooks/useAuth';
import { saveDetectionResult } from '../../api/detection';
import { getFoodById } from '../../api/food';
import client from '../../api/client';

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
      // 로그인 상태가 아닐 경우 이미지 히스토리와 미리보기 초기화
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
      // 현재 이미지 URL을 세션 스토리지에 저장
      sessionStorage.setItem('currentImage', e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!previewUrl || !file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 실제 API 연동 - 파일 업로드 처리
      const formData = new FormData();
      formData.append('file', file);
      
      // 파일 업로드 API 호출
      const uploadResponse = await client.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // 서버에서 이미지 분석 결과 받기
      // 실제 구현에서는 서버로부터 응답을 받아와야 함
      const { food_id, image_path, confidence } = uploadResponse.data;
      
      // 탐지 결과 저장 API 호출
      const detectionResult = await saveDetectionResult({
        food_id,
        image_path,
        confidence
      });
      
      // 4-4 이슈 해결: detectionId를 세션 스토리지에 저장
      // Recipe.jsx에서 이 ID로 공개 추천 API를 호출할 수 있도록 함
      if (detectionResult && detectionResult.id) {
        sessionStorage.setItem('detectionId', detectionResult.id.toString());
        console.log('Detection ID saved:', detectionResult.id);
      }
      
      // 이미지를 로컬 스토리지에 저장
      saveImageToHistory(previewUrl);
      
      // 탐지된 음식 정보 가져오기
      const foodInfo = await getFoodById(food_id);
      
      // 세션 스토리지에 탐지된 음식 이름 저장
      sessionStorage.setItem('selectedFood', foodInfo.name);
      sessionStorage.setItem('selectedFoodId', food_id.toString());
      
      setIsLoading(false);
      navigate('/recipe');
    } catch (err) {
      setError('이미지 분석 중 오류가 발생했습니다.');
      setIsLoading(false);
      console.error('Image analysis error:', err);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setPreviewUrl('');
  };
  
  const saveImageToHistory = (imageUrl) => {
    // 중복 방지
    if (!imageHistory.includes(imageUrl)) {
      const newHistory = [imageUrl, ...imageHistory];
      
      // 최대 10개까지만 저장
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
    // 선택한 이미지를 현재 이미지로 설정
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
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div className={styles.mainContainer}>
          {/* 왼쪽: 이미지 업로드 영역 */}
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
                  <button 
                    onClick={handleUpload} 
                    disabled={isLoading}
                  >
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
          
          {/* 오른쪽: 이전 업로드 이미지 갤러리 */}
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