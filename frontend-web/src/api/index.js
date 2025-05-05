// src/api/index.js - 모든 API를 한 곳에서 내보내기
import apiClient from './client';
import { authApi } from './auth';
import { recipeApi } from './recipe';
import { detectionApi } from './detection';
//import { ingredientsApi } from './ingredients';
//import { reviewApi } from './review';

// API 에러 핸들링을 위한 유틸리티 함수
export const handleApiError = (error) => {
  // API 에러 응답이 있는 경우
  if (error.response) {
    const { status, data } = error.response;
    
    // 401 Unauthorized: 인증 문제
    if (status === 401) {
      return {
        success: false,
        message: '로그인이 필요하거나 세션이 만료되었습니다.',
        error: data
      };
    }
    
    // 403 Forbidden: 권한 문제
    if (status === 403) {
      return {
        success: false,
        message: '해당 작업에 대한 권한이 없습니다.',
        error: data
      };
    }
    
    // 404 Not Found: 리소스 없음
    if (status === 404) {
      return {
        success: false,
        message: '요청한 정보를 찾을 수 없습니다.',
        error: data
      };
    }
    
    // 422 Unprocessable Entity: 유효성 검사 오류
    if (status === 422) {
      return {
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        validationErrors: data.detail || data,
        error: data
      };
    }
    
    // 500 Internal Server Error: 서버 오류
    if (status >= 500) {
      return {
        success: false,
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error: data
      };
    }
    
    // 그 외 기타 오류
    return {
      success: false,
      message: '오류가 발생했습니다.',
      status,
      error: data
    };
  }
  
  // 요청 자체가 실패한 경우 (네트워크 오류 등)
  if (error.request) {
    return {
      success: false,
      message: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      error: error.request
    };
  }
  
  // 그 외 모든 오류
  return {
    success: false,
    message: '알 수 없는 오류가 발생했습니다.',
    error: error.message
  };
};

// 모든 API 내보내기
export {
  apiClient,
  authApi,
  recipeApi,
  detectionApi,
  //ingredientsApi,
  //reviewApi
};