// components/VipFeatures.js
import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';
import { Star, TrendingUp, Palette, Schedule } from '@mui/icons-material';

const VipFeatures = () => {
  const vipFeatures = [
    {
      icon: <TrendingUp sx={{ color: '#ff9800' }} />,
      title: '🔝 Ưu Tiên Hiển Thị',
      features: [
        'Luôn xuất hiện ở TOP đầu trang trong kết quả tìm kiếm',
        'Hiển thị trước tất cả tin thường trong cùng khu vực', 
        'Sticky position - luôn nổi bật so với tin khác'
      ]
    },
    {
      icon: <Palette sx={{ color: '#e91e63' }} />,
      title: '🎨 Giao Diện Đặc Biệt',
      features: [
        'Khung viền màu vàng/cam nổi bật',
        'Badge "VIP" hoặc "Nổi bật" góc tin đăng',
        'Font chữ đậm cho tiêu đề',
        'Background khác biệt làm nổi bật tin'
      ]
    },
    {
      icon: <Star sx={{ color: '#4caf50' }} />,
      title: '📈 Tăng Hiệu Suất',
      features: [
        'Tăng 300-500% lượt xem so với tin thường',
        'Tỷ lệ liên hệ cao hơn đáng kể',
        'Thu hút khách hàng chất lượng'
      ]
    },
    {
      icon: <Schedule sx={{ color: '#2196f3' }} />,
      title: '⏰ Thời Gian Hiển Thị Ưu Tiên',
      features: [
        'Refresh tự động lên đầu trang mỗi ngày',
        'Hiển thị lâu hơn trong timeline',
        'Không bị đẩy xuống bởi tin đăng mới'
      ]
    }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
        ⭐ Tính Năng Tin VIP
      </Typography>
      <Typography variant="h6" textAlign="center" color="text.secondary" mb={4}>
        Nâng tầm tin đăng của bạn với những ưu thế vượt trội
      </Typography>
      
      <Grid container spacing={3}>
        {vipFeatures.map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  {category.icon}
                  <Typography variant="h6" fontWeight="bold" ml={1}>
                    {category.title}
                  </Typography>
                </Box>
                
                {category.features.map((feature, idx) => (
                  <Box key={idx} display="flex" alignItems="flex-start" mb={1}>
                    <Typography variant="body2" color="success.main" mr={1}>
                      ✓
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Hiệu quả thực tế */}
      <Box mt={4} textAlign="center">
        <Card sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#fff3e0', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="#ef6c00" gutterBottom>
              📊 Hiệu Quả Thực Tế
            </Typography>
            
            <Grid container spacing={2} mt={1}>
              <Grid item xs={4}>
                <Chip 
                  label="300-500% lượt xem" 
                  color="warning" 
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
              <Grid item xs={4}>
                <Chip 
                  label="TOP hiển thị" 
                  color="success" 
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
              <Grid item xs={4}>
                <Chip 
                  label="Refresh hàng ngày" 
                  color="info" 
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default VipFeatures;