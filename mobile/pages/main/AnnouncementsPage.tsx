import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 타입 정의
interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: 'update' | 'maintenance' | 'notice';
  date: string;
}

const AnnouncementsPage: React.FC = () => {
  const navigation = useNavigation();

  // 공지사항 데이터 (실제로는 API에서 가져올 수 있음)
  const announcements: AnnouncementItem[] = [
    {
      id: 1,
      title: '서비스 업데이트 안내',
      content: '새로운 기능 추가 및 버그 수정 내용을 안내드립니다. 더 나은 서비스를 위해 지속적으로 개선하고 있습니다.',
      type: 'update',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: '시스템 점검 안내',
      content: '서비스 품질 향상을 위한 정기 시스템 점검이 예정되어 있습니다. 점검 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.',
      type: 'maintenance',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: '개인정보 처리방침 개정 안내',
      content: '개인정보 보호를 위한 처리방침이 개정되었습니다. 자세한 내용은 개인정보 처리방침 페이지를 확인해주세요.',
      type: 'notice',
      date: '2024-01-05'
    }
  ];

  const handleEmailPress = () => {
    const email = 'molba06@naver.com';
    const subject = '삐뽀삐뽀119 피드백';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('오류', '이메일 앱을 열 수 없습니다.');
    });
  };

  const handleDiscordPress = () => {
    const discordUrl = 'https://discord.gg/yourinvite';
    
    Linking.openURL(discordUrl).catch(() => {
      Alert.alert('오류', '링크를 열 수 없습니다.');
    });
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'update':
        return { name: 'system-update', color: '#10B981' };
      case 'maintenance':
        return { name: 'build', color: '#F59E0B' };
      case 'notice':
        return { name: 'info', color: '#3B82F6' };
      default:
        return { name: 'notifications', color: '#6B7280' };
    }
  };

  const getAnnouncementTypeText = (type: string) => {
    switch (type) {
      case 'update':
        return '업데이트';
      case 'maintenance':
        return '점검';
      case 'notice':
        return '공지';
      default:
        return '알림';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항 및 피드백</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 피드백 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="feedback" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>피드백 보내기</Text>
          </View>
          
          <Text style={styles.feedbackDescription}>
            사용자 여러분의 소중한 의견을 기다립니다. 아래의 방법 중 하나로 피드백을 보내주세요.
          </Text>

          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod} onPress={handleEmailPress}>
              <View style={styles.contactIcon}>
                <Icon name="email" size={24} color="#EF4444" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>이메일</Text>
                <Text style={styles.contactValue}>molba06@naver.com</Text>
              </View>
              <Icon name="arrow-forward-ios" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactMethod} onPress={handleDiscordPress}>
              <View style={[styles.contactIcon, { backgroundColor: '#E8F4FD' }]}>
                <Icon name="chat" size={24} color="#5865F2" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Discord</Text>
                <Text style={styles.contactValue}>Join our Discord</Text>
              </View>
              <Icon name="arrow-forward-ios" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.contactMethod}>
              <View style={[styles.contactIcon, { backgroundColor: '#F3F4F6' }]}>
                <Icon name="more-horiz" size={24} color="#6B7280" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>기타</Text>
                <Text style={styles.contactValue}>다른 피드백 방법</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 공지사항 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="campaign" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>최근 공지사항</Text>
          </View>

          <View style={styles.announcementsList}>
            {announcements.map((announcement) => {
              const iconInfo = getAnnouncementIcon(announcement.type);
              return (
                <TouchableOpacity key={announcement.id} style={styles.announcementCard}>
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementTitleRow}>
                      <Icon name={iconInfo.name} size={20} color={iconInfo.color} />
                      <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    </View>
                    <View style={styles.announcementMeta}>
                      <View style={[styles.announcementType, { backgroundColor: `${iconInfo.color}20` }]}>
                        <Text style={[styles.announcementTypeText, { color: iconInfo.color }]}>
                          {getAnnouncementTypeText(announcement.type)}
                        </Text>
                      </View>
                      <Text style={styles.announcementDate}>{announcement.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.announcementContent} numberOfLines={3}>
                    {announcement.content}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  feedbackDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  announcementsList: {
    gap: 16,
  },
  announcementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  announcementHeader: {
    marginBottom: 12,
  },
  announcementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  announcementType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  announcementDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  announcementContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default AnnouncementsPage; 