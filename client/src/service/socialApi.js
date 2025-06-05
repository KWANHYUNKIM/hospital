import axios from '../utils/axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// 채널 목록 조회
export const getSocialChannels = async () => {
  const response = await axios.get(`${API_URL}/api/channels`);
  return response.data;
};

// 채널 생성
export const createChannel = async (channelData) => {
  const response = await axios.post(`${API_URL}/api/channels`, channelData);
  return response.data;
};

// 채널 수정
export const updateChannel = async (id, channelData) => {
  const response = await axios.put(`${API_URL}/api/channels/${id}`, channelData);
  return response.data;
};

// 채널 삭제
export const deleteChannel = async (id) => {
  await axios.delete(`${API_URL}/api/channels/${id}`);
};

// 채널 승인/거절
export const approveChannel = async (id, approvalData) => {
  const response = await axios.post(`${API_URL}/api/channels/${id}/approve`, approvalData);
  return response.data;
};

export const getSocialChannelDetail = async (id) => {
  const response = await axios.get(`${API_URL}/api/social-channels/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/api/categories`);
  return response.data;
}; 