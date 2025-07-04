import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import CorsManager from '../../components/admin/CorsManager';
import SocialConfigManager from '../../components/admin/SocialConfigManager';
import ServerConfigManager from '../../components/admin/ServerConfigManager';
import OperatingTimeSuggestionManager from '../../components/admin/OperatingTimeSuggestionManager';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    collectionStats: {
      hospitals: { total: 0, complete: 0, partial: 0, incomplete: 0 }
    },
    hospitalsByType: {},
    hospitalsByRegion: {},
    recentUpdates: [],
    emptyFields: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBoundaryType, setActiveBoundaryType] = useState('ctp');

  const menuItems = [
    {
      title: '뉴스 관리',
      description: '뉴스를 생성, 수정, 삭제할 수 있습니다.',
      icon: '📰',
      path: '/admin/news',
      color: 'bg-blue-600'
    },
    {
      title: '게시판 카테고리 관리',
      description: '커뮤니티 게시판의 카테고리를 관리합니다.',
      icon: '📋',
      path: '/admin/categories',
      color: 'bg-green-500'
    },
    {
      title: '타입 설정',
      description: '카테고리 타입을 관리합니다.',
      icon: '📝',
      path: '/admin/category-types',
      color: 'bg-yellow-500'
    },
    {
      title: '공지사항 관리',
      description: '팝업 공지사항과 배너를 관리합니다.',
      icon: '📢',
      path: '/admin/announcements',
      color: 'bg-pink-500'
    },
    {
      title: '채널/영상 승인',
      description: '채널과 영상의 승인을 관리합니다.',
      icon: '✅',
      path: '/admin/channels/approval',
      color: 'bg-blue-500'
    },
    {
      title: '의사 권한 승인',
      description: '의사 권한 요청을 승인/거부합니다.',
      icon: '👨‍⚕️',
      path: '/admin/doctor-approval',
      color: 'bg-indigo-500'
    },
    {
      title: '영업시간 제안 관리',
      description: '병원 영업시간 수정 제안을 승인/거부합니다.',
      icon: '🕐',
      path: '#',
      color: 'bg-orange-500',
      onClick: () => setActiveTab('operating-time-suggestions')
    },
    {
      title: 'CORS 관리',
      description: 'CORS 설정을 관리합니다.',
      icon: '🔒',
      path: '#',
      color: 'bg-purple-500',
      onClick: () => setActiveTab('cors')
    },
    {
      title: '소셜 로그인 설정',
      description: '소셜 로그인 API 설정을 관리합니다.',
      icon: '🔑',
      path: '#',
      color: 'bg-yellow-500',
      onClick: () => setActiveTab('social')
    },
    {
      title: '서버 설정',
      description: 'API 서버 주소 등 서버 설정을 관리합니다.',
      icon: '⚙️',
      path: '#',
      color: 'bg-red-500',
      onClick: () => setActiveTab('server')
    }
  ];

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/admin/dashboard/stats');
      
      if (!response.data) {
        throw new Error('서버 응답 오류');
      }
      setStats(response.data);
    } catch (error) {
      console.error('대시보드 통계 로딩 실패:', error);
      if (error.response?.status === 403) {
        navigate('/login');
        return;
      }
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && activeTab === 'dashboard') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">오류!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">관리자 대시보드</h1>
      
      {/* 탭 네비게이션 */}
      {activeTab !== 'dashboard' && (
        <div className="mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ← 대시보드로 돌아가기
          </button>
        </div>
      )}

      {/* 탭별 컨텐츠 */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
              >
                <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4`}>
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">데이터베이스 통계</h1>

            {/* 컬렉션별 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">병원 데이터</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.collectionStats?.hospitals?.total || 0}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>전화번호 미입력: {stats?.emptyFields?.phone || 0}</p>
                  <p>위치정보 미입력: {stats?.emptyFields?.location || 0}</p>
                  <p>주소 미입력: {stats?.emptyFields?.address || 0}</p>
                </div>
              </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 병원 유형 분포 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">병원 유형 분포</h3>
                {Object.keys(stats.hospitalsByType).length > 0 ? (
                  <Pie
                    data={{
                      labels: Object.keys(stats.hospitalsByType),
                      datasets: [{
                        data: Object.values(stats.hospitalsByType),
                        backgroundColor: [
                          '#FF6384',
                          '#36A2EB',
                          '#FFCE56',
                          '#4BC0C0',
                          '#9966FF',
                          '#FF9F40'
                        ]
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right'
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">데이터가 없습니다.</p>
                )}
              </div>

              {/* 지역별 분포 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">지역별 분포</h3>
                {Object.keys(stats.hospitalsByRegion).length > 0 ? (
                  <Bar
                    data={{
                      labels: Object.keys(stats.hospitalsByRegion),
                      datasets: [{
                        label: '병원 수',
                        data: Object.values(stats.hospitalsByRegion),
                        backgroundColor: '#36A2EB'
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">데이터가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 빈 필드 현황 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">빈 필드 현황</h3>
              {Object.keys(stats.emptyFields).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">필드명</th>
                        <th className="px-4 py-2 text-left">빈 데이터 수</th>
                        <th className="px-4 py-2 text-left">비율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.emptyFields).map(([field, count]) => (
                        <tr key={field} className="border-t">
                          <td className="px-4 py-2">{field}</td>
                          <td className="px-4 py-2">{count}</td>
                          <td className="px-4 py-2">
                            {Math.round((count / (stats?.collectionStats?.hospitals?.total || 1)) * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">빈 필드 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'operating-time-suggestions' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">영업시간 제안 관리</h1>
          <div className="bg-white rounded-lg shadow-lg">
            <OperatingTimeSuggestionManager />
          </div>
        </div>
      )}

      {activeTab === 'cors' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">CORS 관리</h1>
          <div className="bg-white rounded-lg shadow-lg">
            <CorsManager />
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">소셜 로그인 설정</h1>
          <div className="bg-white rounded-lg shadow-lg">
            <SocialConfigManager />
          </div>
        </div>
      )}

      {activeTab === 'server' && (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">서버 설정 관리</h1>
          <div className="bg-white rounded-lg shadow-lg">
            <ServerConfigManager />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;