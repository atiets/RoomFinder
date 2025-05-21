// src/components/User/forum/ThreadList.jsx
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
      {/* Hiển thị skeleton overlay khi đang tải dữ liệu mới */}
      {loading && threads.length > 0 && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      )}
      
      {/* Danh sách threads */}
      <Box sx={{ position: 'relative' }}>
        {threads.map((thread) => (
          <ThreadCard 
            key={thread._id} 
            thread={{
              id: thread._id,
              title: thread.title,
              content: thread.content,
              author: thread.author,
              createdAt: thread.created_at,
              tags: thread.tags || [],
              likes: thread.likes?.length || 0,
              comments: thread.commentCount || 0,
              image: thread.image || null
            }} 
            onClick={() => onThreadClick(thread._id)} 
          />
        ))}
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
          />
        </Box>
      )}
    </Box>
  );
};

export default ThreadList;