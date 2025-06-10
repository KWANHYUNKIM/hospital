import axios from 'axios';
import { getApiUrl } from '../utils/api';

// 환경 변수에서 API URL 가져오기
const baseUrl = getApiUrl();

// 건강증진센터 목록 조회 API
export const fetchHealthCenters = async (params = {}) => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers`, { params });
    return response.data;
  } catch (error) {
    console.error('건강증진센터 목록 조회 실패:', error);
    throw error;
  }
};

// 건강증진센터 상세 조회 API
export const fetchHealthCenterDetail = async (id) => {
  try {
    const response = await axios.get(`${baseUrl}/api/health-centers/${id}`);
    return response.data;
  } catch (error) {
    console.error('건강증진센터 상세 조회 실패:', error);
    throw error;
  }
}; 