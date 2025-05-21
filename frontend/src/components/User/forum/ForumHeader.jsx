// src/components/forum/ForumHeader.jsx
import React from 'react';
import { 
  Box, Typography, Button, Paper, Avatar, Stack, Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';

// StyledButton được cập nhật theo CSS đã cung cấp
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#28a745',
  color: 'white',
  borderRadius: '8px',
  padding: '12px 24px',
  width: '100%',
  fontWeight: 600,
  fontSize: '14px',
  transition: 'background 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#218838',
  },
}));

const ForumHeader = ({ onCreateThread, user = { name: "Người dùng", avatar: "" } }) => {
  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  
  return (
    <Box 
      sx={{
        position: 'sticky',
        top: 20,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        // Đảm bảo header luôn ở trên cùng so với các phần tử khác
        zIndex: 10,
        // Thêm padding bottom để khi cuộn xuống dưới vẫn có không gian
        pb: 4,
      }}
    >
      {/* User Profile Card */}
      <Paper 
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={user.avatar} 
            alt={user.name}
            sx={{ width: 40, height: 40 }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="medium">
            {user.name}
          </Typography>
        </Stack>
      </Paper>
      
      {/* Create Post Button - Cập nhật theo CSS mới */}
      <StyledButton 
        startIcon={<EditIcon />}
        onClick={onCreateThread}
        variant="contained"
        disableElevation
      >
        Tạo bài viết
      </StyledButton>
      
      {/* Forum Info */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '8px',
          bgcolor: pastelGreen + '30', // Light opacity
          border: '1px solid',
          borderColor: pastelGreen,
        }}
      >
        <Typography 
          variant="h6" 
          component="h2" 
          fontWeight="bold"
          gutterBottom
          sx={{ color: '#2E7D32' }} // Xanh lá đậm
        >
          Diễn Đàn Phòng Trọ
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="body2" color="text.secondary">
          Nơi chia sẻ, trao đổi thông tin về nhà trọ, khu trọ, và các vấn đề liên quan
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForumHeader;