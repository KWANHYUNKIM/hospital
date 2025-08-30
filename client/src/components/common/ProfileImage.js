import React, { useState } from 'react';

const ProfileImage = ({ 
  imagePath, 
  username, 
  size = 'md', 
  className = '',
  showBorder = false,
  onClick = null
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // API URL 가져오기
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:3002';
  };

  // 프로필 이미지 URL 생성 함수
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath; // HTTP URL 또는 Data URL인 경우 그대로 사용
    }
    if (imagePath.startsWith('storage_disabled_')) {
      return null; // 더미 이미지는 표시하지 않음
    }
    // 로컬 업로드된 이미지인 경우
    return `${getApiUrl()}/uploads/profile/${imagePath}`;
  };

  // 랜덤 색상 생성 함수
  const getRandomColor = (username) => {
    if (!username) return 'bg-gray-500';
    const colors = [
      'bg-red-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 
      'bg-blue-500', 'bg-cyan-500', 'bg-teal-500', 'bg-green-500',
      'bg-yellow-500', 'bg-orange-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // 사용자 이니셜 가져오기
  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  // 크기별 스타일 클래스
  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'md':
        return 'w-10 h-10 text-base';
      case 'lg':
        return 'w-16 h-16 text-xl';
      case 'xl':
        return 'w-24 h-24 text-2xl';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const sizeClasses = getSizeClasses(size);
  const imageUrl = getProfileImageUrl(imagePath);
  const hasValidImage = imageUrl && !imageError;

  // 이미지가 로딩 중이거나 유효한 이미지가 있는 경우
  if (imageLoading && hasValidImage) {
    return (
      <div className={`${sizeClasses} rounded-full bg-gray-200 animate-pulse ${className}`}>
        <div className="w-full h-full rounded-full bg-gray-300"></div>
      </div>
    );
  }

  // 유효한 이미지가 있는 경우
  if (hasValidImage) {
    return (
      <img
        src={imageUrl}
        alt={username ? `${username}의 프로필` : '프로필'}
        className={`${sizeClasses} rounded-full object-cover ${showBorder ? 'border-2 border-gray-200 hover:border-indigo-500 transition-colors duration-200' : ''} ${className}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onLoadStart={() => setImageLoading(true)}
      />
    );
  }

  // 이미지가 없거나 로딩 실패한 경우 - 이니셜 표시
  return (
    <div 
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold ${getRandomColor(username)} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {getInitials(username)}
    </div>
  );
};

export default ProfileImage; 