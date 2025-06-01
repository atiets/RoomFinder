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
import CommentModal from './CommentThread/CommentModal';
import './CommentThread/comment-system.css';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
}));

const ActionButton = styled(Box)(({ theme, active, color = '#2E7D32' }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '6px 12px',
  borderRadius: '16px',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: active ? `${color}15` : 'transparent',
  border: `1px solid ${active ? color : 'transparent'}`,
  '&:hover': {
    backgroundColor: active ? `${color}20` : `${color}08`,
    transform: 'translateY(-1px)',
    boxShadow: `0 2px 8px ${color}20`
  }
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

  // States
  const [expanded, setExpanded] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentCommentCount, setCurrentCommentCount] = useState(comments);

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
  
  // Utility functions
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
    setCommentModalOpen(true);
  };

  const handleCommentModalClose = () => {
    setCommentModalOpen(false);
  };

  // Handle new comment added (callback from modal)
  const handleCommentAdded = () => {
    setCurrentCommentCount(prev => prev + 1);
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
    <>
      <StyledCard>
        {/* Header với avatar, username, thời gian và menu */}
        <CardHeader
          avatar={
            <Avatar 
              alt={getDisplayName()} 
              src={avatar || ''}
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: isAnonymous ? '#e0e0e0' : pastelGreen,
                color: isAnonymous ? '#757575' : 'inherit',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {getAvatarLetter()}
            </Avatar>
          }
          action={
            <IconButton 
              aria-label="settings"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
              {getDisplayName()}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" fontSize="13px">
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
              sx={{ 
                mb: 1.5,
                lineHeight: 1.3,
                cursor: 'pointer',
                '&:hover': {
                  color: '#2E7D32'
                },
                transition: 'color 0.2s ease'
              }}
              onClick={() => console.log('Navigate to thread detail')}
            >
              {title}
            </Typography>
          )}
          
          {/* Nội dung văn bản */}
          <Typography 
            variant="body1" 
            color="text.primary"
            sx={{ 
              mb: 1.5,
              whiteSpace: 'pre-line',
              lineHeight: 1.6
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
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                  transform: 'translateX(4px)'
                },
                transition: 'all 0.2s ease'
              }}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </Button>
          )}

          {/* Collapse content */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1.5 }}>
              {image && (
                <CardMedia
                  component="img"
                  image={image}
                  alt={title || "Thread image"}
                  sx={{ 
                    mt: 2, 
                    borderRadius: '8px',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                    px: 2,
                    py: 0.5,
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  #{tag}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
        
        {/* Phần tương tác với Like/Dislike/Comment */}
        <Divider />
        <CardActions 
          sx={{ 
            px: 2, 
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Like Button */}
            <ActionButton
              active={liked}
              color="#2E7D32"
              onClick={onLikeClick}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ mr: 0.5 }} />
              ) : liked ? (
                <ThumbUpIcon 
                  sx={{ 
                    fontSize: 18,
                    mr: 0.5,
                    color: '#2E7D32'
                  }} 
                />
              ) : (
                <ThumbUpOutlinedIcon 
                  sx={{ 
                    fontSize: 18,
                    mr: 0.5,
                    color: 'text.secondary'
                  }} 
                />
              )}
              <Typography 
                variant="body2" 
                color={liked ? '#2E7D32' : 'text.secondary'}
                sx={{ fontWeight: liked ? 700 : 500 }}
              >
                {likesCount > 0 ? likesCount : 'Thích'}
              </Typography>
            </ActionButton>

            {/* Dislike Button */}
            <ActionButton
              active={disliked}
              color="#d32f2f"
              onClick={onDislikeClick}
            >
              {disliked ? (
                <ThumbDownIcon 
                  sx={{ 
                    fontSize: 18,
                    mr: 0.5,
                    color: '#d32f2f'
                  }} 
                />
              ) : (
                <ThumbDownOutlinedIcon 
                  sx={{ 
                    fontSize: 18,
                    mr: 0.5,
                    color: 'text.secondary'
                  }} 
                />
              )}
              {dislikesCount > 0 && (
                <Typography 
                  variant="body2" 
                  color={disliked ? '#d32f2f' : 'text.secondary'}
                  sx={{ fontWeight: disliked ? 700 : 500 }}
                >
                  {dislikesCount}
                </Typography>
              )}
            </ActionButton>
            
            {/* Comment Button */}
            <ActionButton
              active={false}
              color="#1976d2"
              onClick={handleCommentClick}
            >
              <ChatBubbleOutlineIcon 
                sx={{ 
                  fontSize: 18,
                  mr: 0.5,
                  color: 'text.secondary'
                }} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {currentCommentCount > 0 ? `${currentCommentCount} bình luận` : 'Bình luận'}
              </Typography>
            </ActionButton>
          </Box>
          
          {/* View Count */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'text.secondary'
            }}
          >
            <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2" fontSize="12px">
              {viewCount > 0 ? `${viewCount} lượt xem` : '0 lượt xem'}
            </Typography>
          </Box>
        </CardActions>
      </StyledCard>

      {/* Comment Modal */}
      <CommentModal
        open={commentModalOpen}
        onClose={handleCommentModalClose}
        thread={thread}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

export default ThreadCard;