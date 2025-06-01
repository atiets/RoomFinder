// src/components/User/forum/ThreadActions.jsx
import React from 'react';
import {
  CardActions,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const LikeButton = styled(Box)(({ theme, liked, disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
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

const ThreadActions = ({ 
  liked, 
  likesCount, 
  loading, 
  onLikeClick, 
  currentCommentCount, 
  onCommentClick, 
  viewCount 
}) => {
  return (
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
        <LikeButton
          liked={liked}
          disabled={loading}
          onClick={onLikeClick}
        >
          {loading ? (
            <CircularProgress size={18} />
          ) : liked ? (
            <ThumbUpIcon 
              sx={{ fontSize: 18, color: '#2E7D32' }} 
            />
          ) : (
            <ThumbUpOutlinedIcon 
              sx={{ fontSize: 18, color: 'text.secondary' }} 
            />
          )}
          
          {likesCount > 0 && (
            <Typography 
              variant="body2" 
              color={liked ? '#2E7D32' : 'text.secondary'}
              sx={{ fontWeight: liked ? 700 : 500 }}
            >
              {likesCount}
            </Typography>
          )}
        </LikeButton>

        {/* Comment Button */}
        <ActionButton
          active={false}
          color="#1976d2"
          onClick={onCommentClick}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {currentCommentCount > 0 ? `${currentCommentCount} bình luận` : 'Bình luận'}
          </Typography>
        </ActionButton>
      </Box>

      {/* View Count */}
      {/* <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
        <Typography variant="body2" fontSize="12px">
          {viewCount > 0 ? `${viewCount} lượt xem` : '0 lượt xem'}
        </Typography>
      </Box> */}
    </CardActions>
  );
};

export default ThreadActions;
