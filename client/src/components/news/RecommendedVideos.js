import React, { useState, useEffect } from 'react';
import { getSocialChannels, createChannel, updateChannel, deleteChannel, approveChannel } from '../../service/socialApi';
import { useAuth } from '../../contexts/AuthContext';

export default function RecommendedVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    channelUri: '',
    sourceType: 'MANUAL',
    isAutoGenerated: false,
    type: 'VIDEO'
  });

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getSocialChannels();
        setVideos(response.filter(item => 
          item.channelUri && item.channelUri.includes('watch?v=') && 
          (item.approvalStatus === 'APPROVED' || (isAdmin && item.approvalStatus === 'PENDING'))
        ));
        setIsAdmin(user?.role === 'ADMIN');
      } catch (err) {
        setError('영상 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'channelUri') {
      const videoId = extractYouTubeId(value);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        setFormData(prev => ({
          ...prev,
          channelUri: value,
          imageUrl: thumbnailUrl
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    
    // 일반적인 YouTube URL 패턴 (www. 포함/미포함 모두 처리)
    const patterns = [
      /(?:(?:www\.)?youtube\.com\/watch\?v=|youtu\.be\/|(?:www\.)?youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
      /(?:www\.)?youtube\.com\/watch\?.*&v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const refreshThumbnail = (quality = 'maxresdefault') => {
    const videoId = extractYouTubeId(formData.channelUri);
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
      setFormData(prev => ({
        ...prev,
        imageUrl: thumbnailUrl
      }));
    } else {
      alert('유효한 YouTube URL을 먼저 입력해주세요.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVideo) {
        await updateChannel(selectedVideo.id, formData);
      } else {
        await createChannel(formData);
      }
      const response = await getSocialChannels();
      setVideos(response.filter(item => item.type === 'VIDEO'));
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedVideo(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        channelUri: '',
        sourceType: 'MANUAL',
        isAutoGenerated: false,
        type: 'VIDEO'
      });
    } catch (err) {
      setError('영상 저장에 실패했습니다.');
    }
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setFormData({
      name: video.name,
      description: video.description,
      imageUrl: video.imageUrl,
      channelUri: video.channelUri,
      sourceType: video.sourceType,
      isAutoGenerated: video.isAutoGenerated,
      type: 'VIDEO'
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 영상을 삭제하시겠습니까?')) {
      try {
        await deleteChannel(id);
        const response = await getSocialChannels();
        setVideos(response.filter(item => item.type === 'VIDEO'));
      } catch (err) {
        setError('영상 삭제에 실패했습니다.');
      }
    }
  };

  const handleApprove = async (videoId) => {
    try {
      await approveChannel(videoId, { status: 'APPROVED' });
      const response = await getSocialChannels();
      setVideos(response.filter(item => item.type === 'VIDEO'));
    } catch (err) {
      setError('영상 승인에 실패했습니다.');
    }
  };

  const handleReject = async (videoId) => {
    const reason = window.prompt('거절 사유를 입력해주세요:');
    if (reason) {
      try {
        await approveChannel(videoId, { 
          status: 'REJECTED',
          rejectionReason: reason
        });
        const response = await getSocialChannels();
        setVideos(response.filter(item => item.type === 'VIDEO'));
      } catch (err) {
        setError('영상 거절에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-video bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">추천 영상</h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            영상 추가
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map(video => (
          <div key={video.id} className="relative group">
            <a
              href={video.channelUri}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={video.imageUrl || getDefaultImage(video.sourceType)}
                  alt={video.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="mt-2 text-sm text-center group-hover:text-blue-500 transition-colors duration-200">
                {video.name}
              </div>
            </a>
            
            {isAdmin && (
              <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(video)}
                  className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  title="수정"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="삭제"
                >
                  ×
                </button>
                {video.approvalStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(video.id)}
                      className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600"
                      title="승인"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleReject(video.id)}
                      className="p-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                      title="거절"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            )}
            
            {video.approvalStatus === 'REJECTED' && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">
                거절됨
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 영상 추가/수정 모달 */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {showEditModal ? '영상 수정' : '영상 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">영상 URL</label>
                <input
                  type="url"
                  name="channelUri"
                  value={formData.channelUri}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">썸네일 URL</label>
                <div className="mt-1">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="썸네일 URL을 입력하거나 YouTube URL에서 자동 추출"
                    />
                    <button
                      type="button"
                      onClick={() => refreshThumbnail()}
                      className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 whitespace-nowrap"
                      title="썸네일 다시 가져오기"
                    >
                      🔄 새로고침
                    </button>
                  </div>
                  <div className="flex gap-1 mb-2">
                    <button
                      type="button"
                      onClick={() => refreshThumbnail('maxresdefault')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      고화질
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshThumbnail('hqdefault')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      중화질
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshThumbnail('mqdefault')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      저화질
                    </button>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.imageUrl}
                        alt="썸네일 미리보기"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  YouTube URL을 입력하면 자동으로 썸네일이 추출됩니다. 추출이 안 되면 새로고침 버튼을 눌러보세요.
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">소스 타입</label>
                <select
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="MANUAL">수동</option>
                  <option value="RSS_FEED">RSS 피드</option>
                  <option value="API">API</option>
                  <option value="SCRAPING">스크래핑</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAutoGenerated"
                    checked={formData.isAutoGenerated}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">자동 생성</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  {showEditModal ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getDefaultImage(sourceType) {
  switch (sourceType) {
    case 'RSS_FEED':
      return 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png';
    case 'API':
      return 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png';
    default:
      return '';
  }
} 