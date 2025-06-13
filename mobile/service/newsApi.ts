import axios from '../utils/axios';
import { getApiUrl } from '../utils/api';

// 타입 정의
interface NewsCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  category: NewsCategory;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  viewCount: number;
  author: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface NewsListParams {
  page?: number;
  limit?: number;
  category?: number | string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
}

interface NewsListResponse {
  data: NewsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateNewsData {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  categoryId: number;
  status?: 'DRAFT' | 'PUBLISHED';
}

interface UpdateNewsData extends Partial<CreateNewsData> {
  id: number;
}

interface MediaUploadResponse {
  url: string;
  filename: string;
  size: number;
}

const API_URL = getApiUrl();

/**
 * 소식 목록 조회
 * @param page 페이지 번호 (1부터 시작)
 * @param limit 페이지당 항목 수
 * @param category 카테고리 ID ('all' 또는 null이면 전체)
 * @returns Promise<NewsListResponse> 소식 목록
 */
export const getNewsList = async (
  page: number = 1,
  limit: number = 10,
  category: number | string | null = null
): Promise<NewsListResponse> => {
  try {
    const response = await axios.get(`${API_URL}/api/news`, {
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

/**
 * 소식 상세 조회
 * @param id 소식 ID
 * @returns Promise<NewsItem> 소식 상세 정보
 */
export const getNewsDetail = async (id: number): Promise<NewsItem> => {
  try {
    const response = await axios.get(`${API_URL}/api/news/${id}`);
    return response.data;
  } catch (error) {
    console.error('소식 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 소식 생성
 * @param newsData 소식 데이터
 * @returns Promise<NewsItem> 생성된 소식
 */
export const createNews = async (newsData: CreateNewsData): Promise<NewsItem> => {
  try {
    const response = await axios.post(`${API_URL}/api/news`, newsData, {
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

/**
 * 소식 수정
 * @param id 소식 ID
 * @param newsData 수정할 소식 데이터
 * @returns Promise<NewsItem> 수정된 소식
 */
export const updateNews = async (id: number, newsData: Partial<CreateNewsData>): Promise<NewsItem> => {
  try {
    const response = await axios.put(`${API_URL}/api/news/${id}`, newsData, {
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

/**
 * 소식 삭제
 * @param id 소식 ID
 * @returns Promise<void>
 */
export const deleteNews = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/news/${id}`);
  } catch (error) {
    console.error('소식 삭제 실패:', error);
    throw error;
  }
};

/**
 * 소식 카테고리 목록 조회
 * @returns Promise<NewsCategory[]> 카테고리 목록
 */
export const getNewsCategories = async (): Promise<NewsCategory[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/news/categories`);
    return response.data;
  } catch (error) {
    console.error('소식 카테고리 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 소식 미디어 업로드
 * @param file 업로드할 파일
 * @returns Promise<MediaUploadResponse> 업로드 결과
 */
export const uploadNewsMedia = async (file: any): Promise<MediaUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/api/news/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('소식 이미지 업로드 실패:', error);
    throw error;
  }
};

/**
 * 카테고리 생성
 * @param name 카테고리 이름
 * @returns Promise<NewsCategory> 생성된 카테고리
 */
export const createCategory = async (name: string): Promise<NewsCategory> => {
  try {
    const response = await axios.post(`${API_URL}/api/news/categories`, { name });
    return response.data;
  } catch (error) {
    console.error('카테고리 생성 실패:', error);
    throw error;
  }
};

/**
 * 카테고리 수정
 * @param id 카테고리 ID
 * @param name 새 카테고리 이름
 * @returns Promise<NewsCategory> 수정된 카테고리
 */
export const updateCategory = async (id: number, name: string): Promise<NewsCategory> => {
  try {
    const response = await axios.put(`${API_URL}/api/news/categories/${id}`, { name }, {
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

/**
 * 카테고리 삭제
 * @param id 카테고리 ID
 * @returns Promise<void>
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/news/categories/${id}`);
  } catch (error) {
    console.error('카테고리 삭제 실패:', error);
    throw error;
  }
};

/**
 * 같은 카테고리의 관련 뉴스 조회
 * @param categoryId 카테고리 ID
 * @param excludeId 제외할 뉴스 ID
 * @param limit 조회 개수 (기본값: 3)
 * @returns Promise<NewsItem[]> 관련 뉴스 목록
 */
export const getRelatedNews = async (
  categoryId: number,
  excludeId: number,
  limit: number = 3
): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/news/related`, {
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

/**
 * 뉴스 상태 변경
 * @param id 뉴스 ID
 * @param status 새 상태
 * @returns Promise<NewsItem> 상태가 변경된 뉴스
 */
export const updateNewsStatus = async (
  id: number,
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
): Promise<NewsItem> => {
  try {
    const response = await axios.put(`${API_URL}/api/news/${id}/status`, { status }, {
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

export default {
  getNewsList,
  getNewsDetail,
  createNews,
  updateNews,
  deleteNews,
  getNewsCategories,
  uploadNewsMedia,
  createCategory,
  updateCategory,
  deleteCategory,
  getRelatedNews,
  updateNewsStatus,
}; 