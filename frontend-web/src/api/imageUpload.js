import client from './client';

/**
 * 이미지 파일 업로드 유틸리티
 * @param {File} file - 업로드할 이미지 파일
 * @param {string} type - 이미지 타입 ('profile', 'recipe', 'review' 등)
 * @returns {Promise<string>} 업로드된 이미지 URL
 */
export const uploadImage = async (file, type = 'profile') => {
  // 파일 타입 확인
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.');
  }
  
  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('이미지 크기는 5MB 이하여야 합니다.');
  }
  
  // FormData 생성
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    // '/api/upload' 엔드포인트로 파일 업로드 (실제 엔드포인트에 맞게 수정 필요)
    const response = await client.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // 업로드된 이미지 URL 반환
    return response.data.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('이미지 업로드 중 오류가 발생했습니다.');
  }
};

/**
 * Base64 이미지를 File 객체로 변환
 * @param {string} base64Image - Base64 형식의 이미지 데이터
 * @param {string} filename - 파일 이름
 * @returns {File} File 객체
 */
export const base64ToFile = (base64Image, filename = 'image.png') => {
  // Base64 헤더 제거 (예: 'data:image/png;base64,')
  const base64Data = base64Image.split(',')[1];
  
  // Base64 디코딩
  const byteString = window.atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  
  // 파일 타입 추출 (예: 'image/png')
  const mimeType = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)[1];
  
  // File 객체 생성
  return new File([arrayBuffer], filename, { type: mimeType });
};

/**
 * 이미지 크기 조정
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비
 * @param {number} maxHeight - 최대 높이
 * @param {number} quality - 이미지 품질 (0~1)
 * @returns {Promise<File>} 크기가 조정된 이미지 파일
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // 원본 비율 유지하면서 크기 조정
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        // 캔버스 생성 및 이미지 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 이미지를 Base64로 변환
        const resizedBase64 = canvas.toDataURL(file.type, quality);
        
        // Base64를 File 객체로 변환
        const resizedFile = base64ToFile(resizedBase64, file.name);
        resolve(resizedFile);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};