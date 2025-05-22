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
import ForumHeader from '../../components/User/forum/ForumHeader';
import ThreadList from '../../components/User/forum/ThreadList';
import CreateThreadButton from '../../components/User/forum/CreateThreadButton';
import CreateThread from '../../components/User/forum/CreateThread/';
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
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();

  // Mock user data - có thể lấy từ context hoặc state auth
  const currentUser = {
    name: "Tuyet Nguyen",
    avatar: ""
  };
  
  // Fetch threads khi component mount hoặc khi trang thay đổi
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        const response = await getForumThreads(pagination.page, pagination.limit);
        
        // Kiểm tra cấu trúc dữ liệu trả về từ API
        if (response && response.data) {
          setThreads(response.data);
          setPagination(response.pagination || {
            page: pagination.page,
            pages: Math.ceil(response.data.length / pagination.limit),
            total: response.data.length,
            limit: pagination.limit
          });
        } else {
          // Trường hợp response không có cấu trúc như mong đợi
          console.error("API response format unexpected:", response);
          setError("Định dạng dữ liệu không đúng");
          showSnackbar("Định dạng dữ liệu không đúng", "error");
        }
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        showSnackbar(err.message || "Đã xảy ra lỗi khi tải dữ liệu", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [pagination.page, pagination.limit]);

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
    navigate(`/forum/thread/${threadId}`);
  };
  
  // Xử lý thay đổi trang
  const handlePageChange = (event, value) => {
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
    // Thêm thread mới vào đầu danh sách
    setThreads([newThread, ...threads]);
    showSnackbar("Bài viết đã được tạo thành công!", "success");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Snackbar hiển thị thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Vùng hiển thị danh sách bài viết - chiếm 8/12 ở màn hình lớn */}
        <Grid item xs={12} md={8} mt={4}>
          {/* Hiển thị loading indicator khi đang fetch data */}
          {loading && threads.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress color="primary" />
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