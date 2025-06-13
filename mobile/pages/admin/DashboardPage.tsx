import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  newPostsToday: number;
  totalHospitals: number;
  verifiedHospitals: number;
  totalNews: number;
  publishedNews: number;
  pendingChannels: number;
  totalChannels: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
}

interface RecentActivity {
  id: number;
  type: 'USER' | 'POST' | 'HOSPITAL' | 'NEWS' | 'CHANNEL' | 'ANNOUNCEMENT';
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
  status?: string;
}

interface SystemHealth {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  database_status: 'HEALTHY' | 'WARNING' | 'ERROR';
  api_response_time: number;
}

const DashboardPage: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // 병렬로 모든 데이터를 가져옵니다
      const [statsResponse, activitiesResponse, healthResponse] = await Promise.allSettled([
        axios.get(`${getApiUrl()}/api/admin/dashboard/stats`, { withCredentials: true }),
        axios.get(`${getApiUrl()}/api/admin/dashboard/activities`, { withCredentials: true }),
        axios.get(`${getApiUrl()}/api/admin/dashboard/health`, { withCredentials: true })
      ]);

      // 통계 데이터 처리
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value.data);
      } else {
        console.error('Stats fetch failed:', statsResponse.reason);
      }

      // 최근 활동 데이터 처리
      if (activitiesResponse.status === 'fulfilled') {
        setRecentActivities(activitiesResponse.value.data || []);
      } else {
        console.error('Activities fetch failed:', activitiesResponse.reason);
      }

      // 시스템 상태 데이터 처리
      if (healthResponse.status === 'fulfilled') {
        setSystemHealth(healthResponse.value.data);
      } else {
        console.error('Health fetch failed:', healthResponse.reason);
      }

    } catch (err: any) {
      console.error('Dashboard data fetch failed:', err);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER':
        return '👤';
      case 'POST':
        return '📝';
      case 'HOSPITAL':
        return '🏥';
      case 'NEWS':
        return '📰';
      case 'CHANNEL':
        return '📺';
      case 'ANNOUNCEMENT':
        return '📢';
      default:
        return 'ℹ️';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER':
        return '#3B82F6';
      case 'POST':
        return '#8B5CF6';
      case 'HOSPITAL':
        return '#EF4444';
      case 'NEWS':
        return '#F59E0B';
      case 'CHANNEL':
        return '#10B981';
      case 'ANNOUNCEMENT':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

  const getHealthColor = (value: number, type: 'usage' | 'response') => {
    if (type === 'usage') {
      if (value >= 90) return '#EF4444';
      if (value >= 70) return '#F59E0B';
      return '#10B981';
    } else {
      if (value >= 1000) return '#EF4444';
      if (value >= 500) return '#F59E0B';
      return '#10B981';
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    subtitle?: string;
    subtitleValue?: number;
    icon: string;
    color: string;
    onPress?: () => void;
  }> = ({ title, value, subtitle, subtitleValue, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, onPress && styles.statCardTouchable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Text style={styles.statIconText}>{icon}</Text>
        </View>
        <View style={styles.statValues}>
          <Text style={styles.statValue}>{value.toLocaleString()}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
      {subtitle && subtitleValue !== undefined && (
        <View style={styles.statSubtitle}>
          <Text style={styles.subtitleText}>
            {subtitle}: {subtitleValue.toLocaleString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>대시보드 로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관리자 대시보드</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 통계 카드들 */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>주요 통계</Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                title="총 사용자"
                value={stats.totalUsers}
                subtitle="오늘 신규"
                subtitleValue={stats.newUsersToday}
                icon="👥"
                color="#3B82F6"
                onPress={() => console.log('사용자 관리 페이지로 이동')}
              />
              
              <StatCard
                title="게시글"
                value={stats.totalPosts}
                subtitle="오늘 작성"
                subtitleValue={stats.newPostsToday}
                icon="📝"
                color="#8B5CF6"
                onPress={() => console.log('게시글 관리 페이지로 이동')}
              />
              
              <StatCard
                title="병원"
                value={stats.totalHospitals}
                subtitle="인증된 병원"
                subtitleValue={stats.verifiedHospitals}
                icon="🏥"
                color="#EF4444"
                onPress={() => console.log('병원 관리 페이지로 이동')}
              />
              
              <StatCard
                title="뉴스"
                value={stats.totalNews}
                subtitle="게시된 뉴스"
                subtitleValue={stats.publishedNews}
                icon="📰"
                color="#F59E0B"
                onPress={() => console.log('뉴스 관리 페이지로 이동')}
              />
              
              <StatCard
                title="채널"
                value={stats.totalChannels}
                subtitle="승인 대기"
                subtitleValue={stats.pendingChannels}
                icon="📺"
                color="#10B981"
                onPress={() => console.log('채널 승인 페이지로 이동')}
              />
              
              <StatCard
                title="공지사항"
                value={stats.totalAnnouncements}
                subtitle="활성화"
                subtitleValue={stats.activeAnnouncements}
                icon="📢"
                color="#EC4899"
                onPress={() => console.log('공지사항 관리 페이지로 이동')}
              />
            </View>
          </View>
        )}

        {/* 시스템 상태 */}
        {systemHealth && (
          <View style={styles.healthContainer}>
            <Text style={styles.sectionTitle}>시스템 상태</Text>
            
            <View style={styles.healthCard}>
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>CPU 사용률</Text>
                <View style={styles.healthBar}>
                  <View 
                    style={[
                      styles.healthProgress, 
                      { 
                        width: `${systemHealth.cpu_usage}%`,
                        backgroundColor: getHealthColor(systemHealth.cpu_usage, 'usage')
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.healthValue}>{systemHealth.cpu_usage}%</Text>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>메모리 사용률</Text>
                <View style={styles.healthBar}>
                  <View 
                    style={[
                      styles.healthProgress, 
                      { 
                        width: `${systemHealth.memory_usage}%`,
                        backgroundColor: getHealthColor(systemHealth.memory_usage, 'usage')
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.healthValue}>{systemHealth.memory_usage}%</Text>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>디스크 사용률</Text>
                <View style={styles.healthBar}>
                  <View 
                    style={[
                      styles.healthProgress, 
                      { 
                        width: `${systemHealth.disk_usage}%`,
                        backgroundColor: getHealthColor(systemHealth.disk_usage, 'usage')
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.healthValue}>{systemHealth.disk_usage}%</Text>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>API 응답 시간</Text>
                <Text style={[
                  styles.healthValueLarge,
                  { color: getHealthColor(systemHealth.api_response_time, 'response') }
                ]}>
                  {systemHealth.api_response_time}ms
                </Text>
              </View>
              
              <View style={styles.healthItem}>
                <Text style={styles.healthLabel}>데이터베이스 상태</Text>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: systemHealth.database_status === 'HEALTHY' ? '#D1FAE5' : 
                                   systemHealth.database_status === 'WARNING' ? '#FEF3C7' : '#FEE2E2'
                  }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { 
                      color: systemHealth.database_status === 'HEALTHY' ? '#065F46' : 
                             systemHealth.database_status === 'WARNING' ? '#D97706' : '#DC2626'
                    }
                  ]}>
                    {systemHealth.database_status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 최근 활동 */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          
          {recentActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: getActivityColor(activity.type) + '20' }
                  ]}>
                    <Text style={styles.activityIconText}>
                      {getActivityIcon(activity.type)}
                    </Text>
                  </View>
                  
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivities}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>최근 활동이 없습니다</Text>
            </View>
          )}
        </View>

        {/* 빠른 액션 */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>빠른 액션</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => console.log('새 뉴스 작성 페이지로 이동')}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>새 뉴스 작성</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => console.log('공지사항 관리 페이지로 이동')}
            >
              <Text style={styles.quickActionIcon}>📢</Text>
              <Text style={styles.quickActionText}>공지사항 관리</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => console.log('채널 승인 페이지로 이동')}
            >
              <Text style={styles.quickActionIcon}>✅</Text>
              <Text style={styles.quickActionText}>채널 승인</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => console.log('카테고리 관리 페이지로 이동')}
            >
              <Text style={styles.quickActionIcon}>📂</Text>
              <Text style={styles.quickActionText}>카테고리 관리</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardTouchable: {
    // 터치 가능한 카드에 대한 추가 스타일링은 여기에
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statValues: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statSubtitle: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subtitleText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  healthContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthItem: {
    marginBottom: 16,
  },
  healthLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  healthBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  healthProgress: {
    height: '100%',
    borderRadius: 4,
  },
  healthValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'right',
  },
  healthValueLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activitiesContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  activitiesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyActivities: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#9CA3AF',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default DashboardPage; 