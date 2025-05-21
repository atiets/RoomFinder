// src/components/forum/ThreadCard.jsx
import React from 'react';
import { 
  Card, CardHeader, CardContent, CardActions, 
  Avatar, Typography, Box, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[3],
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
    dislikes = 0, 
    comments = 0, 
    views = 0 
  } = thread;

  // Màu pastel theo yêu cầu
  const pastelGreen = '#C1E1C1';
  const pastelOrange = '#FFD8B1';
  
  // Tính thời gian tương đối (ví dụ: "2 giờ trước")
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
    <StyledCard onClick={onClick}>
      <CardHeader
        avatar={
          <Avatar 
            alt={author.name} 
            src={author.avatar}
            sx={{ bgcolor: pastelGreen }} // Fallback khi không có avatar
          >
            {author.name.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {author.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {getRelativeTime(createdAt)}
            </Typography>
          </Box>
        }
      />
      
      <CardContent sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary" 
          sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {content}
        </Typography>
        
        {tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag, index) => (
              <Box 
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? pastelGreen : pastelOrange,
                  color: '#333',
                  px: 1,
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
      
      <CardActions 
        sx={{ 
          px: 2, 
          py: 1,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          size="small"
          startIcon={<ThumbUpOutlinedIcon />}
          color="default"
        >
          {likes}
        </Button>
        
        <Button
          size="small"
          startIcon={<ThumbDownOutlinedIcon />}
          color="default"
        >
          {dislikes}
        </Button>
        
        <Button
          size="small"
          startIcon={<ChatBubbleOutlineIcon />}
          color="default"
        >
          {comments}
        </Button>
        
        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          color="default"
          sx={{ ml: 'auto' }}
        >
          {views}
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default ThreadCard;
