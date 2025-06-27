import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const DoctorApprovalPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [currentPage, activeTab]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/doctor-approval/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = `/api/doctor-approval/admin/requests?page=${currentPage}&size=10`;
      
      if (activeTab !== 'all') {
        url = `/api/doctor-approval/admin/requests/status/${activeTab}?page=${currentPage}&size=10`;
      }
      
      const response = await api.get(url);
      setRequests(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('요청 목록 조회 실패:', error);
      setError('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleViewDetail = async (requestId) => {
    try {
      const response = await api.get(`/api/doctor-approval/admin/requests/${requestId}`);
      setSelectedRequest(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('상세 정보 조회 실패:', error);
    }
  };

  const handleAction = (type, requestId) => {
    setActionType(type);
    setSelectedRequest(requests.find(req => req.id === requestId));
    setShowActionModal(true);
  };

  const submitAction = async () => {
    try {
      const url = `/api/doctor-approval/admin/requests/${selectedRequest.id}/${actionType}`;
      const params = comment ? { comment } : {};
      
      await api.post(url, null, { params });
      
      setShowActionModal(false);
      setComment('');
      setSelectedRequest(null);
      fetchRequests();
      fetchStats();
      
      alert(`요청이 ${actionType === 'approve' ? '승인' : '거부'}되었습니다.`);
    } catch (error) {
      console.error('액션 처리 실패:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: '대기중' },
      'APPROVED': { color: 'bg-green-100 text-green-800', text: '승인됨' },
      'REJECTED': { color: 'bg-red-100 text-red-800', text: '거부됨' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">의사 권한 승인 관리</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">대기중</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">승인됨</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">거부됨</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleTabChange('pending')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'pending'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          대기중
        </button>
        <button
          onClick={() => handleTabChange('approved')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'approved'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          승인됨
        </button>
        <button
          onClick={() => handleTabChange('rejected')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'rejected'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          거부됨
        </button>
      </div>

      {/* 요청 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  의사 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  요청일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.nickname}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">면허번호: {request.licenseNumber}</div>
                      <div className="text-sm text-gray-500">{request.hospitalName}</div>
                      <div className="text-sm text-gray-500">{request.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(request.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        상세보기
                      </button>
                      {request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction('approve', request.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleAction('reject', request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            거부
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span> 페이지
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    다음
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">요청 상세 정보</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자명</label>
                  <p className="text-sm text-gray-900">{selectedRequest.nickname}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <p className="text-sm text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">의사면허번호</label>
                  <p className="text-sm text-gray-900">{selectedRequest.licenseNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">소속 병원</label>
                  <p className="text-sm text-gray-900">{selectedRequest.hospitalName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">진료과</label>
                  <p className="text-sm text-gray-900">{selectedRequest.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전문분야</label>
                  <p className="text-sm text-gray-900">{selectedRequest.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">경력 연수</label>
                  <p className="text-sm text-gray-900">{selectedRequest.experienceYears}년</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">요청 사유</label>
                  <p className="text-sm text-gray-900">{selectedRequest.requestReason}</p>
                </div>
                {selectedRequest.adminComment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">관리자 코멘트</label>
                    <p className="text-sm text-gray-900">{selectedRequest.adminComment}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 액션 모달 */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                요청 {actionType === 'approve' ? '승인' : '거부'}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  코멘트 (선택사항)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="코멘트를 입력하세요..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setComment('');
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={submitAction}
                  className={`px-4 py-2 rounded-md ${
                    actionType === 'approve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {actionType === 'approve' ? '승인' : '거부'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorApprovalPage; 