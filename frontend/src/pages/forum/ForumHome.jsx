// src/pages/forum/ForumHome.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Typography,
  Grid // Thêm Grid import
} from '@mui/material';
import ForumHeader from '../../components/User/forum/ForumHeader';
// import ForumFilters from '../../components/User/forum/ForumFilters';
import ThreadList from '../../components/User/forum/ThreadList';
import CreateThreadButton from '../../components/User/forum/CreateThreadButton';

// Mock data cho UI demo với thêm trường hình ảnh
const MOCK_THREADS = [
  {
    id: '1',
    title: 'Kinh nghiệm tìm phòng trọ khu vực Cầu Giấy, Hà Nội',
    content: 'Xin chào mọi người, mình mới chuyển công tác ra Hà Nội và đang tìm phòng trọ khu vực Cầu Giấy. Mình có một số kinh nghiệm muốn chia sẻ với các bạn sau 2 tuần tìm kiếm: 1. Nên tìm trọ vào đầu tháng vì sẽ có nhiều phòng trống hơn. 2. Khu vực Dịch Vọng, Quan Hoa có nhiều phòng đẹp nhưng giá hơi cao. 3. Nhớ kiểm tra kỹ điều kiện cơ sở vật chất và đặc biệt là nguồn nước.',
    author: {
      id: 'user1',
      name: 'Nguyễn Văn A',
      avatar: ''
    },
    createdAt: '2023-11-10T08:30:00Z',
    tags: ['Phòng trọ', 'Hà Nội', 'Kinh nghiệm', 'Cầu Giấy'],
    likes: 24,
    comments: 15,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&w=1000&q=80'
  },
  {
    id: '2',
    title: 'Tìm bạn ở ghép quận 7, Thành phố Hồ Chí Minh',
    content: 'Mình đang cần tìm 1 bạn nữ ở ghép tại căn hộ 2PN khu vực Phú Mỹ Hưng. Căn hộ có đầy đủ nội thất, giá 3tr5/tháng/người (đã bao gồm phí quản lý và điện nước). Yêu cầu: sạch sẽ, không hút thuốc, không nuôi thú cưng. Bạn nào quan tâm có thể liên hệ mình qua tin nhắn nhé!',
    author: {
      id: 'user2',
      name: 'Trần Thị B',
      avatar: ''
    },
    createdAt: '2023-11-09T14:20:00Z',
    tags: ['Ở ghép', 'HCM', 'Quận 7', 'Nữ'],
    likes: 18,
    comments: 27,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50JTIwcm9vbXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80'
  },
  {
    id: '3',
    title: 'Review khu trọ sinh viên gần Đại học Bách Khoa Hà Nội',
    content: 'Sau 2 năm sống tại khu trọ sinh viên Bách Khoa Town, mình muốn chia sẻ đôi điều về ưu nhược điểm của khu trọ này cho các bạn sinh viên đang có ý định thuê trọ khu vực này. Ưu điểm: gần trường, an ninh tốt, có nhiều tiện ích. Nhược điểm: hơi ồn vào cuối tuần, thỉnh thoảng bị cúp nước.',
    author: {
      id: 'user3',
      name: 'Lê Văn C',
      avatar: ''
    },
    createdAt: '2023-11-08T09:45:00Z',
    tags: ['Review', 'Khu trọ', 'Sinh viên', 'Bách Khoa'],
    likes: 56,
    comments: 32,
    // This thread doesn't have an image
  },
  {
    id: '4',
    title: 'Hỏi về thủ tục làm hợp đồng thuê nhà',
    content: 'Các bạn cho mình hỏi, khi thuê nhà thì những điều khoản nào cần chú ý trong hợp đồng? Mình sắp ký hợp đồng thuê nhà lần đầu nên còn khá bỡ ngỡ và lo lắng. Mình cũng không rõ về các loại phí và đặt cọc thế nào cho hợp lý. Mong nhận được chia sẻ từ mọi người!',
    author: {
      id: 'user4',
      name: 'Phạm Thị D',
      avatar: ''
    },
    createdAt: '2023-11-07T16:10:00Z',
    tags: ['Hợp đồng', 'Thủ tục', 'Hỏi đáp'],
    likes: 12,
    comments: 20,
    // This thread doesn't have an image
  },
  {
    id: '5',
    title: 'Mẹo tiết kiệm điện nước khi thuê trọ mùa hè',
    content: 'Mùa hè đến rồi, tiền điện tăng cao do sử dụng điều hòa. Mình xin chia sẻ một số mẹo giúp tiết kiệm điện nước mà mình đã áp dụng trong 3 năm qua, giúp giảm được khoảng 25-30% chi phí. Bí quyết: đặt điều hoà ở 26-27 độ, sử dụng quạt phụ trợ, tắt đèn khi không dùng, và sử dụng thời gian giặt đồ hợp lý.',
    author: {
      id: 'user5',
      name: 'Hoàng Văn E',
      avatar: ''
    },
    createdAt: '2023-11-06T11:25:00Z',
    tags: ['Mẹo vặt', 'Tiết kiệm', 'Điện nước'],
    likes: 87,
    comments: 45,
    image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFpcmNvbiUyMHJvb218ZW58MHx8MHx8fDA%3D&w=1000&q=80'
  }
];

const ForumHome = () => {
  const [filter, setFilter] = useState('newest');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Mock user data
  const currentUser = {
    name: "Tuyet Nguyen",
    avatar: ""
  };
  
  // Giả lập dữ liệu thread đã filter
  const filteredThreads = [...MOCK_THREADS].sort((a, b) => {
    if (filter === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else { // popular
      return b.likes - a.likes;
    }
  });
  
  // const handleFilterChange = (newFilter) => {
  //   setFilter(newFilter);
  //   setPage(1);
  // };
  
  const handleThreadClick = (threadId) => {
    console.log(`Navigate to thread: ${threadId}`);
    // Trong thực tế, sẽ dùng router để navigate đến trang thread chi tiết
    // navigate(`/forum/thread/${threadId}`);
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    // Giả lập loading khi chuyển trang
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  const handleCreateThread = () => {
    setCreateDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Vùng hiển thị danh sách bài viết - chiếm 8/12 ở màn hình lớn */}
        <Grid item xs={12} md={8} mt ={4}>
          <ThreadList 
            threads={filteredThreads}
            loading={loading}
            onThreadClick={handleThreadClick}
            page={page}
            totalPages={3} // Giả lập có 3 trang
            onPageChange={handlePageChange}
          />
          
          {/* Nút tạo bài viết nổi ở góc dưới chỉ hiển thị trên mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <CreateThreadButton onClick={handleCreateThread} />
          </Box>
        </Grid>
        
        {/* Vùng sidebar bên phải - chiếm 4/12 ở màn hình lớn */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mt: 4 }}> {/* Thêm margin-top 40px cho header */}
            <ForumHeader 
              onCreateThread={handleCreateThread}
              user={currentUser}
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Dialog giả lập tạo thread - sẽ được thay thế bằng component thực tế sau */}
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