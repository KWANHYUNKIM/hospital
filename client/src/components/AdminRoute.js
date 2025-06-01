import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, userRole, isLoading } = useAuth();

  useEffect(() => {
    console.log('AdminRoute - 컴포넌트 마운트됨');
    console.log('AdminRoute - 현재 사용자 역할:', userRole);
    console.log('AdminRoute - 로그인 상태:', isLoggedIn);
    console.log('AdminRoute - 로딩 상태:', isLoading);
  }, [userRole, isLoggedIn, isLoading]);

  console.log('AdminRoute - 렌더링 중');
  console.log('AdminRoute - 현재 상태:', { userRole, isLoggedIn, isLoading });

  if (isLoading) {
    console.log('AdminRoute - 로딩 중');
    return null;
  }

  if (!isLoggedIn) {
    console.log('AdminRoute - 로그인 필요');
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'ADMIN') {
    console.log('AdminRoute - 관리자 권한 필요');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - 접근 허용');
  return children;
};

export default AdminRoute;
