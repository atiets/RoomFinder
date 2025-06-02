import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Card,
    CardContent,
    Divider,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import {
    Payment,
    AccountBalance,
    QrCode,
    CreditCard
} from '@mui/icons-material';

const PaymentDialog = ({ 
    open, 
    onClose, 
    subscription, 
    onConfirmPayment, 
    loading = false 
}) => {
    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [error, setError] = useState('');

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
        setError('');
    };

    const handleConfirm = async () => {
        if (!paymentMethod) {
            setError('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            await onConfirmPayment({
                subscriptionId: subscription._id,
                paymentMethod: paymentMethod
            });
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo đơn thanh toán');
        }
    };

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
            available: true
        },
        {
            value: 'vnpay',
            label: 'VNPay',
            icon: <CreditCard />,
            description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
            available: true
        },
        {
            value: 'zalopay',
            label: 'ZaloPay',
            icon: <QrCode />,
            description: 'Thanh toán qua ví ZaloPay',
            available: false
        },
        {
            value: 'bank_transfer',
            label: 'Chuyển khoản ngân hàng',
            icon: <AccountBalance />,
            description: 'Chuyển khoản trực tiếp qua ngân hàng',
            available: false
        }
    ];

    if (!subscription) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                    Xác nhận thanh toán
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Hoàn tất thanh toán để nâng cấp gói dịch vụ
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {/* Thông tin gói */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                {subscription.displayName}
                            </Typography>
                            <Chip 
                                label={`${subscription.duration} ngày`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {subscription.displayName.split(' - ')[1]}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                                Tổng thanh toán:
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                {formatPrice(subscription.price)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Phương thức thanh toán */}
                <Box mb={3}>
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend" sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Chọn phương thức thanh toán
                            </Typography>
                        </FormLabel>
                        
                        <RadioGroup
                            value={paymentMethod}
                            onChange={handlePaymentMethodChange}
                        >
                            {paymentMethods.map((method) => (
                                <Card 
                                    key={method.value}
                                    variant="outlined"
                                    sx={{ 
                                        mb: 1,
                                        opacity: method.available ? 1 : 0.5,
                                        '&:hover': method.available ? {
                                            backgroundColor: 'action.hover'
                                        } : {}
                                    }}
                                >
                                    <FormControlLabel
                                        value={method.value}
                                        disabled={!method.available}
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center" py={1} width="100%">
                                                <Box sx={{ mr: 2, color: 'primary.main' }}>
                                                    {method.icon}
                                                </Box>
                                                <Box flexGrow={1}>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {method.label}
                                                        {!method.available && (
                                                            <Chip 
                                                                label="Sắp có"
                                                                size="small"
                                                                sx={{ ml: 1 }}
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
                    </FormControl>
                </Box>

                {/* Lưu ý */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Lưu ý:</strong> Sau khi thanh toán thành công, gói dịch vụ sẽ được kích hoạt ngay lập tức. 
                        Bạn sẽ nhận được email xác nhận và có thể sử dụng đầy đủ các tính năng của gói đã chọn.
                    </Typography>
                </Alert>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading}
                    size="large"
                >
                    Hủy
                </Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={loading || !paymentMethod}
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                    sx={{ minWidth: 150 }}
                >
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentDialog;
