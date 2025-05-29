import client from './client';
import { AI_DETECTION } from './endpoints';

/**
 * 이미지 업로드 API
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<Object>} 업로드된 파일 정보
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await client.post(AI_DETECTION.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // ✔️ JSON 아님
      },
    });
    return response.data;
  } catch (error) {
    console.error("Upload image error:", error);
    throw error;
  }
};

/**
 * AI 예측 API
 * @param {File} file - 예측할 이미지 파일
 * @returns {Promise<Object>} 예측 결과
 */
export const predictImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await client.post(AI_DETECTION.PREDICT, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // ✔️ JSON 아님
      },
    });
    return response.data;
  } catch (error) {
    console.error("Predict image error:", error);
    throw error;
  }
};
