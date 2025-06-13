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
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface ServerConfig {
  id: number;
  keyName: string;
  value: string;
  environment: 'development' | 'staging' | 'production';
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  keyName: string;
  value: string;
  environment: 'development' | 'staging' | 'production';
  description: string;
  isActive: boolean;
}

interface ServerConfigsResponse {
  configs: ServerConfig[];
}

const ServerConfigManager: React.FC = () => {
  const navigation = useNavigation();
  const [configs, setConfigs] = useState<ServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string }>({ type: 'success', text: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ServerConfig | null>(null);
  const [formData, setFormData] = useState<FormData>({
    keyName: '',
    value: '',
    environment: 'development',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/server-configs');
      const data: ServerConfigsResponse = response.data;
      setConfigs(Array.isArray(data.configs) ? data.configs : []);
    } catch (error: any) {
      setMessage({ type: 'error', text: '서버 설정을 불러오는데 실패했습니다.' });
      setConfigs([]);
      Alert.alert('오류', '서버 설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: ServerConfig) => {
    setSelectedConfig(config);
    setFormData({
      keyName: config.keyName,
      value: config.value,
      environment: config.environment,
      description: config.description,
      isActive: config.isActive
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (config: ServerConfig) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConfig) return;

    try {
      await api.delete(`/api/admin/server-configs/${selectedConfig.id}`);
      setMessage({ type: 'success', text: '서버 설정이 삭제되었습니다.' });
      setDeleteDialogOpen(false);
      fetchConfigs();
      Alert.alert('성공', '서버 설정이 삭제되었습니다.');
    } catch (error: any) {
      setMessage({ type: 'error', text: '서버 설정 삭제에 실패했습니다.' });
      Alert.alert('오류', '서버 설정 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.keyName.trim()) {
      Alert.alert('알림', '설정 이름을 입력해주세요.');
      return;
    }

    if (!formData.value.trim()) {
      Alert.alert('알림', '값을 입력해주세요.');
      return;
    }

    try {
      if (selectedConfig) {
        await api.put(`/api/admin/server-configs/${selectedConfig.id}`, formData);
        setMessage({ type: 'success', text: '서버 설정이 업데이트되었습니다.' });
        Alert.alert('성공', '서버 설정이 업데이트되었습니다.');
      } else {
        await api.post('/api/admin/server-configs', formData);
        setMessage({ type: 'success', text: '새로운 서버 설정이 추가되었습니다.' });
        Alert.alert('성공', '새로운 서버 설정이 추가되었습니다.');
      }
      setEditDialogOpen(false);
      fetchConfigs();
    } catch (error: any) {
      setMessage({ type: 'error', text: '서버 설정 저장에 실패했습니다.' });
      Alert.alert('오류', '서버 설정 저장에 실패했습니다.');
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEnvironmentText = (env: string) => {
    switch (env) {
      case 'development': return '개발';
      case 'staging': return '스테이징';
      case 'production': return '운영';
      default: return env;
    }
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
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서버 설정 관리</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setSelectedConfig(null);
            setFormData({
              keyName: '',
              value: '',
              environment: 'development',
              description: '',
              isActive: true
            });
            setEditDialogOpen(true);
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 목록 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.configList}>
          {configs.map((config) => (
            <View key={config.id} style={styles.configCard}>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>{config.keyName}</Text>
                <Text style={styles.configEnv}>환경: {getEnvironmentText(config.environment)}</Text>
                <Text style={styles.configDescription}>{config.description}</Text>
                <Text style={styles.configValue}>{config.value}</Text>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>상태</Text>
                  <View style={styles.switchWrapper}>
                    <Switch
                      value={config.isActive}
                      onValueChange={() => {
                        // 여기서는 직접 변경하지 않고, 편집 모달을 통해서만 변경하도록 함
                        handleEdit(config);
                      }}
                      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                      thumbColor={config.isActive ? "#FFFFFF" : "#9CA3AF"}
                    />
                    <Text style={styles.switchText}>
                      {config.isActive ? "활성" : "비활성"}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.configActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(config)}
                >
                  <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(config)}
                >
                  <Text style={styles.actionButtonText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {configs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 서버 설정이 없습니다</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 편집 모달 */}
      <Modal
        visible={editDialogOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditDialogOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditDialogOpen(false)}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedConfig ? '서버 설정 수정' : '새로운 서버 설정 추가'}
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.saveButton}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>설정 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.keyName}
                  onChangeText={(value) => handleChange('keyName', value)}
                  placeholder="설정 이름을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>환경</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: 'development', label: '개발' },
                    { value: 'staging', label: '스테이징' },
                    { value: 'production', label: '운영' }
                  ].map((env) => (
                    <TouchableOpacity
                      key={env.value}
                      style={[
                        styles.pickerItem,
                        formData.environment === env.value && styles.pickerItemSelected
                      ]}
                      onPress={() => handleChange('environment', env.value as any)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        formData.environment === env.value && styles.pickerItemTextSelected
                      ]}>
                        {env.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>값</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.value}
                  onChangeText={(value) => handleChange('value', value)}
                  placeholder="설정 값을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>설명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="설정에 대한 설명을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.switchFormContainer}>
                <Text style={styles.inputLabel}>활성화</Text>
                <View style={styles.switchFormWrapper}>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => handleChange('isActive', value)}
                    trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                    thumbColor={formData.isActive ? "#FFFFFF" : "#9CA3AF"}
                  />
                  <Text style={styles.switchFormText}>
                    {formData.isActive ? "활성" : "비활성"}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={deleteDialogOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteDialogOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>서버 설정 삭제</Text>
            <Text style={styles.dialogMessage}>
              정말로 `{selectedConfig?.keyName}` 설정을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelButton}
                onPress={() => setDeleteDialogOpen(false)}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogDeleteButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.dialogDeleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  configList: {
    paddingTop: 16,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  configInfo: {
    flex: 1,
    marginRight: 12,
  },
  configName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  configEnv: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  configValue: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
  },
  configActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 20,
    color: '#3B82F6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  bottomSpacing: {
    height: 32,
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
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EBF8FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  switchFormContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchFormWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchFormText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dialogCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  dialogDeleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dialogDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ServerConfigManager; 