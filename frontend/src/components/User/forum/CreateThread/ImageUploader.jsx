// src/components/User/forum/CreateThread/ImageUploader.jsx
import React, { useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  FormLabel 
} from '@mui/material';

const ImageUploader = ({ imagePreview, setImagePreview, setImage, showSnackbar }) => {
  const fileInputRef = useRef(null);
  
  // Xử lý khi chọn file ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar && showSnackbar('Kích thước file không được vượt quá 5MB', 'error');
      return;
    }

    // Kiểm tra định dạng file
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      showSnackbar && showSnackbar('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF)', 'error');
      return;
    }

    setImage(file);
    
    // Tạo preview cho hình ảnh
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý kéo thả file
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  // Khi người dùng click vào vùng chọn ảnh
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <FormControl fullWidth>
      <FormLabel 
        htmlFor="thread-image" 
        sx={{ mb: 1, fontWeight: 500 }}
      >
        Hình ảnh
      </FormLabel>
      <Box 
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={imagePreview ? undefined : handleImageClick}
      >
        {imagePreview ? (
          <>
            <Box 
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}
            >
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
              />
            </Box>
            
            <Box 
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Button 
                variant="soft" 
                color="primary" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick();
                }}
              >
                Đổi ảnh
              </Button>
              <Button 
                variant="soft" 
                color="error" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                Huỷ
              </Button>
            </Box>
          </>
        ) : (
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <Box sx={{ width: 80, height: 80, mb: 2 }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 512 512"
                style={{ width: '100%', height: '100%' }}
              >
                <g>
                  <path fill="#eaf2ff" d="M25.355 61.96h388.401c13.96 0 25.355 11.424 25.355 25.355v367.038c0 13.931-11.395 25.355-25.355 25.355H25.355C11.395 479.709 0 468.284 0 454.353V87.315C0 73.384 11.395 61.96 25.355 61.96z" />
                  <path fill="#3fa9f5" d="M42.725 175.388h353.661v261.596H42.725z" />
                  <path fill="#76c64f" d="m196.168 436.984 106.783-112.088 93.435 112.088z" />
                  <path fill="#5fa040" d="m196.168 436.984 78.455-82.361 68.634 82.361z" />
                  <path fill="#a8df59" d="m42.725 436.984 150.412-157.873 131.584 157.873z" />
                  <path fill="#fdc92f" d="M120.073 274.157c15.038 0 27.308-12.27 27.308-27.308s-12.27-27.308-27.308-27.308-27.308 12.27-27.308 27.308 12.27 27.308 27.308 27.308z" />
                </g>
              </svg>
            </Box>
            <Typography 
              variant="subtitle1" 
              fontWeight="medium"
              sx={{ mb: 1 }}
            >
              Chọn ảnh từ thiết bị của bạn
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              align="center"
            >
              Tệp tối đa 5MB - Kéo thả ảnh vào đây hoặc nhấn để chọn ảnh
            </Typography>
          </Box>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg, image/png, image/gif"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </Box>
    </FormControl>
  );
};

export default ImageUploader;
