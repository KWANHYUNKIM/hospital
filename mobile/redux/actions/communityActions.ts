import { Dispatch } from 'redux';
import axios from '../../utils/axios';
import { getApiUrl } from '../../utils/api';
import { 
  COMMUNITY_ACTION_TYPES, 
  CommunityAction, 
  Board, 
  Category 
} from '../reducers/communityReducer';

// 액션 생성 함수들
export const setBoardsAction = (
  boards: Board[], 
  totalPages: number, 
  currentPage: number
): CommunityAction => ({
  type: COMMUNITY_ACTION_TYPES.SET_BOARDS,
  payload: { boards, totalPages, currentPage }
});

export const setCategoriesAction = (categories: Category[]): CommunityAction => ({
  type: COMMUNITY_ACTION_TYPES.SET_CATEGORIES,
  payload: categories
});

export const setErrorAction = (error: string): CommunityAction => ({
  type: COMMUNITY_ACTION_TYPES.SET_ERROR,
  payload: error
});

export const clearErrorAction = (): CommunityAction => ({
  type: COMMUNITY_ACTION_TYPES.CLEAR_ERROR
});

// 응답 타입 정의
interface BoardsResponse {
  boards: Board[];
  totalPages: number;
  currentPage: number;
}

/**
 * 게시글 목록 조회 액션
 * @param categoryId 카테고리 ID (선택사항)
 * @param page 페이지 번호 (기본값: 1)
 * @returns Promise<void>
 */
export const getBoards = (categoryId: number | null = null, page: number = 1) => 
  async (dispatch: Dispatch<CommunityAction>): Promise<void> => {
    try {
      const url = categoryId 
        ? `${getApiUrl()}/api/boards/category/${categoryId}?page=${page}`
        : `${getApiUrl()}/api/boards?page=${page}`;
      
      const response = await axios.get<BoardsResponse>(url);
      
      if (!response.data || !Array.isArray(response.data.boards)) {
        throw new Error('Invalid response format');
      }

      const payload = {
        boards: response.data.boards || [],
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
      
      dispatch(setBoardsAction(payload.boards, payload.totalPages, payload.currentPage));
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      dispatch(setBoardsAction([], 1, 1));
      dispatch(setErrorAction('게시글 목록을 불러오는데 실패했습니다.'));
    }
  };

/**
 * 카테고리 목록 조회 액션
 * @returns Promise<void>
 */
export const getCategories = () => 
  async (dispatch: Dispatch<CommunityAction>): Promise<void> => {
    try {
      const response = await axios.get<Category[]>(`${getApiUrl()}/api/boards/categories`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      dispatch(setCategoriesAction(response.data));
    } catch (error) {
      console.error('카테고리 목록 조회 실패:', error);
      dispatch(setCategoriesAction([]));
      dispatch(setErrorAction('카테고리 목록을 불러오는데 실패했습니다.'));
    }
  };

/**
 * 게시글 조회 액션 (검색 및 필터링 지원)
 * @param category 카테고리
 * @param page 페이지 번호 (기본값: 1)
 * @returns Promise<void>
 */
export const fetchBoards = (category?: string, page: number = 1) => 
  async (dispatch: Dispatch<CommunityAction>): Promise<void> => {
    try {
      const response = await axios.get<BoardsResponse>(`${getApiUrl()}/api/boards`, {
        params: {
          category,
          page,
        },
      });

      dispatch({
        type: COMMUNITY_ACTION_TYPES.FETCH_BOARDS_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      console.error('게시글 조회 실패:', error);
      dispatch({
        type: COMMUNITY_ACTION_TYPES.FETCH_BOARDS_FAILURE,
        payload: error.message || '게시글 조회에 실패했습니다.',
      });
    }
  };

/**
 * 카테고리 조회 액션
 * @returns Promise<void>
 */
export const fetchCategories = () => 
  async (dispatch: Dispatch<CommunityAction>): Promise<void> => {
    try {
      const response = await axios.get<Category[]>(`${getApiUrl()}/api/categories`);
      
      dispatch({
        type: COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_SUCCESS,
        payload: response.data,
      });
    } catch (error: any) {
      console.error('카테고리 조회 실패:', error);
      dispatch({
        type: COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_FAILURE,
        payload: error.message || '카테고리 조회에 실패했습니다.',
      });
    }
  };

/**
 * 게시글 생성 액션
 * @param boardData 게시글 데이터
 * @returns Promise<Board | null>
 */
export const createBoard = (boardData: Partial<Board>) => 
  async (dispatch: Dispatch<CommunityAction>): Promise<Board | null> => {
    try {
      const response = await axios.post<Board>(`${getApiUrl()}/api/boards`, boardData);
      
      // 게시글 생성 후 목록 새로고침
      dispatch(getBoards());
      
      return response.data;
    } catch (error: any) {
      console.error('게시글 생성 실패:', error);
      dispatch(setErrorAction('게시글 생성에 실패했습니다.'));
      return null;
    }
  };

/**
 * 게시글 수정 액션
 * @param boardId 게시글 ID
 * @param boardData 수정할 게시글 데이터
 * @returns Promise<Board | null>
 */
export const updateBoard = (boardId: number, boardData: Partial<Board>) => 
  async (dispatch: Dispatch<CommunityAction>): Promise<Board | null> => {
    try {
      const response = await axios.put<Board>(`${getApiUrl()}/api/boards/${boardId}`, boardData);
      
      // 게시글 수정 후 목록 새로고침
      dispatch(getBoards());
      
      return response.data;
    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      dispatch(setErrorAction('게시글 수정에 실패했습니다.'));
      return null;
    }
  };

/**
 * 게시글 삭제 액션
 * @param boardId 게시글 ID
 * @returns Promise<boolean>
 */
export const deleteBoard = (boardId: number) => 
  async (dispatch: Dispatch<CommunityAction>): Promise<boolean> => {
    try {
      await axios.delete(`${getApiUrl()}/api/boards/${boardId}`);
      
      // 게시글 삭제 후 목록 새로고침
      dispatch(getBoards());
      
      return true;
    } catch (error: any) {
      console.error('게시글 삭제 실패:', error);
      dispatch(setErrorAction('게시글 삭제에 실패했습니다.'));
      return false;
    }
  };

export default {
  getBoards,
  getCategories,
  fetchBoards,
  fetchCategories,
  createBoard,
  updateBoard,
  deleteBoard,
  clearErrorAction,
}; 