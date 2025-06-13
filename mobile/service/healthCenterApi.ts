import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface HealthCenter {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  services: string[];
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

interface HealthCenterSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
  services?: string[];
}

interface HealthCenterListResponse {
  data: HealthCenter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 건강증진센터 목록 조회 API
 * @param params 검색 파라미터
 * @returns Promise<HealthCenterListResponse> 건강증진센터 목록
 */
export const fetchHealthCenters = async (params: HealthCenterSearchParams = {}): Promise<HealthCenterListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers`, { params });
    return response.data;
  } catch (error) {
    console.error('건강증진센터 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 건강증진센터 상세 조회 API
 * @param id 건강증진센터 ID
 * @returns Promise<HealthCenter> 건강증진센터 상세 정보
 */
export const fetchHealthCenterDetail = async (id: number): Promise<HealthCenter> => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers/${id}`);
    return response.data;
  } catch (error) {
    console.error('건강증진센터 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 근처 건강증진센터 검색
 * @param latitude 위도
 * @param longitude 경도
 * @param radius 검색 반경 (미터)
 * @returns Promise<HealthCenter[]> 근처 건강증진센터 목록
 */
export const fetchNearbyHealthCenters = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<HealthCenter[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers/nearby`, {
      params: { latitude, longitude, radius }
    });
    return response.data;
  } catch (error) {
    console.error('근처 건강증진센터 검색 실패:', error);
    throw error;
  }
};

/**
 * 건강증진센터 서비스 목록 조회
 * @returns Promise<string[]> 사용 가능한 서비스 목록
 */
export const fetchHealthCenterServices = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers/services`);
    return response.data;
  } catch (error) {
    console.error('건강증진센터 서비스 목록 조회 실패:', error);
    throw error;
  }
};

export default {
  fetchHealthCenters,
  fetchHealthCenterDetail,
  fetchNearbyHealthCenters,
  fetchHealthCenterServices,
}; 