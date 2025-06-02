import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Box,
    Typography,
    Divider,
    Grid,
    Button,
    Card,
    CardContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    Alert,
    CircularProgress,
    Container,
    Chip
} from "@mui/material";
import {
    Payment,
    AccountBalance,
    QrCode,
    CreditCard,
    ArrowBack
} from '@mui/icons-material';
import { createPayment } from '../../redux/paymentService';

const PaymentPage = () => {
    const currentUser = useSelector((state) => state.auth?.login?.currentUser);
    const accessToken = currentUser?.accessToken;
    const navigate = useNavigate();
    const [params] = useSearchParams();
    
    // Lấy thông tin từ URL params
    const subscriptionId = params.get("subscriptionId");
    const title = params.get("title");
    const duration = params.get("duration") || "30 ngày";
    const price = Number(params.get("price")) || 0;
    const displayName = params.get("displayName");
    const features = params.get("features")?.split(",") || [];

    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Kiểm tra xem user có quyền truy cập không
    useEffect(() => {
        if (!currentUser || !accessToken) {
            navigate('/login');
            return;
        }
        
        if (!subscriptionId || !title || !price) {
            navigate('/subscription');
            return;
        }
    }, [currentUser, accessToken, subscriptionId, title, price, navigate]);

    const taxRate = 0.08;
    const tax = price * taxRate;
    const total = price + tax;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const paymentMethods = [
        {
            value: 'momo',
            label: 'Ví MoMo',
            icon: <Payment />,
            description: 'Thanh toán qua ví điện tử MoMo',
            available: true,
            image: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png'
        },
        {
            value: 'vnpay',
            label: 'VNPay',
            icon: <CreditCard />,
            description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
            available: true,
            image: 'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg'
        },
        {
            value: 'bank_transfer',
            label: 'Chuyển khoản ngân hàng',
            icon: <AccountBalance />,
            description: 'Chuyển khoản trực tiếp qua ngân hàng',
            available: true,
            image: 'https://img.icons8.com/color/48/000000/bank-building.png'
        },
        {
            value: 'zalopay',
            label: 'ZaloPay',
            icon: <QrCode />,
            description: 'Thanh toán qua ví ZaloPay',
            available: false,
            image: 'https://static.chotot.com/storage/CT_WEB_UNI_PAYMENT_DASHBOARD/fd1a518195b786bf2b400842413324cd3059c5da/dist/cf5b4dd0bc1a29f352aad9aa476dffad.png'
        }
    ];

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setError('');
    };

    const handleConfirmPayment = async () => {
        if (!paymentMethod) {
            setError('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const paymentData = {
                subscriptionId: subscriptionId,
                paymentMethod: paymentMethod
            };

            console.log('🔄 Processing payment:', paymentData);

            const response = await createPayment(paymentData, accessToken);
            const { paymentUrl } = response.data.data;

            if (paymentUrl) {
                // Chuyển hướng đến trang thanh toán
                window.location.href = paymentUrl;
            } else {
                throw new Error('Không thể tạo link thanh toán');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Có lỗi xảy ra khi tạo đơn thanh toán');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || !accessToken) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Đang kiểm tra quyền truy cập...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4, mt: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/subscription')}
                    sx={{ mb: 2, color: '#4caf50' }}
                >
                    Quay lại chọn gói
                </Button>
                
                <Typography
                    variant="h3"
                    fontWeight={700}
                    align="center"
                    gutterBottom
                    sx={{ color: "#2e7d32" }}
                >
                    🧾 Trang Thanh Toán
                </Typography>

                <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Vui lòng kiểm tra kỹ thông tin trước khi tiến hành thanh toán.
                </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Thông tin gói */}
            <Card sx={{ mb: 4 }} elevation={3}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        {/* Hình ảnh gói tin */}
                        <Grid item xs={12} md={4}>
                            <Box
                                component="img"
                                src="https://i.pinimg.com/736x/10/e3/1e/10e31ee7d4137394ff07d67d9477d2ef.jpg"
                                alt={title}
                                sx={{ 
                                    width: "100%", 
                                    maxWidth: 200,
                                    borderRadius: 2,
                                    mx: 'auto',
                                    display: 'block'
                                }}
                            />
                        </Grid>

                        {/* Thông tin gói tin */}
                        <Grid item xs={12} md={8}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Typography variant="h5" fontWeight={700}>
                                    {title}
                                </Typography>
                                <Chip 
                                    label={duration}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {displayName}
                            </Typography>

                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="body1">
                                    Thời gian sử dụng: <strong>{duration}</strong>
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color="#4caf50">
                                    {formatPrice(price)}
                                </Typography>
                            </Box>

                            {features?.length > 0 && (
                                <Box>
                                    <Typography variant="body1" fontWeight={600} gutterBottom>
                                        Tính năng nổi bật:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {features.slice(0, 4).map((feature, index) => (
                                            <Chip 
                                                key={index}
                                                label={feature}
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                            />
                                        ))}
                                        {features.length > 4 && (
                                            <Chip 
                                                label={`+${features.length - 4} tính năng khác`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    {/* Tổng kết giá trị */}
                    <Box
                        sx={{
                            backgroundColor: "#f8f9fa",
                            border: "2px solid #e9ecef",
                            borderRadius: 2,
                            p: 3,
                            mt: 3,
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body1">Giá gói dịch vụ:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">{formatPrice(price)}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body1">Thuế VAT (8%):</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">{formatPrice(tax)}</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="h6" fontWeight={700}>Tổng thanh toán:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight={700} color="#ff9800">
                                    {formatPrice(total)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>

            {/* Chọn phương thức thanh toán */}
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        💳 Chọn phương thức thanh toán
                    </Typography>

                    <RadioGroup 
                        value={paymentMethod} 
                        onChange={handlePaymentMethodChange}
                    >
                        {paymentMethods.map((method) => (
                            <Card 
                                key={method.value}
                                variant="outlined"
                                sx={{ 
                                    mb: 2,
                                    opacity: method.available ? 1 : 0.6,
                                    cursor: method.available ? 'pointer' : 'not-allowed',
                                    '&:hover': method.available ? {
                                        backgroundColor: 'action.hover'
                                    } : {},
                                    border: paymentMethod === method.value ? '2px solid #4caf50' : '1px solid #e0e0e0'
                                }}
                            >
                                <FormControlLabel
                                    value={method.value}
                                    disabled={!method.available}
                                    control={<Radio />}
                                    label={
                                        <Box display="flex" alignItems="center" py={2} width="100%">
                                            <Box sx={{ mr: 3 }}>
                                                <img 
                                                    src={method.image}
                                                    alt={method.label}
                                                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                                                />
                                            </Box>
                                            <Box flexGrow={1}>
                                                <Typography variant="h6" fontWeight="medium">
                                                    {method.label}
                                                    {!method.available && (
                                                        <Chip 
                                                            label="Sắp có"
                                                            size="small"
                                                            sx={{ ml: 2 }}
                                                            color="warning"
                                                        />
                                                    )}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {method.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                    sx={{ 
                                        margin: 0,
                                        padding: 2,
                                        width: '100%',
                                        borderRadius: 1
                                    }}
                                />
                            </Card>
                        ))}
                    </RadioGroup>

                    {/* Lưu ý thanh toán */}
                    <Alert severity="info" sx={{ mt: 3, mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Lưu ý:</strong> Sau khi thanh toán thành công, gói dịch vụ sẽ được kích hoạt ngay lập tức. 
                            Bạn sẽ nhận được email xác nhận và có thể sử dụng đầy đủ các tính năng của gói đã chọn.
                        </Typography>
                    </Alert>

                    {/* Nút thanh toán */}
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading || !paymentMethod}
                        onClick={handleConfirmPayment}
                        startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                        sx={{ 
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #4caf50 30%, #ff9800 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #388e3c 30%, #f57c00 90%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                            },
                            '&:disabled': {
                                background: '#bdbdbd'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? 'ĐANG XỬ LÝ...' : `THANH TOÁN NGAY – ${formatPrice(total)}`}
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PaymentPage;
