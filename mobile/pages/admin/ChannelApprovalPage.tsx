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
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Channel {
  id: number;
  name: string;
  description: string;
  platform: string;
  url: string;
  submitter_name: string;
  submitter_email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: number;
  rejection_reason?: string;
  category: string;
  subscriber_count?: number;
  average_views?: number;
}

interface ChannelsResponse {
  content: Channel[];
  totalPages: number;
  number: number;
  totalElements: number;
}

const ChannelApprovalPage: React.FC = () => {
  const navigation = useNavigation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChannels = async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page - 1).toString(),
        size: '10',
        sort: 'submitted_at,desc'
      });

      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }

      const response = await axios.get(
        `${getApiUrl()}/api/admin/channels?${params.toString()}`,
        { withCredentials: true }
      );

      const data: ChannelsResponse = response.data;
      setChannels(data.content || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.number + 1 || page);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error('채널 목록 로딩 실패:', err);
      setError('채널 목록을 불러오는데 실패했습니다.');
      Alert.alert('오류', '채널 목록을 불러오는데 실패했습니다.');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [selectedStatus]);

  const handleApproval = async (channelId: number, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const data = action === 'reject' && rejectionReason ? { reason: rejectionReason } : {};

      await axios.post(
        `${getApiUrl()}/api/admin/channels/${channelId}/${endpoint}`,
        data,
        { withCredentials: true }
      );

      fetchChannels(currentPage, false);
      setDetailModalVisible(false);
      setSelectedChannel(null);
      
      Alert.alert('성공', `채널이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
    } catch (err: any) {
      console.error('채널 처리 실패:', err);
      Alert.alert('오류', `채널 ${action === 'approve' ? '승인' : '거부'}에 실패했습니다.`);
    }
  };

  const showApprovalDialog = (channel: Channel, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      Alert.alert(
        '채널 승인',
        `'${channel.name}' 채널을 승인하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '승인',
            onPress: () => handleApproval(channel.id, 'approve')
          }
        ]
      );
    } else {
      Alert.prompt(
        '채널 거부',
        `'${channel.name}' 채널을 거부하는 이유를 입력해주세요:`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '거부',
            onPress: (reason) => {
              if (reason?.trim()) {
                handleApproval(channel.id, 'reject', reason.trim());
              } else {
                Alert.alert('알림', '거부 사유를 입력해주세요.');
              }
            }
          }
        ],
        'plain-text'
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChannels(1, false);
  };

  const loadNextPage = () => {
    if (currentPage < totalPages && !loading) {
      fetchChannels(currentPage + 1, false);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 1 && !loading) {
      fetchChannels(currentPage - 1, false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'APPROVED':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'REJECTED':
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거부됨';
      default:
        return status;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '📺';
      case 'twitch':
        return '🎮';
      case 'instagram':
        return '📷';
      case 'tiktok':
        return '🎵';
      default:
        return '🌐';
    }
  };

  const renderChannelItem = ({ item }: { item: Channel }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={styles.channelCard}
        onPress={() => {
          setSelectedChannel(item);
          setDetailModalVisible(true);
        }}
      >
        <View style={styles.channelHeader}>
          <View style={styles.platformInfo}>
            <Text style={styles.platformIcon}>{getPlatformIcon(item.platform)}</Text>
            <Text style={styles.platformText}>{item.platform}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.channelName} numberOfLines={1}>
          {item.name}
        </Text>
        
        <Text style={styles.channelDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.channelMeta}>
          <Text style={styles.submitterText}>
            제출자: {item.submitter_name}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.submitted_at).toLocaleDateString()}
          </Text>
        </View>

        {item.subscriber_count && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              구독자: {item.subscriber_count.toLocaleString()}
            </Text>
            {item.average_views && (
              <Text style={styles.statsText}>
                평균 조회수: {item.average_views.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {item.status === 'PENDING' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => showApprovalDialog(item, 'approve')}
            >
              <Text style={styles.buttonIcon}>✓</Text>
              <Text style={styles.approveButtonText}>승인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => showApprovalDialog(item, 'reject')}
            >
              <Text style={styles.buttonIcon}>✗</Text>
              <Text style={styles.rejectButtonText}>거부</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>로딩 중...</Text>
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
        <Text style={styles.headerTitle}>채널 승인 관리</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.totalCount}>총 {totalElements}개</Text>
        </View>
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { value: 'ALL', label: '전체' },
            { value: 'PENDING', label: '대기중' },
            { value: 'APPROVED', label: '승인됨' },
            { value: 'REJECTED', label: '거부됨' }
          ].map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.filterButton,
                selectedStatus === status.value && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(status.value as typeof selectedStatus)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === status.value && styles.filterButtonTextActive
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 채널 목록 */}
      <FlatList
        data={channels}
        renderItem={renderChannelItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.channelList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {selectedStatus === 'PENDING' ? '승인 대기 중인 채널이 없습니다' : '해당 상태의 채널이 없습니다'}
            </Text>
          </View>
        }
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={loadPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <Text style={styles.pageButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            onPress={loadNextPage}
            disabled={currentPage === totalPages || loading}
          >
            <Text style={styles.pageButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 상세 정보 모달 */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>채널 상세 정보</Text>
            <View style={styles.spacer} />
          </View>

          {selectedChannel && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.detailContainer}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>채널명</Text>
                  <Text style={styles.detailValue}>{selectedChannel.name}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>플랫폼</Text>
                  <View style={styles.platformContainer}>
                    <Text style={styles.platformIcon}>{getPlatformIcon(selectedChannel.platform)}</Text>
                    <Text style={styles.detailValue}>{selectedChannel.platform}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>URL</Text>
                  <Text style={styles.urlText} numberOfLines={2}>
                    {selectedChannel.url}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>설명</Text>
                  <Text style={styles.detailValue}>{selectedChannel.description}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>카테고리</Text>
                  <Text style={styles.detailValue}>{selectedChannel.category}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>제출자 정보</Text>
                  <Text style={styles.detailValue}>
                    {selectedChannel.submitter_name} ({selectedChannel.submitter_email})
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>제출일</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedChannel.submitted_at).toLocaleString()}
                  </Text>
                </View>

                {(selectedChannel.subscriber_count || selectedChannel.average_views) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>통계</Text>
                    {selectedChannel.subscriber_count && (
                      <Text style={styles.statsDetailText}>
                        구독자: {selectedChannel.subscriber_count.toLocaleString()}명
                      </Text>
                    )}
                    {selectedChannel.average_views && (
                      <Text style={styles.statsDetailText}>
                        평균 조회수: {selectedChannel.average_views.toLocaleString()}회
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>상태</Text>
                  <View style={[
                    styles.statusBadgeLarge,
                    { backgroundColor: getStatusColor(selectedChannel.status).backgroundColor }
                  ]}>
                    <Text style={[
                      styles.statusTextLarge,
                      { color: getStatusColor(selectedChannel.status).color }
                    ]}>
                      {getStatusText(selectedChannel.status)}
                    </Text>
                  </View>
                </View>

                {selectedChannel.rejection_reason && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>거부 사유</Text>
                    <Text style={styles.rejectionReason}>{selectedChannel.rejection_reason}</Text>
                  </View>
                )}

                {selectedChannel.reviewed_at && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>검토일</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedChannel.reviewed_at).toLocaleString()}
                    </Text>
                  </View>
                )}

                {selectedChannel.status === 'PENDING' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalApproveButton}
                      onPress={() => showApprovalDialog(selectedChannel, 'approve')}
                    >
                      <Text style={styles.modalButtonIcon}>✓</Text>
                      <Text style={styles.modalActionText}>승인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalRejectButton}
                      onPress={() => showApprovalDialog(selectedChannel, 'reject')}
                    >
                      <Text style={styles.modalButtonIcon}>✗</Text>
                      <Text style={styles.modalActionText}>거부</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  headerInfo: {
    alignItems: 'flex-end',
  },
  totalCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  channelList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  platformIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  channelDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  channelMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  submitterText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    padding: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: 16,
    color: '#374151',
    marginHorizontal: 20,
    fontWeight: '500',
  },
  pageButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  spacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailContainer: {
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  statsDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
  rejectionReason: {
    fontSize: 14,
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    marginBottom: 32,
  },
  modalApproveButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalRejectButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ChannelApprovalPage; 