import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchActiveAnnouncements } from '../service/commonApi';

// TypeScript 인터페이스 정의
interface Announcement {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  startDate: string;
  endDate: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  closeModal: () => void;
  closeDayModal: () => void;
  fetchAnnouncements: () => Promise<void>;
}

interface AnnouncementProviderProps {
  children: ReactNode;
}

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);

export const useAnnouncement = (): AnnouncementContextType => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(true);

  const fetchAnnouncements = useCallback(async (): Promise<void> => {
    try {
      const activeAnnouncements: Announcement[] = await fetchActiveAnnouncements();
      // 우선순위 기준으로 정렬
      const sortedAnnouncements = activeAnnouncements.sort((a, b) => b.priority - a.priority);
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('공지사항 로딩 실패 (Context):', error);
      // React Native에서는 Alert를 사용할 수 있지만, 여기서는 조용히 처리
      setAnnouncements([]);
    }
  }, []);

  const closeModal = useCallback((): void => {
    setModalVisible(false);
  }, []);

  const closeDayModal = useCallback(async (): Promise<void> => {
    setModalVisible(false);
    try {
      const today = new Date();
      const todayString = today.getDate().toString();
      await AsyncStorage.setItem('AnnouncementCookie', todayString);
    } catch (error) {
      console.error('AsyncStorage 저장 실패:', error);
    }
  }, []);

  useEffect(() => {
    const checkAnnouncementVisibility = async () => {
      try {
        const visitedDate = await AsyncStorage.getItem('AnnouncementCookie');
        const currentDate = new Date().getDate();
        
        if (visitedDate !== null) {
          const visitedDateNumber = parseInt(visitedDate, 10);
          if (visitedDateNumber === currentDate) {
            setModalVisible(false);
          }
        }
      } catch (error) {
        console.error('AsyncStorage 읽기 실패:', error);
        // 에러가 발생해도 모달은 보여줍니다
      }
      
      // 공지사항 데이터 로드
      await fetchAnnouncements();
    };

    checkAnnouncementVisibility();
  }, [fetchAnnouncements]);

  const value: AnnouncementContextType = {
    announcements,
    modalVisible,
    setModalVisible,
    closeModal,
    closeDayModal,
    fetchAnnouncements
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}; 