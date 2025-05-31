// src/components/User/forum/ThreadList.jsx
import React from 'react';
import { Box, Typography, Pagination, Skeleton, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThreadCard from './ThreadCard';

const ThreadList = ({ threads, loading, onThreadClick, page, totalPages, onPageChange }) => {
  // Skeleton để hiển thị khi đang loading
  const ThreadSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '12px' }} />
    </Box>
  );
  
  // Component hiển thị khi không có threads
  const EmptyState = () => (
    <Box 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Chưa có bài viết nào trong diễn đàn
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hãy là người đầu tiên chia sẻ kinh nghiệm của bạn!
      </Typography>
      <Box sx={{ mt: 2 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ opacity: 0.3 }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="#ccc" strokeWidth="2"/>
          <path d="M40 60 L80 60 M60 40 L60 80" stroke="#ccc" strokeWidth="2"/>
        </svg>
      </Box>
    </Box>
  );
  
  // Handle comment click - chuyển đến detail thread
  const handleCommentClick = (threadId) => {
    onThreadClick(threadId);
  };
  
  // Hiển thị loading skeletons khi đang tải lần đầu
  if (loading && threads.length === 0) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <ThreadSkeleton key={index} />
        ))}
      </Box>
    );
  }
  
  // Hiển thị trạng thái không có bài viết
  if (!loading && threads.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <Box>
      {/* Hiển thị loading overlay khi chuyển trang */}
      {loading && threads.length > 0 && (
        <Box 
          sx={{ 
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
              borderRadius: '12px'
            }
          }}
        >
          <Box 
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </Box>
      )}
      
      {/* Danh sách threads */}
      <Box sx={{ position: 'relative' }}>
        {threads.map((thread) => {
          // Map dữ liệu từ API response sang format mà ThreadCard expect
          const mappedThread = {
            id: thread._id,
            _id: thread._id, // Keep both for compatibility
            title: thread.title || '',
            content: thread.content || '',
            username: thread.username || 'Unknown User', 
            avatar: thread.avatar || null, 
            created_at: thread.created_at || thread.createdAt || new Date().toISOString(),
            tags: thread.tags || [],
            // Sử dụng data từ backend đã format với like/dislike counts
            likesCount: thread.likesCount || 0,
            dislikesCount: thread.dislikesCount || 0,
            comments: thread.commentCount || 0,
            image: thread.image || null,
            viewCount: thread.viewCount || 0
          };
          
          return (
            <ThreadCard 
              key={thread._id} 
              thread={mappedThread} 
              onCommentClick={handleCommentClick}
            />
          );
        })}
      </Box>
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
            disabled={loading}
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default ThreadList;