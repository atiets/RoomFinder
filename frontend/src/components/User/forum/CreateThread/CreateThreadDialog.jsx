// src/components/User/forum/CreateThread/CreateThreadDialog.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Để lấy token từ Redux state
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  FormControl,
  FormLabel,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createThread } from '../../../../redux/threadApi';

// Import các component con
import ThreadEditor from './ThreadEditor';
import ImageUploader from './ImageUploader';
import ThreadCaptcha from './ThreadCaptcha';

const CreateThreadDialog = ({ open, onClose, onSuccess, showSnackbar }) => {
  // States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [error, setError] = useState(null);
  const [quillInstance, setQuillInstance] = useState(null);
  
  // Lấy token từ Redux state (điều chỉnh path theo cấu trúc state của bạn)
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;
  
  // Reset form khi đóng dialog
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Reset form và các state
  const resetForm = () => {
    setTitle('');
    setContent('');
    setImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setError(null);
    setIsCaptchaVerified(false);
    
    // Reset Quill content
    if (quillInstance) {
      quillInstance.setText('');
    }
  };

  // Xử lý gửi form
  const handleSubmit = async () => {
    // Kiểm tra đăng nhập
    if (!accessToken) {
      setError('Bạn cần đăng nhập để tạo bài viết');
      showSnackbar && showSnackbar('Bạn cần đăng nhập để tạo bài viết', 'error');
      return;
    }

    // Kiểm tra nội dung (bắt buộc)
    if (!content.trim() || content === '<p><br></p>') {
      setError('Vui lòng nhập nội dung bài viết');
      showSnackbar && showSnackbar('Vui lòng nhập nội dung bài viết', 'error');
      return;
    }

    // Bỏ qua việc kiểm tra captcha trong demo
    // if (!isCaptchaVerified) {
    //   setError('Vui lòng xác nhận captcha');
    //   showSnackbar && showSnackbar('Vui lòng xác nhận captcha', 'error');
    //   return;
    // }

    try {
      setIsSubmitting(true);
      setError(null);

      // Chuẩn bị dữ liệu gửi lên server
      const threadData = {
        title: title.trim() || '', // Title có thể rỗng
        content: content.trim(),
        tags: [] // Có thể thêm logic xử lý tags sau
      };

      // Gọi API để tạo thread
      const response = await createThread(threadData, accessToken);
      
      // Kiểm tra response
      if (response.success) {
        // Đóng dialog và thông báo thành công
        onSuccess && onSuccess(response.data);
        showSnackbar && showSnackbar('Bài viết đã được tạo thành công!', 'success');
        resetForm();
        onClose();
      } else {
        throw new Error(response.message || 'Tạo bài viết thất bại');
      }
    } catch (err) {
      console.error('Create thread error:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo bài viết');
      showSnackbar && showSnackbar(err.message || 'Đã xảy ra lỗi khi tạo bài viết', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? onClose : undefined}
      maxWidth="md"
      fullWidth
      aria-labelledby="create-thread-dialog"
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#C1E1C1',
          color: '#2E7D32',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        Tạo bài viết
        {!isSubmitting && (
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose} 
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        {/* Hiển thị thông báo cần đăng nhập nếu chưa có token */}
        {!accessToken && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
            <Typography color="warning.main" variant="body2">
              Bạn cần đăng nhập để tạo bài viết mới.
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel 
              htmlFor="thread-title" 
              sx={{ mb: 1, fontWeight: 500 }}
            >
              Tiêu đề (không bắt buộc)
            </FormLabel>
            <input
              type="text"
              placeholder="Tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!accessToken || isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
                marginBottom: '10px',
                opacity: (!accessToken || isSubmitting) ? 0.6 : 1
              }}
            />
          </FormControl>

          {/* Thread Editor Component */}
          <ThreadEditor 
            setContent={setContent}
            setQuillInstance={setQuillInstance}
            error={error}
            disabled={!accessToken || isSubmitting}
          />
          
          {/* Image Uploader Component - Tạm thời disable */}
          <ImageUploader
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setImage={setImage}
            showSnackbar={showSnackbar}
            disabled={true} // Disable upload ảnh như yêu cầu
          />
        </Box>
        
        {/* Thread Captcha Component */}
        <ThreadCaptcha 
          isCaptchaVerified={isCaptchaVerified}
          setIsCaptchaVerified={setIsCaptchaVerified}
          showSnackbar={showSnackbar}
          disabled={!accessToken || isSubmitting}
        />
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={!accessToken || isSubmitting || !content.trim()}
          onClick={handleSubmit}
          sx={{ 
            mt: 2,
            borderRadius: '20px',
            bgcolor: '#2E7D32',
            '&:hover': {
              bgcolor: '#1B5E20',
            },
            '&:disabled': {
              bgcolor: '#cccccc',
              color: '#666666'
            }
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Đang tạo bài viết...
            </>
          ) : (
            'Tạo bài viết mới'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;