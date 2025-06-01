import React from 'react';
import { useAnnouncements } from '../../contexts/AnnouncementContext';
import { FaBullhorn } from 'react-icons/fa';
import { format } from 'date-fns';

const AnnouncementBanner = () => {
  const { announcements, loading, error } = useAnnouncements();

  if (loading || error || !announcements.length) {
    return null;
  }

  // 가장 최근의 공지사항을 표시
  const latestAnnouncement = announcements[0];

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center">
            <FaBullhorn className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              {latestAnnouncement.title}
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-blue-500">
              {latestAnnouncement.createdAt ? format(new Date(latestAnnouncement.createdAt), 'yyyy-MM-dd') : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner; 