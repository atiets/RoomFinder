// src/components/User/forum/CreateThread/CreateThreadDialog.jsx
import React, { useState, useEffect } from 'react';
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

      // Tạo FormData nếu có image
      let threadData;
      if (image) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', image);
        threadData = formData;
      } else {
        threadData = { title, content };
      }

      // Gọi API để tạo thread
      const response = await createThread(threadData);
      
      // Đóng dialog và thông báo thành công
      onSuccess && onSuccess(response.data);
      resetForm();
      onClose();
    } catch (err) {
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
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
                marginBottom: '10px'
              }}
            />
          </FormControl>

          {/* Thread Editor Component */}
          <ThreadEditor 
            setContent={setContent}
            setQuillInstance={setQuillInstance}
            error={error}
          />
          
          {/* Image Uploader Component */}
          <ImageUploader
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setImage={setImage}
            showSnackbar={showSnackbar}
          />
        </Box>
        
        {/* Thread Captcha Component */}
        <ThreadCaptcha 
          isCaptchaVerified={isCaptchaVerified}
          setIsCaptchaVerified={setIsCaptchaVerified}
          showSnackbar={showSnackbar}
        />
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          onClick={handleSubmit}
          sx={{ 
            mt: 2,
            borderRadius: '20px',
            bgcolor: '#2E7D32',
            '&:hover': {
              bgcolor: '#1B5E20',
            }
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Tạo bài viết mới'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
