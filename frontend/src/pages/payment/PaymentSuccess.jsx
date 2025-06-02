import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    Home,
    Receipt
} from '@mui/icons-material';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const resultCode = params.get('resultCode');

    useEffect(() => {
        // Có thể gọi API để verify payment status
        if (resultCode === '0') {
            // Payment successful
            console.log('Payment successful');
        }
    }, [resultCode]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card elevation={4} sx={{ textAlign: 'center', borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <CheckCircle 
                        sx={{ 
                            fontSize: 80, 
                            color: '#4caf50',
                            mb: 2
                        }} 
                    />
                    
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#4caf50' }}>
                        Thanh toán thành công!
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Gói dịch vụ của bạn đã được kích hoạt thành công. 
                        Bạn có thể bắt đầu sử dụng các tính năng mới ngay bây giờ.
                    </Typography>

                    {orderId && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                Mã đơn hàng: <strong>{orderId}</strong>
                            </Typography>
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<Home />}
                            onClick={() => navigate('/')}
                            sx={{ 
                                background: '#4caf50',
                                '&:hover': { background: '#388e3c' }
                            }}
                        >
                            Về trang chủ
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<Receipt />}
                            onClick={() => navigate('/subscription')}
                            sx={{ 
                                borderColor: '#4caf50',
                                color: '#4caf50',
                                '&:hover': { 
                                    borderColor: '#388e3c',
                                    color: '#388e3c'
                                }
                            }}
                        >
                            Xem gói dịch vụ
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PaymentSuccess;
