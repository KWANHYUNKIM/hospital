import axios from "axios";
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 병원 목록 가져오기 (전체 조회)
export const fetchHospitals = async (params) => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/search`, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching hospitals:", error);
    throw error;
  }
};

// 병원 상세 정보 가져오기
export const fetchHospitalDetail = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/api/hospitals/detail/${id}`);
    return response.data;
  } catch (error) {
    console.error('병원 상세 정보 조회 실패:', error);
    throw error;
  }
};

// 자동완성 API
export const fetchAutoComplete = async ({ query, latitude, longitude }) => {
  try {
    // params 객체 조립
    const params = { query };
    if (latitude != null)  params.latitude  = latitude;
    if (longitude != null) params.longitude = longitude;

    const response = await axios.get(`${baseUrl}/api/autocomplete`, { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching autocomplete suggestions:", error);
    throw error;
  }
};

// 위치 기반 병원 검색
export const fetchNearbyHospitals = async (latitude, longitude, distance = 1000) => {
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