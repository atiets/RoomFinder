// src/components/User/forum/ThreadCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardContent, CardActions, 
  Avatar, Typography, Box, IconButton, CardMedia,
  Divider, Button, Collapse, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Swal from 'sweetalert2';
import { useThreadLike } from '../../../hooks/useThreadLike';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
}));

const ThreadCard = ({ thread, onCommentClick }) => {
  const navigate = useNavigate();
  
  const { 
    title, 
    content, 
    username,
    avatar,
    created_at,
    createdAt, 
    tags = [], 
    likesCount: initialLikesCount = 0,
    dislikesCount: initialDislikesCount = 0,
    comments = 0, 
    image = null,
    viewCount = 0
  } = thread;

  // State để quản lý việc mở rộng nội dung
  const [expanded, setExpanded] = useState(false);

  // Hook để quản lý like/dislike
  const {
    liked,
    disliked,
    likesCount,
    dislikesCount,
    loading,
    error,
    handleLike,
    handleDislike,
    clearError,
    isLoggedIn
  } = useThreadLike(thread.id || thread._id, initialLikesCount, initialDislikesCount);

  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';
  
  // Existing utility functions...
  const getDisplayName = () => {
    return username || 'Người dùng ẩn danh';
  };

  const getAvatarLetter = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const isAnonymous = !username || username === 'anonymous_user';
  
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

  // Event handlers
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick(thread.id || thread._id);
    }
  };

  // Show login alert với SweetAlert2
  const showLoginAlert = (action) => {
    Swal.fire({
      title: "Chưa đăng nhập",
      text: `Vui lòng đăng nhập để ${action} bài viết.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập",
      cancelButtonText: "Hủy",
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        content: 'custom-swal-content',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel',
        icon: 'custom-swal-icon'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  // Like button handler với SweetAlert2
  const onLikeClick = async () => {
    if (!isLoggedIn) {
      showLoginAlert('thích');
      return;
    }
    
    await handleLike();
    
    if (error) {
      Swal.fire({
        title: "Lỗi",
        text: error,
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      clearError();
    }
  };

  // Dislike button handler với SweetAlert2
  const onDislikeClick = async () => {
    if (!isLoggedIn) {
      showLoginAlert('không thích');
      return;
    }
    
    await handleDislike();
    
    if (error) {
      Swal.fire({
        title: "Lỗi",
        text: error,
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      clearError();
    }
  };
  
  return (
    <StyledCard>
      {/* Header với avatar, username, thời gian và menu */}
      <CardHeader
        avatar={
          <Avatar 
            alt={getDisplayName()} 
            src={avatar || ''}
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
      
      {/* Nội dung bài viết */}
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
      
      {/* Phần tương tác với Like/Dislike */}
      <Divider />
      <CardActions 
        sx={{ 
          px: 2, 
          py: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Nút Like */}
          <Box 
            onClick={onLikeClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: loading ? 'default' : 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              transition: 'all 0.2s',
              bgcolor: liked ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
              '&:hover': loading ? {} : {
                bgcolor: liked ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.08)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={16} sx={{ mr: 0.5 }} />
            ) : liked ? (
              <ThumbUpIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5,
                  color: '#2E7D32'
                }} 
              />
            ) : (
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
            )}
            <Typography 
              variant="body2" 
              color={liked ? '#2E7D32' : 'text.secondary'}
              sx={{ fontWeight: liked ? 600 : 400 }}
            >
              {likesCount > 0 ? likesCount : 'Thích'}
            </Typography>
          </Box>

          {/* Nút Dislike */}
          <Box 
            onClick={onDislikeClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: loading ? 'default' : 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              transition: 'all 0.2s',
              bgcolor: disliked ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
              '&:hover': loading ? {} : {
                bgcolor: disliked ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.08)',
              }
            }}
          >
            {disliked ? (
              <ThumbDownIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5,
                  color: '#d32f2f'
                }} 
              />
            ) : (
              <ThumbDownOutlinedIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5,
                  color: 'action.active',
                  '&:hover': {
                    color: '#d32f2f'
                  }
                }} 
              />
            )}
            <Typography 
              variant="body2" 
              color={disliked ? '#d32f2f' : 'text.secondary'}
              sx={{ fontWeight: disliked ? 600 : 400 }}
            >
              {dislikesCount > 0 ? dislikesCount : ''}
            </Typography>
          </Box>
          
          {/* Nút bình luận */}
          <Box 
            onClick={handleCommentClick}
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
        {/* <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
          }}
        >
          <VisibilityIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {viewCount > 0 ? `${viewCount} lượt xem` : '0 lượt xem'}
          </Typography>
        </Box> */}
      </CardActions>
    </StyledCard>
  );
};

export default ThreadCard;