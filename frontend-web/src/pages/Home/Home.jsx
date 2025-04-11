import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import RankingRecommendation from '../../components/RankingRecommendation/RankingRecommendation';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageHistory, setImageHistory] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // 로그인 상태 확인
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
    
    // 로컬 스토리지에서 이미지 히스토리 가져오기
    const storedHistory = JSON.parse(localStorage.getItem('imageHistory')) || [];
    setImageHistory(storedHistory);
  }, []);
  
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
  
  const handleUpload = () => {
    // 이미지를 로컬 스토리지에 저장
    if (previewUrl) {
      saveImageToHistory(previewUrl);
      navigate('/recipe');
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
                  <button onClick={handleUpload}>분석하기</button>
                  <button onClick={resetUpload} className={styles.cancelButton}>취소</button>
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
              <button onClick={clearHistory} className={styles.clearHistory}>기록 삭제</button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Home;