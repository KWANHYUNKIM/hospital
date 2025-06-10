import axios from 'axios';
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 전체 약국 데이터 조회 API
export const fetchAllPharmacies = async (params = {}) => {
  try {
    const response = await axios.get(`${baseUrl}/api/pharmacies`, { params });
    return response.data;
  } catch (error) {
    console.error('약국 데이터 조회 실패:', error);
    throw error;
  }
};

// 약국 검색 API
export const searchPharmacies = async (params = {}) => {
  try {
    const response = await axios.get(`${baseUrl}/api/pharmacies`, { params });
    return response.data;
  } catch (error) {
    console.error('약국 검색 실패:', error);
    throw error;
  }
}; 