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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  verificationCode: string;
  realName: string;
  nickname: string;
  interests: string[];
  social_provider: string;
  social_id: string;
  is_email_verified: boolean;
  profile_image: string;
}

interface ValidationErrors {
  username: string;
  password: string;
  confirmPassword: string;
  realName: string;
  nickname: string;
  email: string;
}

interface SocialData {
  email?: string;
  username?: string;
  profile_image?: string;
  social_id?: string;
  provider?: string;
  name?: string;
  given_name?: string;
}

interface RouteParams {
  socialData?: SocialData;
  provider?: string;
  socialLoginData?: SocialData;
}

const RegisterPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { socialData, provider, socialLoginData } = route.params as RouteParams || {};

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: '',
    realName: '',
    nickname: '',
    interests: [],
    social_provider: '',
    social_id: '',
    is_email_verified: false,
    profile_image: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingTime, setRemainingTime] = useState(180); // 3분 = 180초
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    nickname: '',
    email: ''
  });

  const interests = [
    '암', '심장병', '당뇨병', '고혈압', '관절염', '호흡기질환',
    '소화기질환', '피부질환', '정신건강', '영양', '운동', '건강검진'
  ];

  useEffect(() => {
    if (socialData) {
      setFormData(prev => ({
        ...prev,
        email: socialData.email || '',
        username: socialData.username || '',
        is_email_verified: true
      }));
    }
  }, [socialData]);

  useEffect(() => {
    if (socialLoginData) {
      const { email, profile_image, social_id, provider, name, given_name } = socialLoginData;
      
      setFormData(prev => ({
        ...prev,
        email: email || '',
        profile_image: profile_image || '',
        social_id: social_id || '',
        social_provider: provider || '',
        is_email_verified: true,
        realName: provider === 'google' ? `${given_name} ${name}` : '',
        interests: [],
        username: '',
        password: '',
        nickname: ''
      }));
      setIsVerified(true);
    }
  }, [socialLoginData]);

  // 타이머 효과
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerificationSent && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    } else if (remainingTime === 0) {
      setIsVerificationSent(false);
      setError('인증 시간이 만료되었습니다. 다시 인증코드를 발급받아주세요.');
    }
    return () => clearInterval(timer);
  }, [isVerificationSent, remainingTime]);

  const validateField = (name: keyof ValidationErrors, value: string): boolean => {
    let error = '';
    switch (name) {
      case 'username':
        if (value.length < 3) {
          error = '아이디는 최소 3자 이상이어야 합니다.';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
        }
        break;
      case 'password':
        if (value.length < 6) {
          error = '비밀번호는 최소 6자리 이상이어야 합니다.';
        } else if (!/[A-Za-z]/.test(value)) {
          error = '비밀번호는 알파벳을 포함해야 합니다.';
        } else if (!/[0-9]/.test(value)) {
          error = '비밀번호는 숫자를 포함해야 합니다.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = '비밀번호가 일치하지 않습니다.';
        }
        break;
      case 'realName':
        if (value.length < 2) {
          error = '실명은 최소 2자 이상이어야 합니다.';
        } else if (!/^[가-힣]+$/.test(value)) {
          error = '실명은 한글만 입력 가능합니다.';
        }
        break;
      case 'nickname':
        if (value.length < 2) {
          error = '닉네임은 최소 2자 이상이어야 합니다.';
        } else if (value.length > 20) {
          error = '닉네임은 최대 20자까지 가능합니다.';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = '올바른 이메일 형식이 아닙니다.';
        }
        break;
    }
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    return !error;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field in validationErrors) {
      validateField(field as keyof ValidationErrors, value);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  const handleSendVerification = async () => {
    if (!validateField('email', formData.email)) {
      return;
    }

    try {
      // 이메일 중복 확인
      const checkResponse = await axios.get(
        `http://localhost:8080/api/auth/check-email?email=${formData.email}`,
        { withCredentials: true }
      );

      if (checkResponse.data.exists) {
        Alert.alert('알림', '이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.');
        return;
      }

      // 이메일 인증 코드 전송
      await axios.post('http://localhost:8080/api/email/send-verification', {
        email: formData.email
      });

      setIsVerificationSent(true);
      setRemainingTime(180);
      Alert.alert('알림', '인증 코드가 이메일로 전송되었습니다. 3분 이내에 입력해주세요.');
    } catch (err: any) {
      const message = err.response?.data?.message || '인증 코드 전송에 실패했습니다.';
      setError(message);
      Alert.alert('오류', message);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode.trim()) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/email/verify-email', {
        email: formData.email,
        verificationCode: formData.verificationCode
      });

      setIsVerified(true);
      Alert.alert('성공', '이메일 인증이 완료되었습니다.');
    } catch (err: any) {
      const message = err.response?.data?.message || '인증 코드 확인에 실패했습니다.';
      setError(message);
      Alert.alert('오류', message);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // 소셜 로그인 사용자가 아닌 경우 이메일 인증 확인
      if (!formData.social_provider && !isVerified) {
        Alert.alert('알림', '이메일 인증이 필요합니다.');
        setLoading(false);
        return;
      }

      // 유효성 검사
      const fieldsToValidate: (keyof ValidationErrors)[] = ['username', 'password', 'confirmPassword', 'realName', 'nickname'];
      let hasError = false;
      
      for (const field of fieldsToValidate) {
        if (!validateField(field, formData[field] as string)) {
          hasError = true;
        }
      }

      if (hasError) {
        Alert.alert('알림', '입력 정보를 확인해주세요.');
        setLoading(false);
        return;
      }

      // interests를 JSON 문자열로 변환
      const interestsJson = JSON.stringify(formData.interests);

      // 회원가입 데이터 준비
      const registerData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        nickname: formData.nickname,
        interests: interestsJson,
        social_id: formData.social_id || null,
        social_provider: formData.social_provider || null,
        is_email_verified: formData.social_provider ? 1 : (formData.is_email_verified ? 1 : 0),
        profile_image: formData.profile_image || null
      };

      const response = await axios.post('http://localhost:8080/api/auth/register', registerData);

      if (response.data.success) {
        // 소셜 로그인 사용자의 경우 바로 로그인 처리
        if (formData.social_provider) {
          const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
            username: formData.username,
            password: formData.password
          });

          if (loginResponse.data.user) {
            navigation.navigate('Main' as never);
          }
        } else {
          Alert.alert('성공', '회원가입이 완료되었습니다.', [
            {
              text: '확인',
              onPress: () => navigation.navigate('Login' as never)
            }
          ]);
        }
      }
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      const message = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(message);
      Alert.alert('오류', message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {formData.social_provider ? '소셜 계정 정보 입력' : '회원가입'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.formContainer}>
            {/* 아이디 */}
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
              {validationErrors.username ? (
                <Text style={styles.errorText}>{validationErrors.username}</Text>
              ) : null}
            </View>

            {/* 비밀번호 */}
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
              {validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : null}
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호 확인</Text>
              <TextInput
                style={styles.textInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {validationErrors.confirmPassword ? (
                <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* 이메일 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <View style={styles.emailContainer}>
                <TextInput
                  style={[styles.textInput, styles.emailInput, formData.social_provider && styles.disabledInput]}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!formData.social_provider && !loading}
                />
                {!formData.social_provider && (
                  <TouchableOpacity
                    style={[styles.verificationButton, (isVerificationSent || loading || !!validationErrors.email) && styles.buttonDisabled]}
                    onPress={handleSendVerification}
                    disabled={isVerificationSent || loading || !!validationErrors.email}
                  >
                    <Text style={styles.verificationButtonText}>
                      {isVerificationSent ? '전송됨' : '인증코드'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {validationErrors.email ? (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              ) : null}
            </View>

            {/* 이메일 인증 코드 */}
            {isVerificationSent && !formData.social_provider && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>인증코드</Text>
                <View style={styles.verificationContainer}>
                  <TextInput
                    style={[styles.textInput, styles.verificationInput]}
                    value={formData.verificationCode}
                    onChangeText={(value) => handleChange('verificationCode', value)}
                    placeholder="인증코드를 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    editable={!loading}
                  />
                  <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
                  <TouchableOpacity
                    style={[styles.verifyButton, (isVerified || loading || remainingTime === 0) && styles.buttonDisabled]}
                    onPress={handleVerifyCode}
                    disabled={isVerified || loading || remainingTime === 0}
                  >
                    <Text style={styles.verifyButtonText}>
                      {isVerified ? '완료' : '인증'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 실명 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>실명</Text>
              <TextInput
                style={styles.textInput}
                value={formData.realName}
                onChangeText={(value) => handleChange('realName', value)}
                placeholder="실명을 입력하세요"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              {validationErrors.realName ? (
                <Text style={styles.errorText}>{validationErrors.realName}</Text>
              ) : null}
            </View>

            {/* 닉네임 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>닉네임</Text>
              <TextInput
                style={styles.textInput}
                value={formData.nickname}
                onChangeText={(value) => handleChange('nickname', value)}
                placeholder="닉네임을 입력하세요 (2-20자)"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />
              {validationErrors.nickname ? (
                <Text style={styles.errorText}>{validationErrors.nickname}</Text>
              ) : null}
            </View>

            {/* 관심사 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>관심사</Text>
              <View style={styles.interestsContainer}>
                {interests.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestChip,
                      formData.interests.includes(interest) && styles.interestChipSelected
                    ]}
                    onPress={() => handleInterestToggle(interest)}
                    disabled={loading}
                  >
                    <Text style={[
                      styles.interestChipText,
                      formData.interests.includes(interest) && styles.interestChipTextSelected
                    ]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>회원가입</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  emailContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  emailInput: {
    flex: 1,
  },
  verificationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verificationInput: {
    flex: 1,
  },
  timerText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  interestChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  interestChipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterPage; 