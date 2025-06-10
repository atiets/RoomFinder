import React, { useState } from 'react';
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
    Grid,
    Modal,
    IconButton
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
    FlashOn,
    Close,
    InfoOutlined
} from '@mui/icons-material';
import './SubscriptionCard.css';

const SubscriptionCard = ({ 
    subscription, 
    currentSubscription, 
    onSelectPlan, 
    loading = false 
}) => {
    const [showDetailModal, setShowDetailModal] = useState(false);
    
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

    // Tạo danh sách tính năng chính (chỉ hiển thị những gì có)
    const getMainFeatures = () => {
        const allFeatures = [
            {
                label: features.maxPosts === -1 ? 'Tin đăng không giới hạn' : `Tối đa ${features.maxPosts} tin đăng`,
                available: true,
                show: true
            },
            {
                label: 'Phân tích cơ bản',
                available: true,
                show: isFree
            },
            {
                label: 'Hỗ trợ cộng đồng',
                available: true,
                show: isFree
            },
            {
                label: features.vipPosts === -1 ? 'Tin VIP không giới hạn' : `${features.vipPosts} tin VIP`,
                available: features.vipPosts > 0 || features.vipPosts === -1,
                show: features.vipPosts > 0 || features.vipPosts === -1
            },
            {
                label: 'Phân tích nâng cao',
                available: isPro || isPlus,
                show: isPro || isPlus
            },
            {
                label: 'Hỗ trợ ưu tiên 24/7',
                available: features.prioritySupport,
                show: features.prioritySupport
            },
            {
                label: 'Xem số điện thoại ẩn',
                available: features.canViewHiddenPhone,
                show: features.canViewHiddenPhone
            },
            {
                label: 'Tích hợp tùy chỉnh',
                available: isPlus,
                show: isPlus
            },
            {
                label: 'Quản lý tài khoản chuyên dụng',
                available: isPlus,
                show: isPlus
            }
        ];

        return allFeatures.filter(feature => feature.show && feature.available);
    };

    // Tất cả tính năng cho modal (chỉ cho gói plus)
    const getAllFeatures = () => {
        return [
            {
                label: 'Tin đăng mỗi tháng',
                value: features.maxPosts === -1 ? 'Không giới hạn' : features.maxPosts,
                available: true
            },
            {
                label: 'Tin VIP',
                value: features.vipPosts === -1 ? 'Không giới hạn' : features.vipPosts,
                available: features.vipPosts > 0 || features.vipPosts === -1
            },
            {
                label: 'Xem số điện thoại ẩn',
                value: 'Có',
                available: features.canViewHiddenPhone
            },
            {
                label: 'Giảm phí cọc',
                value: `${features.depositFeeDiscount}%`,
                available: features.depositFeeDiscount > 0
            },
            {
                label: 'Thời gian duyệt tin',
                value: `${features.fastApproval} giờ`,
                available: true
            },
            {
                label: 'Hỗ trợ ưu tiên 24/7',
                value: 'Có',
                available: features.prioritySupport
            },
            {
                label: 'Phân tích chi tiết và báo cáo',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'Logo thương hiệu tùy chỉnh',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'Quản lý tài khoản chuyên dụng',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'Xác thực SSO',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'Bảo mật nâng cao',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'Hợp đồng tùy chỉnh',
                value: 'Có',
                available: isPlus
            },
            {
                label: 'SLA cam kết',
                value: 'Có',
                available: isPlus
            }
        ];
    };

    const getPrimaryColor = () => {
        if (isPro) return '#4CAF50'; // Xanh lá
        if (isPlus) return '#FF9800'; // Cam
        return '#757575'; // Xám cho free
    };

    const getDisplayName = () => {
        if (isFree) return 'MIỄN PHÍ';
        if (isPro) return 'GÓI PRO';
        if (isPlus) return 'GÓI PLUS';
        return displayName.split(' - ')[0];
    };

    const getSubtitle = () => {
        if (isFree) return 'Hoàn hảo cho người dùng cá nhân và dự án nhỏ';
        if (isPro) return 'Lý tưởng cho đội nhóm phát triển và doanh nghiệp';
        if (isPlus) return 'Dành cho tổ chức lớn với nhu cầu đặc biệt';
        return displayName.split(' - ')[1];
    };

    return (
        <>
            <Card 
                className={`subscription-card subscription-card--${name}`}
                elevation={isCurrentPlan ? 8 : 2}
                sx={{
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 3,
                    border: isCurrentPlan ? `3px solid ${getPrimaryColor()}` : `2px solid ${isPro ? getPrimaryColor() : '#E0E0E0'}`,
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 32px rgba(0,0,0,0.12)`
                    }
                }}
            >
                {/* Popular Badge */}
                {isPro && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: -35,
                            background: getPrimaryColor(),
                            color: 'white',
                            padding: '6px 45px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            transform: 'rotate(45deg)',
                            zIndex: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        PHỔ BIẾN
                    </Box>
                )}

                {/* Header */}
                <CardContent sx={{ pb: 1, pt: 3 }}>
                    <Box textAlign="center" mb={3}>
                        <Typography 
                            variant="overline" 
                            component="div" 
                            sx={{ 
                                color: getPrimaryColor(),
                                fontWeight: 'bold',
                                letterSpacing: 1,
                                fontSize: '0.8rem'
                            }}
                        >
                            {getDisplayName()}
                        </Typography>
                    </Box>

                    {/* Price */}
                    <Box mb={1} textAlign="center">
                        <Typography 
                            variant="h3" 
                            component="div" 
                            fontWeight="bold" 
                            sx={{ 
                                color: '#2C2C2C',
                                fontSize: '3rem',
                                lineHeight: 1
                            }}
                        >
                            {isFree ? (
                                <Box>
                                    <Typography component="span" sx={{ fontSize: '2rem', color: getPrimaryColor() }}>
                                        Miễn phí
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography component="span" sx={{ fontSize: '3rem' }}>
                                        {Math.floor(price / 1000)}
                                    </Typography>
                                    <Typography component="span" sx={{ fontSize: '1.5rem', color: '#757575' }}>
                                        .000 VND
                                    </Typography>
                                </Box>
                            )}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ color: '#757575', mt: 0.5 }}
                        >
                            {isFree ? 'mãi mãi' : `/ ${duration} ngày`}
                        </Typography>
                        
                        {/* Current Plan Indicator */}
                        {isCurrentPlan && (
                            <Box mt={1}>
                                <Chip 
                                    label="Đang sử dụng" 
                                    sx={{ 
                                        bgcolor: getPrimaryColor(),
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                    }}
                                    size="small"
                                />
                            </Box>
                        )}
                    </Box>
                </CardContent>

                <Divider sx={{ bgcolor: '#F0F0F0' }} />

                {/* Features List */}
                <CardContent sx={{ flexGrow: 1, py: 2 }}>
                    <List sx={{ py: 0 }}>
                        {getMainFeatures().map((feature, index) => (
                            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircle sx={{ 
                                        fontSize: 20, 
                                        color: getPrimaryColor()
                                    }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={feature.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        color: '#2C2C2C',
                                        fontWeight: 500
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    {/* View More Button - Only for Plus */}
                    {isPlus && (
                        <Box textAlign="center" mt={2}>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => setShowDetailModal(true)}
                                sx={{
                                    color: getPrimaryColor(),
                                    fontSize: '0.8rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: `${getPrimaryColor()}10`
                                    }
                                }}
                                startIcon={<InfoOutlined sx={{ fontSize: 16 }} />}
                            >
                                Xem tất cả tính năng
                            </Button>
                        </Box>
                    )}
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ p: 3, pt: 0 }}>
                    <Box width="100%">
                        <Button
                            variant={isCurrentPlan ? "outlined" : "contained"}
                            fullWidth
                            size="large"
                            disabled={isCurrentPlan || loading || !isActive}
                            onClick={() => onSelectPlan(subscription)}
                            sx={{ 
                                fontWeight: 'bold',
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1rem',
                                textTransform: 'none',
                                mb: 1,
                                ...(isCurrentPlan ? {
                                    borderColor: getPrimaryColor(),
                                    color: getPrimaryColor(),
                                    backgroundColor: 'transparent'
                                } : {
                                    backgroundColor: getPrimaryColor(),
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: getPrimaryColor(),
                                        opacity: 0.9,
                                        transform: 'translateY(-1px)'
                                    }
                                })
                            }}
                        >
                            {isCurrentPlan ? 'Gói hiện tại' : 
                             isFree ? 'Bắt đầu miễn phí' : 'Nâng cấp ngay'}
                        </Button>
                        
                        {/* Subtitle moved here */}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: '#666',
                                textAlign: 'center',
                                display: 'block',
                                fontSize: '0.75rem',
                                lineHeight: 1.3,
                                mt: 0.5
                            }}
                        >
                            {getSubtitle()}
                        </Typography>
                    </Box>
                </CardActions>
            </Card>

            {/* Detail Modal - Only for Plus */}
            {isPlus && (
                <Modal
                    open={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            width: '90%',
                            maxWidth: 500,
                            bgcolor: 'white',
                            borderRadius: 3,
                            boxShadow: 24,
                            p: 4,
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" fontWeight="bold" color={getPrimaryColor()}>
                                {getDisplayName()} - Chi tiết tính năng
                            </Typography>
                            <IconButton onClick={() => setShowDetailModal(false)}>
                                <Close />
                            </IconButton>
                        </Box>

                        <List>
                            {getAllFeatures().filter(feature => feature.available).map((feature, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <CheckCircle sx={{ color: getPrimaryColor() }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={feature.label}
                                        secondary={feature.value}
                                        primaryTypographyProps={{
                                            fontWeight: 500,
                                            color: '#2C2C2C'
                                        }}
                                        secondaryTypographyProps={{
                                            color: getPrimaryColor(),
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box mt={3} textAlign="center">
                            <Button
                                variant="contained"
                                onClick={() => setShowDetailModal(false)}
                                sx={{
                                    backgroundColor: getPrimaryColor(),
                                    color: 'white',
                                    px: 4,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                Đóng
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            )}
        </>
    );
};

export default SubscriptionCard;