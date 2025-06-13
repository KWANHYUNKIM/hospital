import { Dispatch } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../../utils/axios';
import { getApiUrl } from '../../utils/api';
import { 
  AUTH_ACTION_TYPES, 
  AuthAction 
} from '../reducers/authReducer';

// 로그인 데이터 타입
interface LoginData {
  email: string;
  password: string;
}

// 회원가입 데이터 타입
interface SignupData {
  email: string;
  password: string;
  nickname: string;
  confirmPassword: string;
}

// 사용자 정보 타입
interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

// 로그인 응답 타입
interface LoginResponse {
  token: string;
  user: UserInfo;
}

// 액션 생성 함수들
export const setAuthAction = (
  isLoggedIn: boolean, 
  userRole: string, 
  userId: number
): AuthAction => ({
  type: AUTH_ACTION_TYPES.SET_AUTH,
  payload: { isLoggedIn, userRole, userId }
});

export const setErrorAction = (error: string): AuthAction => ({
  type: AUTH_ACTION_TYPES.SET_ERROR,
  payload: error
});

export const clearErrorAction = (): AuthAction => ({
  type: AUTH_ACTION_TYPES.CLEAR_ERROR
});

export const logoutAction = (): AuthAction => ({
  type: AUTH_ACTION_TYPES.LOGOUT
});

/**
 * 로그인 액션
 * @param loginData 로그인 데이터
 * @returns Promise<boolean>
 */
export const login = (loginData: LoginData) => 
  async (dispatch: Dispatch<AuthAction>): Promise<boolean> => {
    try {
      const response = await axios.post<LoginResponse>(`${getApiUrl()}/api/auth/login`, loginData);
      
      if (response.data && response.data.token) {
        // 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        // Redux 상태 업데이트
        dispatch(setAuthAction(
          true, 
          response.data.user.role, 
          response.data.user.id
        ));
        
        return true;
      } else {
        throw new Error('로그인 응답이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      dispatch(setErrorAction(
        error.response?.data?.message || '로그인에 실패했습니다.'
      ));
      return false;
    }
  };

/**
 * 회원가입 액션
 * @param signupData 회원가입 데이터
 * @returns Promise<boolean>
 */
export const signup = (signupData: SignupData) => 
  async (dispatch: Dispatch<AuthAction>): Promise<boolean> => {
    try {
      if (signupData.password !== signupData.confirmPassword) {
        dispatch(setErrorAction('비밀번호가 일치하지 않습니다.'));
        return false;
      }

      const response = await axios.post<LoginResponse>(`${getApiUrl()}/api/auth/signup`, {
        email: signupData.email,
        password: signupData.password,
        nickname: signupData.nickname
      });
      
      if (response.data && response.data.token) {
        // 토큰을 AsyncStorage에 저장
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        // Redux 상태 업데이트
        dispatch(setAuthAction(
          true, 
          response.data.user.role, 
          response.data.user.id
        ));
        
        return true;
      } else {
        throw new Error('회원가입 응답이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      dispatch(setErrorAction(
        error.response?.data?.message || '회원가입에 실패했습니다.'
      ));
      return false;
    }
  };

/**
 * 로그아웃 액션
 * @returns Promise<void>
 */
export const logout = () => 
  async (dispatch: Dispatch<AuthAction>): Promise<void> => {
    try {
      // AsyncStorage에서 토큰 및 사용자 정보 제거
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      
      // Redux 상태 초기화
      dispatch(logoutAction());
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

/**
 * 자동 로그인 확인 액션 (토큰 유효성 검사)
 * @returns Promise<boolean>
 */
export const checkAutoLogin = () => 
  async (dispatch: Dispatch<AuthAction>): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfoString) {
        const userInfo: UserInfo = JSON.parse(userInfoString);
        
        // 토큰 유효성 검사
        const response = await axios.get(`${getApiUrl()}/api/auth/validate-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.valid) {
          dispatch(setAuthAction(true, userInfo.role, userInfo.id));
          return true;
        } else {
          // 토큰이 유효하지 않으면 제거
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userInfo');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('자동 로그인 확인 실패:', error);
      // 에러 발생 시 토큰 제거
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      return false;
    }
  };

/**
 * 사용자 정보 업데이트 액션
 * @param userInfo 사용자 정보
 * @returns Promise<void>
 */
export const updateUserInfo = (userInfo: UserInfo) => 
  async (dispatch: Dispatch<AuthAction>): Promise<void> => {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      dispatch(setAuthAction(true, userInfo.role, userInfo.id));
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
  };

export default {
  login,
  signup,
  logout,
  checkAutoLogin,
  updateUserInfo,
  setAuthAction,
  setErrorAction,
  clearErrorAction,
  logoutAction,
}; 