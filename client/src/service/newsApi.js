import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// API 요청 설정
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// 요청 인터셉터 추가
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrfToken');
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

// 소식 목록 조회
export const getNewsList = async (page = 1, limit = 10, category = null) => {
    try {
        const response = await api.get('/api/news', {
            params: { 
                page: page - 1, // Spring은 0부터 시작하므로 1을 빼줍니다
                limit, 
                categoryId: category === 'all' ? null : category
            }
        });
        return response.data;
    } catch (error) {
        console.error('소식 목록 조회 실패:', error);
        throw error;
    }
};

// 소식 상세 조회
export const getNewsDetail = async (id) => {
    try {
        const response = await api.get(`/api/news/${id}`);
        return response.data;
    } catch (error) {
        console.error('소식 상세 조회 실패:', error);
        throw error;
    }
};

// 소식 생성
export const createNews = async (newsData) => {
    try {
        const response = await api.post('/api/news', newsData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('소식 생성 실패:', error);
        throw error;
    }
};

// 소식 수정
export const updateNews = async (id, newsData) => {
    try {
        const response = await api.put(`/api/news/${id}`, newsData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('소식 수정 실패:', error);
        throw error;
    }
};

// 소식 삭제
export const deleteNews = async (id) => {
    try {
        const response = await api.delete(`/api/news/${id}`);
        return response.data;
    } catch (error) {
        console.error('소식 삭제 실패:', error);
        throw error;
    }
};

// 소식 카테고리 목록 조회
export const getNewsCategories = async () => {
    try {
        const response = await api.get('/api/news/categories');
        return response.data;
    } catch (error) {
        console.error('소식 카테고리 목록 조회 실패:', error);
        throw error;
    }
};

// 소식 미디어 업로드
export const uploadNewsMedia = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/news/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('소식 미디어 업로드 실패:', error);
        throw error;
    }
};

// 카테고리 생성
export const createCategory = async (name) => {
    try {
        const response = await api.post('/api/news/categories', { name });
        return response.data;
    } catch (error) {
        console.error('카테고리 생성 실패:', error);
        throw error;
    }
};

// 카테고리 수정
export const updateCategory = async (id, name) => {
    try {
        const response = await api.put(`/api/news/categories/${id}`, { name }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('카테고리 수정 실패:', error);
        throw error;
    }
};

// 카테고리 삭제
export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`/api/news/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error('카테고리 삭제 실패:', error);
        throw error;
    }
};

// 같은 카테고리의 관련 뉴스 조회
export const getRelatedNews = async (categoryId, excludeId, limit = 3) => {
    try {
        const response = await api.get('/api/news/related', {
            params: {
                categoryId,
                excludeId,
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('관련 뉴스 조회 실패:', error);
        throw error;
    }
};

// 뉴스 상태 변경
export const updateNewsStatus = async (id, status) => {
    try {
        const response = await api.put(`/api/news/${id}/status`, { status }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('뉴스 상태 변경 실패:', error);
        throw error;
    }
};
