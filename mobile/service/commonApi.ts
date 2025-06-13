import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WeatherData {
  id: number;
  temperature: number;
  humidity: number;
  weather: string;
  location: string;
  timestamp: string;
}

interface WeatherParams {
  location?: string;
  limit?: number;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 활성 공지사항 목록 가져오기
 * @returns Promise<Announcement[]> 활성 공지사항 목록 (우선순위 내림차순)
 */
export const fetchActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/announcements/active`);
    return response.data.sort((a: Announcement, b: Announcement) => b.priority - a.priority);
  } catch (error) {
    console.error('활성 공지사항 로딩 실패:', error);
    throw error;
  }
};

/**
 * 최신 날씨 데이터 조회
 * @param params 날씨 조회 파라미터
 * @returns Promise<WeatherData[]> 날씨 데이터 목록
 */
export const fetchLatestWeather = async (params: WeatherParams = {}): Promise<WeatherData[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/weather/latest`, { params });
    return response.data;
  } catch (error) {
    console.error('최신 날씨 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 상세 조회
 * @param id 공지사항 ID
 * @returns Promise<Announcement> 공지사항 상세 정보
 */
export const fetchAnnouncementDetail = async (id: number): Promise<Announcement> => {
  try {
    const response = await axios.get(`${baseUrl}/api/announcements/${id}`);
    return response.data;
  } catch (error) {
    console.error('공지사항 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 날씨 정보 업데이트 (관리자용)
 * @param weatherData 날씨 데이터
 * @returns Promise<WeatherData> 업데이트된 날씨 데이터
 */
export const updateWeatherData = async (weatherData: Partial<WeatherData>): Promise<WeatherData> => {
  try {
    const response = await axios.post(`${baseUrl}/api/weather/update`, weatherData);
    return response.data;
  } catch (error) {
    console.error('날씨 데이터 업데이트 실패:', error);
    throw error;
  }
};

export default {
  fetchActiveAnnouncements,
  fetchLatestWeather,
  fetchAnnouncementDetail,
  updateWeatherData,
}; 