import axios from 'axios';

// React Native에서는 process.env 대신 설정 상수 사용
// TODO: 실제 배포 시에는 환경별 설정 파일로 관리
const API_CONFIG = {
  development: 'http://localhost:3002',
  production: 'https://your-production-api.com', // TODO: 실제 API URL로 변경
};

// 현재 환경 감지 (개발용)
const isDevelopment = __DEV__;
const API_URL = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    return Promise.reject(error);
  }
);

export { api };

export const getApiUrl = (): string => API_URL;

export default api; 