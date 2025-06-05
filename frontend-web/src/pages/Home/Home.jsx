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
import client from '../../api/client';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recentImages, setRecentImages] = useState([]); // API 기반으로 변경
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  
  // 로그아웃 감지 및 백업 처리
  const backupCurrentHistory = useCallback(() => {
    if (user?.id && recentImages.length > 0) {
      const fullHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
      localStorage.setItem(`imageHistory_${user.id}`, JSON.stringify(fullHistory));
      console.log(`Backed up history for user ${user.id} before logout`);
    }
  }, [user?.id, recentImages]);

  // 로그아웃 감지
  useEffect(() => {
    // 이전에 로그인된 사용자가 있었는데 지금 로그아웃된 경우
    const prevUserId = JSON.parse(localStorage.getItem('user') || '{}').id;
    if (prevUserId && !isLoggedIn) {
      backupCurrentHistory();
    }
  }, [isLoggedIn, backupCurrentHistory]);

  // 통합: API 기반 최근 이미지 로드
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadRecentImages();
    } else {
      // 로그인하지 않은 경우 로컬 히스토리만 표시
      loadLocalHistory();
    }
  }, [isLoggedIn, user?.id]);

  // API에서 최근 이미지 3개 가져오기 - 개선된 버전
  const loadRecentImages = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    
    try {
      const detectionResults = await getMyDetectionResults();
      // 최신 3개만 추출
      const recent = detectionResults.slice(0, 3).map(item => ({
        imageUrl: item.image_path,
        foodName: item.food_name,
        confidence: item.confidence,
        id: item.id
      }));
      setRecentImages(recent);
      setHistoryError(null);
      console.log(`Loaded ${recent.length} recent images from API`);
    } catch (error) {
      console.error('Failed to load recent images from API:', error);
      setHistoryError('서버에서 이미지를 가져올 수 없습니다. 로컬 기록을 표시합니다.');
      // API 실패 시 로컬 히스토리로 fallback
      loadLocalHistory();
    } finally {
      setHistoryLoading(false);
    }
  };

  // 로컬 히스토리에서 로드 (비로그인 사용자용)
  const loadLocalHistory = () => {
    try {
      const localHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
      const recent = localHistory.slice(0, 3).map((imageUrl, index) => ({
        imageUrl,
        foodName: '이전 업로드 이미지',
        id: `local-${index}`
      }));
      setRecentImages(recent);
      console.log(`Loaded ${recent.length} recent images from local storage`);
    } catch (error) {
      console.error('Failed to load local history:', error);
      setRecentImages([]);
    }
  };

  // 이미지 업로드 성공 시 목록 새로고침
  const refreshRecentImages = () => {
    if (isLoggedIn) {
      loadRecentImages();
    } else {
      loadLocalHistory();
    }
  };
  
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
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await client.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const { food_id, image_path, confidence } = uploadResponse.data;
      
      // 탐지된 음식 정보 가져오기
      const foodInfo = await getFoodById(food_id);
      
      // 로그인된 경우 탐지 결과 저장
      if (isLoggedIn) {
        const detectionResult = await saveDetectionResult({
          food_id,
          image_path,
          confidence
        });
        
        if (detectionResult && detectionResult.id) {
          sessionStorage.setItem('detectionId', detectionResult.id.toString());
          console.log('Detection ID saved:', detectionResult.id);
        }
        
        // 즉시 로컬 상태 업데이트 (개선)
        const newItem = {
          imageUrl: image_path,
          foodName: foodInfo.name,
          confidence: confidence,
          id: detectionResult?.id || Date.now()
        };
        setRecentImages(prev => [newItem, ...prev.slice(0, 2)]);
        
        // 백그라운드에서 API 재조회로 동기화
        setTimeout(() => {
          refreshRecentImages();
        }, 1000);
      } else {
        // 비로그인 사용자는 로컬에만 저장
        saveToLocalHistory(previewUrl);
        
        // 즉시 로컬 상태 업데이트
        const newItem = {
          imageUrl: previewUrl,
          foodName: foodInfo.name,
          id: `local-${Date.now()}`
        };
        setRecentImages(prev => [newItem, ...prev.slice(0, 2)]);
      }
      
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
  
  // 비로그인 사용자용 로컬 히스토리 저장
  const saveToLocalHistory = (imageUrl) => {
    try {
      const currentHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
      if (!currentHistory.includes(imageUrl)) {
        const newHistory = [imageUrl, ...currentHistory].slice(0, 10);
        localStorage.setItem('imageHistory', JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error('Failed to save to local history:', error);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setPreviewUrl('');
  };
  
  // 최근 이미지 클릭 핸들러
  const handleRecentImageClick = (imageUrl, foodName) => {
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
          
          {/* 오른쪽: 최근 업로드 이미지 (3개) */}
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
            
            {/* 비로그인 사용자용 로컬 히스토리 정리 버튼 */}
            {!isLoggedIn && recentImages.length > 0 && (
              <button 
                className={styles.clearLocalHistory}
                onClick={() => {
                  localStorage.removeItem('imageHistory');
                  setRecentImages([]);
                  alert('로컬 히스토리가 삭제되었습니다.');
                }}
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