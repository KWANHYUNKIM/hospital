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
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface SocialConfig {
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
}

interface SocialConfigsResponse {
  configs: SocialConfig[];
}

const SocialConfigManager: React.FC = () => {
  const navigation = useNavigation();
  const [configs, setConfigs] = useState<SocialConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string }>({ type: 'success', text: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SocialConfig | null>(null);
  const [formData, setFormData] = useState<FormData>({
    provider: '',
    clientId: '',
    clientSecret: '',
    redirectUri: '',
    environment: 'production',
    isActive: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/social-configs');
      const data: SocialConfigsResponse = response.data;
      setConfigs(data.configs || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: '설정을 불러오는데 실패했습니다.' });
      setConfigs([]);
      Alert.alert('오류', '설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: SocialConfig) => {
    console.log('Editing config:', config);
    if (!config || !config.provider) {
      setMessage({ type: 'error', text: '유효하지 않은 설정입니다.' });
      Alert.alert('오류', '유효하지 않은 설정입니다.');
      return;
    }
    setSelectedConfig(config);
    setFormData({
      provider: config.provider,
      clientId: config.clientId || '',
      clientSecret: config.clientSecret || '',
      redirectUri: config.redirectUri || '',
      environment: config.environment || 'production',
      isActive: config.isActive ?? true
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (config: SocialConfig) => {
    console.log('Deleting config:', config);
    if (!config || !config.provider) {
      setMessage({ type: 'error', text: '유효하지 않은 설정입니다.' });
      Alert.alert('오류', '유효하지 않은 설정입니다.');
      return;
    }
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting form data:', formData);
      
      // provider 값 검증
      if (!formData.provider) {
        throw new Error('제공자(provider)를 입력해주세요.');
      }

      // provider 값 형식 검증 (소문자, 숫자, 하이픈만 허용)
      if (!/^[a-z0-9-]+$/.test(formData.provider)) {
        throw new Error('제공자(provider)는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.');
      }

      const submitData = {
        provider: formData.provider.toLowerCase(), // 소문자로 변환
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        redirectUri: formData.redirectUri,
        environment: formData.environment,
        isActive: formData.isActive
      };

      if (selectedConfig) {
        await api.put(
          `/api/admin/social-configs/${selectedConfig.provider}`,
          submitData
        );
        setMessage({ type: 'success', text: '설정이 수정되었습니다.' });
        Alert.alert('성공', '설정이 수정되었습니다.');
      } else {
        await api.post(
          '/api/admin/social-configs',
          submitData
        );
        setMessage({ type: 'success', text: '설정이 추가되었습니다.' });
        Alert.alert('성공', '설정이 추가되었습니다.');
      }
      setEditDialogOpen(false);
      fetchConfigs();
    } catch (error: any) {
      console.error('Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || '설정 저장에 실패했습니다.' 
      });
      Alert.alert('오류', error.message || '설정 저장에 실패했습니다.');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Selected config for deletion:', selectedConfig);
      if (!selectedConfig?.provider) {
        throw new Error('유효하지 않은 설정입니다.');
      }

      const response = await api.delete(
        `/api/admin/social-configs/${selectedConfig.provider}`
      );
      
      if (response.data) {
        setMessage({ type: 'success', text: '설정이 삭제되었습니다.' });
        setDeleteDialogOpen(false);
        fetchConfigs();
        Alert.alert('성공', '설정이 삭제되었습니다.');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || '설정 삭제에 실패했습니다.' 
      });
      Alert.alert('오류', error.response?.data?.message || error.message || '설정 삭제에 실패했습니다.');
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    console.log(`Changing ${field} to:`, value);
    
    // provider 필드인 경우 소문자로 변환
    if (field === 'provider' && typeof value === 'string') {
      value = value.toLowerCase();
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const getEnvironmentText = (env: string) => {
    switch (env) {
      case 'development': return '개발';
      case 'staging': return '스테이징';
      case 'production': return '운영';
      default: return env;
    }
  };

  const renderConfigItem = ({ item }: { item: SocialConfig }) => (
    <View style={styles.configCard}>
      <View style={styles.configHeader}>
        <Text style={styles.configProvider}>{item.provider.toUpperCase()}</Text>
        <View style={styles.configActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionButtonText}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.configDetail}>Client ID: {item.clientId}</Text>
      <Text style={styles.configDetail}>Redirect URI: {item.redirectUri}</Text>
      <Text style={styles.configDetail}>환경: {getEnvironmentText(item.environment)}</Text>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>활성화</Text>
        <Switch
          value={item.isActive}
          disabled={true}
          trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
          thumbColor={item.isActive ? "#FFFFFF" : "#9CA3AF"}
        />
      </View>
    </View>
  );

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
          <Text style={styles.backButtonText}>👈</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>소셜 로그인 설정 관리</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setSelectedConfig(null);
            setFormData({
              provider: '',
              clientId: '',
              clientSecret: '',
              redirectUri: '',
              environment: 'production',
              isActive: true
            });
            setEditDialogOpen(true);
          }}
        >
          <Text style={styles.addButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 목록 */}
      <FlatList
        data={configs}
        renderItem={renderConfigItem}
        keyExtractor={(item) => item.provider}
        numColumns={2}
        columnWrapperStyle={styles.configRow}
        contentContainerStyle={styles.configList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 소셜 로그인 설정이 없습니다</Text>
          </View>
        }
      />

      {/* 수정/추가 모달 */}
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
              {selectedConfig ? '소셜 로그인 설정 수정' : '새 소셜 로그인 설정 추가'}
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.saveButton}>저장</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>제공자</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    formData.provider && !/^[a-z0-9-]+$/.test(formData.provider) && styles.textInputError
                  ]}
                  value={formData.provider}
                  onChangeText={(value) => handleChange('provider', value)}
                  placeholder="provider name (e.g., google, facebook)"
                  placeholderTextColor="#9CA3AF"
                  editable={!selectedConfig}
                  autoCapitalize="none"
                />
                <Text style={styles.helperText}>
                  영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Client ID</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.clientId}
                  onChangeText={(value) => handleChange('clientId', value)}
                  placeholder="Client ID를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Client Secret</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.clientSecret}
                  onChangeText={(value) => handleChange('clientSecret', value)}
                  placeholder="Client Secret을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Redirect URI</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.redirectUri}
                  onChangeText={(value) => handleChange('redirectUri', value)}
                  placeholder="Redirect URI를 입력하세요"
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
            <Text style={styles.dialogTitle}>설정 삭제 확인</Text>
            {selectedConfig?.provider ? (
              <Text style={styles.dialogMessage}>
                정말로 {selectedConfig.provider.toUpperCase()} 설정을 삭제하시겠습니까?
              </Text>
            ) : (
              <Text style={[styles.dialogMessage, styles.errorText]}>
                유효하지 않은 설정입니다.
              </Text>
            )}
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelButton}
                onPress={() => setDeleteDialogOpen(false)}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dialogDeleteButton,
                  !selectedConfig?.provider && styles.dialogDeleteButtonDisabled
                ]}
                onPress={handleConfirmDelete}
                disabled={!selectedConfig?.provider}
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
  },
  configList: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  configRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  configProvider: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  configActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    fontSize: 20,
    color: '#3B82F6',
  },
  configDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
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
    textAlign: 'center',
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
  textInputError: {
    borderColor: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  errorText: {
    color: '#EF4444',
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
  dialogDeleteButtonDisabled: {
    opacity: 0.5,
  },
  dialogDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SocialConfigManager; 