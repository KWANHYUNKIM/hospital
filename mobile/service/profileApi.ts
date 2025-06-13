import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  interests: string[];
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  nickname?: string;
  interests?: string[] | string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: any; // React Native의 이미지 파일 타입
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 사용자 프로필 정보 조회
 * @param userId 사용자 ID
 * @returns Promise<UserProfile> 사용자 프로필
 */
export const fetchUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${baseUrl}/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('프로필 로딩 실패:', error);
    throw error;
  }
};

/**
 * 사용자 프로필 정보 업데이트
 * @param userId 사용자 ID
 * @param profileData 업데이트할 프로필 데이터
 * @returns Promise<UserProfile> 업데이트된 프로필
 */
export const updateUserProfile = async (userId: number, profileData: UpdateProfileData): Promise<UserProfile> => {
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
      formData.append('current_password', profileData.currentPassword || '');
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
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
    throw error;
  }
};

export default {
  fetchUserProfile,
  updateUserProfile,
}; 