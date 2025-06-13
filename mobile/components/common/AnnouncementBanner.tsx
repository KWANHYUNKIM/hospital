import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAnnouncements } from '../../contexts/AnnouncementContext';

// TypeScript 인터페이스 정의
interface Announcement {
  id: string;
  title: string;
  content?: string;
  createdAt?: string;
}

const AnnouncementBanner: React.FC = () => {
  const { announcements, loading, error } = useAnnouncements();

  if (loading || error || !announcements.length) {
    return null;
  }

  // 가장 최근의 공지사항을 표시
  const latestAnnouncement: Announcement = announcements[0];

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Icon name="campaign" size={20} color="#3B82F6" style={styles.icon} />
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {latestAnnouncement.title}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.date}>
            {formatDate(latestAnnouncement.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EBF8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  rightSection: {
    marginLeft: 12,
  },
  date: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '400',
  },
});

export default AnnouncementBanner; 