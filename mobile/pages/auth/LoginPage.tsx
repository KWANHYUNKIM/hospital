import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

interface FormData {
  username: string;
  password: string;
}

interface SocialSettings {
  client_id: string;
  redirect_uri: string;
  client_secret?: string;
}

const LoginPage: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [kakaoSettings, setKakaoSettings] = useState<SocialSettings>({
    client_id: '',
    redirect_uri: ''
  });
  const [naverSettings, setNaverSettings] = useState<SocialSettings>({
    client_id: '',
    client_secret: '',
    redirect_uri: ''
  });

  useEffect(() => {
    const fetchSocialSettings = async () => {
      try {
        const [kakaoResponse, naverResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/auth/social-config/kakao'),
          axios.get('http://localhost:8080/api/auth/social-config/naver')
        ]);
        
        setKakaoSettings(kakaoResponse.data);
        setNaverSettings(naverResponse.data);
      } catch (error) {
        console.error('소셜 로그인 설정 조회 실패:', error);
      }
    };
    fetchSocialSettings();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      if (response.data.user) {
        setSuccessMessage('로그인 성공!');
        setTimeout(() => {
          navigation.navigate('Main' as never);
        }, 1500);
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      const message = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(message);
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  const handleNaverLogin = () => {
    if (!naverSettings.client_id || !naverSettings.redirect_uri) {
      Alert.alert('알림', '네이버 로그인 설정이 완료되지 않았습니다.');
      return;
    }
    Alert.alert('알림', '네이버 로그인은 웹브라우저에서만 지원됩니다.');
  };

  const handleKakaoLogin = () => {
    if (!kakaoSettings.client_id || !kakaoSettings.redirect_uri) {
      Alert.alert('알림', '카카오 로그인 설정이 완료되지 않았습니다.');
      return;
    }
    Alert.alert('알림', '카카오 로그인은 웹브라우저에서만 지원됩니다.');
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/social-config/google');
      const { client_id, redirect_uri } = response.data;
      
      if (!client_id || !redirect_uri) {
        Alert.alert('알림', '구글 로그인 설정이 완료되지 않았습니다.');
        return;
      }
      Alert.alert('알림', '구글 로그인은 웹브라우저에서만 지원됩니다.');
    } catch (error) {
      console.error('구글 로그인 설정 조회 실패:', error);
      Alert.alert('오류', '구글 로그인을 시도하는 중 오류가 발생했습니다.');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>로그인</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>아이디</Text>
              <TextInput
                style={styles.textInput}
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                placeholder="아이디를 입력하세요"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.textInput}
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>간편 로그인</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 소셜 로그인 버튼들 */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.naverButton} onPress={handleNaverLogin}>
                <View style={styles.socialButtonContent}>
                  <Text style={styles.naverButtonText}>네이버 계정으로 로그인</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
                <View style={styles.socialButtonContent}>
                  <Text style={styles.kakaoButtonText}>카카오 계정으로 로그인</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <View style={styles.socialButtonContent}>
                  <Text style={styles.googleButtonText}>구글 계정으로 로그인</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 회원가입 링크 */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 성공 모달 */}
      <Modal
        visible={!!successMessage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessMessage('')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={64} color="#22C55E" />
            <Text style={styles.modalTitle}>{successMessage}</Text>
            <Text style={styles.modalSubtitle}>잠시 후 홈페이지로 이동합니다.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 48,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  naverButton: {
    backgroundColor: '#03C75A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  naverButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  kakaoButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default LoginPage; 