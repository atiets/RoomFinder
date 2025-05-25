// src/components/User/forum/ThreadCard.jsx
import React, { useState } from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, 
  Avatar, Typography, Box, IconButton, CardMedia,
  Divider, Button, Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
}));

// src/components/User/forum/ThreadCard.jsx
const ThreadCard = ({ thread, onCommentClick }) => {
  const { 
    title, 
    content, 
    username, // Thay đổi từ author thành username
    avatar,   // Thêm avatar từ thread
    created_at,
    createdAt, 
    tags = [], 
    likes = [], 
    comments = 0, 
    image = null,
    viewCount = 0
  } = thread;

  // State để quản lý việc mở rộng nội dung
  const [expanded, setExpanded] = useState(false);

  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';
  
  // Hàm để lấy display name
  const getDisplayName = () => {
    return username || 'Người dùng ẩn danh';
  };

  // Hàm để lấy avatar letter
  const getAvatarLetter = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Check if user is anonymous
  const isAnonymous = !username || username === 'anonymous_user';
  
  // Tính thời gian tương đối
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
      return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
    } catch (error) {
      return 'Vừa xong';
    }
  };

  // Rest of component functions...
  const formatContent = (htmlContent) => {
    if (!htmlContent) return '';
    
    return htmlContent
      .replace(/<\/p><p>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/g, '$1')
      .replace(/<em>(.*?)<\/em>/g, '$1')
      .replace(/<u>(.*?)<\/u>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  };

  const formattedContent = formatContent(content);
  const contentLines = formattedContent.split('\n').length;
  const contentLength = formattedContent.length;
  const shouldShowReadMore = contentLines > 4 || contentLength > 300;

  const truncatedContent = shouldShowReadMore && !expanded
    ? formattedContent.split('\n').slice(0, 3).join('\n') + 
      (formattedContent.length > 200 ? '...' : '')
    : formattedContent;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick(thread.id || thread._id);
    }
  };

  const likesCount = Array.isArray(likes) ? likes.length : 0;
  
  return (
    <StyledCard>
      {/* Header với avatar, username, thời gian và menu */}
      <CardHeader
        avatar={
          <Avatar 
            alt={getDisplayName()} 
            src={avatar || ''} // Sử dụng avatar trực tiếp từ thread
            sx={{ 
              width: 38, 
              height: 38,
              bgcolor: isAnonymous ? '#e0e0e0' : pastelGreen,
              color: isAnonymous ? '#757575' : 'inherit'
            }}
          >
            {getAvatarLetter()}
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Typography variant="subtitle2" fontWeight="500">
            {getDisplayName()}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" fontSize="12px">
            {getRelativeTime(created_at || createdAt)}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      
      {/* Nội dung bài viết - giữ nguyên */}
      <CardContent sx={{ pt: 0, pb: 1.5 }}>
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
        
        {/* Nội dung văn bản */}
        <Typography 
          variant="body1" 
          color="text.primary"
          sx={{ 
            mb: 1,
            whiteSpace: 'pre-line'
          }}
        >
          {truncatedContent}
        </Typography>

        {/* Nút xem thêm/thu gọn */}
        {shouldShowReadMore && (
          <Button
            onClick={handleExpandClick}
            size="small"
            sx={{
              p: 0,
              minWidth: 'auto',
              color: '#2E7D32',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline'
              }
            }}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        )}

        {/* Collapse content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 1 }}>
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
          </Box>
        </Collapse>
        
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
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Nút thích */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'rgba(46, 125, 50, 0.08)',
              }
            }}
          >
            <ThumbUpOutlinedIcon 
              fontSize="small" 
              sx={{ 
                mr: 0.5,
                color: 'action.active',
                '&:hover': {
                  color: '#2E7D32'
                }
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {likesCount > 0 ? likesCount : 'Thích'}
            </Typography>
          </Box>
          
          {/* Nút bình luận */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'rgba(46, 125, 50, 0.08)',
              }
            }}
            onClick={handleCommentClick}
          >
            <ChatBubbleOutlineIcon 
              fontSize="small" 
              sx={{ 
                mr: 0.5,
                color: 'action.active',
                '&:hover': {
                  color: '#2E7D32'
                }
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {comments > 0 ? `${comments} bình luận` : 'Bình luận'}
            </Typography>
          </Box>
        </Box>
        
        {/* Số lượt xem */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
          }}
        >
          <VisibilityIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {viewCount > 0 ? `${viewCount} lượt xem` : '0 lượt xem'}
          </Typography>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default ThreadCard;