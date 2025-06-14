import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  DialogContentText
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { api } from '../../utils/api';

const CorsManager = () => {
  const [origins, setOrigins] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState(null);
  const [formData, setFormData] = useState({
    originUrl: '',
    environment: 'development',
    isActive: true,
    description: '',
    createdBy: null,
    updatedBy: null
  });

  const fetchOrigins = async () => {
    try {
      const response = await api.get('/api/origins');
      setOrigins(response.data);
    } catch (error) {
      console.error('Origin 목록 조회 실패:', error);
      alert('Origin 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const handleOpen = (origin = null) => {
    if (origin) {
      setEditingOrigin(origin);
      setFormData(origin);
    } else {
      setEditingOrigin(null);
      setFormData({
        originUrl: '',
        environment: 'development',
        isActive: true,
        description: '',
        createdBy: null,
        updatedBy: null
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrigin(null);
    setFormData({
      originUrl: '',
      environment: 'development',
      isActive: true,
      description: '',
      createdBy: null,
      updatedBy: null
    });
  };

  const handleDelete = async (id) => {
    setEditingOrigin(origins.find(origin => origin.id === id));
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/origins/${editingOrigin.id}/delete`);
      fetchOrigins();
      setDeleteDialogOpen(false);
      alert('Origin이 삭제되었습니다.');
    } catch (error) {
      console.error('Origin 삭제 실패:', error);
      alert('Origin 삭제에 실패했습니다.');
    }
  };

  const handleActivate = async (id) => {
    setEditingOrigin(origins.find(origin => origin.id === id));
    setActivateDialogOpen(true);
  };

  const confirmActivate = async () => {
    try {
      await api.put(`/api/origins/${editingOrigin.id}`, {
        ...editingOrigin,
        isActive: true
      });
      fetchOrigins();
      setActivateDialogOpen(false);
      alert('Origin이 활성화되었습니다.');
    } catch (error) {
      console.error('Origin 활성화 실패:', error);
      alert('Origin 활성화에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        originUrl: formData.originUrl,
        environment: formData.environment,
        isActive: formData.isActive === 1 || formData.isActive === true,
        description: formData.description
      };

      console.log('Submitting data:', submitData);

      if (editingOrigin) {
        await api.put(`/api/origins/${editingOrigin.id}`, submitData);
      } else {
        await api.post('/api/origins', submitData);
      }
      fetchOrigins();
      handleClose();
      alert(editingOrigin ? 'Origin이 수정되었습니다.' : '새로운 Origin이 추가되었습니다.');
    } catch (error) {
      console.error('Origin 저장 실패:', error);
      console.error('Error response:', error.response?.data);
      alert('Origin 저장에 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('이 Origin을 비활성화하시겠습니까?')) {
      try {
        await api.delete(`/api/origins/${id}`);
        fetchOrigins();
        alert('Origin이 비활성화되었습니다.');
      } catch (error) {
        console.error('Origin 비활성화 실패:', error);
        alert('Origin 비활성화에 실패했습니다.');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">CORS Origin 관리</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          새로운 Origin 추가
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Origin URL</TableCell>
              <TableCell>환경</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell>수정일</TableCell>
              <TableCell>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {origins.map((origin) => (
              <TableRow key={origin.id}>
                <TableCell>{origin.originUrl}</TableCell>
                <TableCell>{origin.environment}</TableCell>
                <TableCell>{origin.isActive ? '활성' : '비활성'}</TableCell>
                <TableCell>{origin.description}</TableCell>
                <TableCell>{new Date(origin.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(origin.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(origin)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(origin.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  {origin.isActive ? (
                    <IconButton
                      size="small"
                      onClick={() => handleDeactivate(origin.id)}
                      color="warning"
                    >
                      <BlockIcon />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleActivate(origin.id)}
                      color="success"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingOrigin ? 'Origin 설정 변경' : '새로운 Origin 추가'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Origin URL"
              value={formData.originUrl}
              onChange={(e) => setFormData({ ...formData, originUrl: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="환경"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="development">개발</MenuItem>
              <MenuItem value="staging">스테이징</MenuItem>
              <MenuItem value="production">운영</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="상태"
              value={formData.isActive ? 1 : 0}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 1 })}
              margin="normal"
              required
            >
              <MenuItem value={1}>활성</MenuItem>
              <MenuItem value={0}>비활성</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingOrigin ? '변경' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Origin 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 이 Origin을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={activateDialogOpen} onClose={() => setActivateDialogOpen(false)}>
        <DialogTitle>Origin 활성화</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 Origin을 활성화하시겠습니까? 활성화된 Origin은 CORS 설정에 포함됩니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivateDialogOpen(false)}>취소</Button>
          <Button onClick={confirmActivate} color="success" autoFocus>
            활성화
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CorsManager; 