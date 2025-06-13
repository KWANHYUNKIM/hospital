import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { api } from '../utils/api';

// TypeScript 인터페이스 정의
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userId: number | null;
  username: string | null;
  userProfileImage: string | null;
  user: User | null;
  isLoading: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUserRole: (role: string | null) => void;
  setUserId: (id: number | null) => void;
  setUsername: (username: string | null) => void;
  setUserProfileImage: (image: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  login: (userData?: User) => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateAuthState = useCallback((userData: User | null) => {
    if (userData) {
      setIsLoggedIn(true);
      setUserRole(userData.role);
      setUserId(userData.id);
      setUsername(userData.username);
      setUserProfileImage(userData.profile_image || null);
      setUser(userData);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserId(null);
      setUserProfileImage(null);
      setUsername(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // AsyncStorage에서 CSRF 토큰 가져오기
        const csrfToken = await AsyncStorage.getItem('csrfToken');
        
        const response = await api.get('/api/auth/check-auth', {
          withCredentials: true,
          headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}
        });
        
        console.log('서버 응답 데이터:', response.data);
        
        if (response.data && response.data.user) {
          console.log('사용자 데이터:', response.data.user);
          updateAuthState(response.data.user);
        } else {
          updateAuthState(null);
        }
      } catch (error) {
        console.error('인증 체크 에러:', error);
        updateAuthState(null);
        // 에러 시 저장된 토큰 제거
        await AsyncStorage.removeItem('csrfToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [updateAuthState]);

  const handleLogout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
      updateAuthState(null);
      
      // AsyncStorage에서 인증 관련 데이터 제거
      await AsyncStorage.multiRemove(['csrfToken', 'authToken', 'refreshToken']);
      
      // React Navigation을 사용하여 로그인 화면으로 이동
      // 주의: 이 부분은 실제 앱에서는 NavigationContainer 밖에서 호출되므로
      // 별도의 navigation service를 구현하거나 다른 방법을 사용해야 할 수 있습니다.
      
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 클라이언트 측 상태는 초기화
      updateAuthState(null);
      await AsyncStorage.multiRemove(['csrfToken', 'authToken', 'refreshToken']);
    }
  };

  const handleLogin = async (userData?: User): Promise<boolean> => {
    try {
      const csrfToken = await AsyncStorage.getItem('csrfToken');
      
      const response = await api.get('/api/auth/check-auth', {
        withCredentials: true,
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}
      });

      if (response.data?.user) {
        updateAuthState(response.data.user);
        return true;
      } else {
        updateAuthState(null);
        return false;
      }
    } catch (error) {
      console.error('로그인 상태 업데이트 오류:', error);
      updateAuthState(null);
      return false;
    }
  };

  const value: AuthContextType = {
    isLoggedIn,
    userRole,
    userId,
    username,
    userProfileImage,
    user,
    isLoading,
    setIsLoggedIn,
    setUserRole,
    setUserId,
    setUsername,
    setUserProfileImage,
    setUser,
    logout: handleLogout,
    login: handleLogin
  };

  // 로딩 중일 때는 null을 반환하여 로딩 화면을 표시할 수 있습니다
  if (isLoading) {
    return null; // 또는 로딩 스피너 컴포넌트
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 