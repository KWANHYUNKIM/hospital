import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  nightService: boolean;
  holidayService: boolean;
  parking: boolean;
  website?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface PharmacySearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  nightService?: boolean;
  holidayService?: boolean;
  parking?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface PharmacyListResponse {
  data: Pharmacy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 전체 약국 데이터 조회 API
 * @param params 검색 파라미터
 * @returns Promise<PharmacyListResponse> 약국 목록
 */
export const fetchAllPharmacies = async (params: PharmacySearchParams = {}): Promise<PharmacyListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/pharmacies`, { params });
    return response.data;
  } catch (error) {
    console.error('약국 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * 약국 검색 API
 * @param params 검색 파라미터
 * @returns Promise<PharmacyListResponse> 약국 검색 결과
 */
export const searchPharmacies = async (params: PharmacySearchParams = {}): Promise<PharmacyListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/pharmacies`, { params });
    return response.data;
  } catch (error) {
    console.error('약국 검색 실패:', error);
    throw error;
  }
};

export default {
  fetchAllPharmacies,
  searchPharmacies,
}; 