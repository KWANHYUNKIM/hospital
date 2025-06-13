import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// TODO: 실제 프로젝트에서는 AuthContext를 구현해야 함
// import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // TODO: 실제 AuthContext 구현 시 주석 해제
  /*
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
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    console.log('AdminRoute - 로그인 필요');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>로그인이 필요합니다.</Text>
      </View>
    );
  }

  if (userRole !== 'ADMIN') {
    console.log('AdminRoute - 관리자 권한 필요');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>관리자 권한이 필요합니다.</Text>
      </View>
    );
  }

  console.log('AdminRoute - 접근 허용');
  */

  // 임시로 모든 접근을 허용 (개발용)
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default AdminRoute; 