import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const SocialConfigManager = () => {
  const [configs, setConfigs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
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
      const response = await api.get('/api/admin/social-configs');
      setConfigs(response.data.configs || []);
    } catch (error) {
      setMessage({ type: 'error', text: '설정을 불러오는데 실패했습니다.' });
      setConfigs([]);
    }
  };

  const handleEdit = (config) => {
    console.log('Editing config:', config);
    if (!config || !config.provider) {
      setMessage({ type: 'error', text: '유효하지 않은 설정입니다.' });
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

  const handleDelete = (config) => {
    console.log('Deleting config:', config);
    if (!config || !config.provider) {
      setMessage({ type: 'error', text: '유효하지 않은 설정입니다.' });
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
      } else {
        await api.post(
          '/api/admin/social-configs',
          submitData
        );
        setMessage({ type: 'success', text: '설정이 추가되었습니다.' });
      }
      setEditDialogOpen(false);
      fetchConfigs();
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || '설정 저장에 실패했습니다.' 
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Selected config for deletion:', selectedConfig);
      const response = await api.delete(
        `/api/admin/social-configs/${selectedConfig.provider}`
      );
      
      if (response.data) {
        setMessage({ type: 'success', text: '설정이 삭제되었습니다.' });
        setDeleteDialogOpen(false);
        fetchConfigs();
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || '설정 삭제에 실패했습니다.' 
      });
    }
  };

  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
    
    // provider 필드인 경우 소문자로 변환
    if (field === 'provider') {
      value = value.toLowerCase();
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">소셜 로그인 설정 관리</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
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
          새 설정 추가
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {configs.map((config) => (
          <Grid item xs={12} md={6} key={config.provider}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {config.provider.toUpperCase()}
                  </Typography>
                  <Box>
                    <IconButton onClick={() => handleEdit(config)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(config)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary">
                  Client ID: {config.clientId}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Redirect URI: {config.redirectUri}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  환경: {config.environment}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.isActive}
                      disabled
                    />
                  }
                  label="활성화"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 수정/추가 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedConfig ? '소셜 로그인 설정 수정' : '새 소셜 로그인 설정 추가'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="제공자"
            value={formData.provider}
            onChange={(e) => handleChange('provider', e.target.value)}
            margin="normal"
            disabled={!!selectedConfig}
            helperText="영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다."
            error={formData.provider && !/^[a-z0-9-]+$/.test(formData.provider)}
          />
          <TextField
            fullWidth
            label="Client ID"
            value={formData.clientId}
            onChange={(e) => handleChange('clientId', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Client Secret"
            value={formData.clientSecret}
            onChange={(e) => handleChange('clientSecret', e.target.value)}
            margin="normal"
            type="password"
          />
          <TextField
            fullWidth
            label="Redirect URI"
            value={formData.redirectUri}
            onChange={(e) => handleChange('redirectUri', e.target.value)}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
            }
            label="활성화"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>설정 삭제 확인</DialogTitle>
        <DialogContent>
          {selectedConfig?.provider ? (
            <Typography>
              정말로 {selectedConfig.provider.toUpperCase()} 설정을 삭제하시겠습니까?
            </Typography>
          ) : (
            <Typography color="error">
              유효하지 않은 설정입니다.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={!selectedConfig?.provider}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialConfigManager; 