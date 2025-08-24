import axios from "axios";
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

export const analyticsApi = {
  // 검색 이벤트 전송
  sendSearchEvent: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}/api/analytics/search-event`, data);
      return response.data;
    } catch (error) {
      console.error("❌ 검색 이벤트 전송 실패:", error);
      throw error;
    }
  },

  // 클릭 이벤트 전송
  sendClickEvent: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}/api/analytics/click-event`, data);
      return response.data;
    } catch (error) {
      console.error("❌ 클릭 이벤트 전송 실패:", error);
      throw error;
    }
  },

  // 체류 시간 이벤트 전송
  sendDwellTimeEvent: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}/api/analytics/dwell-time`, data);
      return response.data;
    } catch (error) {
      console.error("❌ 체류 시간 이벤트 전송 실패:", error);
      throw error;
    }
  },

  // 페이지 뷰 이벤트 전송
  sendPageViewEvent: async (data) => {
    try {
      const response = await axios.post(`${baseUrl}/api/analytics/page-view`, data);
      return response.data;
    } catch (error) {
      console.error("❌ 페이지 뷰 이벤트 전송 실패:", error);
      throw error;
    }
  },

  // 사용자 프로파일 조회
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/user-profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ 사용자 프로파일 조회 실패:", error);
      throw error;
    }
  },

  // 검색 분석 데이터 조회
  getSearchAnalytics: async (userId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/search-analytics/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ 검색 분석 데이터 조회 실패:", error);
      throw error;
    }
  },

  // 인기 검색어 조회
  getPopularSearches: async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/popular-searches`);
      return response.data;
    } catch (error) {
      console.error("❌ 인기 검색어 조회 실패:", error);
      throw error;
    }
  },

  // 인기 병원 조회
  getPopularHospitals: async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/popular-hospitals`);
      return response.data;
    } catch (error) {
      console.error("❌ 인기 병원 조회 실패:", error);
      throw error;
    }
  },

  // 사용자 프로파일 업데이트
  updateUserProfile: async (userId) => {
    try {
      const response = await axios.put(`${baseUrl}/api/analytics/user-profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ 사용자 프로파일 업데이트 실패:", error);
      throw error;
    }
  },

  // 이벤트 통계 조회
  getEventStatistics: async (userId, eventType, startDate, endDate) => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/statistics/${userId}`, {
        params: { eventType, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("❌ 이벤트 통계 조회 실패:", error);
      throw error;
    }
  },

  // 헬스 체크
  healthCheck: async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/analytics/health`);
      return response.data;
    } catch (error) {
      console.error("❌ 분석 서비스 헬스 체크 실패:", error);
      throw error;
    }
  }
}; 