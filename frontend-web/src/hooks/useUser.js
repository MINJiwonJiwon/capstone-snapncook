import { useState } from 'react';
import { 
  getUserInfo, 
  getSocialStatus, 
  disconnectSocial, 
  updateUserInfo, 
  deleteAccount,
  changePassword 
} from '../api/user';

/**
 * 사용자 정보 관리 관련 기능을 제공하는 커스텀 훅
 * @returns {Object} 사용자 정보 관련 상태 및 함수들
 */
const useUser = () => {
  const [user, setUser] = useState(null);
  const [socialStatus, setSocialStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * 사용자 정보 가져오기
   */
  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserInfo();
      setUser(result);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 소셜 연동 상태 가져오기
   */
  const fetchSocialStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getSocialStatus();
      setSocialStatus(result);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || '소셜 연동 상태를 가져오는 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 소셜 연동 해제하기
   * @param {string} provider - 연동 해제할 소셜 로그인 제공자 (google, kakao, naver)
   */
  const handleDisconnectSocial = async (provider) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await disconnectSocial(provider);
      setSuccess(`${provider} 연동이 해제되었습니다.`);
      setLoading(false);
      
      // 소셜 상태 업데이트
      await fetchSocialStatus();
      
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || `${provider} 연동 해제 중 오류가 발생했습니다.`);
      throw err;
    }
  };

  /**
   * 사용자 정보 수정하기
   * @param {Object} userData - 수정할 사용자 정보
   */
  const handleUpdateUserInfo = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await updateUserInfo(userData);
      setSuccess('사용자 정보가 성공적으로 업데이트되었습니다.');
      setUser(result);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || '사용자 정보 업데이트 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 비밀번호 변경하기
   * @param {Object} passwordData - 비밀번호 정보
   */
  const handleChangePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await changePassword(passwordData);
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 계정 삭제하기
   */
  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await deleteAccount();
      setSuccess('계정이 성공적으로 삭제되었습니다.');
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      setError(err.message || '계정 삭제 중 오류가 발생했습니다.');
      throw err;
    }
  };

  /**
   * 에러 및 성공 메시지 초기화
   */
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    user,
    socialStatus,
    loading,
    error,
    success,
    fetchUserInfo,
    fetchSocialStatus,
    disconnectSocial: handleDisconnectSocial,
    updateUserInfo: handleUpdateUserInfo,
    changePassword: handleChangePassword,
    deleteAccount: handleDeleteAccount,
    clearMessages
  };
};

export default useUser;