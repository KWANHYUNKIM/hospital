import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSocialChannel, updateSocialChannel, getSocialChannelDetail, getCategories } from '../../service/socialApi';
import { AuthContext } from '../../context/AuthContext';

export default function SocialChannelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    platform: '',
    channel_name: '',
    channel_url: '',
    channel_image_url: '',
    description: '',
    category_id: '',
    is_active: true
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const categoriesResponse = await getCategories();
        setCategories(categoriesResponse);

        if (id) {
          const channelResponse = await getSocialChannelDetail(id);
          setFormData(channelResponse);
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (id) {
        await updateSocialChannel(id, formData);
      } else {
        await createSocialChannel(formData);
      }
      navigate('/admin/social-channels');
    } catch (err) {
      setError('채널 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {id ? '채널 수정' : '새 채널 추가'}
        </h1>
        <p className="text-gray-600">
          {id ? '기존 채널 정보를 수정합니다.' : '새로운 소셜 미디어 채널을 추가합니다.'}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">플랫폼</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">플랫폼 선택</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">채널명</label>
          <input
            type="text"
            name="channel_name"
            value={formData.channel_name}
            onChange={handleInputChange}
            required
            placeholder="채널명을 입력하세요"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">채널 URL</label>
          <input
            type="url"
            name="channel_url"
            value={formData.channel_url}
            onChange={handleInputChange}
            required
            placeholder="https://"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">채널 이미지 URL</label>
          <input
            type="url"
            name="channel_image_url"
            value={formData.channel_image_url}
            onChange={handleInputChange}
            placeholder="https://"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="채널에 대한 설명을 입력하세요"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">활성화 상태</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/social-channels')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 