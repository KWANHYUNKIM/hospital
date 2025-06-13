// 액션 타입 정의
export const COMMUNITY_ACTION_TYPES = {
  SET_BOARDS: 'SET_BOARDS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_ERROR: 'SET_ERROR',
  FETCH_BOARDS_SUCCESS: 'FETCH_BOARDS_SUCCESS',
  FETCH_BOARDS_FAILURE: 'FETCH_BOARDS_FAILURE',
  FETCH_CATEGORIES_SUCCESS: 'FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_FAILURE: 'FETCH_CATEGORIES_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
} as const;

// 데이터 타입 정의
export interface Board {
  id: number;
  title: string;
  content: string;
  author: string;
  categoryId: number;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 상태 타입 정의
export interface CommunityState {
  boards: Board[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  error: string | null;
}

// 액션 타입 정의
interface SetBoardsAction {
  type: typeof COMMUNITY_ACTION_TYPES.SET_BOARDS;
  payload: {
    boards: Board[];
    totalPages: number;
    currentPage: number;
  };
}

interface SetCategoriesAction {
  type: typeof COMMUNITY_ACTION_TYPES.SET_CATEGORIES;
  payload: Category[];
}

interface SetErrorAction {
  type: typeof COMMUNITY_ACTION_TYPES.SET_ERROR;
  payload: string;
}

interface FetchBoardsSuccessAction {
  type: typeof COMMUNITY_ACTION_TYPES.FETCH_BOARDS_SUCCESS;
  payload: {
    boards: Board[];
    totalPages: number;
    currentPage: number;
  };
}

interface FetchBoardsFailureAction {
  type: typeof COMMUNITY_ACTION_TYPES.FETCH_BOARDS_FAILURE;
  payload: string;
}

interface FetchCategoriesSuccessAction {
  type: typeof COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_SUCCESS;
  payload: Category[];
}

interface FetchCategoriesFailureAction {
  type: typeof COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_FAILURE;
  payload: string;
}

interface ClearErrorAction {
  type: typeof COMMUNITY_ACTION_TYPES.CLEAR_ERROR;
}

export type CommunityAction = 
  | SetBoardsAction 
  | SetCategoriesAction 
  | SetErrorAction 
  | FetchBoardsSuccessAction 
  | FetchBoardsFailureAction 
  | FetchCategoriesSuccessAction 
  | FetchCategoriesFailureAction
  | ClearErrorAction;

// 초기 상태
const initialState: CommunityState = {
  boards: [],
  categories: [],
  totalPages: 1,
  currentPage: 1,
  error: null
};

// 리듀서
const communityReducer = (state = initialState, action: CommunityAction): CommunityState => {
  switch (action.type) {
    case COMMUNITY_ACTION_TYPES.SET_BOARDS:
    case COMMUNITY_ACTION_TYPES.FETCH_BOARDS_SUCCESS:
      const newBoards = Array.isArray(action.payload.boards) ? action.payload.boards : [];
      
      return {
        ...state,
        boards: newBoards,
        totalPages: Number(action.payload.totalPages) || 1,
        currentPage: Number(action.payload.currentPage) || 1,
        error: null
      };

    case COMMUNITY_ACTION_TYPES.SET_CATEGORIES:
    case COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_SUCCESS:
      const newCategories = Array.isArray(action.payload) ? action.payload : [];
      
      return {
        ...state,
        categories: newCategories,
        error: null
      };

    case COMMUNITY_ACTION_TYPES.SET_ERROR:
    case COMMUNITY_ACTION_TYPES.FETCH_BOARDS_FAILURE:
    case COMMUNITY_ACTION_TYPES.FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        error: action.payload
      };

    case COMMUNITY_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default communityReducer; 