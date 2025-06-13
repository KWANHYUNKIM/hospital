import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface Hospital {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  category: string;
  operatingHours: string;
  emergencyRoom: boolean;
  nightService: boolean;
  holidayService: boolean;
  specialties: string[];
  description?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface HospitalSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  emergencyRoom?: boolean;
  nightService?: boolean;
  holidayService?: boolean;
  specialties?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface HospitalListResponse {
  data: Hospital[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AutoCompleteResult {
  id: number;
  name: string;
  address: string;
  category: string;
  distance?: number;
}

interface NearbyHospitalParams {
  latitude: number;
  longitude: number;
  radius: number;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 병원 목록 가져오기 (전체 조회)
 * @param params 검색 파라미터
 * @returns Promise<HospitalListResponse> 병원 목록
 */
export const fetchHospitals = async (params: HospitalSearchParams): Promise<HospitalListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/search`, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching hospitals:", error);
    throw error;
  }
};

/**
 * 병원 상세 정보 가져오기
 * @param id 병원 ID
 * @returns Promise<Hospital> 병원 상세 정보
 */
export const fetchHospitalDetail = async (id: number): Promise<Hospital> => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('병원 상세 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 자동완성 API
 * @param params 자동완성 파라미터
 * @returns Promise<AutoCompleteResult[]> 자동완성 결과
 */
export const fetchAutoComplete = async (params: {
  query: string;
  latitude?: number;
  longitude?: number;
}): Promise<AutoCompleteResult[]> => {
  try {
    // params 객체 조립
    const searchParams: any = { query: params.query };
    if (params.latitude != null) searchParams.latitude = params.latitude;
    if (params.longitude != null) searchParams.longitude = params.longitude;

    const response = await axios.get(`${baseUrl}/api/autocomplete`, { params: searchParams });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching autocomplete suggestions:", error);
    throw error;
  }
};

/**
 * 위치 기반 병원 검색
 * @param latitude 위도
 * @param longitude 경도
 * @param distance 검색 반경 (미터, 기본값: 1000m)
 * @returns Promise<Hospital[]> 근처 병원 목록
 */
export const fetchNearbyHospitals = async (
  latitude: number,
  longitude: number,
  distance: number = 1000
): Promise<Hospital[]> => {
  try {
    const response = await axios.post(`${baseUrl}/api/autocomplete/nearby`, {
      latitude,
      longitude,
      radius: distance
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nearby hospitals:", error);
    throw error;
  }
};

/**
 * 응급실 운영 병원 조회
 * @param params 검색 파라미터
 * @returns Promise<Hospital[]> 응급실 운영 병원 목록
 */
export const fetchEmergencyHospitals = async (params: HospitalSearchParams = {}): Promise<Hospital[]> => {
  try {
    const searchParams = { ...params, emergencyRoom: true };
    const response = await axios.get(`${baseUrl}/api/hospitals/emergency`, { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('응급실 운영 병원 조회 실패:', error);
    throw error;
  }
};

/**
 * 병원 카테고리 목록 조회
 * @returns Promise<string[]> 병원 카테고리 목록
 */
export const fetchHospitalCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/categories`);
    return response.data;
  } catch (error) {
    console.error('병원 카테고리 조회 실패:', error);
    throw error;
  }
};

/**
 * 병원 진료과목 목록 조회
 * @returns Promise<string[]> 진료과목 목록
 */
export const fetchHospitalSpecialties = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/specialties`);
    return response.data;
  } catch (error) {
    console.error('병원 진료과목 조회 실패:', error);
    throw error;
  }
};

export default {
  fetchHospitals,
  fetchHospitalDetail,
  fetchAutoComplete,
  fetchNearbyHospitals,
  fetchEmergencyHospitals,
  fetchHospitalCategories,
  fetchHospitalSpecialties,
}; 