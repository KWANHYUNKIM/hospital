import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../redux/store';
import { fetchUserProfile, updateUserProfile } from '../../service/profileApi';
import { updateUserInfo } from '../../redux/actions/authActions';

const { width } = Dimensions.get('window');

interface ProfileData {
  username: string;
  email: string;
  nickname: string;
  interests: string[];
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileImageUrl?: string;
}

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  interests: string[];
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { userId, isLoggedIn } = useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    email: '',
    nickname: '',
    interests: [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const interestOptions = [
    '암', '심장병', '당뇨병', '고혈압', '관절염', '호흡기질환',
    '소화기질환', '피부질환', '정신건강', '영양', '운동', '건강검진'
  ];

  // 랜덤 색상 생성 함수
  const getRandomColor = (username: string): string => {
    const colors = [
      '#EF4444', '#EC4899', '#A855F7', '#6366F1', 
      '#3B82F6', '#06B6D4', '#10B981', '#22C55E',
      '#EAB308', '#F97316'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // 사용자 이니셜 가져오기
  const getInitials = (username: string): string => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      navigation.goBack();
      return;
    }

    loadProfile();
  }, [userId, isLoggedIn]);

  const loadProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data: UserProfile = await fetchUserProfile(userId);
      setProfile(prev => ({
        ...prev,
        username: data.email.split('@')[0] || data.nickname, // username이 없으면 email에서 추출
        email: data.email,
        nickname: data.nickname,
        interests: data.interests || [],
        profileImageUrl: data.profileImageUrl
      }));
      setPreviewUrl(data.profileImageUrl || '');
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
      Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));

    // 비밀번호 일치 여부 확인
    if (field === 'newPassword' || field === 'confirmPassword') {
      const newPassword = field === 'newPassword' ? value : profile.newPassword;
      const confirmPassword = field === 'confirmPassword' ? value : profile.confirmPassword;
      setPasswordMatch(newPassword === confirmPassword);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setProfileImage(asset);
        setPreviewUrl(asset.uri || '');
      }
    });
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = profile.interests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];

    setProfile(prev => ({
      ...prev,
      interests: newInterests
    }));
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setCurrentPasswordError('');

    if (profile.newPassword && !passwordMatch) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        nickname: profile.nickname,
        interests: profile.interests,
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
        profileImage: profileImage
      };

      const updatedProfile = await updateUserProfile(userId, profileData);
      
      // Redux 상태 업데이트
      dispatch(updateUserInfo({
        id: userId,
        email: updatedProfile.email,
        nickname: updatedProfile.nickname,
        role: updatedProfile.role
      }));

      Alert.alert('성공', '프로필이 성공적으로 업데이트되었습니다.');
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      if (error.response?.data?.message === '현재 비밀번호가 일치하지 않습니다.') {
        setCurrentPasswordError('현재 비밀번호가 일치하지 않습니다.');
      } else {
        Alert.alert('오류', error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>프로필 설정</Text>
        </View>

        <View style={styles.content}>
          {/* 프로필 이미지 섹션 */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
              {previewUrl ? (
                <Image source={{ uri: previewUrl }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: getRandomColor(profile.username) }]}>
                  <Text style={styles.profileImageText}>
                    {getInitials(profile.username)}
                  </Text>
                </View>
              )}
              <View style={styles.editImageButton}>
                <Icon name="camera-alt" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.imageInfo}>
              <Text style={styles.imageInfoText}>프로필 이미지 변경</Text>
              <Text style={styles.imageInfoSubText}>권장 크기: 200x200px</Text>
            </View>
          </View>

          {/* 기본 정보 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.username}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                value={profile.nickname}
                onChangeText={(value) => handleInputChange('nickname', value)}
                placeholder="닉네임을 입력하세요"
              />
            </View>
          </View>

          {/* 관심사 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>관심사</Text>
            <View style={styles.interestsContainer}>
              {interestOptions.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    profile.interests.includes(interest) && styles.interestButtonActive
                  ]}
                  onPress={() => handleInterestToggle(interest)}
                >
                  <Text style={[
                    styles.interestButtonText,
                    profile.interests.includes(interest) && styles.interestButtonTextActive
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 비밀번호 변경 섹션 */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Text style={styles.sectionTitle}>비밀번호 변경</Text>
              <Icon 
                name={showPasswordSection ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#6B7280" 
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <View style={styles.passwordSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>현재 비밀번호</Text>
                  <TextInput
                    style={[styles.input, currentPasswordError && styles.inputError]}
                    value={profile.currentPassword}
                    onChangeText={(value) => handleInputChange('currentPassword', value)}
                    secureTextEntry
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                  {currentPasswordError && (
                    <Text style={styles.errorText}>{currentPasswordError}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>새 비밀번호</Text>
                  <TextInput
                    style={styles.input}
                    value={profile.newPassword}
                    onChangeText={(value) => handleInputChange('newPassword', value)}
                    secureTextEntry
                    placeholder="새 비밀번호를 입력하세요"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>새 비밀번호 확인</Text>
                  <TextInput
                    style={[styles.input, !passwordMatch && styles.inputError]}
                    value={profile.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                  {!passwordMatch && (
                    <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* 버튼 섹션 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>저장</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfo: {
    alignItems: 'center',
  },
  imageInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  imageInfoSubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  inputError: {
    borderColor: '#EF4444',
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
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  interestButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  interestButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  interestButtonTextActive: {
    color: '#FFFFFF',
  },
  passwordToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ProfilePage; 