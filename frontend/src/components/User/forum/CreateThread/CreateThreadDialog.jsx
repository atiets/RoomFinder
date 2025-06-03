// src/components/User/forum/CreateThread/CreateThreadDialog.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { createThread } from '../../../../redux/threadApi';

// Import các component con
import ThreadEditor from './ThreadEditor';
import ImageUploader from './ImageUploader';
import TagInput from './TagInput'; // Import TagInput component mới

const CreateThreadDialog = ({ open, onClose, onSuccess, showSnackbar }) => {
  // States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]); // Thêm state cho tags
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [error, setError] = useState(null);
  const [quillInstance, setQuillInstance] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Lấy token từ Redux state
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  const accessToken = currentUser?.accessToken;
  
  // Reset form khi đóng dialog
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Countdown effect
  useEffect(() => {
    let timer;
    if (showSuccessMessage && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showSuccessMessage && countdown === 0) {
      handleSuccessClose();
    }
    
    return () => clearTimeout(timer);
  }, [showSuccessMessage, countdown]);

  // Validation để kiểm tra thông tin user
  const validateUserInfo = () => {
    if (!currentUser) {
      setError('Thông tin người dùng không hợp lệ');
      return false;
    }
    
    if (!currentUser.username) {
      setError('Username không tồn tại. Vui lòng cập nhật thông tin tài khoản.');
      return false;
    }
    
    return true;
  };

  // Reset form và các state
  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]); // Reset tags
    setImage(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setError(null);
    setIsCaptchaVerified(false);
    setShowSuccessMessage(false);
    setCountdown(0);
    
    // Reset Quill content
    if (quillInstance) {
      quillInstance.setText('');
    }
  };

  // Handle success close
  const handleSuccessClose = () => {
    onSuccess && onSuccess();
    resetForm();
    onClose();
  };

  // Xử lý gửi form
  const handleSubmit = async () => {
    // Kiểm tra đăng nhập
    if (!accessToken) {
      setError('Bạn cần đăng nhập để tạo bài viết');
      showSnackbar && showSnackbar('Bạn cần đăng nhập để tạo bài viết', 'error');
      return;
    }

    // Validate thông tin user
    if (!validateUserInfo()) {
      showSnackbar && showSnackbar('Thông tin người dùng không đầy đủ', 'error');
      return;
    }

    // Kiểm tra nội dung (bắt buộc)
    if (!content.trim() || content === '<p><br></p>') {
      setError('Vui lòng nhập nội dung bài viết');
      showSnackbar && showSnackbar('Vui lòng nhập nội dung bài viết', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Chuẩn bị dữ liệu gửi lên server
      const threadData = {
        title: title.trim() || '',
        content: content.trim(),
        tags: tags // Thêm tags vào data
      };

      // Debug log để kiểm tra thông tin user
      console.log('Sending thread data:', {
        ...threadData,
        userInfo: {
          username: currentUser.username,
          avatar: currentUser.profile?.picture || null,
          id: currentUser.id
        }
      });

      // Gọi API để tạo thread
      const response = await createThread(threadData, accessToken);
      
      // Kiểm tra response
      if (response.success) {
        // Hiển thị message thành công trong dialog với countdown 8 giây
        setShowSuccessMessage(true);
        setCountdown(8);
        
        console.log('Thread created successfully:', response.data);
        
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

  // Component hiển thị thông báo thành công với countdown
  const SuccessMessage = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      py: 4,
      textAlign: 'center'
    }}>
      <CheckCircleIcon 
        sx={{ 
          fontSize: 80, 
          color: '#4caf50', 
          mb: 2,
          animation: 'bounce 0.6s ease-in-out'
        }} 
      />
      <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 700 }}>
        🎉 Bài viết đã được gửi thành công!
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mt: 2, 
        mb: 3,
        p: 2,
        bgcolor: '#fff3e0',
        borderRadius: 2,
        border: '1px solid #ffcc02'
      }}>
        <HourglassEmptyIcon sx={{ fontSize: 24, color: '#ff9800', mr: 1 }} />
        <Typography variant="h6" sx={{ color: '#e65100', fontWeight: 600 }}>
          Đang chờ được duyệt
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.primary" sx={{ 
        maxWidth: 450, 
        mb: 3,
        lineHeight: 1.6,
        fontSize: '1.1rem'
      }}>
        Bài viết của bạn sẽ xuất hiện trong diễn đàn sau khi được quản trị viên phê duyệt. 
        <br />
        <strong>Thời gian duyệt thường từ 15-30 phút.</strong>
      </Typography>

      {/* Countdown và buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        {countdown > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 1.5,
            bgcolor: '#e3f2fd',
            borderRadius: 2,
            border: '1px solid #2196f3'
          }}>
            <CircularProgress 
              size={20} 
              sx={{ color: '#2196f3', mr: 1 }} 
            />
            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
              Tự động đóng sau {countdown} giây
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          onClick={handleSuccessClose}
          sx={{
            borderRadius: '25px',
            px: 4,
            py: 1.5,
            bgcolor: '#2E7D32',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#1B5E20',
            }
          }}
        >
          Đóng và quay về diễn đàn
        </Button>
      </Box>
    </Box>
  );

  // Kiểm tra xem có thể submit không
  const canSubmit = () => {
    return (
      accessToken && 
      !isSubmitting && 
      content.trim() && 
      content !== '<p><br></p>' &&
      validateUserInfo()
    );
  };

  return (
    <Dialog
      open={open}
      onClose={(!isSubmitting && !showSuccessMessage) ? onClose : undefined}
      maxWidth="md"
      fullWidth
      aria-labelledby="create-thread-dialog"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: showSuccessMessage ? '#e8f5e8' : '#C1E1C1',
          color: '#2E7D32',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}
      >
        {showSuccessMessage ? '✅ Thành công!' : '📝 Tạo bài viết mới'}
        {(!isSubmitting && !showSuccessMessage) && (
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
      
      <DialogContent sx={{ p: showSuccessMessage ? 2 : 3 }}>
        {showSuccessMessage ? (
          <SuccessMessage />
        ) : (
          <>
            {/* Hiển thị thông báo lỗi nếu có */}
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

            {/* Hiển thị thông báo cần đăng nhập nếu chưa có token */}
            {!accessToken && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: '#fff3e0', 
                borderRadius: 1,
                border: '1px solid #ffcc02'
              }}>
                <Typography color="warning.main" variant="body2" sx={{ fontWeight: 500 }}>
                  🔐 Bạn cần đăng nhập để tạo bài viết mới.
                </Typography>
              </Box>
            )}

            {/* Hiển thị warning nếu thiếu username */}
            {accessToken && currentUser && !currentUser.username && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: '#fff3e0', 
                borderRadius: 1,
                border: '1px solid #ffcc02'
              }}>
                <Typography color="warning.main" variant="body2" sx={{ fontWeight: 500 }}>
                  👤 Username không tồn tại. Vui lòng cập nhật thông tin tài khoản trước khi tạo bài viết.
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
                  id="thread-title"
                  type="text"
                  placeholder="Tiêu đề bài viết"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!accessToken || isSubmitting || !validateUserInfo()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '16px',
                    marginBottom: '10px',
                    opacity: (!accessToken || isSubmitting || !validateUserInfo()) ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </FormControl>

              {/* Thread Editor Component */}
              <ThreadEditor 
                setContent={setContent}
                setQuillInstance={setQuillInstance}
                error={error}
                disabled={!accessToken || isSubmitting || !validateUserInfo()}
              />

              {/* Tags Input Component - Thêm component mới */}
              <TagInput
                tags={tags}
                setTags={setTags}
                disabled={!accessToken || isSubmitting || !validateUserInfo()}
                error={null}
              />
              
              {/* Image Uploader Component - Tạm thời disable */}
              <ImageUploader
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setImage={setImage}
                showSnackbar={showSnackbar}
                disabled={true}
              />
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!canSubmit()}
              onClick={handleSubmit}
              sx={{ 
                mt: 2,
                borderRadius: '20px',
                bgcolor: '#2E7D32',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
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
                  Đang gửi bài viết...
                </>
              ) : (
                'Gửi bài viết'
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;