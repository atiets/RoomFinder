// src/components/forum/ThreadList.jsx
import React from 'react';
import { Box, Typography, Pagination, Skeleton } from '@mui/material';
import ThreadCard from './ThreadCard';

const ThreadList = ({ threads, loading, onThreadClick, page, totalPages, onPageChange }) => {
  // Skeleton để hiển thị khi đang loading
  const ThreadSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: '12px' }} />
    </Box>
  );
  
  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <ThreadSkeleton key={index} />
        ))}
      </Box>
    );
  }
  
  if (threads.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          bgcolor: 'background.paper',
          borderRadius: '12px'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Chưa có bài viết nào trong diễn đàn.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hãy là người đầu tiên chia sẻ!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {threads.map((thread) => (
        <ThreadCard 
          key={thread.id} 
          thread={thread} 
          onClick={() => onThreadClick(thread.id)} 
        />
      ))}
      
      {/* Phân trang */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default ThreadList;
