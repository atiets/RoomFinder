// src/components/User/forum/CommentModal/CommentItem.jsx
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
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Swal from 'sweetalert2';
import { useCommentLike } from '../../../../hooks/useCommentLike';
import { updateComment, deleteComment } from '../../../../redux/commentApi';
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
  border: `1px solid ${liked ? '#2E7D32' : 'transparent'}`,
  '&:hover': disabled ? {} : {
    backgroundColor: liked ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.05)',
    transform: 'scale(1.02)',
    boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)'
  }
}));

const CommentContent = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  padding: theme.spacing(1.5),
  borderRadius: '16px',
  marginBottom: theme.spacing(1),
  wordWrap: 'break-word',
  border: '1px solid #e9ecef',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#f1f3f4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  '& .mention': {
    color: '#2E7D32',
    fontWeight: 600,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    padding: '0 4px',
    borderRadius: '4px'
  }
}));

const EditContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  border: '2px solid #2E7D32',
  marginBottom: theme.spacing(1),
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#fafafa',
      '&.Focused': {
        backgroundColor: '#fff'
      }
    }
  }
}));

const CommentItem = ({ comment, onReply, onCommentUpdated, onCommentDeleted, currentUser, isReply = false }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
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
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
      return `${Math.floor(diffInSeconds / 604800)}w`;
    } catch (error) {
      return 'now';
    }
  };

  // Format content with mentions
  const formatContent = (content) => {
    if (!content) return '';
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  };

  // Check nếu user có thể edit/delete comment - CHỈ CHỦ COMMENT MỚI CÓ QUYỀN
  const isOwner = currentUser && comment && (
    (currentUser.username && comment.username && 
     currentUser.username.toLowerCase() === comment.username.toLowerCase()) ||
    (currentUser.id && comment.author && 
     currentUser.id.toString() === comment.author.toString())
  );

  // Check if comment is edited
  const isEdited = comment.updated_at && 
    new Date(comment.updated_at).getTime() !== new Date(comment.created_at).getTime();

  // Handle like
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

  // Handle edit comment
  const handleEdit = () => {
    handleMenuClose();
    setIsEditing(true);
    setEditContent(comment.content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || '');
  };

  const handleSaveEdit = async () => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      Swal.fire({
        title: "Lỗi",
        text: "Nội dung bình luận không được để trống",
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      return;
    }

    if (trimmedContent === comment.content) {
      setIsEditing(false);
      return;
    }

    if (trimmedContent.length > 1000) {
      Swal.fire({
        title: "Lỗi",
        text: "Nội dung bình luận không được vượt quá 1000 ký tự",
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
      return;
    }

    try {
      setUpdating(true);
      
      const response = await updateComment(
        comment._id,
        { content: trimmedContent },
        currentUser.accessToken
      );

      if (response.success) {
        setIsEditing(false);
        
        // Callback to parent để update comment
        onCommentUpdated && onCommentUpdated(comment._id, response.data);
        
        Swal.fire({
          title: "Thành công",
          text: "Đã cập nhật bình luận!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'custom-swal-popup'
          }
        });
      }
    } catch (error) {
      console.error('Update comment error:', error);
      Swal.fire({
        title: "Lỗi",
        text: error.message,
        icon: "error",
        confirmButtonText: "Đóng",
        customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-swal-confirm'
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete comment
  const handleDelete = () => {
    handleMenuClose();
    
    Swal.fire({
      title: "Xác nhận xóa",
      html: `
        <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
        ${!comment.parentComment ? '<p><strong>Lưu ý:</strong> Tất cả replies cũng sẽ bị xóa.</p>' : ''}
      `,
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeleting(true);
          
          const response = await deleteComment(comment._id, currentUser.accessToken);
          
          if (response.success) {
            // Callback to parent để remove comment khỏi list
            onCommentDeleted && onCommentDeleted(comment._id, !comment.parentComment);
            
            Swal.fire({
              title: "Đã xóa",
              text: "Bình luận đã được xóa thành công!",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'custom-swal-popup'
              }
            });
          }
        } catch (error) {
          console.error('Delete comment error:', error);
          Swal.fire({
            title: "Lỗi",
            text: error.message,
            icon: "error",
            confirmButtonText: "Đóng",
            customClass: {
              popup: 'custom-swal-popup',
              confirmButton: 'custom-swal-confirm'
            }
          });
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      <CommentContainer isReply={isReply}>
        {/* Avatar */}
        <Avatar
          src={comment.avatar || ''}
          sx={{ 
            width: isReply ? 28 : 32, 
            height: isReply ? 28 : 32,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '2px solid #f0f0f0'
          }}
        >
          {comment.username?.charAt(0).toUpperCase() || 'U'}
        </Avatar>

        {/* Comment Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={600} color="primary.main">
              {comment.username || 'Unknown User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getRelativeTime(comment.created_at)}
            </Typography>
            
            {/* Edited indicator */}
            {isEdited && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontStyle: 'italic',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                đã sửa
              </Typography>
            )}
            
            {/* Menu button - CHỈ HIỂN THỊ KHI LÀ CHỦ COMMENT */}
            {isOwner && !isEditing && (
              <IconButton
                size="small"
                onClick={handleMenuClick}
                disabled={deleting}
                sx={{ 
                  ml: 'auto', 
                  opacity: 0.6, 
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    opacity: 1,
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    transform: 'scale(1.1)'
                  },
                  '&:disabled': { opacity: 0.3 }
                }}
              >
                {deleting ? (
                  <CircularProgress size={16} />
                ) : (
                  <MoreVertIcon fontSize="small" />
                )}
              </IconButton>
            )}
          </Box>

          {/* Content */}
          {isEditing ? (
            <EditContainer>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={updating}
                placeholder="Nhập nội dung bình luận..."
                variant="outlined"
                size="small"
                inputProps={{ maxLength: 1000 }}
                helperText={`${editContent.length}/1000 ký tự (Ctrl+Enter để lưu, Esc để hủy)`}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                  disabled={updating}
                  sx={{ borderRadius: '20px' }}
                >
                  Hủy
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={handleSaveEdit}
                  disabled={updating || !editContent.trim()}
                  sx={{ 
                    bgcolor: '#2E7D32',
                    borderRadius: '20px',
                    '&:hover': { bgcolor: '#1B5E20' }
                  }}
                >
                  {updating ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </Box>
            </EditContainer>
          ) : (
            <CommentContent>
              <Typography 
                variant="body2" 
                sx={{ 
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(comment.content || '') 
                }}
              />
            </CommentContent>
          )}

          {/* Actions - CHỈ HIỂN THỊ KHI KHÔNG EDIT */}
          {!isEditing && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                    sx={{ fontWeight: liked ? 700 : 500 }}
                  >
                    {likesCount}
                  </Typography>
                )}
              </LikeButton>

              {/* Reply Button - HIỂN THỊ CHO TẤT CẢ COMMENT (cả gốc và reply) */}
              {currentUser && (
                <ReplyButton
                  startIcon={<ReplyIcon sx={{ fontSize: 14 }} />}
                  onClick={handleReplyClick}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      color: '#1976d2'
                    }
                  }}
                >
                  Trả lời
                </ReplyButton>
              )}
            </Box>
          )}
        </Box>
      </CommentContainer>

      {/* Replies - HIỂN THỊ CHO TẤT CẢ COMMENT CÓ REPLIES */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ 
          ml: 3, 
          borderLeft: '2px solid #e0e0e0',
          pl: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: -1,
            top: 0,
            bottom: 0,
            width: '2px',
            background: 'linear-gradient(180deg, #2E7D32 0%, transparent 100%)',
            opacity: 0.3
          }
        }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              currentUser={currentUser}
              isReply={true}
            />
          ))}
        </Box>
      )}

      {/* Context Menu - CHỈ HIỂN THỊ KHI LÀ CHỦ COMMENT */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            borderRadius: '12px',
            minWidth: '150px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.08)'
            }
          }}
        >
          <EditIcon sx={{ mr: 1.5, fontSize: 18, color: '#2E7D32' }} />
          <Typography variant="body2" fontWeight={500}>Sửa</Typography>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)'
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          <Typography variant="body2" fontWeight={500}>Xóa</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CommentItem;