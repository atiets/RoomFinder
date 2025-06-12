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

// FIXED: Component để hiển thị HTML content với CSS-based truncate (giữ nguyên format Quill)
const RichTextContent = ({ htmlContent, expanded, onToggle }) => {
  if (!htmlContent) return null;

  // Function để đếm text length từ HTML (bỏ qua tags)
  const getTextLength = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').length;
  };

  const shouldTruncate = getTextLength(htmlContent) > 300;

  return (
    <Box>
      {/* FIXED: Luôn hiển thị HTML content với đầy đủ format Quill */}
      <Box
        sx={{
          // Quill Editor Styles - Luôn áp dụng
          '& .ql-editor, & div': {
            fontFamily: 'inherit',
          },
          '& p': { 
            margin: '0 0 12px 0',
            lineHeight: 1.6,
            '&:last-child': { marginBottom: 0 }
          },
          '& h1': { 
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: '16px 0 12px 0',
            lineHeight: 1.3
          },
          '& h2': { 
            fontSize: '1.75rem',
            fontWeight: 'bold',
            margin: '16px 0 12px 0',
            lineHeight: 1.3
          },
          '& h3': { 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '14px 0 10px 0',
            lineHeight: 1.3
          },
          '& h4': { 
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: '14px 0 10px 0',
            lineHeight: 1.3
          },
          '& h5': { 
            fontSize: '1.125rem',
            fontWeight: 'bold',
            margin: '12px 0 8px 0',
            lineHeight: 1.3
          },
          '& h6': { 
            fontSize: '1rem',
            fontWeight: 'bold',
            margin: '12px 0 8px 0',
            lineHeight: 1.3
          },
          '& strong, & b': { 
            fontWeight: 'bold' 
          },
          '& em, & i': { 
            fontStyle: 'italic' 
          },
          '& u': { 
            textDecoration: 'underline' 
          },
          '& s, & strike': { 
            textDecoration: 'line-through' 
          },
          '& ul': { 
            margin: '12px 0',
            paddingLeft: '24px',
            listStyleType: 'disc'
          },
          '& ol': { 
            margin: '12px 0',
            paddingLeft: '24px',
            listStyleType: 'decimal'
          },
          '& li': { 
            margin: '4px 0',
            lineHeight: 1.6
          },
          '& blockquote': {
            borderLeft: '4px solid #ddd',
            paddingLeft: '16px',
            margin: '16px 0',
            fontStyle: 'italic',
            color: '#666',
            backgroundColor: '#f9f9f9',
            padding: '12px 16px',
            borderRadius: '4px'
          },
          '& a': {
            color: '#2E7D32',
            textDecoration: 'none',
            '&:hover': { 
              textDecoration: 'underline',
              color: '#1B5E20'
            }
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            margin: '12px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          },
          '& pre': {
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            border: '1px solid #e0e0e0',
            margin: '12px 0'
          },
          '& code': {
            backgroundColor: '#f5f5f5',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '14px',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            border: '1px solid #e0e0e0'
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            margin: '12px 0',
            fontSize: '14px'
          },
          '& th, & td': {
            border: '1px solid #ddd',
            padding: '8px 12px',
            textAlign: 'left'
          },
          '& th': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold'
          },
          '& hr': {
            border: 'none',
            borderTop: '2px solid #e0e0e0',
            margin: '20px 0'
          },
          // Text alignment from Quill
          '& .ql-align-center': {
            textAlign: 'center'
          },
          '& .ql-align-right': {
            textAlign: 'right'
          },
          '& .ql-align-justify': {
            textAlign: 'justify'
          },
          // Font sizes from Quill
          '& .ql-size-small': {
            fontSize: '0.75rem'
          },
          '& .ql-size-large': {
            fontSize: '1.25rem'
          },
          '& .ql-size-huge': {
            fontSize: '1.5rem'
          },
          // Colors from Quill
          '& .ql-color-red': {
            color: '#e60000'
          },
          '& .ql-color-orange': {
            color: '#f90'
          },
          '& .ql-color-yellow': {
            color: '#ff0'
          },
          '& .ql-color-green': {
            color: '#008a00'
          },
          '& .ql-color-blue': {
            color: '#06c'
          },
          '& .ql-color-purple': {
            color: '#93f'
          },
          // Background colors from Quill  
          '& .ql-bg-black': {
            backgroundColor: '#000'
          },
          '& .ql-bg-red': {
            backgroundColor: '#e60000'
          },
          '& .ql-bg-orange': {
            backgroundColor: '#f90'
          },
          '& .ql-bg-yellow': {
            backgroundColor: '#ff0'
          },
          '& .ql-bg-green': {
            backgroundColor: '#008a00'
          },
          '& .ql-bg-blue': {
            backgroundColor: '#06c'
          },
          '& .ql-bg-purple': {
            backgroundColor: '#93f'
          },
          // Indent
          '& .ql-indent-1': {
            paddingLeft: '3em'
          },
          '& .ql-indent-2': {
            paddingLeft: '6em'
          },
          '& .ql-indent-3': {
            paddingLeft: '9em'
          },
          '& .ql-indent-4': {
            paddingLeft: '12em'
          },
          '& .ql-indent-5': {
            paddingLeft: '15em'
          },
          '& .ql-indent-6': {
            paddingLeft: '18em'
          },
          '& .ql-indent-7': {
            paddingLeft: '21em'
          },
          '& .ql-indent-8': {
            paddingLeft: '24em'
          },
          
          lineHeight: 1.6,
          color: 'text.primary',
          wordBreak: 'break-word',
          
          // FIXED: CSS-based truncate với gradient fade
          position: 'relative',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          
          // Truncate styles khi chưa expand
          ...((!expanded && shouldTruncate) && {
            maxHeight: '160px', // Khoảng 5-6 dòng
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,1) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }
          }),
          
          // Expanded styles
          ...(expanded && {
            maxHeight: 'none'
          })
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      {/* Read More Button */}
      {shouldTruncate && (
        <Button
          onClick={onToggle}
          size="small"
          sx={{
            p: 0,
            mt: 1.5,
            minWidth: 'auto',
            color: '#2E7D32',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: '16px',
            padding: '4px 8px',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.1)',
              textDecoration: 'none',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
            },
            transition: 'all 0.2s ease'
          }}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      )}
    </Box>
  );
};

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
    image = null,
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

          {/* FIXED: Rich Text Content - Luôn giữ format Quill */}
          <RichTextContent
            htmlContent={content}
            expanded={expanded}
            onToggle={handleExpandClick}
          />

          {/* Image Display */}
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
                window.open(image, '_blank');
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