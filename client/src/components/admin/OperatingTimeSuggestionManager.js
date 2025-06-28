import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const OperatingTimeSuggestionManager = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      // 모든 제안을 가져오도록 엔드포인트 변경
      const response = await api.get('/api/admin/operating-time-suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('영업시간 제안 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (suggestionId) => {
    try {
      await api.post(`/api/admin/operating-time-suggestions/${suggestionId}/approve`);
      alert('영업시간 수정 제안이 승인되었습니다.');
      fetchSuggestions(); // 목록 새로고침
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (suggestionId) => {
    if (!rejectReason.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }

    try {
      await api.post(`/api/admin/operating-time-suggestions/${suggestionId}/reject`, {
        reason: rejectReason
      });
      alert('영업시간 수정 제안이 거부되었습니다.');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedSuggestion(null);
      fetchSuggestions(); // 목록 새로고침
    } catch (error) {
      console.error('거부 실패:', error);
      alert('거부 중 오류가 발생했습니다.');
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "-" || timeStr === "정보 없음") return "정보 없음";
    const strTime = String(timeStr);
    const paddedTime = strTime.padStart(4, "0");
    return `${paddedTime.slice(0, 2)}:${paddedTime.slice(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { text: '대기중', color: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { text: '승인됨', color: 'bg-green-100 text-green-800' },
      'REJECTED': { text: '거부됨', color: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // 상태별 필터링
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (statusFilter === 'ALL') return true;
    return suggestion.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">오류!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">영업시간 수정 제안 관리</h2>
        <button
          onClick={fetchSuggestions}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            statusFilter === 'ALL' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          전체 ({suggestions.length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            statusFilter === 'PENDING' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          대기중 ({suggestions.filter(s => s.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            statusFilter === 'APPROVED' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          승인됨 ({suggestions.filter(s => s.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            statusFilter === 'REJECTED' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          거부됨 ({suggestions.filter(s => s.status === 'REJECTED').length})
        </button>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {statusFilter === 'ALL' 
            ? '영업시간 수정 제안이 없습니다.' 
            : `${statusFilter === 'PENDING' ? '대기 중인' : statusFilter === 'APPROVED' ? '승인된' : '거부된'} 영업시간 수정 제안이 없습니다.`
          }
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{suggestion.hospitalName}</h3>
                    {getStatusBadge(suggestion.status)}
                  </div>
                  <p className="text-sm text-gray-600">병원 ID: {suggestion.hospitalId}</p>
                  <p className="text-sm text-gray-600">제출일: {formatDate(suggestion.submittedAt)}</p>
                  {suggestion.reviewedAt && (
                    <p className="text-sm text-gray-600">처리일: {formatDate(suggestion.reviewedAt)}</p>
                  )}
                  {suggestion.reviewerNote && (
                    <p className="text-sm text-gray-600">처리 메모: {suggestion.reviewerNote}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {suggestion.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(suggestion.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setShowRejectModal(true);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        거부
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">제안 이유</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {suggestion.suggestion}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 현재 영업시간 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">현재 영업시간</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>월요일:</span>
                      <span>{formatTime(suggestion.trmtMonStart)} ~ {formatTime(suggestion.trmtMonEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>화요일:</span>
                      <span>{formatTime(suggestion.trmtTueStart)} ~ {formatTime(suggestion.trmtTueEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>수요일:</span>
                      <span>{formatTime(suggestion.trmtWedStart)} ~ {formatTime(suggestion.trmtWedEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>목요일:</span>
                      <span>{formatTime(suggestion.trmtThuStart)} ~ {formatTime(suggestion.trmtThuEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>금요일:</span>
                      <span>{formatTime(suggestion.trmtFriStart)} ~ {formatTime(suggestion.trmtFriEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>토요일:</span>
                      <span>{formatTime(suggestion.trmtSatStart)} ~ {formatTime(suggestion.trmtSatEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>일요일:</span>
                      <span>{suggestion.noTrmtSun}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>점심시간:</span>
                      <span>{suggestion.lunchWeek || "정보 없음"}</span>
                    </div>
                  </div>
                </div>

                {/* 제안된 영업시간 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">제안된 영업시간</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>월요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtMonStart)} ~ {formatTime(suggestion.suggestedTrmtMonEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>화요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtTueStart)} ~ {formatTime(suggestion.suggestedTrmtTueEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>수요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtWedStart)} ~ {formatTime(suggestion.suggestedTrmtWedEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>목요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtThuStart)} ~ {formatTime(suggestion.suggestedTrmtThuEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>금요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtFriStart)} ~ {formatTime(suggestion.suggestedTrmtFriEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>토요일:</span>
                      <span>{formatTime(suggestion.suggestedTrmtSatStart)} ~ {formatTime(suggestion.suggestedTrmtSatEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>일요일:</span>
                      <span>{suggestion.suggestedNoTrmtSun}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>점심시간:</span>
                      <span>{suggestion.suggestedLunchWeek || "정보 없음"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 거부 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">제안 거부</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedSuggestion?.hospitalName}의 영업시간 수정 제안을 거부하시겠습니까?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                거부 사유
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거부 사유를 입력해주세요..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                rows="3"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedSuggestion(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleReject(selectedSuggestion.id)}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
              >
                거부
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatingTimeSuggestionManager; 