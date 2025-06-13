// 액션 타입 정의
export const AUTH_ACTION_TYPES = {
  SET_AUTH: 'SET_AUTH',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
} as const;

// 상태 타입 정의
export interface AuthState {
  isLoggedIn: boolean;
  userRole: string | null;
  userId: number | null;
  error: string | null;
}

// 액션 타입 정의
interface SetAuthAction {
  type: typeof AUTH_ACTION_TYPES.SET_AUTH;
  payload: {
    isLoggedIn: boolean;
    userRole: string;
    userId: number;
  };
}

interface SetErrorAction {
  type: typeof AUTH_ACTION_TYPES.SET_ERROR;
  payload: string;
}

interface LogoutAction {
  type: typeof AUTH_ACTION_TYPES.LOGOUT;
}

interface ClearErrorAction {
  type: typeof AUTH_ACTION_TYPES.CLEAR_ERROR;
}

export type AuthAction = SetAuthAction | SetErrorAction | LogoutAction | ClearErrorAction;

// 초기 상태
const initialState: AuthState = {
  isLoggedIn: false,
  userRole: null,
  userId: null,
  error: null
};

// 리듀서
const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AUTH_ACTION_TYPES.SET_AUTH:
      return {
        ...state,
        isLoggedIn: action.payload.isLoggedIn,
        userRole: action.payload.userRole,
        userId: action.payload.userId,
        error: null
      };
    case AUTH_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case AUTH_ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTION_TYPES.LOGOUT:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export default authReducer; 