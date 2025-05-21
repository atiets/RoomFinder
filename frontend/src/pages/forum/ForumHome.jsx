// src/pages/forum/ForumHome.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [pagination.page, pagination.limit]);

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
  
  // Đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Snackbar hiển thị lỗi nếu có */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
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
      
      {/* Dialog tạo thread mới */}
      <Dialog 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#C1E1C1',
          color: '#2E7D32'
        }}>
          Tạo bài viết mới
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Tại đây sẽ là form tạo bài viết mới.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Component này sẽ được xây dựng chi tiết trong giai đoạn tiếp theo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setCreateDialogOpen(false)}
            sx={{ 
              borderRadius: '20px',
              bgcolor: '#2E7D32',
              '&:hover': {
                bgcolor: '#1B5E20',
              }
            }}
          >
            Đăng bài
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ForumHome;