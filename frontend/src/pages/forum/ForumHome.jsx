// src/pages/forum/ForumHome.jsx
import React, { useState } from 'react';
import { Container, Box, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import ForumHeader from '../../components/User/forum/ForumHeader';
// import ForumFilters from '../../components/User/forum/ForumFilters';
import ThreadList from '../../components/User/forum/ThreadList';
import CreateThreadButton from '../../components/User/forum/CreateThreadButton';

// Mock data cho UI demo
const MOCK_THREADS = [
  {
    id: '1',
    title: 'Kinh nghiệm tìm phòng trọ khu vực Cầu Giấy, Hà Nội',
    content: 'Xin chào mọi người, mình mới chuyển công tác ra Hà Nội và đang tìm phòng trọ khu vực Cầu Giấy. Mình có một số kinh nghiệm muốn chia sẻ với các bạn sau 2 tuần tìm kiếm...',
    author: {
      id: 'user1',
      name: 'Nguyễn Văn A',
      avatar: ''
    },
    createdAt: '2023-11-10T08:30:00Z',
    tags: ['Phòng trọ', 'Hà Nội', 'Kinh nghiệm', 'Cầu Giấy'],
    likes: 24,
    dislikes: 2,
    comments: 15,
    views: 142
  },
  {
    id: '2',
    title: 'Tìm bạn ở ghép quận 7, Thành phố Hồ Chí Minh',
    content: 'Mình đang cần tìm 1 bạn nữ ở ghép tại căn hộ 2PN khu vực Phú Mỹ Hưng. Căn hộ có đầy đủ nội thất, giá 3tr5/tháng/người (đã bao gồm phí quản lý và điện nước). Yêu cầu: sạch sẽ, không hút thuốc, không nuôi thú cưng.',
    author: {
      id: 'user2',
      name: 'Trần Thị B',
      avatar: ''
    },
    createdAt: '2023-11-09T14:20:00Z',
    tags: ['Ở ghép', 'HCM', 'Quận 7', 'Nữ'],
    likes: 18,
    dislikes: 0,
    comments: 27,
    views: 231
  },
  {
    id: '3',
    title: 'Review khu trọ sinh viên gần Đại học Bách Khoa Hà Nội',
    content: 'Sau 2 năm sống tại khu trọ sinh viên Bách Khoa Town, mình muốn chia sẻ đôi điều về ưu nhược điểm của khu trọ này cho các bạn sinh viên đang có ý định thuê trọ khu vực này...',
    author: {
      id: 'user3',
      name: 'Lê Văn C',
      avatar: ''
    },
    createdAt: '2023-11-08T09:45:00Z',
    tags: ['Review', 'Khu trọ', 'Sinh viên', 'Bách Khoa'],
    likes: 56,
    dislikes: 4,
    comments: 32,
    views: 412
  },
  {
    id: '4',
    title: 'Hỏi về thủ tục làm hợp đồng thuê nhà',
    content: 'Các bạn cho mình hỏi, khi thuê nhà thì những điều khoản nào cần chú ý trong hợp đồng? Mình sắp ký hợp đồng thuê nhà lần đầu nên còn khá bỡ ngỡ và lo lắng...',
    author: {
      id: 'user4',
      name: 'Phạm Thị D',
      avatar: ''
    },
    createdAt: '2023-11-07T16:10:00Z',
    tags: ['Hợp đồng', 'Thủ tục', 'Hỏi đáp'],
    likes: 12,
    dislikes: 0,
    comments: 20,
    views: 186
  },
  {
    id: '5',
    title: 'Mẹo tiết kiệm điện nước khi thuê trọ mùa hè',
    content: 'Mùa hè đến rồi, tiền điện tăng cao do sử dụng điều hòa. Mình xin chia sẻ một số mẹo giúp tiết kiệm điện nước mà mình đã áp dụng trong 3 năm qua, giúp giảm được khoảng 25-30% chi phí...',
    author: {
      id: 'user5',
      name: 'Hoàng Văn E',
      avatar: ''
    },
    createdAt: '2023-11-06T11:25:00Z',
    tags: ['Mẹo vặt', 'Tiết kiệm', 'Điện nước'],
    likes: 87,
    dislikes: 1,
    comments: 45,
    views: 523
  }
];

const ForumHome = () => {
  const [filter, setFilter] = useState('newest');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
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
  
//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//   };
  
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
    <Container maxWidth="md" sx={{ py: 4, mt: 5 }}>
      <ForumHeader onCreateThread={handleCreateThread} />
      
      {/* <ForumFilters 
        currentFilter={filter} 
        onFilterChange={handleFilterChange} 
      /> */}
      
      <Divider sx={{ mb: 3 }} />
      
      <ThreadList 
        threads={filteredThreads}
        loading={loading}
        onThreadClick={handleThreadClick}
        page={page}
        totalPages={3} // Giả lập có 3 trang
        onPageChange={handlePageChange}
      />
      
      <CreateThreadButton onClick={handleCreateThread} />
      
      {/* Dialog giả lập tạo thread - sẽ được thay thế bằng component thực tế sau */}
      <Dialog 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo bài viết mới</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <p>Tại đây sẽ là form tạo bài viết mới.</p>
            <p>Component này sẽ được xây dựng chi tiết trong giai đoạn tiếp theo.</p>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
            Đăng bài
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ForumHome;
