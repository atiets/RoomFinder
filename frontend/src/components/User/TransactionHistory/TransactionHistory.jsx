import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

const TransactionHistory = () => {
  // Mock data cho lịch sử giao dịch
  const [transactions] = useState([
    {
      id: 'TXN_202406_001',
      packageType: 'plus',
      packageName: 'Gói Plus',
      amount: 499000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'momo',
      transactionDate: '2024-06-15T10:30:00Z',
      expiryDate: '2024-07-15T23:59:59Z',
      description: 'Nâng cấp gói Plus - 30 ngày',
      invoiceNumber: 'INV-2024-06-001',
      features: [
        'Tin đăng không giới hạn',
        'Tin VIP không giới hạn',
        'Xem SĐT ấn tức thì',
        'Duyệt tin 4h',
        'Hỗ trợ VIP ưu tiên',
        'Thêm logo thương hiệu'
      ]
    },
    {
      id: 'TXN_202405_001',
      packageType: 'pro',
      packageName: 'Gói Pro',
      amount: 199000,
      currency: 'VND',
      status: 'completed',
      paymentMethod: 'banking',
      transactionDate: '2024-05-10T14:20:00Z',
      expiryDate: '2024-06-10T23:59:59Z',
      description: 'Nâng cấp gói Pro - 30 ngày',
      invoiceNumber: 'INV-2024-05-001',
      features: [
        'Tin đăng không giới hạn',
        'Tin VIP 5 tin',
        'Xem SĐT có điều kiện',
        'Duyệt tin 24h',
        'Hỗ trợ VIP ưu tiên'
      ]
    },
    {
      id: 'TXN_202404_001',
      packageType: 'pro',
      packageName: 'Gói Pro',
      amount: 199000,
      currency: 'VND',
      status: 'failed',
      paymentMethod: 'vnpay',
      transactionDate: '2024-04-25T09:15:00Z',
      expiryDate: null,
      description: 'Nâng cấp gói Pro - 30 ngày (Giao dịch thất bại)',
      invoiceNumber: null,
      features: []
    }
  ]);

  // Hàm format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm lấy màu theo loại gói
  const getPackageColor = (packageType) => {
    switch (packageType) {
      case 'pro':
        return '#81C784'; // Xanh lá pastel
      case 'plus':
        return '#FFB74D'; // Cam pastel
      default:
        return '#90A4AE'; // Xám
    }
  };

  // Hàm lấy icon theo trạng thái
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#81C784' }} />;
      case 'pending':
        return <ScheduleIcon sx={{ color: '#FFB74D' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#E57373' }} />;
      default:
        return <ScheduleIcon sx={{ color: '#90A4AE' }} />;
    }
  };

  // Hàm lấy tên trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  // Hàm lấy icon phương thức thanh toán
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'momo':
        return '📱';
      case 'banking':
        return '🏦';
      case 'vnpay':
        return '💳';
      default:
        return '💰';
    }
  };

  // Hàm lấy tên phương thức thanh toán
  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'momo':
        return 'Ví MoMo';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      case 'vnpay':
        return 'VNPay';
      default:
        return 'Khác';
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fffe', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          color: '#2E7D32',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          💳 Lịch sử giao dịch
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
          Quản lý và theo dõi các giao dịch nâng cấp gói dịch vụ của bạn
        </Typography>

        {/* Thống kê tổng quan */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: '#E8F5E8', 
              border: '1px solid #81C784',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                  Tổng giao dịch
                </Typography>
                <Typography variant="h4" sx={{ color: '#1B5E20', fontWeight: 'bold' }}>
                  {transactions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: '#FFF3E0', 
              border: '1px solid #FFB74D',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#F57C00', fontWeight: 'bold' }}>
                  Thành công
                </Typography>
                <Typography variant="h4" sx={{ color: '#E65100', fontWeight: 'bold' }}>
                  {transactions.filter(t => t.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: '#E8F5E8', 
              border: '1px solid #81C784',
              borderRadius: 2
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                  Tổng chi tiêu
                </Typography>
                <Typography variant="h4" sx={{ color: '#1B5E20', fontWeight: 'bold' }}>
                  {formatCurrency(transactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + t.amount, 0))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Danh sách giao dịch */}
      <Box>
        {transactions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1">
              Bạn chưa có giao dịch nào. Hãy nâng cấp gói để sử dụng nhiều tính năng hơn!
            </Typography>
          </Alert>
        ) : (
          transactions.map((transaction) => (
            <Accordion 
              key={transaction.id}
              sx={{ 
                mb: 2, 
                borderRadius: '12px !important',
                border: `2px solid ${getPackageColor(transaction.packageType)}`,
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: transaction.status === 'completed' 
                    ? `${getPackageColor(transaction.packageType)}15`
                    : '#f5f5f5',
                  borderRadius: '12px 12px 0 0',
                  minHeight: '80px !important'
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={1}>
                    <Avatar sx={{ 
                      bgcolor: getPackageColor(transaction.packageType),
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem'
                    }}>
                      {transaction.packageType === 'pro' ? '⭐' : 
                       transaction.packageType === 'plus' ? '🔥' : '📦'}
                    </Avatar>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      color: getPackageColor(transaction.packageType)
                    }}>
                      {transaction.packageName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {transaction.description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      color: '#1B5E20'
                    }}>
                      {formatCurrency(transaction.amount)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {getPaymentIcon(transaction.paymentMethod)} {getPaymentMethodText(transaction.paymentMethod)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatDate(transaction.transactionDate)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Chip 
                      icon={getStatusIcon(transaction.status)}
                      label={getStatusText(transaction.status)}
                      sx={{
                        bgcolor: transaction.status === 'completed' 
                          ? '#E8F5E8' 
                          : transaction.status === 'failed' 
                            ? '#FFEBEE' 
                            : '#FFF3E0',
                        color: transaction.status === 'completed' 
                          ? '#2E7D32' 
                          : transaction.status === 'failed' 
                            ? '#C62828' 
                            : '#F57C00',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={1}>
                      {transaction.status === 'completed' && (
                        <IconButton 
                          size="small" 
                          sx={{ 
                            bgcolor: '#E8F5E8',
                            color: '#2E7D32',
                            '&:hover': { bgcolor: '#C8E6C8' }
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                      {transaction.status === 'failed' && (
                        <IconButton 
                          size="small"
                          sx={{ 
                            bgcolor: '#FFF3E0',
                            color: '#F57C00',
                            '&:hover': { bgcolor: '#FFE0B2' }
                          }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                  {/* Thông tin chi tiết */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f8fffe', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        color: '#2E7D32'
                      }}>
                        📋 Thông tin giao dịch
                      </Typography>
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Mã giao dịch:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {transaction.id}
                          </Typography>
                        </Box>
                        
                        {transaction.invoiceNumber && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Mã hóa đơn:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {transaction.invoiceNumber}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Ngày giao dịch:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatDate(transaction.transactionDate)}
                          </Typography>
                        </Box>
                        
                        {transaction.expiryDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Ngày hết hạn:
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 'bold',
                              color: new Date(transaction.expiryDate) > new Date() 
                                ? '#2E7D32' : '#D32F2F'
                            }}>
                              {formatDate(transaction.expiryDate)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Tính năng gói */}
                  {transaction.features.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, bgcolor: '#f8fffe', borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold', 
                          mb: 2,
                          color: getPackageColor(transaction.packageType)
                        }}>
                          ✨ Tính năng đã mua
                        </Typography>
                        
                        <Stack spacing={1}>
                          {transaction.features.map((feature, index) => (
                            <Box key={index} sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <CheckCircleIcon sx={{ 
                                color: getPackageColor(transaction.packageType),
                                fontSize: 16
                              }} />
                              <Typography variant="body2">
                                {feature}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  )}

                  {/* Actions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      {transaction.status === 'completed' && (
                        <>
                          <Button
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            sx={{
                              borderColor: '#81C784',
                              color: '#2E7D32',
                              '&:hover': {
                                borderColor: '#66BB6A',
                                bgcolor: '#E8F5E8'
                              }
                            }}
                          >
                            Xem hóa đơn
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            sx={{
                              borderColor: '#81C784',
                              color: '#2E7D32',
                              '&:hover': {
                                borderColor: '#66BB6A',
                                bgcolor: '#E8F5E8'
                              }
                            }}
                          >
                            Tải xuống
                          </Button>
                        </>
                      )}
                      
                      {transaction.status === 'failed' && (
                        <Button
                          variant="contained"
                          startIcon={<RefreshIcon />}
                          sx={{
                            bgcolor: '#FFB74D',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: '#FF9800'
                            }
                          }}
                        >
                          Thử lại
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Nút nâng cấp */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: '#81C784',
            color: '#fff',
            py: 1.5,
            px: 4,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#66BB6A'
            }
          }}
        >
          🚀 Nâng cấp gói mới
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionHistory;