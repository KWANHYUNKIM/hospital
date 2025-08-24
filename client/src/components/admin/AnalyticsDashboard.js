import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../service/analyticsApi';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsDashboard = () => {
  const [popularSearches, setPopularSearches] = useState([]);
  const [popularHospitals, setPopularHospitals] = useState([]);
  const [searchStats, setSearchStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { getEventQueueStatus, flushEventQueue } = useAnalytics();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 가져오기
      const [searches, hospitals] = await Promise.all([
        analyticsApi.getPopularSearches(),
        analyticsApi.getPopularHospitals()
      ]);
      
      setPopularSearches(searches);
      setPopularHospitals(hospitals);
      
    } catch (error) {
      console.error('분석 데이터 가져오기 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlushQueue = async () => {
    try {
      await flushEventQueue();
      alert('이벤트 큐가 성공적으로 플러시되었습니다.');
    } catch (error) {
      alert('이벤트 큐 플러시 실패: ' + error.message);
    }
  };

  const queueStatus = getEventQueueStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          📊 분석 대시보드
        </h1>
        <p className="text-gray-600">
          사용자 행동 데이터를 기반으로 한 분석 결과입니다.
        </p>
      </div>

      {/* 이벤트 큐 상태 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            🔄 이벤트 큐 상태
          </h2>
          <button
            onClick={handleFlushQueue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            큐 플러시
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">대기 중인 이벤트</p>
            <p className="text-2xl font-bold text-blue-800">{queueStatus.queueLength}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">처리 상태</p>
            <p className="text-2xl font-bold text-green-800">
              {queueStatus.isProcessing ? '처리 중' : '대기 중'}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">네트워크 상태</p>
            <p className="text-2xl font-bold text-purple-800">
              {queueStatus.isOnline ? '온라인' : '오프라인'}
            </p>
          </div>
        </div>
      </div>

      {/* 인기 검색어 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🔍 인기 검색어 TOP 10
        </h2>
        
        {popularSearches.length > 0 ? (
          <div className="space-y-3">
            {popularSearches.slice(0, 10).map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-800">
                    {search.query}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">검색 횟수</p>
                  <p className="font-bold text-gray-800">{search.count}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            아직 검색 데이터가 없습니다.
          </p>
        )}
      </div>

      {/* 인기 병원 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🏥 인기 병원 TOP 10
        </h2>
        
        {popularHospitals.length > 0 ? (
          <div className="space-y-3">
            {popularHospitals.slice(0, 10).map((hospital, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-600">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{hospital.name}</p>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">클릭 횟수</p>
                  <p className="font-bold text-gray-800">{hospital.clickCount}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            아직 병원 클릭 데이터가 없습니다.
          </p>
        )}
      </div>

      {/* 검색 통계 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📈 검색 통계
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 font-medium">총 검색 횟수</p>
            <p className="text-2xl font-bold text-blue-800">
              {searchStats.totalSearches || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 font-medium">성공률</p>
            <p className="text-2xl font-bold text-green-800">
              {searchStats.successRate || 0}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-600 font-medium">평균 결과 수</p>
            <p className="text-2xl font-bold text-purple-800">
              {searchStats.avgResults || 0}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-sm text-orange-600 font-medium">고유 사용자</p>
            <p className="text-2xl font-bold text-orange-800">
              {searchStats.uniqueUsers || 0}
            </p>
          </div>
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <div className="text-center">
        <button
          onClick={fetchAnalyticsData}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🔄 데이터 새로고침
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 