// src/components/forum/ForumHeader.jsx
import React from 'react';
import { 
  Box, Typography, Button, Paper, useMediaQuery 
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '20px',
  padding: '8px 24px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ForumHeader = ({ onCreateThread }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';
  
  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${pastelGreen} 0%, ${pastelOrange} 100%)`,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          fontWeight="bold"
          sx={{ color: '#2E7D32' }} // Xanh lá đậm
        >
          Diễn Đàn Phòng Trọ
        </Typography>
        
        <StyledButton 
          startIcon={<AddIcon />}
          onClick={onCreateThread}
          size={isMobile ? "small" : "medium"}
        >
          Tạo bài viết
        </StyledButton>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Nơi chia sẻ, trao đổi thông tin về nhà trọ, khu trọ, và các vấn đề liên quan
        </Typography>
      </Box>
    </Paper>
  );
};

export default ForumHeader;