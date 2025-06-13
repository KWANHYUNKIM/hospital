import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from './api';

const instance = axios.create({
  baseURL: `${getApiUrl()}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 저장/조회/삭제 함수들
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('토큰 조회 실패:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
};

// 요청 인터셉터 - 토큰을 헤더에 추가
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 인증 에러 처리
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      await removeAuthToken();
      
      // TODO: 로그인 화면으로 이동
      // 실제 앱에서는 navigation 서비스나 context를 통해 처리
      console.log('인증 오류: 로그인이 필요합니다.');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 