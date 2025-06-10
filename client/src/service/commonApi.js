import axios from "axios";
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 활성 공지사항 목록 가져오기
export const fetchActiveAnnouncements = async () => {
  try {
    const response = await axios.get(`${baseUrl}/api/announcements/active`);
    return response.data.sort((a, b) => b.priority - a.priority);
  } catch (error) {
    console.error('활성 공지사항 로딩 실패:', error);
    throw error;
  }
};

// 최신 날씨 데이터 조회
export const fetchLatestWeather = async (params = {}) => {
  try {
    const response = await axios.get(`${baseUrl}/api/weather/latest`, { params });
    return response.data;
  } catch (error) {
    console.error('최신 날씨 데이터 조회 실패:', error);
    throw error;
  }
};

//console.log(`🔗 API Base URL: ${baseURL}`); 