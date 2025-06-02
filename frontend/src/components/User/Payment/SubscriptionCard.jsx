import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Grid
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Star,
    TrendingUp,
    Phone,
    Support,
    Analytics,
    Business,
    FlashOn
} from '@mui/icons-material';
import './SubscriptionCard.css';

const SubscriptionCard = ({ 
    subscription, 
    currentSubscription, 
    onSelectPlan, 
    loading = false 
}) => {
    const {
        _id,
        name,
        displayName,
        price,
        duration,
        features,
        isActive
    } = subscription;

    const isCurrentPlan = currentSubscription?.subscriptionId?._id === _id;
    const isFree = name === 'free';
    const isPro = name === 'pro';
    const isPlus = name === 'plus';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getFeatureIcon = (featureName) => {
        const iconMap = {
            maxPosts: <TrendingUp />,
            vipPosts: <Star />,
            canViewHiddenPhone: <Phone />,
            prioritySupport: <Support />,
            analytics: <Analytics />,
            customBranding: <Business />,
            fastApproval: <FlashOn />
        };
        return iconMap[featureName] || <CheckCircle />;
    };

    // Tạo danh sách tính năng quan trọng (rút gọn)
    const getKeyFeatures = () => {
        const keyFeatures = [
            {
                label: 'Tin đăng/tháng',
                value: features.maxPosts === -1 ? 'Không giới hạn' : features.maxPosts,
                icon: <TrendingUp />,
                available: true
            },
            {
                label: 'Tin VIP',
                value: features.vipPosts === -1 ? 'Không giới hạn' : features.vipPosts || 'Không',
                icon: <Star />,
                available: features.vipPosts > 0 || features.vipPosts === -1
            },
            {
                label: 'Xem SĐT ẩn',
                value: features.canViewHiddenPhone ? 'Có' : 'Không',
                icon: <Phone />,
                available: features.canViewHiddenPhone
            },
            {
                label: 'Giảm phí cọc',
                value: features.depositFeeDiscount > 0 ? `${features.depositFeeDiscount}%` : 'Không',
                icon: <TrendingUp />,
                available: features.depositFeeDiscount > 0
            },
            {
                label: 'Duyệt tin',
                value: `${features.fastApproval}h`,
                icon: <FlashOn />,
                available: true
            },
            {
                label: 'Hỗ trợ VIP',
                value: features.prioritySupport ? 'Có' : 'Không',
                icon: <Support />,
                available: features.prioritySupport
            }
        ];

        return keyFeatures;
    };

    const renderFeature = (feature) => {
        return (
            <Grid item xs={6} key={feature.label}>
                <Box display="flex" alignItems="center" mb={0.5}>
                    {feature.available ? (
                        React.cloneElement(feature.icon, { 
                            sx: { 
                                fontSize: 16, 
                                color: isFree ? '#4caf50' : 'white',
                                mr: 0.5 
                            } 
                        })
                    ) : (
                        <Cancel sx={{ 
                            fontSize: 16, 
                            color: isFree ? '#bdbdbd' : 'rgba(255,255,255,0.5)',
                            mr: 0.5 
                        }} />
                    )}
                    <Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: isFree ? '#333' : 'white',
                                fontWeight: 'medium',
                                fontSize: '0.7rem',
                                lineHeight: 1.2
                            }}
                        >
                            {feature.label}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: feature.available ? (isFree ? '#4caf50' : 'white') : '#bdbdbd',
                                fontSize: '0.65rem',
                                display: 'block',
                                fontWeight: feature.available ? 'bold' : 'normal'
                            }}
                        >
                            {feature.value}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        );
    };

    const getCardColor = () => {
        if (isPlus) return '#ff9800';
        if (isPro) return '#4caf50';
        return '#f5f5f5';
    };

    return (
        <Card 
            className={`subscription-card subscription-card--${name}`}
            elevation={isCurrentPlan ? 8 : 3}
            sx={{
                height: '550px', // Giảm chiều cao
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 3,
                border: isCurrentPlan ? '3px solid #4caf50' : '1px solid #e0e0e0',
                background: getCardColor(),
                color: isFree ? '#333' : 'white',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
            }}
        >
            {/* Popular Badge */}
            {isPro && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: -30,
                        background: '#2e7d32',
                        color: 'white',
                        padding: '4px 40px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        transform: 'rotate(45deg)',
                        zIndex: 1
                    }}
                >
                    PHỔ BIẾN
                </Box>
            )}

            {isPlus && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: -30,
                        background: '#d84315',
                        color: 'white',
                        padding: '4px 40px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        transform: 'rotate(45deg)',
                        zIndex: 1
                    }}
                >
                    KHUYẾN MÃI
                </Box>
            )}

            {/* Header */}
            <CardContent sx={{ pb: 1, flexGrow: 0 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        fontWeight="bold"
                        sx={{ color: isFree ? '#333' : 'white' }}
                    >
                        {displayName.split(' - ')[0]}
                    </Typography>
                    {isCurrentPlan && (
                        <Chip 
                            label="Đang dùng" 
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                        />
                    )}
                </Box>

                <Typography 
                    variant="body2" 
                    sx={{ 
                        mb: 2, 
                        minHeight: 40,
                        color: isFree ? '#666' : 'rgba(255,255,255,0.9)',
                        fontSize: '0.85rem'
                    }}
                >
                    {displayName.split(' - ')[1]}
                </Typography>

                {/* Price */}
                <Box mb={2} textAlign="center">
                    <Typography 
                        variant="h3" 
                        component="div" 
                        fontWeight="bold" 
                        sx={{ 
                            color: isFree ? '#4caf50' : 'white',
                            fontSize: '2rem'
                        }}
                    >
                        {isFree ? 'Miễn phí' : formatPrice(price)}
                    </Typography>
                    {!isFree && (
                        <Typography 
                            variant="body2" 
                            sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                            /{duration} ngày
                        </Typography>
                    )}
                </Box>
            </CardContent>

            <Divider sx={{ bgcolor: isFree ? '#e0e0e0' : 'rgba(255,255,255,0.2)' }} />

            {/* Features - Compact Grid Layout */}
            <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ 
                        color: isFree ? '#333' : 'white',
                        mb: 2,
                        fontSize: '1rem'
                    }}
                >
                    🎯 Tính năng chính
                </Typography>
                <Grid container spacing={1}>
                    {getKeyFeatures().map(renderFeature)}
                </Grid>

                {/* Extra features for Plus */}
                {isPlus && (
                    <Box mt={2}>
                        <Typography 
                            variant="body2" 
                            sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}
                        >
                            ⭐ Thêm: Báo cáo chi tiết, Logo thương hiệu, Luôn hiển thị đầu
                        </Typography>
                    </Box>
                )}
            </CardContent>

            {/* Actions */}
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isCurrentPlan || loading || !isActive}
                    onClick={() => onSelectPlan(subscription)}
                    sx={{ 
                        fontWeight: 'bold',
                        py: 1.5,
                        borderRadius: 2,
                        background: isCurrentPlan ? '#bdbdbd' : 
                                   isFree ? '#4caf50' : 'white',
                        color: isCurrentPlan ? 'white' :
                               isFree ? 'white' : getCardColor(),
                        '&:hover': {
                            background: isCurrentPlan ? '#bdbdbd' :
                                       isFree ? '#388e3c' : '#f5f5f5',
                            transform: 'scale(1.02)'
                        },
                        '&:disabled': {
                            background: '#bdbdbd',
                            color: 'white'
                        }
                    }}
                >
                    {isCurrentPlan ? 'Đang sử dụng' : 
                     isFree ? 'Dùng miễn phí' : 'Nâng cấp ngay'}
                </Button>
            </CardActions>
        </Card>
    );
};

export default SubscriptionCard;
