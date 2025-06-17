  import { Box, Pagination, Skeleton, Typography } from '@mui/material';
  import { useSelector } from 'react-redux';
  import { toast } from "react-toastify";
  import { approveThread, rejectThread } from '../../../redux/threadApi';
  import ThreadCard from './ThreadCard';

  const ThreadList = ({
    threads,
    setThreads,
    loading,
    onThreadClick,
    page,
    totalPages,
    onPageChange,
    onThreadUpdated,
    onThreadDeleted,
    onThreadAdded,
    type,
  }) => {
    const user = useSelector((state) => state.auth.login.currentUser);
    const accessToken = user?.accessToken;

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
            <circle cx="60" cy="60" r="50" fill="none" stroke="#ccc" strokeWidth="2" />
            <path d="M40 60 L80 60 M60 40 L60 80" stroke="#ccc" strokeWidth="2" />
          </svg>
        </Box>
      </Box>
    );

    // Handle comment click - chuyển đến detail thread
    const handleCommentClick = (threadId) => {
      onThreadClick && onThreadClick(threadId);
    };

    // Handle thread updated - Forward to parent và update local state
    const handleThreadUpdated = (threadId, updatedData) => {
      console.log('ThreadList: Thread updated', threadId, updatedData);

      // Update local state immediately
      if (setThreads) {
        setThreads(prevThreads =>
          prevThreads.map(thread =>
            (thread._id === threadId || thread.id === threadId)
              ? { ...thread, ...updatedData }
              : thread
          )
        );
      }

      // Forward to parent callback
      onThreadUpdated && onThreadUpdated(threadId, updatedData);
    };

    // Handle thread deleted - Forward to parent và update local state
    const handleThreadDeleted = (threadId) => {
      console.log('ThreadList: Thread deleted', threadId);

      // Update local state immediately
      if (setThreads) {
        setThreads(prevThreads =>
          prevThreads.filter(thread =>
            thread._id !== threadId && thread.id !== threadId
          )
        );
      }

      // Forward to parent callback
      onThreadDeleted && onThreadDeleted(threadId);
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

    const handleApprove = async (id) => {
      if (!accessToken) return;
      try {
        const res = await approveThread(id, accessToken);
        setThreads(prev => prev.filter(thread => thread._id !== id));
        toast.success('Đã duyệt thành công!');
      } catch (err) {
        console.error('Lỗi duyệt:', err);
        toast.error('Lỗi duyệt bài viết!');
      }
    };

    const handleReject = async (id) => {
      if (!accessToken) return;
      try {
        const res = await rejectThread(id, accessToken);
        setThreads(prev => prev.filter(thread => thread._id !== id));
        toast.success('Đã từ chối thành công!');
      } catch (err) {
        console.error('Lỗi từ chối:', err);
        toast.error('Lỗi từ chối bài viết!');
      }
    };

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
            // FIXED: Map dữ liệu từ API response sang format mà ThreadCard expect (include image)
            const mappedThread = {
              id: thread._id,
              _id: thread._id,
              title: thread.title || '',
              content: thread.content || '',
              username: thread.username || 'Unknown User',
              avatar: thread.avatar || null,
              created_at: thread.created_at || thread.createdAt || new Date().toISOString(),
              tags: thread.tags || [],
              likesCount: thread.likesCount || 0,
              dislikesCount: thread.dislikesCount || 0,
              comments: thread.commentCount || 0,
              image: thread.image || null, // FIXED: Include image field
              viewCount: thread.viewCount || 0,
              author: thread.author
            };

            return (
              <ThreadCard
                key={thread._id}
                thread={mappedThread}
                onCommentClick={handleCommentClick}
                onThreadUpdated={handleThreadUpdated}
                onThreadDeleted={handleThreadDeleted}
                type={type}
                handleApprove={() => handleApprove(thread._id)}
                handleReject={() => handleReject(thread._id)}
                handleHide={() => handleReject(thread._id)}
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