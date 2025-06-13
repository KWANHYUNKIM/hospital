import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface RouteParams {
  code?: string;
  error?: string;
  error_description?: string;
}

interface KakaoCallbackResponse {
  success: boolean;
  isNewUser: boolean;
  email?: string;
  nickname?: string;
  profile_image?: string;
  social_id?: string;
  user?: any;
  message?: string;
}

const KakaoCallback: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasCalledApi = useRef(false);
  const processingRef = useRef(false);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      if (processingRef.current) {
        return;
      }

      try {
        processingRef.current = true;
        const params = route.params as RouteParams;
        const code = params?.code;
        const errorParam = params?.error;
        const errorDescription = params?.error_description;

        if (errorParam) {
          console.error('카카오 로그인 에러:', errorParam, errorDescription);
          setError(`카카오 로그인 중 오류가 발생했습니다: ${errorDescription || errorParam}`);
          return;
        }

        if (!code) {
          setError('인증 코드가 없습니다.');
          return;
        }

        if (hasCalledApi.current) {
          return;
        }
        hasCalledApi.current = true;

        console.log('카카오 콜백 API 호출 시작');
        const response = await api.post('/auth/kakao/callback', { code });
        console.log('카카오 콜백 API 응답:', response.data);

        const data: KakaoCallbackResponse = response.data;

        if (data.success) {
          if (data.isNewUser) {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Register',
                params: {
                  socialLoginData: {
                    email: data.email,
                    nickname: data.nickname,
                    profile_image: data.profile_image,
                    social_id: data.social_id,
                    provider: 'kakao'
                  }
                }
              })
            );
          } else {
            await login(data.user);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
          }
        } else {
          setError(data.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error: any) {
        console.error('카카오 로그인 처리 중 오류 발생:', error);
        if (error.response?.status === 404) {
          setError('카카오 로그인 설정을 찾을 수 없습니다.');
        } else if (error.response?.data?.error === 'invalid_grant') {
          setError('인증 코드가 만료되었습니다. 다시 로그인해주세요.');
          setTimeout(() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }, 2000);
        } else if (error.response?.data?.error === 'invalid_request') {
          setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.message) {
          setError(error.message);
        } else {
          setError('로그인 처리 중 오류가 발생했습니다.');
        }
      } finally {
        processingRef.current = false;
      }
    };

    handleKakaoCallback();

    return () => {
      processingRef.current = false;
    };
  }, [navigation, route, login]);

  const handleBackToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>오류 발생</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backButtonText}>로그인 페이지로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FEE500" />
        <Text style={styles.loadingText}>로그인 처리 중...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3C1E1E',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default KakaoCallback; 