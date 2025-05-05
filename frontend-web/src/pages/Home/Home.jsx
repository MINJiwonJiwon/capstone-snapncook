import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import RankingRecommendation from '../../components/RankingRecommendation/RankingRecommendation';
import styles from './Home.module.css';
import useAuth from '../../hooks/useAuth';
import { saveDetectionResult } from '../../api/detection';

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
    if (!isLoggedIn) {
      alert('사진을 업로드하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
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
    
    if (!isLoggedIn) {
      alert('사진을 업로드하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
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
    if (!previewUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 실제 API 연동 시 파일 업로드 처리
      const formData = new FormData();
      formData.append('file', file);
      
      // 파일 업로드 API 호출 (예시)
      // const uploadResponse = await apiClient.post('/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // 백엔드 API가 완전히 연동되기 전까지는 목업 데이터 사용
      // 실제 구현 시 API 응답으로 대체
      const detectionResult = {
        food_id: 1, // 김치찌개 ID로 가정
        image_path: 'uploads/images/kimchi.jpg', // 서버에 저장된 이미지 경로
        confidence: 0.92 // 신뢰도
      };
      
      // 탐지 결과 저장 API 호출
      await saveDetectionResult(detectionResult);
      
      // 이미지를 로컬 스토리지에 저장
      saveImageToHistory(previewUrl);
      
      // 세션 스토리지에 탐지된 음식 이름 저장 (실제로는 API 응답에서 가져옴)
      sessionStorage.setItem('selectedFood', '김치찌개');
      
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
                onClick={() => {
                  if (isLoggedIn) {
                    document.getElementById('file-input').click();
                  } else {
                    alert('사진을 업로드하려면 로그인이 필요합니다.');
                    navigate('/login');
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <p>
                  {isLoggedIn 
                    ? '이미지를 여기에 드래그하거나 클릭하여 업로드하세요' 
                    : '사진을 업로드하려면 로그인이 필요합니다.'}
                </p>
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