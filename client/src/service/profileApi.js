import axios from 'axios';
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 사용자 프로필 정보 조회
export const fetchUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${baseUrl}/api/auth/users/${userId}`, { 
      withCredentials: true 
    });
    return response.data;
  } catch (error) {
    console.error('프로필 로딩 실패:', error);
    throw error;
  }
};

// 사용자 프로필 정보 업데이트
export const updateUserProfile = async (userId, profileData) => {
  try {
    const formData = new FormData();
    
    // 기본 정보 추가
    if (profileData.nickname) {
      formData.append('nickname', profileData.nickname);
    }
    
    // 관심사 추가 (JSON 형식으로 변환)
    if (profileData.interests) {
      const interestsArray = Array.isArray(profileData.interests) 
        ? profileData.interests 
        : (profileData.interests ? JSON.parse(profileData.interests) : []);
      formData.append('interests', JSON.stringify(interestsArray));
    }
    
    // 비밀번호 변경 정보 추가
    if (profileData.newPassword) {
      formData.append('current_password', profileData.currentPassword);
      formData.append('new_password', profileData.newPassword);
    }

    // 프로필 이미지 추가
    if (profileData.profileImage) {
      formData.append('profile_image', profileData.profileImage);
    }

    const response = await axios.put(
      `${baseUrl}/api/auth/users/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    throw error;
  }
}; 