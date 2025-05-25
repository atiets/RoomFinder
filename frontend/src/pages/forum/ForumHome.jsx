// src/pages/forum/ForumHome.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import ForumHeader from '../../components/User/forum/ForumHeader';
import ThreadList from '../../components/User/forum/ThreadList';
import CreateThreadButton from '../../components/User/forum/CreateThreadButton';
import CreateThread from '../../components/User/forum/CreateThread';
import { getForumThreads } from '../../redux/threadApi';

const ForumHome = () => {
  // State management
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

    const currentUserRedux = useSelector((state) => state.auth?.login?.currentUser);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();

  const currentUser = {
    name: currentUserRedux?.username || "Unknown User",
    avatar: currentUserRedux?.profile?.picture || ""
  };
  
  // Fetch threads khi component mount hoặc khi trang thay đổi
  useEffect(() => {
    fetchThreadsData();
  }, [pagination.page]);

  // Function để fetch threads từ API
  const fetchThreadsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching threads...', { page: pagination.page, limit: pagination.limit });
      
      const response = await getForumThreads(pagination.page, pagination.limit);
      
      console.log('API Response:', response);
      
      // Kiểm tra cấu trúc dữ liệu trả về từ API
      if (response && response.success && response.data) {
        setThreads(response.data);
        
        // Cập nhật pagination từ response
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            pages: response.pagination.pages,
            total: response.pagination.total
          }));
        }
        
        console.log('Threads loaded successfully:', response.data.length, 'threads');
      } else {
        // Trường hợp response không có cấu trúc như mong đợi
        console.error("API response format unexpected:", response);
        setError("Định dạng dữ liệu không đúng");
        showSnackbar("Định dạng dữ liệu không đúng", "error");
        setThreads([]); // Set empty array as fallback
      }
    } catch (err) {
      console.error("Error fetching threads:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
      showSnackbar(err.message || "Đã xảy ra lỗi khi tải dữ liệu", "error");
      setThreads([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Xử lý click vào thread để xem chi tiết
  const handleThreadClick = (threadId) => {
    console.log('Navigate to thread:', threadId);
    navigate(`/forum/thread/${threadId}`);
  };
  
  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    console.log('Page changed to:', value);
    setPagination(prev => ({
      ...prev,
      page: value
    }));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Mở dialog tạo thread mới
  const handleCreateThread = () => {
    setCreateDialogOpen(true);
  };
  
  // Xử lý khi tạo thread thành công
  const handleCreateSuccess = (newThread) => {
    console.log('New thread created:', newThread);
    
    // KHÔNG thêm thread mới vào danh sách vì nó đang ở trạng thái pending
    // setThreads([newThread, ...threads]); // <- XÓA DÒNG NÀY
    
    // Hiển thị thông báo chờ duyệt thay vì thành công
    showSnackbar(
      "Bài viết đã được gửi thành công! Bài viết của bạn đang chờ được duyệt và sẽ xuất hiện trong diễn đàn sau khi được phê duyệt.", 
      "info"
    );
  };

  // Function để refresh threads (có thể gọi từ pull-to-refresh)
  const handleRefresh = () => {
    console.log('Refreshing threads...');
    fetchThreadsData();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Custom Snackbar với UI đẹp hơn */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'info' ? 8000 : 6000} // Dài hơn cho thông báo chờ duyệt
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }} // Thêm margin top để không bị che bởi header
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            minWidth: '400px',
            borderRadius: '12px',
            fontSize: '14px',
            '& .MuiAlert-message': {
              fontSize: '14px',
              lineHeight: '1.5'
            },
            ...(snackbar.severity === 'info' && {
              backgroundColor: '#2196f3',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            })
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Vùng hiển thị danh sách bài viết - chiếm 8/12 ở màn hình lớn */}
        <Grid item xs={12} md={8} mt={4}>
          {/* Hiển thị loading indicator khi đang fetch data lần đầu */}
          {loading && threads.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Đang tải danh sách bài viết...
              </Typography>
            </Box>
          )}
          
          {/* Hiển thị lỗi nếu có và không có threads */}
          {error && threads.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <button 
                onClick={handleRefresh}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Thử lại
              </button>
            </Box>
          )}
          
          {/* Hiển thị danh sách thread */}
          <ThreadList 
            threads={threads}
            loading={loading}
            onThreadClick={handleThreadClick}
            page={pagination.page}
            totalPages={pagination.pages} 
            onPageChange={handlePageChange}
          />
          
          {/* Nút tạo bài viết nổi ở góc dưới chỉ hiển thị trên mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <CreateThreadButton onClick={handleCreateThread} />
          </Box>
        </Grid>
        
        {/* Vùng sidebar bên phải - chiếm 4/12 ở màn hình lớn */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mt: 4 }}>
            <ForumHeader 
              onCreateThread={handleCreateThread}
              user={currentUser}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Component CreateThread */}
      <CreateThread
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
        showSnackbar={showSnackbar}
      />
    </Container>
  );
};

export default ForumHome;