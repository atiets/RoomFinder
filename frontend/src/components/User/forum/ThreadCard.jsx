// src/components/User/forum/ThreadCard.jsx
import React from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, 
  Avatar, Typography, Box, IconButton, CardMedia,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
}));

const ThreadCard = ({ thread, onClick }) => {
  const { 
    title, 
    content, 
    author, 
    createdAt, 
    tags = [], 
    likes = 0, 
    comments = 0, 
    image = null, 
  } = thread;

  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';
  
  // Hàm để chuyển đổi HTML content thành plain text với formatting
  const formatContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Strip HTML tags và format lại
    return htmlContent
      .replace(/<\/p><p>/g, '\n\n')  // Thay </p><p> thành 2 xuống dòng
      .replace(/<p>/g, '')           // Xóa <p> đầu
      .replace(/<\/p>/g, '')         // Xóa </p> cuối
      .replace(/<br\s*\/?>/gi, '\n') // Thay <br> thành xuống dòng
      .replace(/<strong>(.*?)<\/strong>/g, '$1') // Xóa strong tags nhưng giữ nội dung
      .replace(/<em>(.*?)<\/em>/g, '$1')         // Xóa em tags nhưng giữ nội dung
      .replace(/<u>(.*?)<\/u>/g, '$1')           // Xóa u tags nhưng giữ nội dung
      .replace(/<[^>]*>/g, '')       // Xóa tất cả HTML tags còn lại
      .replace(/&nbsp;/g, ' ')       // Thay &nbsp; thành space
      .replace(/&amp;/g, '&')        // Thay &amp; thành &
      .replace(/&lt;/g, '<')         // Thay &lt; thành <
      .replace(/&gt;/g, '>')         // Thay &gt; thành >
      .trim();                       // Xóa space thừa đầu cuối
  };
  
  // Tính thời gian tương đối
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  };
  
  return (
    <StyledCard>
      {/* Header với avatar, tên tác giả, thời gian và menu */}
      <CardHeader
        avatar={
          <Avatar 
            alt={author?.name || 'User'} 
            src={author?.avatar || ''}
            sx={{ 
              width: 38, 
              height: 38,
              bgcolor: pastelGreen 
            }}
          >
            {author?.name ? author.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography variant="subtitle2" fontWeight="500">
            {author?.name || 'Người dùng'}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" fontSize="12px">
            {createdAt ? getRelativeTime(createdAt) : 'Vừa xong'}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      
      {/* Nội dung bài viết */}
      <CardContent sx={{ pt: 0, pb: 1.5 }} onClick={onClick}>
        {/* Tiêu đề bài viết */}
        {title && (
          <Typography 
            variant="h6" 
            component="h2" 
            fontWeight="bold" 
            color="text.primary"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>
        )}
        
        {/* Nội dung văn bản - Đã được format */}
        <Typography 
          variant="body1" 
          color="text.primary"
          sx={{ 
            mb: image ? 2 : 0,
            whiteSpace: 'pre-line', // Giữ nguyên line breaks
            display: '-webkit-box',
            WebkitLineClamp: 4, // Giới hạn hiển thị 4 dòng
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {formatContent(content)}
        </Typography>
        
        {/* Hình ảnh nếu có */}
        {image && (
          <CardMedia
            component="img"
            image={image}
            alt={title || "Thread image"}
            sx={{ 
              mt: 2, 
              borderRadius: '4px',
              maxHeight: '400px',
              objectFit: 'contain'
            }}
          />
        )}
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag, index) => (
              <Box 
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? pastelGreen : pastelOrange,
                  color: '#333',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {tag}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
      
      {/* Phần tương tác */}
      <Divider />
      <CardActions 
        sx={{ 
          px: 2, 
          py: 1,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            cursor: 'pointer',
            py: 0.5,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <ThumbUpOutlinedIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {likes > 0 ? `Thích (${likes})` : 'Thích'}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            cursor: 'pointer',
            py: 0.5,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
          onClick={onClick}
        >
          <ChatBubbleOutlineIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {comments > 0 ? `Bình luận (${comments})` : 'Bình luận'}
          </Typography>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default ThreadCard;