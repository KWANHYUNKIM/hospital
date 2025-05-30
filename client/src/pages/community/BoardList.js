import React from 'react';
import { useNavigate } from 'react-router-dom';

const BoardList = ({ boards }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 정보 없음';
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\. /g, '. ').replace(/\./g, '-').replace(/,/g, '');
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  };

  const handleBoardClick = (id) => {
    navigate(`/community/boards/${id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">조회수</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">댓글</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {boards.map((board) => (
            <tr
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{board.title}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-500">{board.username}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-500">
                  {formatDate(board.createdAt)}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="text-sm text-gray-500">{board.viewCount || 0}</div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="text-sm text-gray-500">{board.commentCount || 0}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoardList; 