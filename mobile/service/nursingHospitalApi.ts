import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface NursingHospital {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  category: string;
  operatingHours: string;
  capacity: number;
  availableBeds: number;
  specialties: string[];
  facilities: string[];
  description?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface NursingHospitalSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  specialties?: string[];
  minCapacity?: number;
  hasAvailableBeds?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'distance' | 'rating' | 'name' | 'capacity';
  sortOrder?: 'asc' | 'desc';
}

interface NursingHospitalListResponse {
  data: NursingHospital[];
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

interface KeywordStats {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface HospitalReview {
  id: number;
  rating: number;
  comment: string;
  keywords: string[];
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewListResponse {
  data: HospitalReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
}

interface CreateReviewData {
  rating: number;
  comment: string;
  keywords?: string[];
  isAnonymous?: boolean;
}

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

/**
 * 요양병원 목록 가져오기
 * @param params 검색 파라미터
 * @returns Promise<NursingHospitalListResponse> 요양병원 목록
 */
export const fetchNursingHospitals = async (params: NursingHospitalSearchParams): Promise<NursingHospitalListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/search`, { 
      params: {
        ...params,
        category: params.category || "요양병원"  // 기본값으로 요양병원 카테고리 설정
      } 
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nursing hospitals:", error);
    throw error;
  }
};

/**
 * 요양병원 상세 정보 가져오기
 * @param id 요양병원 ID
 * @returns Promise<NursingHospital> 요양병원 상세 정보
 */
export const fetchNursingHospitalDetail = async (id: number): Promise<NursingHospital> => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/hospital/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nursing hospital detail:", error);
    throw error;
  }
};

/**
 * 요양병원 자동완성 API
 * @param query 검색어
 * @returns Promise<AutoCompleteResult[]> 자동완성 결과
 */
export const fetchNursingHospitalAutoComplete = async (query: string): Promise<AutoCompleteResult[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/autoComplete`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nursing hospital autocomplete:", error);
    throw error;
  }
};

/**
 * 요양병원 키워드 통계 조회
 * @param hospitalId 병원 ID
 * @returns Promise<KeywordStats[]> 키워드 통계
 */
export const fetchHospitalKeywordStats = async (hospitalId: number): Promise<KeywordStats[]> => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/keyword-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching keyword stats:', error);
    throw error;
  }
};

/**
 * 요양병원 리뷰 목록 조회 (페이지네이션 및 정렬 포함)
 * @param hospitalId 병원 ID
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 * @param sort 정렬 방식
 * @returns Promise<ReviewListResponse> 리뷰 목록
 */
export const fetchHospitalReviews = async (
  hospitalId: number,
  page: number = 1,
  limit: number = 10,
  sort: string = 'latest'
): Promise<ReviewListResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews`, {
      params: { page, limit, sort }
    });
    return response.data;
  } catch (error) {
    console.error('병원 리뷰 조회 실패:', error);
    throw error;
  }
};

/**
 * 요양병원 리뷰 작성
 * @param hospitalId 병원 ID
 * @param reviewData 리뷰 데이터
 * @returns Promise<HospitalReview> 작성된 리뷰
 */
export const submitHospitalReview = async (hospitalId: number, reviewData: CreateReviewData): Promise<HospitalReview> => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    throw error;
  }
};

/**
 * 요양병원 리뷰 수정
 * @param hospitalId 병원 ID
 * @param reviewId 리뷰 ID
 * @param reviewData 수정할 리뷰 데이터
 * @returns Promise<HospitalReview> 수정된 리뷰
 */
export const updateHospitalReview = async (
  hospitalId: number,
  reviewId: number,
  reviewData: Partial<CreateReviewData>
): Promise<HospitalReview> => {
  try {
    const response = await axios.put(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

/**
 * 요양병원 리뷰 삭제
 * @param hospitalId 병원 ID
 * @param reviewId 리뷰 ID
 * @returns Promise<void>
 */
export const deleteHospitalReview = async (hospitalId: number, reviewId: number): Promise<void> => {
  try {
    await axios.delete(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews/${reviewId}`
    );
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
};

export default {
  fetchNursingHospitals,
  fetchNursingHospitalDetail,
  fetchNursingHospitalAutoComplete,
  fetchHospitalKeywordStats,
  fetchHospitalReviews,
  submitHospitalReview,
  updateHospitalReview,
  deleteHospitalReview,
}; 