import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { useCommentLike } from '../../../../hooks/useCommentLike';
import './comment-system.css';

const CommentContainer = styled(Box)(({ theme, isReply }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  marginLeft: isReply ? theme.spacing(4) : 0,
  padding: theme.spacing(1),
  borderRadius: '8px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: isReply ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.01)',
  }
}));

const ReplyButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '4px 8px',
  borderRadius: '16px',
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: '#2E7D32'
  }
}));

const LikeButton = styled(Box)(({ theme, liked, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '16px',
  cursor: disabled ? 'default' : 'pointer',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: liked ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
  '&:hover': disabled ? {} : {
    backgroundColor: liked ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.05)',
    transform: 'scale(1.05)'
  }
}));

const CommentContent = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(1.5),
  borderRadius: '16px',
  marginBottom: theme.spacing(1),
  wordWrap: 'break-word',
  '& .mention': {
    color: '#2E7D32',
    fontWeight: 600
  }
}));

const CommentItem = ({ comment, onReply, onLike, currentUser, isReply = false }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const {
    liked,
    likesCount,
    loading,
    handleLike,
    error,
    clearError
  } = useCommentLike(
    comment._id,
    comment.likesCount || 0,
    comment.liked || false
  );

  // Calculate relative time
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds}s`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } catch (error) {
      return 'now';
    }
  };

  // Format content with mentions
  const formatContent = (content) => {
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  };

  // Handle like with callback to parent
  const handleLikeClick = async () => {
    if (!currentUser) {
      Swal.fire({
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thích bình luận.",
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

  const handleReplyClick = () => {
    onReply && onReply(comment._id, comment.username);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa bình luận này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement delete comment
        console.log('Delete comment:', comment._id);
      }
    });
  };

  // Check if current user can delete comment
  const canDelete = currentUser && (
    currentUser.id === comment.author || 
    currentUser.admin
  );

  return (
    <>
      <CommentContainer isReply={isReply}>
        {/* Avatar */}
        <Avatar
          src={comment.avatar || ''}
          sx={{ width: isReply ? 28 : 32, height: isReply ? 28 : 32 }}
        >
          {comment.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>

        {/* Comment Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.username || 'Unknown User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getRelativeTime(comment.created_at)}
            </Typography>
            
            {/* Menu button for comment owner */}
            {canDelete && (
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ ml: 'auto', opacity: 0.7, '&:hover': { opacity: 1 } }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Content */}
          <CommentContent>
            <Typography 
              variant="body2" 
              sx={{ lineHeight: 1.4 }}
              dangerouslySetInnerHTML={{ __html: formatContent(comment.content) }}
            />
          </CommentContent>

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Like Button */}
            <LikeButton
              liked={liked}
              disabled={loading}
              onClick={handleLikeClick}
            >
              {loading ? (
                <CircularProgress size={14} />
              ) : liked ? (
                <ThumbUpIcon 
                  sx={{ fontSize: 14, color: '#2E7D32' }} 
                />
              ) : (
                <ThumbUpOutlinedIcon 
                  sx={{ fontSize: 14, color: 'text.secondary' }} 
                />
              )}
              
              {likesCount > 0 && (
                <Typography 
                  variant="caption" 
                  color={liked ? '#2E7D32' : 'text.secondary'}
                  sx={{ fontWeight: liked ? 600 : 400 }}
                >
                  {likesCount}
                </Typography>
              )}
            </LikeButton>

            {/* Reply Button */}
            {!isReply && (
              <ReplyButton
                startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                onClick={handleReplyClick}
              >
                Trả lời
              </ReplyButton>
            )}
          </Box>
        </Box>
      </CommentContainer>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: 2 }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              currentUser={currentUser}
              isReply={true}
            />
          ))}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            borderRadius: '8px',
            minWidth: '120px'
          }
        }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Xóa
        </MenuItem>
      </Menu>
    </>
  );
};

export default CommentItem;