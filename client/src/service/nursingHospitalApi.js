import axios from 'axios';
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 요양병원 목록 가져오기
export const fetchNursingHospitals = async (params) => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/search`, { 
      params: {
        ...params,
        category: "요양병원"  // 기본값으로 요양병원 카테고리 설정
      } 
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nursing hospitals:", error);
    throw error;
  }
};

// 요양병원 상세 정보 가져오기
export const fetchNursingHospitalDetail = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/hospital/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching nursing hospital detail:", error);
    throw error;
  }
};

// 요양병원 자동완성 API
export const fetchNursingHospitalAutoComplete = async (query) => {
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

// 요양병원 키워드 통계 조회
export const fetchHospitalKeywordStats = async (hospitalId) => {
  try {
    const response = await axios.get(`${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/keyword-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching keyword stats:', error);
    throw error;
  }
};

// 요양병원 리뷰 목록 조회 (페이지네이션 및 정렬 포함)
export const fetchHospitalReviews = async (hospitalId, page = 1, limit = 10, sort = 'latest') => {
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

// 요양병원 리뷰 작성
export const submitHospitalReview = async (hospitalId, reviewData) => {
  try {
    const response = await axios.post(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('리뷰 작성 실패:', error);
    throw error;
  }
};

// 요양병원 리뷰 수정
export const updateHospitalReview = async (hospitalId, reviewId, reviewData) => {
  try {
    const response = await axios.put(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews/${reviewId}`,
      reviewData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('리뷰 수정 실패:', error);
    throw error;
  }
};

// 요양병원 리뷰 삭제
export const deleteHospitalReview = async (hospitalId, reviewId) => {
  try {
    const response = await axios.delete(
      `${baseUrl}/api/nursing-hospitals/hospital/${hospitalId}/reviews/${reviewId}`,
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('리뷰 삭제 실패:', error);
    throw error;
  }
}; 