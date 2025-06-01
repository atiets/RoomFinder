// src/components/User/forum/ThreadEditDialog.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  FormControl,
  FormLabel,
  Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Swal from 'sweetalert2';
import { updateThread } from '../../../redux/threadApi';
import ThreadEditor from './CreateThread/ThreadEditor';

const ThreadEditDialog = ({ open, onClose, thread, onThreadUpdated }) => {
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [quillInstance, setQuillInstance] = useState(null);
  const [error, setError] = useState(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && thread) {
      setEditTitle(thread.title || '');
      setEditContent(thread.content || '');
      setError(null);
      
      // Set content to Quill editor after a short delay to ensure Quill is initialized
      setTimeout(() => {
        if (quillInstance && thread.content) {
          quillInstance.root.innerHTML = thread.content;
        }
      }, 100);
    }
  }, [open, thread, quillInstance]);

  // Handle Quill content change
  const handleContentChange = (content) => {
    setEditContent(content);
  };

  const handleCancel = () => {
    onClose();
    setEditTitle(thread?.title || '');
    setEditContent(thread?.content || '');
    setError(null);
    
    // Reset Quill content
    if (quillInstance && thread) {
      quillInstance.root.innerHTML = thread.content || '';
    }
  };

  const validateContent = (content) => {
    // Remove HTML tags and check if there's actual text content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 0 && content !== '<p><br></p>';
  };

  const handleSave = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();
    
    if (!trimmedTitle) {
      setError('Tiêu đề không được để trống');
      Swal.fire({
        title: "Lỗi",
        text: "Tiêu đề không được để trống",
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      return;
    }

    if (!validateContent(trimmedContent)) {
      setError('Nội dung không được để trống');
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng nhập nội dung bài viết",
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      return;
    }

    if (trimmedTitle === thread.title && trimmedContent === thread.content) {
      onClose();
      return;
    }

    if (trimmedTitle.length > 200) {
      setError('Tiêu đề không được vượt quá 200 ký tự');
      Swal.fire({
        title: "Lỗi",
        text: "Tiêu đề không được vượt quá 200 ký tự",
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      
      const response = await updateThread(
        thread.id || thread._id,
        { 
          title: trimmedTitle,
          content: trimmedContent,
          tags: thread.tags
        },
        currentUser.accessToken
      );

      if (response.success) {
        onClose();
        
        // Callback to parent để update thread với đầy đủ data
        const updatedThreadData = {
          ...thread,
          title: trimmedTitle,
          content: trimmedContent,
          updated_at: new Date().toISOString(),
          ...response.data
        };
        
        onThreadUpdated && onThreadUpdated(thread.id || thread._id, updatedThreadData);
        
        Swal.fire({
          title: "Thành công",
          text: "Đã cập nhật bài viết!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'custom-swal-popup'
          }
        });
      }
    } catch (error) {
      console.error('Update thread error:', error);
      setError(error.message);
      Swal.fire({
        title: "Lỗi",
        text: error.message,
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold',
        bgcolor: '#C1E1C1',
        color: '#2E7D32',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        📝 Sửa bài viết
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={handleCancel}
          disabled={updating}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Error message */}
        {error && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: '#ffebee', 
            borderRadius: 1,
            border: '1px solid #ffcdd2'
          }}>
            <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>
              ⚠️ {error}
            </Typography>
          </Box>
        )}

        {/* Title field */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel 
            htmlFor="edit-title" 
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Tiêu đề
          </FormLabel>
          <TextField
            id="edit-title"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={updating}
            variant="outlined"
            placeholder="Nhập tiêu đề bài viết"
            inputProps={{ maxLength: 200 }}
            helperText={`${editTitle.length}/200 ký tự`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
        </FormControl>

        {/* Content editor with Quill */}
        <ThreadEditor 
          setContent={handleContentChange}
          setQuillInstance={setQuillInstance}
          error={error}
          disabled={updating}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleCancel}
          disabled={updating}
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{ borderRadius: '20px' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          disabled={updating || !editTitle.trim() || !validateContent(editContent)}
          variant="contained"
          startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
          sx={{ 
            bgcolor: '#2E7D32',
            borderRadius: '20px',
            '&:hover': { bgcolor: '#1B5E20' }
          }}
        >
          {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThreadEditDialog;