import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useThreadLike } from '../../../hooks/useThreadLike';
import CommentModal from './CommentThread/CommentModal';
import './CommentThread/comment-system.css';
import ThreadActions from './ThreadActions';
import ThreadEditDialog from './ThreadEditDialog';
import ThreadMenu from './ThreadMenu';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '8px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12)',
  },
}));

const ThreadCard = ({ thread, onCommentClick, onThreadUpdated, onThreadDeleted, type, handleApprove, handleHide, handleReject }) => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.login?.currentUser);
  
  const {
    title,
    content,
    username,
    avatar,
    created_at,
    createdAt,
    tags = [],
    likesCount: initialLikesCount = 0,
    comments = 0,
    image = null, // FIXED: Include image prop
    viewCount = 0,
    author
  } = thread;

  // States
  const [expanded, setExpanded] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentCommentCount, setCurrentCommentCount] = useState(comments);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Hook để quản lý like
  const {
    liked,
    likesCount,
    loading,
    error,
    handleLike,
    clearError,
    isLoggedIn
  } = useThreadLike(thread.id || thread._id, initialLikesCount, 0);

  // Constants
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';

  // Check ownership
  const isOwner = currentUser && thread && (
    (currentUser.username && thread.username && 
     currentUser.username.toLowerCase() === thread.username.toLowerCase()) ||
    (currentUser.id && thread.author && 
     currentUser.id.toString() === thread.author.toString())
  );

  // Utility functions
  const getDisplayName = () => username || 'Người dùng ẩn danh';
  
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
    ? formattedContent.split('\n').slice(0, 3).join('\n') + (formattedContent.length > 200 ? '...' : '')
    : formattedContent;

  // Event handlers
  const handleExpandClick = () => setExpanded(!expanded);
  const handleCommentClick = () => setCommentModalOpen(true);
  const handleCommentModalClose = () => setCommentModalOpen(false);
  const handleCommentAdded = () => setCurrentCommentCount(prev => prev + 1);

  // Edit handlers
  const handleEditOpen = () => setEditDialogOpen(true);
  const handleEditClose = () => setEditDialogOpen(false);

  // Like handler
  const onLikeClick = async () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thích bài viết.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm',
          cancelButton: 'custom-swal-cancel'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
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

  return (
    <>
      <StyledCard>
        {/* Header */}
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
            isOwner && (
              <ThreadMenu
                thread={thread}
                onEdit={handleEditOpen}
                onThreadDeleted={onThreadDeleted}
              />
            )
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

        {/* Content */}
        <CardContent sx={{ pt: 0, pb: 1.5 }}>
          {/* Title */}
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
                '&:hover': { color: '#2E7D32' },
                transition: 'color 0.2s ease'
              }}
              onClick={() => console.log('Navigate to thread detail')}
            >
              {title}
            </Typography>
          )}

          {/* Content Text */}
          <Typography
            variant="body1"
            color="text.primary"
            sx={{ mb: 1.5, whiteSpace: 'pre-line', lineHeight: 1.6 }}
          >
            {truncatedContent}
          </Typography>

          {/* FIXED: Image Display - Always show if exists */}
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
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => {
                // Optional: Open image in modal/lightbox
                window.open(image, '_blank');
              }}
            />
          )}

          {/* Read More Button */}
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

          {/* Collapse Content - Remove duplicate image display */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1.5 }}>
              {/* Additional expanded content if needed */}
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

        {/* Actions */}
        <Divider />
        <ThreadActions
          liked={liked}
          likesCount={likesCount}
          loading={loading}
          onLikeClick={onLikeClick}
          currentCommentCount={currentCommentCount}
          onCommentClick={handleCommentClick}
          viewCount={viewCount}
          type={type}
          handleApprove={handleApprove}
          handleHide={handleHide}
          handleReject={handleReject}
        />
      </StyledCard>

      {/* Edit Dialog */}
      <ThreadEditDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        thread={thread}
        onThreadUpdated={onThreadUpdated}
      />

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