import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile } from '../../service/profileApi';
import ProfileImage from '../../components/common/ProfileImage';

const ProfilePage = () => {
  const { userId, username } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    nickname: '',
    interests: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profile_image: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [currentPasswordError, setCurrentPasswordError] = useState('');

  const interests = [
    '암', '심장병', '당뇨병', '고혈압', '관절염', '호흡기질환',
    '소화기질환', '피부질환', '정신건강', '영양', '운동', '건강검진'
  ];

  // API URL 가져오기
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:3002';
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile(userId);
        setProfile(prev => ({
          ...prev,
          username: data.username,
          email: data.email,
          nickname: data.nickname,
          interests: data.interests || '',
          profile_image: data.profile_image
        }));
        setPreviewUrl(data.profile_image || '');
      } catch (error) {
        console.error('프로필 로딩 실패:', error);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    // 비밀번호 일치 여부 확인
    if (name === 'newPassword' || name === 'confirmPassword') {
      const newPassword = name === 'newPassword' ? value : profile.newPassword;
      const confirmPassword = name === 'confirmPassword' ? value : profile.confirmPassword;
      setPasswordMatch(newPassword === confirmPassword);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Preview URL:', reader.result); // 로그 추가
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestChange = (interest) => {
    const currentInterests = Array.isArray(profile.interests) 
      ? profile.interests 
      : profile.interests ? JSON.parse(profile.interests) : [];

    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];

    setProfile(prev => ({
      ...prev,
      interests: newInterests
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setCurrentPasswordError('');

    if (profile.newPassword && !passwordMatch) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const profileData = {
        nickname: profile.nickname,
        interests: profile.interests,
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword,
        profileImage: profileImage
      };

      await updateUserProfile(userId, profileData);

      setMessage('프로필이 성공적으로 업데이트되었습니다.');
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      if (error.response?.data?.message === '현재 비밀번호가 일치하지 않습니다.') {
        setCurrentPasswordError('현재 비밀번호가 일치하지 않습니다.');
      } else {
        setError(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로필 설정</h2>
          
          {message && (
            <div className="fixed top-4 right-4 z-50 animate-fade-in">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">{message}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="fixed top-4 right-4 z-50 animate-fade-in">
              <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {previewUrl ? (
                  <ProfileImage
                    imagePath={previewUrl}
                    username={profile.username}
                    size="xl"
                    showBorder={false}
                  />
                ) : (
                  <ProfileImage
                    imagePath={profile.profile_image}
                    username={profile.username}
                    size="xl"
                    showBorder={false}
                  />
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-500">프로필 이미지 변경</p>
                <p className="text-xs text-gray-400">권장 크기: 200x200px</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">아이디</label>
              <input
                type="text"
                value={profile.username}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">닉네임</label>
              <input
                type="text"
                name="nickname"
                value={profile.nickname}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                관심사
              </label>
              <div className="mt-2 flex flex-wrap gap-3">
                {interests.map((interest) => {
                  const currentInterests = Array.isArray(profile.interests) 
                    ? profile.interests 
                    : profile.interests ? JSON.parse(profile.interests) : [];
                  
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestChange(interest)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium
                        transition-all duration-300 ease-in-out
                        transform hover:-translate-y-1 hover:shadow-lg
                        ${currentInterests.includes(interest)
                          ? 'bg-indigo-500 text-white shadow-indigo-200'
                          : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300'}
                        cursor-pointer
                        animate-float
                      `}
                      style={{
                        animation: `float ${Math.random() * 2 + 2}s ease-in-out infinite`
                      }}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">비밀번호 변경</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={profile.currentPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      currentPasswordError ? 'border-red-500' : ''
                    }`}
                  />
                  {currentPasswordError && (
                    <p className="mt-1 text-sm text-red-600">{currentPasswordError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={profile.newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      !passwordMatch ? 'border-red-500' : ''
                    }`}
                  />
                  {!passwordMatch && (
                    <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                저장
              </button>
            </div>
          </form>

          <style jsx>{`
            @keyframes float {
              0% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-5px);
              }
              100% {
                transform: translateY(0px);
              }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out forwards;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 